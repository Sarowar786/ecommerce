import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { UserRole } from "../../../shared/prisma";
import { CartControllers } from "./cart.controller";
import { CartValidation } from "./cart.validation";

const router = Router();

router.post(
  "/",
  auth(UserRole.USER, UserRole.ADMIN),
  validateRequest(CartValidation.addToCart),
  CartControllers.addToCart
);

router.get(
  "/",
  auth(UserRole.USER, UserRole.ADMIN),
  CartControllers.getMyCart
);

router.patch(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN),
  validateRequest(CartValidation.updateQuantity),
  CartControllers.updateCartQuantity
);

router.delete(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN),
  CartControllers.removeCartItem
);

router.delete(
  "/",
  auth(UserRole.USER, UserRole.ADMIN),
  CartControllers.clearCart
);

export const CartRoutes = router;
