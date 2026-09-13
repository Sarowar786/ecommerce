import { Router } from "express";
import { ProductControllers } from "./product.controller";
import { ProductValidation } from "./product.validation";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { UserRole } from "../../../shared/prisma";

const router = Router();

router.get("/", ProductControllers.getAllProducts);
router.get("/:id", ProductControllers.getProductById);

router.post(
  "/",
  auth(UserRole.ADMIN),
  validateRequest(ProductValidation.createProduct),
  ProductControllers.createProduct
);

router.patch(
  "/:id",
  auth(UserRole.ADMIN),
  validateRequest(ProductValidation.updateProduct),
  ProductControllers.updateProduct
);

router.delete(
  "/:id",
  auth(UserRole.ADMIN),
  ProductControllers.deleteProduct
);

export const ProductRoutes = router;
