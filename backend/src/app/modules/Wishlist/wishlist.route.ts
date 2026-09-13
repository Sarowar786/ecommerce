import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { UserRole } from "../../../shared/prisma";
import { WishlistControllers } from "./wishlist.controller";
import { WishlistValidation } from "./wishlist.validation";

const router = Router();

router.post(
  "/toggle",
  auth(UserRole.USER, UserRole.ADMIN),
  validateRequest(WishlistValidation.toggleWishlist),
  WishlistControllers.toggleWishlist
);

router.get(
  "/",
  auth(UserRole.USER, UserRole.ADMIN),
  WishlistControllers.getMyWishlist
);

router.delete(
  "/:productId",
  auth(UserRole.USER, UserRole.ADMIN),
  WishlistControllers.removeWishlistItem
);

export const WishlistRoutes = router;
