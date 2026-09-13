import { Router } from "express";
import { DashboardControllers } from "./dashboard.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "../../../shared/prisma";

const router = Router();

router.get(
  "/overview",
  auth(UserRole.ADMIN),
  DashboardControllers.getOverview
);

export const DashboardRoutes = router;
