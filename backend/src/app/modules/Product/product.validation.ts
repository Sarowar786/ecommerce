import { z } from "zod";

const createProduct = z.object({
  body: z.object({
    title: z.string().trim().nonempty("Title is required"),
    slug: z.string().trim().optional(),
    description: z.string().nonempty("Description is required"),
    price: z.number().positive("Price must be greater than 0"),
    discountPercentage: z.number().min(0).max(100).optional(),
    rating: z.number().min(0).max(5).optional(),
    stock: z.number().int().min(0).optional(),
    brand: z.string().optional(),
    category: z.string().nonempty("Category is required"),
    categoryId: z.string().optional(),
    thumbnail: z.string().nonempty("Thumbnail is required"),
    images: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    warrantyInformation: z.string().optional(),
    shippingInformation: z.string().optional(),
    availabilityStatus: z.string().optional(),
    isFeatured: z.boolean().optional(),
    status: z.enum(["ACTIVE", "INACTIVE", "OUT_OF_STOCK"]).optional(),
  }),
});

const updateProduct = z.object({
  body: z.object({
    title: z.string().trim().optional(),
    slug: z.string().trim().optional(),
    description: z.string().optional(),
    price: z.number().positive().optional(),
    discountPercentage: z.number().min(0).max(100).optional(),
    rating: z.number().min(0).max(5).optional(),
    stock: z.number().int().min(0).optional(),
    brand: z.string().optional(),
    category: z.string().optional(),
    categoryId: z.string().optional(),
    thumbnail: z.string().optional(),
    images: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    warrantyInformation: z.string().optional(),
    shippingInformation: z.string().optional(),
    availabilityStatus: z.string().optional(),
    isFeatured: z.boolean().optional(),
    status: z.enum(["ACTIVE", "INACTIVE", "OUT_OF_STOCK"]).optional(),
  }),
});

export const ProductValidation = {
  createProduct,
  updateProduct,
};
