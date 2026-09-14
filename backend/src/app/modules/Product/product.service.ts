import httpStatus from "http-status";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import { uploadFileToS3 } from "../../../helpers/uploadToS3";
import { env } from "../../../config/env.config";
import path from "path";
import fs from "fs";

const uploadProductMedia = async (file: Express.Multer.File): Promise<string> => {
  if (env.AWS_S3_ACCESS_KEY && env.AWS_S3_SECRET_KEY && env.AWS_S3_ENDPOINT && env.AWS_S3_BUCKET) {
    try {
      const { fileUrl } = await uploadFileToS3(file);
      if (fileUrl) return fileUrl;
    } catch (error) {
      console.warn("S3 product media upload failed, falling back to local file storage:", error);
    }
  }

  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileExtension = path.extname(file.originalname) || (file.mimetype.startsWith("video/") ? ".mp4" : ".jpg");
  const prefix = file.mimetype.startsWith("video/") ? "video" : "product";
  const fileName = `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}${fileExtension}`;
  const filePath = path.join(uploadDir, fileName);
  fs.writeFileSync(filePath, file.buffer);

  const baseUrl = process.env.BACKEND_IMAGE_URL || "http://localhost:5000";
  return `${baseUrl}/uploads/${fileName}`;
};

const createProduct = async (files: Express.Multer.File[] | undefined, payload: any) => {
  const { id: _ignoredId, ...cleanPayload } = payload;
  const title = cleanPayload.title || cleanPayload.productName;
  if (!title) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product title or name is required");
  }

  const slug =
    cleanPayload.slug ||
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") +
      "-" +
      Date.now();

  // Upload any incoming image or video files
  const uploadedUrls: string[] = [];
  let videoUrlFromFiles: string | undefined;

  if (files && files.length > 0) {
    for (const file of files) {
      const isVideo = file.fieldname === "productVideos" || file.mimetype.startsWith("video/");
      const url = await uploadProductMedia(file);
      if (isVideo) {
        videoUrlFromFiles = url;
      } else {
        uploadedUrls.push(url);
      }
    }
  }

  if (videoUrlFromFiles) {
    cleanPayload.video = videoUrlFromFiles;
  }

  // Combine with existing images if provided
  let images: string[] = [];
  if (Array.isArray(cleanPayload.images)) {
    images = [...cleanPayload.images];
  } else if (typeof cleanPayload.images === "string") {
    try {
      images = JSON.parse(cleanPayload.images);
    } catch (e) {
      images = [cleanPayload.images];
    }
  }
  images = [...images, ...uploadedUrls];

  const thumbnail = cleanPayload.thumbnail || images[0] || "";

  // Parse specifications & variants if sent as JSON strings
  let specifications = cleanPayload.specifications;
  if (typeof specifications === "string") {
    try {
      specifications = JSON.parse(specifications);
    } catch (e) {
      // keep as string
    }
  }

  let variants = cleanPayload.variants;
  if (typeof variants === "string") {
    try {
      variants = JSON.parse(variants);
    } catch (e) {
      // keep as string
    }
  }

  // Calculate stock if variants provided and stock not explicitly set
  let stock = cleanPayload.stock !== undefined ? Number(cleanPayload.stock) : 10;
  if (Array.isArray(variants) && variants.length > 0 && !cleanPayload.stock) {
    stock = variants.reduce((acc: number, v: any) => acc + (Number(v.stock) || 0), 0);
  }

  // Resolve category name from categoryId if category name wasn't passed
  let category = cleanPayload.category;
  let categoryId = cleanPayload.categoryId;
  if (!category && categoryId) {
    const catDoc = await prisma.category.findUnique({ where: { id: categoryId } });
    if (catDoc) category = catDoc.name;
  } else if (category && !categoryId) {
    const catDoc = await prisma.category.findFirst({
      where: { name: { equals: category, mode: "insensitive" } },
    });
    if (catDoc) categoryId = catDoc.id;
  }
  if (!category) category = "General";

  // Resolve subcategory name from subcategoryId or vice versa
  let subcategory = cleanPayload.subcategory;
  let subcategoryId = cleanPayload.subcategoryId;
  if (!subcategory && subcategoryId) {
    const subDoc = await prisma.subcategory.findUnique({ where: { id: subcategoryId } });
    if (subDoc) subcategory = subDoc.name;
  } else if (subcategory && !subcategoryId) {
    const subDoc = await prisma.subcategory.findFirst({
      where: { name: { equals: subcategory, mode: "insensitive" } },
    });
    if (subDoc) subcategoryId = subDoc.id;
  }

  const product = await prisma.product.create({
    data: {
      title,
      slug,
      description: cleanPayload.description || title,
      price: Number(cleanPayload.price) || 0,
      discountPercentage: Number(cleanPayload.discountPercentage) || 0,
      rating: cleanPayload.rating ? Number(cleanPayload.rating) : 5.0,
      stock,
      brand: cleanPayload.brand || undefined,
      category,
      categoryId: categoryId || undefined,
      subcategory: subcategory || undefined,
      subcategoryId: subcategoryId || undefined,
      thumbnail,
      images: images.length > 0 ? images : (thumbnail ? [thumbnail] : []),
      tags: Array.isArray(cleanPayload.tags) ? cleanPayload.tags : [],
      warrantyInformation: cleanPayload.warrantyInformation || undefined,
      shippingInformation: cleanPayload.shippingInformation || cleanPayload.deliveryTimeline || undefined,
      deliveryTimeline: cleanPayload.deliveryTimeline || undefined,
      specifications: specifications || undefined,
      variants: variants || undefined,
      video: cleanPayload.video || undefined,
      availabilityStatus: cleanPayload.availabilityStatus || "In Stock",
      isFeatured: cleanPayload.isFeatured === true || cleanPayload.isFeatured === "true",
      status: cleanPayload.status || "ACTIVE",
    },
  });

  return product;
};

