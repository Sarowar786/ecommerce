import { z } from "zod";

const toggleWishlist = z.object({
  body: z.object({
    productId: z.string().min(1, "Product ID is required"),
  }),
});

export const WishlistValidation = {
  toggleWishlist,
};
