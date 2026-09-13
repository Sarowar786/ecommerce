import httpStatus from "http-status";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";

const createProduct = async (payload: any) => {
  const slug = payload.slug || payload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") + "-" + Date.now();
  
  const product = await prisma.product.create({
    data: {
      ...payload,
      slug,
      images: payload.images && payload.images.length > 0 ? payload.images : [payload.thumbnail],
      tags: payload.tags || [],
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
  const limit = Number(query.limit) || 20;
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
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getProductById = async (id: string) => {
  // Can find by id or slug
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

const updateProduct = async (id: string, payload: any) => {
  const existing = await prisma.product.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found.");
  }

  const updated = await prisma.product.update({
    where: { id },
    data: payload,
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
