import httpStatus from "http-status";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import { OrderStatus, PaymentStatus } from "../../../shared/prisma";

const createOrder = async (userId: string | undefined, payload: any) => {
  const orderNumber = "ORD-" + Date.now().toString(36).toUpperCase() + "-" + Math.floor(1000 + Math.random() * 9000);

  const items = Array.isArray(payload.items) ? payload.items : [];
  const calculatedTotal = items.reduce((acc: number, item: any) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  const totalAmount = Number(payload.totalAmount) || calculatedTotal;

  const customerPhone = payload.customerPhone || payload.phone || null;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      customerPhone,
      shippingAddress: payload.shippingAddress,
      city: payload.city || null,
      postalCode: payload.postalCode || null,
      totalAmount,
      discountAmount: Number(payload.discountAmount) || 0,
      paymentMethod: payload.paymentMethod || "COD",
      paymentStatus: payload.paymentStatus || "PENDING",
      orderStatus: payload.orderStatus || "PENDING",
      ...(userId && /^[0-9a-fA-F]{24}$/.test(userId) && { userId }),
      items: {
        create: items.map((item: any) => ({
          productId: item.productId && /^[0-9a-fA-F]{24}$/.test(item.productId) ? item.productId : undefined,
          title: item.title,
          price: Number(item.price),
          quantity: Number(item.quantity) || 1,
          image: item.image || item.thumbnail || null,
        })),
      },
    },
    include: {
      items: true,
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return order;
};

const getMyOrders = async (userId: string) => {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return orders;
};

const getAllOrders = async (query: {
  page?: string | number;
  limit?: string | number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  search?: string;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 15;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (query.status) {
    where.orderStatus = query.status;
  }

  if (query.paymentStatus) {
    where.paymentStatus = query.paymentStatus;
  }

  if (query.search) {
    where.OR = [
      { orderNumber: { contains: query.search, mode: "insensitive" } },
      { customerName: { contains: query.search, mode: "insensitive" } },
      { customerEmail: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      include: {
        items: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getOrderById = async (id: string, userId?: string, role?: string) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, "Order not found.");
  }

  if (role !== "ADMIN" && userId && order.userId && order.userId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, "You are not authorized to view this order.");
  }

  return order;
};

const updateOrderStatus = async (
  id: string,
  payload: {
    orderStatus: OrderStatus;
    paymentStatus?: PaymentStatus;
  }
) => {
  const existing = await prisma.order.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Order not found.");
  }

  const updated = await prisma.order.update({
    where: { id },
    data: payload,
    include: {
      items: true,
    },
  });

  return updated;
};

export const OrderServices = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
};
