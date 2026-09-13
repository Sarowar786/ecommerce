"use client";

import { useGetDashboardOverviewQuery } from "@/redux/api/ecommerceApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  Plus,
  Eye,
} from "lucide-react";
import Link from "next/link";
import PriceFormat from "@/components/PriceFormat";

export default function Overview() {
  const { data, isLoading, error, refetch } = useGetDashboardOverviewQuery(undefined, {
    pollingInterval: 30000,
  });

  const stats = data?.data?.stats || {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    averageOrderValue: 0,
  };

  const monthlySales = data?.data?.monthlySales || [];
  const statusCounts = data?.data?.orderStatusCounts || {
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };
  const recentOrders = data?.data?.recentOrders || [];

  const maxRevenue = Math.max(...monthlySales.map((m: any) => m.revenue), 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 md:p-8 rounded-3xl text-white shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-400 text-xs font-semibold backdrop-blur-md mb-2">
            <TrendingUp className="h-3.5 w-3.5" />
            Real-time Ecommerce Analytics
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Store Performance Overview
          </h1>
          <p className="text-slate-300 text-sm">
            Monitor sales revenue, active customers, orders processing, and inventory status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard/products">
            <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 h-10 px-4">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </Link>
          <Link href="/dashboard/orders">
            <Button variant="outline" className="border-white/20 bg-white/10 hover:bg-white/20 text-white rounded-xl h-10 px-4">
              View All Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <Card className="rounded-2xl border-slate-200/80 shadow-sm hover:shadow-md transition bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Revenue
            </CardTitle>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight text-slate-900">
              <PriceFormat amount={stats.totalRevenue} />
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <span className="text-emerald-600 font-bold flex items-center">
                <ArrowUpRight className="h-3 w-3" /> +14.2%
              </span>
              vs previous month
            </p>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="rounded-2xl border-slate-200/80 shadow-sm hover:shadow-md transition bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Orders
            </CardTitle>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight text-slate-900">
              {stats.totalOrders}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <span className="text-blue-600 font-bold">Avg ${stats.averageOrderValue}</span>
              per customer order
            </p>
          </CardContent>
        </Card>

        {/* Total Products */}
        <Card className="rounded-2xl border-slate-200/80 shadow-sm hover:shadow-md transition bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Products
            </CardTitle>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight text-slate-900">
              {stats.totalProducts}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <span className="text-amber-600 font-bold">{stats.totalCategories || 6} categories</span>
              in catalog
            </p>
          </CardContent>
        </Card>

        {/* Total Customers */}
        <Card className="rounded-2xl border-slate-200/80 shadow-sm hover:shadow-md transition bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Users
            </CardTitle>
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight text-slate-900">
              {stats.totalUsers}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <span className="text-purple-600 font-bold">Active</span> verified accounts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart */}
        <Card className="lg:col-span-2 rounded-2xl border-slate-200/80 shadow-sm bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Revenue & Sales Trends
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Monthly revenue breakdown over the last 6 months
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-semibold">
                Last 6 Months
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {monthlySales.length === 0 ? (
              <div className="h-60 flex items-center justify-center text-sm text-slate-400">
                No monthly sales history available yet.
              </div>
            ) : (
              <div className="space-y-4 pt-4">
                <div className="h-52 flex items-end gap-3 sm:gap-6 px-2">
                  {monthlySales.map((item: any, idx: number) => {
                    const heightPercent = Math.max(Math.round((item.revenue / maxRevenue) * 100), 8);
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="text-[11px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          ${item.revenue}
                        </div>
                        <div className="w-full bg-slate-100 rounded-xl overflow-hidden flex flex-col justify-end h-36">
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-full bg-gradient-to-t from-slate-900 to-indigo-600 rounded-xl transition-all duration-500 group-hover:from-amber-500 group-hover:to-orange-500"
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-600">
                          {item.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card className="rounded-2xl border-slate-200/80 shadow-sm bg-white flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">
              Orders Status
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Current fulfillment distribution
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 flex-1 justify-center flex flex-col">
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 border border-amber-100">
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-bold text-slate-800">Pending</span>
              </div>
              <span className="text-xs font-extrabold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
                {statusCounts.pending}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/70 border border-blue-100">
              <div className="flex items-center gap-2.5">
                <Truck className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800">Processing</span>
              </div>
              <span className="text-xs font-extrabold bg-blue-200/80 text-blue-900 px-2 py-0.5 rounded-full">
                {statusCounts.processing}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/70 border border-indigo-100">
              <div className="flex items-center gap-2.5">
                <Package className="h-4 w-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800">Shipped</span>
              </div>
              <span className="text-xs font-extrabold bg-indigo-200/80 text-indigo-900 px-2 py-0.5 rounded-full">
                {statusCounts.shipped}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">Delivered</span>
              </div>
              <span className="text-xs font-extrabold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full">
                {statusCounts.delivered}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-red-50/70 border border-red-100">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-xs font-bold text-slate-800">Cancelled</span>
              </div>
              <span className="text-xs font-extrabold bg-red-200/80 text-red-900 px-2 py-0.5 rounded-full">
                {statusCounts.cancelled}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Section */}
      <Card className="rounded-2xl border-slate-200/80 shadow-sm bg-white overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Recent Orders
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Latest transactions placed by customers
            </CardDescription>
          </div>
          <Link href="/dashboard/orders">
            <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold">
              View All Orders
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              No recent orders found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-y border-slate-100 bg-slate-50/60 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-6">Order ID</th>
                    <th className="py-3 px-6">Customer</th>
                    <th className="py-3 px-6">Items</th>
                    <th className="py-3 px-6">Amount</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((order: any) => {
                    const statusBadgeVariant =
                      order.orderStatus === "DELIVERED"
                        ? "success"
                        : order.orderStatus === "SHIPPED"
                        ? "info"
                        : order.orderStatus === "PROCESSING"
                        ? "secondary"
                        : order.orderStatus === "CANCELLED"
                        ? "destructive"
                        : "warning";

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-6 font-mono text-xs font-bold text-slate-900">
                          {order.orderNumber}
                        </td>
                        <td className="py-3.5 px-6">
                          <div className="font-semibold text-slate-900 text-xs">
                            {order.customerName}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {order.customerEmail}
                          </div>
                        </td>
                        <td className="py-3.5 px-6 text-xs text-slate-600">
                          {order.items?.length || 1} items
                        </td>
                        <td className="py-3.5 px-6 font-bold text-slate-900 text-xs">
                          <PriceFormat amount={order.totalAmount} />
                        </td>
                        <td className="py-3.5 px-6">
                          <Badge variant={statusBadgeVariant as any} className="text-[10px] font-bold uppercase">
                            {order.orderStatus}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <Link href={`/dashboard/orders`}>
                            <Button size="sm" variant="ghost" className="h-8 px-2.5 rounded-lg text-xs">
                              <Eye className="h-3.5 w-3.5 mr-1" /> View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
