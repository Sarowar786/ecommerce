import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { WishlistServices } from "./wishlist.service";

const toggleWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { productId } = req.body;
  const result = await WishlistServices.toggleWishlist(userId, productId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result,
  });
});

const getMyWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await WishlistServices.getMyWishlist(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Wishlist retrieved successfully",
    data: result,
  });
});

const removeWishlistItem = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const productId = String(req.params.productId);
  const result = await WishlistServices.removeWishlistItem(userId, productId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

export const WishlistControllers = {
  toggleWishlist,
  getMyWishlist,
  removeWishlistItem,
};
