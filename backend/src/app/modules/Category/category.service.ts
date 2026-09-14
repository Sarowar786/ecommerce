import httpStatus from "http-status";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import { uploadFileToS3 } from "../../../helpers/uploadToS3";
import { env } from "../../../config/env.config";
import path from "path";
import fs from "fs";

const uploadCategoryImage = async (file: Express.Multer.File): Promise<string> => {
  if (env.AWS_S3_ACCESS_KEY && env.AWS_S3_SECRET_KEY && env.AWS_S3_ENDPOINT && env.AWS_S3_BUCKET) {
    try {
      const { fileUrl } = await uploadFileToS3(file);
      if (fileUrl) return fileUrl;
    } catch (error) {
      console.warn("S3 upload failed, falling back to local file storage:", error);
    }
  }

  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileExtension = path.extname(file.originalname) || ".jpg";
  const fileName = `category-${Date.now()}-${Math.random().toString(36).substring(2, 9)}${fileExtension}`;
  const filePath = path.join(uploadDir, fileName);
  fs.writeFileSync(filePath, file.buffer);

  const baseUrl = process.env.BACKEND_IMAGE_URL || "http://localhost:5000";
  return `${baseUrl}/uploads/${fileName}`;
};

const createCategory = async (
  file: Express.Multer.File | undefined,
  payload: {
    id?: string;
    name: string;
    slug?: string;
    image?: string;
    description?: string;
  }
) => {
  const { id: _ignoredId, ...cleanPayload } = payload;
  const slug = cleanPayload.slug || cleanPayload.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  
  const existing = await prisma.category.findFirst({
    where: {
      OR: [
        { name: { equals: cleanPayload.name, mode: "insensitive" } },
        { slug },
      ],
    },
  });

  if (existing) {
    throw new ApiError(httpStatus.CONFLICT, "Category name or slug already exists.");
  }

  let image = cleanPayload.image;
  if (file) {
    image = await uploadCategoryImage(file);
  }

  const category = await prisma.category.create({
    data: {
      ...cleanPayload,
      slug,
      ...(image !== undefined && { image }),
    },
  });

  return category;
};

const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    include: {
      subcategories: {
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  const categoriesWithCount = await Promise.all(
    categories.map(async (c) => {
      const productsCount = await prisma.product.count({
        where: {
          OR: [
            { category: c.name },
            { categoryId: c.id },
          ],
        },
      });

      const subcategoriesWithCount = await Promise.all(
        (c.subcategories || []).map(async (sub) => {
          const subProductsCount = await prisma.product.count({
            where: {
              OR: [
                { subcategory: sub.name },
                { subcategoryId: sub.id },
              ],
            },
          });
          return {
            ...sub,
            productsCount: subProductsCount,
          };
        })
      );

      return {
        ...c,
        productsCount,
        subcategories: subcategoriesWithCount,
      };
    })
  );

  return categoriesWithCount;
};

const getCategoryById = async (id: string) => {
  const category = await prisma.category.findFirst({
    where: {
      OR: [
        { id: id.match(/^[0-9a-fA-F]{24}$/) ? id : undefined },
        { slug: id },
      ].filter(Boolean) as any,
    },
    include: {
      subcategories: true,
    },
  });

  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found.");
  }

  return category;
};

const updateCategory = async (
  id: string,
  file: Express.Multer.File | undefined,
  payload: {
    id?: string;
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

  const { id: _ignoredId, ...cleanPayload } = payload;
  const slug = cleanPayload.slug || (cleanPayload.name ? cleanPayload.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") : undefined);

  let image = cleanPayload.image;
  if (file) {
    image = await uploadCategoryImage(file);
  }

  const updated = await prisma.category.update({
    where: { id },
    data: {
      ...cleanPayload,
      ...(slug && { slug }),
      ...(image !== undefined && { image }),
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
