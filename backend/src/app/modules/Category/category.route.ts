import { Router } from "express";
import { CategoryControllers } from "./category.controller";
import { CategoryValidation } from "./category.validation";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { UserRole } from "../../../shared/prisma";

const router = Router();

router.get("/", CategoryControllers.getAllCategories);
router.get("/:id", CategoryControllers.getCategoryById);

router.post(
  "/",
  auth(UserRole.ADMIN),
  validateRequest(CategoryValidation.createCategory),
  CategoryControllers.createCategory
);

router.patch(
  "/:id",
  auth(UserRole.ADMIN),
  validateRequest(CategoryValidation.updateCategory),
  CategoryControllers.updateCategory
);

router.delete(
  "/:id",
  auth(UserRole.ADMIN),
  CategoryControllers.deleteCategory
);

export const CategoryRoutes = router;
