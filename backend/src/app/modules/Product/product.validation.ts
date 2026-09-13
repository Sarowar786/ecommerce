import { z } from "zod";

const createProduct = z.object({
  body: z.object({
    id: z.string().optional(),
    title: z.string().trim().optional(),
    productName: z.string().trim().optional(),
    slug: z.string().trim().optional(),
    description: z.string().optional(),
    price: z.coerce.number().positive("Price must be greater than 0"),
    discountPercentage: z.coerce.number().min(0).max(100).optional(),
    rating: z.coerce.number().min(0).max(5).optional(),
    stock: z.coerce.number().int().min(0).optional(),
    brand: z.string().optional(),
    category: z.string().optional(),
    categoryId: z.string().optional(),
    thumbnail: z.string().optional(),
    images: z.any().optional(),
    tags: z.any().optional(),
    warrantyInformation: z.string().optional(),
    shippingInformation: z.string().optional(),
    deliveryTimeline: z.string().optional(),
    specifications: z.any().optional(),
    variants: z.any().optional(),
    video: z.string().optional(),
    productVideos: z.any().optional(),
    availabilityStatus: z.string().optional(),
    isFeatured: z.union([z.boolean(), z.string().transform((v) => v === "true")]).optional(),
    status: z.enum(["ACTIVE", "INACTIVE", "OUT_OF_STOCK"]).optional(),
  }).refine((data) => data.title || data.productName, {
    message: "Product name or title is required",
    path: ["title"],
  }),
});

const updateProduct = z.object({
  body: z.object({
    id: z.string().optional(),
    title: z.string().trim().optional(),
    productName: z.string().trim().optional(),
    slug: z.string().trim().optional(),
    description: z.string().optional(),
    price: z.coerce.number().positive().optional(),
    discountPercentage: z.coerce.number().min(0).max(100).optional(),
    rating: z.coerce.number().min(0).max(5).optional(),
    stock: z.coerce.number().int().min(0).optional(),
    brand: z.string().optional(),
    category: z.string().optional(),
    categoryId: z.string().optional(),
    thumbnail: z.string().optional(),
    images: z.any().optional(),
    tags: z.any().optional(),
    warrantyInformation: z.string().optional(),
    shippingInformation: z.string().optional(),
    deliveryTimeline: z.string().optional(),
    specifications: z.any().optional(),
    variants: z.any().optional(),
    video: z.string().optional(),
    productVideos: z.any().optional(),
    availabilityStatus: z.string().optional(),
    isFeatured: z.union([z.boolean(), z.string().transform((v) => v === "true")]).optional(),
    status: z.enum(["ACTIVE", "INACTIVE", "OUT_OF_STOCK"]).optional(),
  }),
});

export const ProductValidation = {
  createProduct,
  updateProduct,
};
