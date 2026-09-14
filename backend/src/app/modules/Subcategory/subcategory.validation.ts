import { z } from "zod";

const createSubcategory = z.object({
  body: z.object({
    id: z.string().optional(),
    name: z.string().trim().nonempty("Subcategory name is required"),
    slug: z.string().trim().optional(),
    categoryId: z.string().trim().nonempty("Parent category ID is required"),
    image: z.string().optional(),
    description: z.string().optional(),
  }),
});

const updateSubcategory = z.object({
  body: z.object({
    id: z.string().optional(),
    name: z.string().trim().optional(),
    slug: z.string().trim().optional(),
    categoryId: z.string().trim().optional(),
    image: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const SubcategoryValidation = {
  createSubcategory,
  updateSubcategory,
};
