/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import {
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
} from "@/redux/api/ecommerceApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ShoppingBag,
  Search,
  Eye,
  Calendar,
  User,
  MapPin,
  CreditCard,
  PackageCheck,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import PriceFormat from "@/components/PriceFormat";

const STATUS_TABS = [
  { label: "All Orders", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function OrdersManagementPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data, isLoading } = useGetAllOrdersQuery({
    status: statusFilter || undefined,
    search: searchTerm || undefined,
  });

  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  const orders = data?.data || [];

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const toastId = toast.loading("Updating order status...");
    try {
      await updateOrderStatus({
        id: orderId,
        orderStatus: newStatus,
        paymentStatus: newStatus === "DELIVERED" ? "PAID" : undefined,
      }).unwrap();
      toast.success(`Order status updated to ${newStatus}`, { id: toastId });
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, orderStatus: newStatus }));
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update status", { id: toastId });
    }
  };

  const handleOpenDetail = (order: any) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Orders Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Process customer orders, update delivery status, and view invoices.
          </p>
        </div>
      </div>

      {/* Tabs & Search */}
      <Card className="rounded-2xl border-slate-200/80 shadow-sm bg-white p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order ID, customer name or email..."
            className="pl-9 rounded-xl border-slate-200 bg-slate-50/60 focus:bg-white text-xs h-10"
          />
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="rounded-2xl border-slate-200/80 shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-slate-400">
              <div className="inline-block h-6 w-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mb-2" />
              <p>Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-400 space-y-3">
              <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-700">No orders found</p>
              <p className="text-xs text-slate-400">
                Customer purchases will appear here in real time.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-6">Order ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order: any) => {
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

                    const dateStr = new Date(order.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-6 font-mono text-xs font-bold text-slate-900">
                          {order.orderNumber}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 text-xs">
                            {order.customerName}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {order.customerEmail}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-xs text-slate-500 font-medium">
                          {dateStr}
                        </td>

                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          {order.items?.length || 1} items
                        </td>

                        <td className="py-3.5 px-4 font-bold text-slate-900 text-xs">
                          <PriceFormat amount={order.totalAmount} />
                        </td>

                        <td className="py-3.5 px-4">
                          <Select
                            value={order.orderStatus}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="h-8 text-xs font-bold rounded-lg border-slate-200"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </Select>
                        </td>

                        <td className="py-3.5 px-6 text-right">
                          <Button
                            onClick={() => handleOpenDetail(order)}
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" /> View Details
                          </Button>
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

      {/* ================= ORDER DETAIL DIALOG ================= */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <div>
                <DialogTitle className="text-lg font-bold">
                  Order {selectedOrder?.orderNumber}
                </DialogTitle>
                <DialogDescription>
                  Placed on {selectedOrder ? new Date(selectedOrder.createdAt).toLocaleString() : ""}
                </DialogDescription>
              </div>
              {selectedOrder && (
                <Badge
                  variant={
                    selectedOrder.orderStatus === "DELIVERED"
                      ? "success"
                      : selectedOrder.orderStatus === "SHIPPED"
                      ? "info"
                      : selectedOrder.orderStatus === "PROCESSING"
                      ? "secondary"
                      : selectedOrder.orderStatus === "CANCELLED"
                      ? "destructive"
                      : "warning"
                  }
                  className="uppercase text-xs font-bold"
                >
                  {selectedOrder.orderStatus}
                </Badge>
              )}
            </div>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 mt-2">
              {/* Customer & Shipping Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                    <User className="h-3.5 w-3.5" /> Customer Information
                  </span>
                  <p className="font-bold text-slate-900 text-sm">{selectedOrder.customerName}</p>
                  <p className="text-slate-500">{selectedOrder.customerEmail}</p>
                  {selectedOrder.customerPhone && <p className="text-slate-500">{selectedOrder.customerPhone}</p>}
                </div>

                <div className="space-y-1.5">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                    <MapPin className="h-3.5 w-3.5" /> Shipping Address
                  </span>
                  <p className="font-medium text-slate-800">{selectedOrder.shippingAddress}</p>
                  <p className="text-slate-500">
                    Payment Method: <span className="font-bold text-slate-800">{selectedOrder.paymentMethod}</span> ({selectedOrder.paymentStatus})
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Order Items ({selectedOrder.items?.length || 0})
                </h4>
                <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 overflow-hidden">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-slate-100 overflow-hidden relative shrink-0">
                          {item.image && (
                            <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{item.title}</p>
                          <p className="text-slate-400">Qty: {item.quantity} × ${item.price}</p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900 text-sm">
                        <PriceFormat amount={item.price * item.quantity} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Total Order Amount</span>
                  <div className="text-xl font-black">
                    <PriceFormat amount={selectedOrder.totalAmount} />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    value={selectedOrder.orderStatus}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    className="bg-white text-slate-900 text-xs font-bold rounded-lg h-9"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              onClick={() => setIsDetailOpen(false)}
              className="bg-black text-white rounded-xl"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