const getAllProducts = async (query: {
  page?: string | number;
  limit?: string | number;
  search?: string;
  searchTerm?: string;
  q?: string;
  category?: string;
  categoryId?: string;
  subcategory?: string;
  subcategoryId?: string;
  brand?: string;
  isFeatured?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  min_price?: string | number;
  max_price?: string | number;
  rating?: string | number;
  sortBy?: string;
  sortby?: string;
  sortOrder?: "asc" | "desc";
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 50;
  const skip = (page - 1) * limit;

  const andConditions: any[] = [];

  // 1. Search term filter
  const rawSearch = query.searchTerm || query.search || query.q;
  const search = typeof rawSearch === "string" ? rawSearch.trim() : "";
  if (search) {
    andConditions.push({
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  // 2. Category filter by categoryId or slug/name
  const categoryParam = (query.categoryId || query.category)?.toString()?.trim();
  if (categoryParam && categoryParam !== "") {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(categoryParam);

    if (isObjectId) {
      // Direct high-performance indexed query by categoryId
      andConditions.push({ categoryId: categoryParam });
    } else {
      // Resolve category by slug or name to its exact categoryId
      const matchedCat = await prisma.category.findFirst({
        where: {
          OR: [
            { slug: { equals: categoryParam, mode: "insensitive" } },
            { name: { equals: categoryParam, mode: "insensitive" } },
          ],
        },
      });

      if (matchedCat) {
        andConditions.push({
          OR: [
            { categoryId: matchedCat.id },
            { category: { equals: matchedCat.name, mode: "insensitive" } },
          ],
        });
      } else {
        andConditions.push({
          category: { equals: categoryParam, mode: "insensitive" },
        });
      }
    }
  }

  // 2b. Subcategory filter by subcategoryId or slug/name
  const subcategoryParam = (query.subcategoryId || query.subcategory)?.toString()?.trim();
  if (subcategoryParam && subcategoryParam !== "") {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(subcategoryParam);

    if (isObjectId) {
      andConditions.push({ subcategoryId: subcategoryParam });
    } else {
      const matchedSub = await prisma.subcategory.findFirst({
        where: {
          OR: [
            { slug: { equals: subcategoryParam, mode: "insensitive" } },
            { name: { equals: subcategoryParam, mode: "insensitive" } },
          ],
        },
      });

      if (matchedSub) {
        andConditions.push({
          OR: [
            { subcategoryId: matchedSub.id },
            { subcategory: { equals: matchedSub.name, mode: "insensitive" } },
          ],
        });
      } else {
        andConditions.push({
          subcategory: { equals: subcategoryParam, mode: "insensitive" },
        });
      }
    }
  }

  // 3. Brand filter
  if (query.brand) {
    const brand = query.brand.toString().trim();
    if (brand) {
      andConditions.push({
        brand: { equals: brand, mode: "insensitive" },
      });
    }
  }

  // 4. Featured filter
  if (query.isFeatured !== undefined && query.isFeatured !== "") {
    andConditions.push({
      isFeatured: query.isFeatured === "true" || (query.isFeatured === true as any),
    });
  }

  // 5. Price range filter
  const minPrice = query.minPrice ?? query.min_price;
  const maxPrice = query.maxPrice ?? query.max_price;
  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceCondition: any = {};
    if (minPrice !== undefined && minPrice !== "" && !isNaN(Number(minPrice))) {
      priceCondition.gte = Number(minPrice);
    }
    if (maxPrice !== undefined && maxPrice !== "" && !isNaN(Number(maxPrice))) {
      priceCondition.lte = Number(maxPrice);
    }
    if (Object.keys(priceCondition).length > 0) {
      andConditions.push({ price: priceCondition });
    }
  }

  // 6. Rating filter
  const rating = query.rating;
  if (rating !== undefined && rating !== "" && !isNaN(Number(rating))) {
    andConditions.push({ rating: { gte: Number(rating) } });
  }

  const where: any = andConditions.length > 0 ? { AND: andConditions } : {};

  // 7. Sort options
  let sortBy = query.sortBy || "createdAt";
  let sortOrder = query.sortOrder || "desc";

  const sortbyParam = query.sortby || (query as any).sortby;
  if (sortbyParam === "recent") {
    sortBy = "createdAt";
    sortOrder = "desc";
  } else if (sortbyParam === "asc") {
    sortBy = "title";
    sortOrder = "asc";
  } else if (sortbyParam === "desc") {
    sortBy = "title";
    sortOrder = "desc";
  } else if (sortbyParam === "price_low") {
    sortBy = "price";
    sortOrder = "asc";
  } else if (sortbyParam === "price_high") {
    sortBy = "price";
    sortOrder = "desc";
  } else if (sortbyParam === "rating" || sortbyParam === "top_rated") {
    sortBy = "rating";
    sortOrder = "desc";
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    data: products, // support both data and products keys
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getProductById = async (id: string) => {
  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { id: id.match(/^[0-9a-fA-F]{24}$/) ? id : undefined },
        { slug: id },
      ].filter(Boolean) as any,
    },
  });

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found.");
  }

  return product;
};

