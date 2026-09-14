import httpStatus from "http-status";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import { uploadFileToS3 } from "../../../helpers/uploadToS3";
import { env } from "../../../config/env.config";
import path from "path";
import fs from "fs";

const uploadSubcategoryImage = async (file: Express.Multer.File): Promise<string> => {
  if (env.AWS_S3_ACCESS_KEY && env.AWS_S3_SECRET_KEY && env.AWS_S3_ENDPOINT && env.AWS_S3_BUCKET) {
    try {
      const { fileUrl } = await uploadFileToS3(file);
      if (fileUrl) return fileUrl;
    } catch (error) {
      console.warn("S3 upload failed, falling back to local storage:", error);
    }
  }

  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileExtension = path.extname(file.originalname) || ".jpg";
  const fileName = `subcategory-${Date.now()}-${Math.random().toString(36).substring(2, 9)}${fileExtension}`;
  const filePath = path.join(uploadDir, fileName);
  fs.writeFileSync(filePath, file.buffer);

  const baseUrl = process.env.BACKEND_IMAGE_URL || "http://localhost:5000";
  return `${baseUrl}/uploads/${fileName}`;
};

const createSubcategory = async (
  file: Express.Multer.File | undefined,
  payload: {
    name: string;
    slug?: string;
    categoryId: string;
    image?: string;
    description?: string;
  }
) => {
  const { name, categoryId, description } = payload;

  const parentCat = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (!parentCat) {
    throw new ApiError(httpStatus.NOT_FOUND, "Parent Category does not exist.");
  }

  const slug =
    payload.slug ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const existing = await prisma.subcategory.findFirst({
    where: {
      OR: [
        { slug },
        {
          name: { equals: name, mode: "insensitive" },
          categoryId,
        },
      ],
    },
  });

  if (existing) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "A subcategory with this name or slug already exists."
    );
  }

  let image = payload.image;
  if (file) {
    image = await uploadSubcategoryImage(file);
  }

  const subcategory = await prisma.subcategory.create({
    data: {
      name,
      slug,
      categoryId,
      description: description || null,
      ...(image !== undefined && { image }),
    },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  return subcategory;
};

const getAllSubcategories = async (query: { categoryId?: string; search?: string; searchTerm?: string }) => {
  const { categoryId, search, searchTerm } = query;
  const term = (searchTerm || search || "")?.trim();

  const whereCondition: any = {};

  if (categoryId) {
    whereCondition.categoryId = categoryId;
  }

  if (term) {
    whereCondition.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { slug: { contains: term, mode: "insensitive" } },
      { description: { contains: term, mode: "insensitive" } },
    ];
  }

  const subcategories = await prisma.subcategory.findMany({
    where: whereCondition,
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const subcategoriesWithCount = await Promise.all(
    subcategories.map(async (sub) => {
      const productsCount = await prisma.product.count({
        where: {
          OR: [
            { subcategory: sub.name },
            { subcategoryId: sub.id },
          ],
        },
      });
      return {
        ...sub,
        productsCount,
      };
    })
  );

  return subcategoriesWithCount;
};

const getSubcategoryById = async (id: string) => {
  const subcategory = await prisma.subcategory.findFirst({
    where: {
      OR: [
        { id: id.match(/^[0-9a-fA-F]{24}$/) ? id : undefined },
        { slug: id },
      ].filter(Boolean) as any,
    },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  if (!subcategory) {
    throw new ApiError(httpStatus.NOT_FOUND, "Subcategory not found");
  }

  const productsCount = await prisma.product.count({
    where: {
      OR: [
        { subcategory: subcategory.name },
        { subcategoryId: subcategory.id },
      ],
    },
  });

  return {
    ...subcategory,
    productsCount,
  };
};

const updateSubcategory = async (
  id: string,
  file: Express.Multer.File | undefined,
  payload: any
) => {
  const existingSub = await prisma.subcategory.findUnique({
    where: { id },
  });
  if (!existingSub) {
    throw new ApiError(httpStatus.NOT_FOUND, "Subcategory not found");
  }

  let slug = payload.slug;
  if (!slug && payload.name && payload.name !== existingSub.name) {
    slug = payload.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  if (slug && slug !== existingSub.slug) {
    const duplicate = await prisma.subcategory.findFirst({
      where: {
        slug,
        id: { not: id },
      },
    });
    if (duplicate) {
      throw new ApiError(httpStatus.CONFLICT, "Slug already in use by another subcategory");
    }
  }

  let image = payload.image;
  if (file) {
    image = await uploadSubcategoryImage(file);
  }

  const updated = await prisma.subcategory.update({
    where: { id },
    data: {
      ...(payload.name !== undefined && { name: payload.name }),
      ...(slug !== undefined && { slug }),
      ...(payload.categoryId !== undefined && { categoryId: payload.categoryId }),
      ...(payload.description !== undefined && { description: payload.description }),
      ...(image !== undefined && { image }),
    },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  return updated;
};

const deleteSubcategory = async (id: string) => {
  const existingSub = await prisma.subcategory.findUnique({
    where: { id },
  });
  if (!existingSub) {
    throw new ApiError(httpStatus.NOT_FOUND, "Subcategory not found");
  }

  // Clear subcategory association in products
  await prisma.product.updateMany({
    where: {
      OR: [
        { subcategoryId: id },
        { subcategory: existingSub.name },
      ],
    },
    data: {
      subcategoryId: null,
      subcategory: null,
    },
  });

  await prisma.subcategory.delete({
    where: { id },
  });

  return { message: "Subcategory deleted successfully", id };
};

export const SubcategoryServices = {
  createSubcategory,
  getAllSubcategories,
  getSubcategoryById,
  updateSubcategory,
  deleteSubcategory,
};
