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
  category?: string;
  brand?: string;
  isFeatured?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 50;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
      { brand: { contains: query.search, mode: "insensitive" } },
      { category: { contains: query.search, mode: "insensitive" } },
    ];
  }

  if (query.category) {
    where.category = { equals: query.category, mode: "insensitive" };
  }

  if (query.brand) {
    where.brand = { equals: query.brand, mode: "insensitive" };
  }

  if (query.isFeatured !== undefined) {
    where.isFeatured = query.isFeatured === "true" || query.isFeatured === true as any;
  }

  if (query.minPrice || query.maxPrice) {
    where.price = {};
    if (query.minPrice) where.price.gte = Number(query.minPrice);
    if (query.maxPrice) where.price.lte = Number(query.maxPrice);
  }

  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder || "desc";

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
