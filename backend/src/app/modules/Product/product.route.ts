import { Router, Request, Response, NextFunction } from "express";
import { ProductControllers } from "./product.controller";
import { ProductValidation } from "./product.validation";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { fileUploader } from "../../middlewares/fileUploader";
import { UserRole } from "../../../shared/prisma";

const router = Router();

const parseProductBodyData = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && req.body.data) {
    try {
      const parsed = typeof req.body.data === "string" ? JSON.parse(req.body.data) : req.body.data;
      req.body = { ...parsed, ...req.body };
      delete req.body.data;
    } catch (e) {
      // Continue
    }
  }

  // Parse specifications or variants if they are JSON strings
  if (typeof req.body.specifications === "string") {
    try {
      req.body.specifications = JSON.parse(req.body.specifications);
    } catch (e) {
      // Keep
    }
  }

  if (typeof req.body.variants === "string") {
    try {
      req.body.variants = JSON.parse(req.body.variants);
    } catch (e) {
      // Keep
    }
  }

  // Alias productName to title
  if (req.body.productName && !req.body.title) {
    req.body.title = req.body.productName;
  }

  next();
};

router.get("/", ProductControllers.getAllProducts);
router.get("/:id", ProductControllers.getProductById);

router.post(
  "/",
  auth(UserRole.ADMIN),
  fileUploader.any(),
  parseProductBodyData,
  validateRequest(ProductValidation.createProduct),
  ProductControllers.createProduct
);

router.patch(
  "/:id",
  auth(UserRole.ADMIN),
  fileUploader.any(),
  parseProductBodyData,
  validateRequest(ProductValidation.updateProduct),
  ProductControllers.updateProduct
);

router.delete(
  "/:id",
  auth(UserRole.ADMIN),
  ProductControllers.deleteProduct
);

export const ProductRoutes = router;

