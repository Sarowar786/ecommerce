/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
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
import { Textarea } from "@/components/ui/textarea";
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
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Filter,
  Image as ImageIcon,
  Star,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import PriceFormat from "@/components/PriceFormat";
import Image from "next/image";
import Link from "next/link";

export default function ProductsManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const { data, isLoading } = useGetProductsQuery({
    search: searchTerm || undefined,
    category: selectedCategory || undefined,
    limit: 100,
  });

  const { data: catData } = useGetCategoriesQuery(undefined);
  const categories = catData?.data || [];

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    brand: "",
    price: "",
    discountPercentage: "",
    stock: "",
    description: "",
    thumbnail: "",
    warrantyInformation: "1 year official warranty",
    shippingInformation: "Ships in 24 hours",
    isFeatured: false,
  });

  const products = data?.data || [];

  const handleOpenAdd = () => {
    setFormData({
      title: "",
      category: categories[0]?.name || "Smartphones",
      brand: "",
      price: "",
      discountPercentage: "0",
      stock: "10",
      description: "",
      thumbnail: "",
      warrantyInformation: "1 year official warranty",
      shippingInformation: "Ships in 24 hours",
      isFeatured: false,
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (prod: any) => {
    setSelectedProduct(prod);
    setFormData({
      title: prod.title || "",
      category: prod.category || "",
      brand: prod.brand || "",
      price: String(prod.price || ""),
      discountPercentage: String(prod.discountPercentage || 0),
      stock: String(prod.stock || 10),
      description: prod.description || "",
      thumbnail: prod.thumbnail || "",
      warrantyInformation: prod.warrantyInformation || "1 year official warranty",
      shippingInformation: prod.shippingInformation || "Ships in 24 hours",
      isFeatured: Boolean(prod.isFeatured),
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (prod: any) => {
    setSelectedProduct(prod);
    setIsDeleteOpen(true);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.thumbnail) {
      toast.error("Please fill in Title, Price, and Thumbnail URL");
      return;
    }

    const toastId = toast.loading("Adding new product...");
    try {
      const payload = {
        title: formData.title,
        category: formData.category || "General",
        brand: formData.brand || undefined,
        price: parseFloat(formData.price),
        discountPercentage: parseFloat(formData.discountPercentage || "0"),
        stock: parseInt(formData.stock || "10"),
        description: formData.description || formData.title,
        thumbnail: formData.thumbnail,
        images: [formData.thumbnail],
        warrantyInformation: formData.warrantyInformation,
        shippingInformation: formData.shippingInformation,
        isFeatured: formData.isFeatured,
      };

      await createProduct(payload).unwrap();
      toast.success("Product created successfully!", { id: toastId });
      setIsAddOpen(false);
    } catch (err: any) {
      console.log("ADD PROD ERROR:", err);
      toast.error(err?.data?.message || "Failed to create product", { id: toastId });
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const toastId = toast.loading("Updating product...");
    try {
      const payload = {
        id: selectedProduct.id,
        title: formData.title,
        category: formData.category,
        brand: formData.brand,
        price: parseFloat(formData.price),
        discountPercentage: parseFloat(formData.discountPercentage || "0"),
        stock: parseInt(formData.stock || "10"),
        description: formData.description,
        thumbnail: formData.thumbnail,
        warrantyInformation: formData.warrantyInformation,
        shippingInformation: formData.shippingInformation,
        isFeatured: formData.isFeatured,
      };

      await updateProduct(payload).unwrap();
      toast.success("Product updated successfully!", { id: toastId });
      setIsEditOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update product", { id: toastId });
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    const toastId = toast.loading("Deleting product...");
    try {
      await deleteProduct(selectedProduct.id).unwrap();
      toast.success("Product deleted successfully!", { id: toastId });
      setIsDeleteOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete product", { id: toastId });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Products Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your store items, pricing, inventory stock, and details.
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="bg-black hover:bg-slate-800 text-white rounded-xl shadow-md flex items-center gap-2 font-semibold h-10 px-4"
        >
          <Plus className="h-4 w-4" />
          Add New Product
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <Card className="rounded-2xl border-slate-200/80 shadow-sm bg-white p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products by name, brand, or keyword..."
              className="pl-9 rounded-xl border-slate-200 bg-slate-50/60 focus:bg-white text-xs h-10"
            />
          </div>

          <div>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border-slate-200 bg-slate-50/60 focus:bg-white text-xs h-10"
            >
              <option value="">All Categories</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* Products Table */}
      <Card className="rounded-2xl border-slate-200/80 shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-slate-400">
              <div className="inline-block h-6 w-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mb-2" />
              <p>Loading products catalog...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-400 space-y-3">
              <Package className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-700">No products found</p>
              <p className="text-xs text-slate-400">
                Try adjusting your search query or add a new product.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-6">Product</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition group">
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative shrink-0">
                            {item.thumbnail ? (
                              <img
                                src={item.thumbnail}
                                alt={item.title}
                                className="h-full w-full object-cover object-center"
                              />
                            ) : (
                              <ImageIcon className="h-6 w-6 text-slate-400 m-auto" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 text-xs truncate max-w-xs">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium">
                              Brand: {item.brand || "Generic"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-[10px] font-semibold">
                          {item.category}
                        </Badge>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-xs">
                          <PriceFormat amount={item.price} />
                        </div>
                        {item.discountPercentage > 0 && (
                          <div className="text-[10px] text-emerald-600 font-bold">
                            {item.discountPercentage}% OFF
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.stock > 5
                              ? "bg-emerald-50 text-emerald-700"
                              : item.stock > 0
                              ? "bg-amber-50 text-amber-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {item.stock} in stock
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span>{item.rating || 5.0}</span>
                        </div>
                      </td>

                      <td className="py-3 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/products/${item.id}`} target="_blank">
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-900">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </Link>

                          <Button
                            onClick={() => handleOpenEdit(item)}
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            onClick={() => handleOpenDelete(item)}
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ================= ADD PRODUCT MODAL ================= */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Create a new product listing for your storefront catalog.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitAdd} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">Product Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Category *</label>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1"
                >
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Brand</label>
                <Input
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="e.g. Sony, Apple, Nike"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Price ($) *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="299.99"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Discount (%)</label>
                <Input
                  type="number"
                  value={formData.discountPercentage}
                  onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                  placeholder="10"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Stock Quantity</label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="25"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Thumbnail Image URL *</label>
                <Input
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed product highlights, specifications and features..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="bg-black hover:bg-slate-800 text-white rounded-xl"
              >
                {isCreating ? "Saving Product..." : "Create Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= EDIT PRODUCT MODAL ================= */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product details, pricing or inventory stock.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitEdit} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">Product Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Category</label>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1"
                >
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Brand</label>
                <Input
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Price ($) *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Discount (%)</label>
                <Input
                  type="number"
                  value={formData.discountPercentage}
                  onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Stock Quantity</label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Thumbnail URL</label>
                <Input
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="bg-black hover:bg-slate-800 text-white rounded-xl"
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= DELETE CONFIRM MODAL ================= */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Product?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-bold text-slate-900">&quot;{selectedProduct?.title}&quot;</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
            >
              {isDeleting ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
