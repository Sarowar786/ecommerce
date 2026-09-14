import httpStatus from "http-status";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";

const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

const addToCart = async (
  userId: string,
  payload: {
    productId: string;
    quantity?: number;
    color?: string;
    size?: string;
  }
) => {
  if (!payload.productId || !isValidObjectId(payload.productId)) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }

  const product = await prisma.product.findUnique({
    where: { id: payload.productId },
  });

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }

  const quantityToAdd = payload.quantity && payload.quantity > 0 ? payload.quantity : 1;

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId: payload.productId,
      },
    },
  });

  if (existingItem) {
    const updated = await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: existingItem.quantity + quantityToAdd,
        color: payload.color || existingItem.color,
        size: payload.size || existingItem.size,
      },
      include: {
        product: true,
      },
    });
    return updated;
  }

  const created = await prisma.cartItem.create({
    data: {
      userId,
      productId: payload.productId,
      quantity: quantityToAdd,
      color: payload.color,
      size: payload.size,
    },
    include: {
      product: true,
    },
  });

  return created;
};

const getMyCart = async (userId: string) => {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const subtotal = items.reduce((acc, item) => {
    const price = item.product?.price || 0;
    const discount = item.product?.discountPercentage || 0;
    const effectivePrice = discount > 0 ? price - (price * discount) / 100 : price;
    return acc + effectivePrice * item.quantity;
  }, 0);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return {
    items,
    totalItems,
    subtotal: Number(subtotal.toFixed(2)),
  };
};

const updateCartQuantity = async (
  userId: string,
  cartItemId: string,
  quantity: number
) => {
  if (!cartItemId || !isValidObjectId(cartItemId)) {
    throw new ApiError(httpStatus.NOT_FOUND, "Cart item not found");
  }

  const item = await prisma.cartItem.findFirst({
    where: {
      userId,
      OR: [{ id: cartItemId }, { productId: cartItemId }],
    },
  });

  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, "Cart item not found");
  }

  const updated = await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity },
    include: {
      product: true,
    },
  });

  return updated;
};

const removeCartItem = async (userId: string, cartItemId: string) => {
  if (!cartItemId || !isValidObjectId(cartItemId)) {
    throw new ApiError(httpStatus.NOT_FOUND, "Cart item not found");
  }

  const item = await prisma.cartItem.findFirst({
    where: {
      userId,
      OR: [{ id: cartItemId }, { productId: cartItemId }],
    },
  });

  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, "Cart item not found");
  }

  await prisma.cartItem.delete({
    where: { id: item.id },
  });

  return { message: "Item removed from cart" };
};

const clearCart = async (userId: string) => {
  await prisma.cartItem.deleteMany({
    where: { userId },
  });

  return { message: "Cart cleared successfully" };
};

export const CartServices = {
  addToCart,
  getMyCart,
  updateCartQuantity,
  removeCartItem,
  clearCart,
};