const updateProduct = async (id: string, files: Express.Multer.File[] | undefined, payload: any) => {
  const existing = await prisma.product.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found.");
  }

  const { id: _ignoredId, ...cleanPayload } = payload;

  // Upload any new media files
  const uploadedUrls: string[] = [];
  let videoUrlFromFiles: string | undefined;

  if (files && files.length > 0) {
    for (const file of files) {
      const isVideo = file.fieldname === "productVideos" || file.mimetype.startsWith("video/");
      const url = await uploadProductMedia(file);
      if (isVideo) {
        videoUrlFromFiles = url;
      } else {
        uploadedUrls.push(url);
      }
    }
  }

  if (videoUrlFromFiles) {
    cleanPayload.video = videoUrlFromFiles;
  }

  // Combine images
  let images: string[] = existing.images || [];
  if (cleanPayload.images) {
    if (typeof cleanPayload.images === "string") {
      try {
        images = JSON.parse(cleanPayload.images);
      } catch (e) {
        images = [cleanPayload.images];
      }
    } else if (Array.isArray(cleanPayload.images)) {
      images = cleanPayload.images;
    }
  }
  if (uploadedUrls.length > 0) {
    images = [...images, ...uploadedUrls];
  }

  const thumbnail = cleanPayload.thumbnail || (images.length > 0 ? images[0] : existing.thumbnail);

  // Parse specifications & variants if JSON strings
  let specifications = cleanPayload.specifications !== undefined ? cleanPayload.specifications : existing.specifications;
  if (typeof specifications === "string") {
    try {
      specifications = JSON.parse(specifications);
    } catch (e) {
      // keep
    }
  }

  let variants = cleanPayload.variants !== undefined ? cleanPayload.variants : existing.variants;
  if (typeof variants === "string") {
    try {
      variants = JSON.parse(variants);
    } catch (e) {
      // keep
    }
  }

  let stock = cleanPayload.stock !== undefined ? Number(cleanPayload.stock) : existing.stock;
  if (Array.isArray(variants) && variants.length > 0 && cleanPayload.stock === undefined) {
    stock = variants.reduce((acc: number, v: any) => acc + (Number(v.stock) || 0), 0);
  }

  let category = cleanPayload.category || existing.category;
  let categoryId = cleanPayload.categoryId || existing.categoryId;
  if (cleanPayload.categoryId && !cleanPayload.category) {
    const catDoc = await prisma.category.findUnique({ where: { id: cleanPayload.categoryId } });
    if (catDoc) category = catDoc.name;
  }

  let subcategory = cleanPayload.subcategory !== undefined ? cleanPayload.subcategory : existing.subcategory;
  let subcategoryId = cleanPayload.subcategoryId !== undefined ? cleanPayload.subcategoryId : existing.subcategoryId;
  if (cleanPayload.subcategoryId && !cleanPayload.subcategory) {
    const subDoc = await prisma.subcategory.findUnique({ where: { id: cleanPayload.subcategoryId } });
    if (subDoc) subcategory = subDoc.name;
  }

  const updateData: any = {
    title: cleanPayload.title || cleanPayload.productName || existing.title,
    description: cleanPayload.description !== undefined ? cleanPayload.description : existing.description,
    price: cleanPayload.price !== undefined ? Number(cleanPayload.price) : existing.price,
    discountPercentage: cleanPayload.discountPercentage !== undefined ? Number(cleanPayload.discountPercentage) : existing.discountPercentage,
    rating: cleanPayload.rating !== undefined ? Number(cleanPayload.rating) : existing.rating,
    stock,
    brand: cleanPayload.brand !== undefined ? cleanPayload.brand : existing.brand,
    category,
    categoryId,
    subcategory,
    subcategoryId,
    thumbnail,
    images,
    warrantyInformation: cleanPayload.warrantyInformation !== undefined ? cleanPayload.warrantyInformation : existing.warrantyInformation,
    shippingInformation: cleanPayload.shippingInformation || cleanPayload.deliveryTimeline || existing.shippingInformation,
    deliveryTimeline: cleanPayload.deliveryTimeline !== undefined ? cleanPayload.deliveryTimeline : existing.deliveryTimeline,
    specifications: specifications !== undefined ? specifications : existing.specifications,
    variants: variants !== undefined ? variants : existing.variants,
    video: cleanPayload.video !== undefined ? cleanPayload.video : existing.video,
    availabilityStatus: cleanPayload.availabilityStatus !== undefined ? cleanPayload.availabilityStatus : existing.availabilityStatus,
    isFeatured: cleanPayload.isFeatured !== undefined ? (cleanPayload.isFeatured === true || cleanPayload.isFeatured === "true") : existing.isFeatured,
    status: cleanPayload.status || existing.status,
  };

  const updated = await prisma.product.update({
    where: { id },
    data: updateData,
  });

  return updated;
};

const deleteProduct = async (id: string) => {
  const existing = await prisma.product.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found.");
  }

  await prisma.product.delete({
    where: { id },
  });

  return { message: "Product deleted successfully." };
};

export const ProductServices = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
