import httpStatus from "http-status";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";

const createCategory = async (payload: {
  name: string;
  slug?: string;
  image?: string;
  description?: string;
}) => {
  const slug = payload.slug || payload.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  
  const existing = await prisma.category.findFirst({
    where: {
      OR: [
        { name: { equals: payload.name, mode: "insensitive" } },
        { slug },
      ],
    },
  });

  if (existing) {
    throw new ApiError(httpStatus.CONFLICT, "Category name or slug already exists.");
  }

  const category = await prisma.category.create({
    data: {
      ...payload,
      slug,
    },
  });

  return category;
};

const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  return categories;
};

const getCategoryById = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found.");
  }

  return category;
};

const updateCategory = async (
  id: string,
  payload: {
    name?: string;
    slug?: string;
    image?: string;
    description?: string;
  }
) => {
  const existing = await prisma.category.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found.");
  }

  const slug = payload.slug || (payload.name ? payload.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") : undefined);

  const updated = await prisma.category.update({
    where: { id },
    data: {
      ...payload,
      ...(slug && { slug }),
    },
  });

  return updated;
};

const deleteCategory = async (id: string) => {
  const existing = await prisma.category.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found.");
  }

  await prisma.category.delete({
    where: { id },
  });

  return { message: "Category deleted successfully." };
};

export const CategoryServices = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
