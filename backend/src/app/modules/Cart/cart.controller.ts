import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { CartServices } from "./cart.service";

const addToCart = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await CartServices.addToCart(userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product added to cart",
    data: result,
  });
});

const getMyCart = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await CartServices.getMyCart(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cart retrieved successfully",
    data: result,
  });
});

const updateCartQuantity = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const id = String(req.params.id);
  const { quantity } = req.body;
  const result = await CartServices.updateCartQuantity(userId, id, Number(quantity));
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cart quantity updated",
    data: result,
  });
});

const removeCartItem = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const id = String(req.params.id);
  const result = await CartServices.removeCartItem(userId, id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

const clearCart = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await CartServices.clearCart(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

export const CartControllers = {
  addToCart,
  getMyCart,
  updateCartQuantity,
  removeCartItem,
  clearCart,
};
