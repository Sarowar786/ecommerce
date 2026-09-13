import { z } from "zod";

const addToCart = z.object({
  body: z.object({
    productId: z.string().min(1, "Product ID is required"),
    quantity: z.coerce.number().int().min(1).default(1),
    color: z.string().optional(),
    size: z.string().optional(),
  }),
});

const updateQuantity = z.object({
  body: z.object({
    quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  }),
});

export const CartValidation = {
  addToCart,
  updateQuantity,
};
