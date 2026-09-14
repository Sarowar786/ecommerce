import httpStatus from "http-status";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";

const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

const toggleWishlist = async (userId: string, productId: string) => {
  if (!productId || !isValidObjectId(productId)) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }

  const existingItem = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  if (existingItem) {
    await prisma.wishlistItem.delete({
      where: { id: existingItem.id },
    });
    return {
      inWishlist: false,
      message: "Removed from wishlist",
      productId,
    };
  }

  const created = await prisma.wishlistItem.create({
    data: {
      userId,
      productId,
    },
    include: {
      product: true,
    },
  });

  return {
    inWishlist: true,
    message: "Added to wishlist",
    data: created,
    productId,
  };
};

const getMyWishlist = async (userId: string) => {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    include: {
      product: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return items;
};

const removeWishlistItem = async (userId: string, productId: string) => {
  if (!productId || !isValidObjectId(productId)) {
    throw new ApiError(httpStatus.NOT_FOUND, "Wishlist item not found");
  }

  const existing = await prisma.wishlistItem.findFirst({
    where: {
      userId,
      OR: [
        { productId },
        { id: productId },
      ],
    },
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Wishlist item not found");
  }

  await prisma.wishlistItem.delete({
    where: { id: existing.id },
  });

  return { message: "Removed from wishlist" };
};

export const WishlistServices = {
  toggleWishlist,
  getMyWishlist,
  removeWishlistItem,
};
