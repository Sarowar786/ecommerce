import { z } from "zod";

const createOrder = z.object({
  body: z.object({
    customerName: z.string().nonempty("Customer name is required"),
    customerEmail: z.string().email("Valid email is required"),
    customerPhone: z.string().optional(),
    phone: z.string().optional(),
    shippingAddress: z.string().nonempty("Shipping address is required"),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    paymentMethod: z.enum(["COD", "STRIPE", "CARD"]).optional(),
    items: z.array(
      z.object({
        productId: z.string().optional(),
        title: z.string().nonempty("Item title is required"),
        price: z.number().positive("Item price must be positive"),
        quantity: z.number().int().positive("Item quantity must be positive"),
        image: z.string().optional(),
        thumbnail: z.string().optional(),
      })
    ).nonempty("Order items cannot be empty"),
    totalAmount: z.number().positive().optional(),
    discountAmount: z.number().min(0).optional(),
  }),
});

const updateOrderStatus = z.object({
  body: z.object({
    orderStatus: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
    paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
  }),
});

export const OrderValidation = {
  createOrder,
  updateOrderStatus,
};
