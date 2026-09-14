import express from "express";

import { AuthRoutes } from "../modules/Auth/auth.routes";
import { UserRoutes } from "../modules/User/user.route";
import { CategoryRoutes } from "../modules/Category/category.route";
import { SubcategoryRoutes } from "../modules/Subcategory/subcategory.route";
import { ProductRoutes } from "../modules/Product/product.route";
import { OrderRoutes } from "../modules/Order/order.route";
import { DashboardRoutes } from "../modules/Dashboard/dashboard.route";
import { CartRoutes } from "../modules/Cart/cart.route";
import { WishlistRoutes } from "../modules/Wishlist/wishlist.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/categories",
    route: CategoryRoutes,
  },
  {
    path: "/subcategories",
    route: SubcategoryRoutes,
  },
  {
    path: "/products",
    route: ProductRoutes,
  },
  {
    path: "/orders",
    route: OrderRoutes,
  },
  {
    path: "/dashboard",
    route: DashboardRoutes,
  },
  {
    path: "/cart",
    route: CartRoutes,
  },
  {
    path: "/wishlist",
    route: WishlistRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
