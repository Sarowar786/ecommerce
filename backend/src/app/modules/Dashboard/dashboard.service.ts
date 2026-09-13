import prisma from "../../../shared/prisma";

const getOverview = async () => {
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    orders,
    recentOrders,
    categories,
  ] = await Promise.all([
    prisma.user.count({ where: { isDeleted: false } }),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.findMany({
      select: {
        totalAmount: true,
        orderStatus: true,
        paymentStatus: true,
        createdAt: true,
      },
    }),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
    }),
  ]);

  // Calculate total revenue (excluding cancelled orders)
  const validOrders = orders.filter((o) => o.orderStatus !== "CANCELLED");
  const totalRevenue = validOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Group by month for chart (last 6 months)
  const monthlyDataMap: { [key: string]: { month: string; revenue: number; orders: number } } = {};
  
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    monthlyDataMap[key] = {
      month: monthNames[d.getMonth()],
      revenue: 0,
      orders: 0,
    };
  }

  orders.forEach((ord) => {
    const d = new Date(ord.createdAt);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    if (monthlyDataMap[key]) {
      monthlyDataMap[key].orders += 1;
      if (ord.orderStatus !== "CANCELLED") {
        monthlyDataMap[key].revenue += ord.totalAmount || 0;
      }
    }
  });

  const monthlySales = Object.values(monthlyDataMap);

  // Order status counts
  const orderStatusCounts = {
    pending: orders.filter((o) => o.orderStatus === "PENDING").length,
    processing: orders.filter((o) => o.orderStatus === "PROCESSING").length,
    shipped: orders.filter((o) => o.orderStatus === "SHIPPED").length,
    delivered: orders.filter((o) => o.orderStatus === "DELIVERED").length,
    cancelled: orders.filter((o) => o.orderStatus === "CANCELLED").length,
  };

  return {
    stats: {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalUsers,
      totalCategories: categories.length,
      averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
    },
    monthlySales,
    orderStatusCounts,
    recentOrders,
  };
};

export const DashboardServices = {
  getOverview,
};
