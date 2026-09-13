import { Router } from "express";
import { OrderControllers } from "./order.controller";
import { OrderValidation } from "./order.validation";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { UserRole } from "../../../shared/prisma";

const router = Router();

// Order can be created by guest or logged in user
router.post(
  "/",
  (req, res, next) => {
    // optional auth (attach user if token present)
    const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];
    if (token) {
      return auth()(req, res, next);
    }
    next();
  },
  validateRequest(OrderValidation.createOrder),
  OrderControllers.createOrder
);

router.get("/my-orders", auth(), OrderControllers.getMyOrders);

router.get("/:id", auth(), OrderControllers.getOrderById);

// Admin routes
router.get("/", auth(UserRole.ADMIN), OrderControllers.getAllOrders);

router.patch(
  "/:id/status",
  auth(UserRole.ADMIN),
  validateRequest(OrderValidation.updateOrderStatus),
  OrderControllers.updateOrderStatus
);

export const OrderRoutes = router;
