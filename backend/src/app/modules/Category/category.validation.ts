import { z } from "zod";

const createCategory = z.object({
  body: z.object({
    id: z.string().optional(),
    name: z.string().trim().nonempty("Category name is required"),
    slug: z.string().trim().optional(),
    image: z.string().optional(),
    description: z.string().optional(),
  }),
});

const updateCategory = z.object({
  body: z.object({
    id: z.string().optional(),
    name: z.string().trim().optional(),
    slug: z.string().trim().optional(),
    image: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const CategoryValidation = {
  createCategory,
  updateCategory,
};
