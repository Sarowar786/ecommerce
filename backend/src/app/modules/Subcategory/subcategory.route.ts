import { Router, Request, Response, NextFunction } from "express";
import { SubcategoryControllers } from "./subcategory.controller";
import { SubcategoryValidation } from "./subcategory.validation";
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

router.get("/", SubcategoryControllers.getAllSubcategories);
router.get("/:id", SubcategoryControllers.getSubcategoryById);

router.post(
  "/",
  auth(UserRole.ADMIN),
  fileUploader.single("image"),
  parseBodyData,
  validateRequest(SubcategoryValidation.createSubcategory),
  SubcategoryControllers.createSubcategory
);

router.patch(
  "/:id",
  auth(UserRole.ADMIN),
  fileUploader.single("image"),
  parseBodyData,
  validateRequest(SubcategoryValidation.updateSubcategory),
  SubcategoryControllers.updateSubcategory
);

router.delete("/:id", auth(UserRole.ADMIN), SubcategoryControllers.deleteSubcategory);

export const SubcategoryRoutes = router;
