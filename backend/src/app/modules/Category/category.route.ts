import { Router, Request, Response, NextFunction } from "express";
import { CategoryControllers } from "./category.controller";
import { CategoryValidation } from "./category.validation";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { fileUploader } from "../../middlewares/fileUploader";
import { UserRole } from "../../../shared/prisma";

const router = Router();

const parseBodyData = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && req.body.data) {
    try {
      const parsed = typeof req.body.data === "string" ? JSON.parse(req.body.data) : req.body.data;
      req.body = { ...parsed, ...req.body };
      delete req.body.data;
    } catch (e) {
      // Continue if not JSON
    }
  }
  next();
};

router.get("/", CategoryControllers.getAllCategories);
router.get("/:id", CategoryControllers.getCategoryById);

router.post(
  "/",
  auth(UserRole.ADMIN),
  fileUploader.single("image"),
  parseBodyData,
  validateRequest(CategoryValidation.createCategory),
  CategoryControllers.createCategory
);

router.patch(
  "/:id",
  auth(UserRole.ADMIN),
  fileUploader.single("image"),
  parseBodyData,
  validateRequest(CategoryValidation.updateCategory),
  CategoryControllers.updateCategory
);

router.delete(
  "/:id",
  auth(UserRole.ADMIN),
  CategoryControllers.deleteCategory
);

export const CategoryRoutes = router;

