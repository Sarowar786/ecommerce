/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef } from "react";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/redux/api/ecommerceApi";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  FolderOpen,
  Image as ImageIcon,
  UploadCloud,
  X,
  Link2,
} from "lucide-react";
import toast from "react-hot-toast";

export default function CategoriesManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, isLoading } = useGetCategoriesQuery(undefined);

  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
  });

  // Image Upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageInputMode, setImageInputMode] = useState<"file" | "url">("file");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const categories = data?.data || [];

  const filteredCategories = categories.filter(
    (c: any) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleOpenAdd = () => {
    setFormData({ name: "", slug: "", description: "", imageUrl: "" });
    setImageFile(null);
    setImagePreview("");
    setImageInputMode("file");
    setIsAddOpen(true);
  };

  const handleOpenEdit = (cat: any) => {
    setSelectedCategory(cat);
    setFormData({
      name: cat.name || "",
      slug: cat.slug || "",
      description: cat.description || "",
      imageUrl: cat.image || "",
    });
    setImageFile(null);
    setImagePreview(cat.image || "");
    setImageInputMode(
      cat.image && !cat.image.includes("/uploads/") ? "url" : "file",
    );
    setIsEditOpen(true);
  };

  const handleOpenDelete = (cat: any) => {
    setSelectedCategory(cat);
    setIsDeleteOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB limit");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (editFileInputRef.current) editFileInputRef.current.value = "";
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    const toastId = toast.loading("Adding new category...");
    try {
      if (imageFile) {
        const payload = new FormData();
        payload.append("name", formData.name.trim());
        if (formData.slug.trim()) payload.append("slug", formData.slug.trim());
        if (formData.description.trim())
          payload.append("description", formData.description.trim());
        payload.append("image", imageFile);

        await createCategory(payload).unwrap();
      } else {
        const payload = {
          name: formData.name.trim(),
          slug: formData.slug.trim() || undefined,
          description: formData.description.trim() || undefined,
          image: formData.imageUrl.trim() || undefined,
        };

        await createCategory(payload).unwrap();
      }

      toast.success("Category created successfully!", { id: toastId });
      setIsAddOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create category", {
        id: toastId,
      });
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    const toastId = toast.loading("Updating category...");
    try {
      if (imageFile) {
        const payload = new FormData();
        payload.append("id", selectedCategory.id);
        payload.append("name", formData.name.trim());
        if (formData.slug.trim()) payload.append("slug", formData.slug.trim());
        if (formData.description.trim())
          payload.append("description", formData.description.trim());
        payload.append("image", imageFile);

        await updateCategory(payload).unwrap();
      } else {
        const payload = {
          id: selectedCategory.id,
          name: formData.name.trim(),
          slug: formData.slug.trim() || undefined,
          description: formData.description.trim() || undefined,
          image:
            formData.imageUrl.trim() ||
            (imagePreview ? imagePreview : undefined),
        };

        await updateCategory(payload).unwrap();
      }

      toast.success("Category updated successfully!", { id: toastId });
      setIsEditOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update category", {
        id: toastId,
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    const toastId = toast.loading("Deleting category...");
    try {
      await deleteCategory(selectedCategory.id).unwrap();
      toast.success("Category deleted successfully!", { id: toastId });
      setIsDeleteOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete category", {
        id: toastId,
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Categories Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize, classify products, and manage category media across your
            store.
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="bg-black hover:bg-slate-800 text-white rounded-xl shadow-md flex items-center gap-2 font-semibold h-10 px-4"
        >
          <Plus className="h-4 w-4" />
          Add New Category
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <Card className="rounded-2xl border-slate-200/80 shadow-sm bg-white p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search category by name, slug, or description..."
              className="pl-9 rounded-xl border-slate-200 bg-slate-50/60 focus:bg-white text-xs h-10"
            />
          </div>

          <div className="flex items-center justify-start sm:justify-end">
            <Badge
              variant="secondary"
              className="bg-slate-100 text-slate-700 text-xs px-3 py-2 rounded-xl font-semibold"
            >
              {filteredCategories.length} Categories Found
            </Badge>
          </div>
        </div>
      </Card>

      {/* Categories Table */}
      <Card className="rounded-2xl border-slate-200/80 shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-slate-400">
              <div className="inline-block h-6 w-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mb-2" />
              <p>Loading categories catalog...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-400 space-y-3">
              <FolderOpen className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-700">
                No categories found
              </p>
              <p className="text-xs text-slate-400">
                Try adjusting your search query or add a new category.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-100 bg-slate-50/70 hover:bg-slate-50/70">
                  <TableHead className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Category
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Slug
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Description
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Products
                  </TableHead>
                  <TableHead className="py-3 px-6 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((item: any) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-slate-50/70 transition group"
                  >
                    <TableCell className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative shrink-0 flex items-center justify-center">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover object-center"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-amber-50 text-amber-600">
                              <Layers className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 text-xs truncate max-w-xs">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString()
                              : "Active"}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-3 px-4">
                      <code className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        /{item.slug}
                      </code>
                    </TableCell>

                    <TableCell className="py-3 px-4">
                      <span className="text-xs text-slate-500 line-clamp-1 max-w-xs">
                        {item.description || "—"}
                      </span>
                    </TableCell>

                    <TableCell className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        {item.productsCount ?? 0} products
                      </span>
                    </TableCell>

                    <TableCell className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ================= ADD CATEGORY MODAL ================= */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new category for storefront catalog and product
              navigation.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitAdd} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">
                  Category Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Headphones & Audio"
                  className="mt-1"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">
                  Category Slug (optional)
                </label>
                <Input
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="e.g. headphones-audio (auto-generated if empty)"
                  className="mt-1"
                />
              </div>

              {/* Category Image Field */}
              <div className="sm:col-span-2 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    Category Image
                  </label>
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px]">
                    <button
                      type="button"
                      onClick={() => setImageInputMode("file")}
                      className={`px-2 py-0.5 rounded-md font-medium transition ${
                        imageInputMode === "file"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode("url")}
                      className={`px-2 py-0.5 rounded-md font-medium transition ${
                        imageInputMode === "url"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {imageInputMode === "file" ? (
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                    />

                    {imagePreview ? (
                      <div className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-slate-50/60">
                        <div className="h-14 w-14 rounded-lg overflow-hidden border border-slate-200 relative shrink-0 bg-white">
                          <img
                            src={imagePreview}
                            alt="Category preview"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {imageFile?.name || "Selected Image"}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {imageFile
                              ? `${(imageFile.size / 1024).toFixed(1)} KB`
                              : "Ready to upload"}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={handleRemoveImage}
                          className="h-8 w-8 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 hover:border-slate-400 hover:bg-slate-50/60 transition rounded-xl p-4 text-center cursor-pointer space-y-1.5"
                      >
                        <UploadCloud className="h-6 w-6 text-slate-400 mx-auto" />
                        <p className="text-xs font-semibold text-slate-700">
                          Click or drag category image here
                        </p>
                        <p className="text-[11px] text-slate-400">
                          PNG, JPG, or WEBP up to 5MB
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="relative">
                      <Link2 className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        value={formData.imageUrl}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            imageUrl: e.target.value,
                          });
                          setImagePreview(e.target.value);
                        }}
                        placeholder="https://example.com/category.jpg"
                        className="pl-9"
                      />
                    </div>
                    {formData.imageUrl && (
                      <div className="mt-2 h-14 w-14 rounded-lg overflow-hidden border border-slate-200 relative bg-slate-50">
                        <img
                          src={formData.imageUrl}
                          alt="URL preview"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of this category..."
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
                {isCreating ? "Saving Category..." : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= EDIT CATEGORY MODAL ================= */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update category details, classification, and thumbnail image.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitEdit} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">
                  Category Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">
                  Category Slug
                </label>
                <Input
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              {/* Edit Category Image Field */}
              <div className="sm:col-span-2 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    Category Image
                  </label>
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px]">
                    <button
                      type="button"
                      onClick={() => setImageInputMode("file")}
                      className={`px-2 py-0.5 rounded-md font-medium transition ${
                        imageInputMode === "file"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode("url")}
                      className={`px-2 py-0.5 rounded-md font-medium transition ${
                        imageInputMode === "url"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {imageInputMode === "file" ? (
                  <div>
                    <input
                      type="file"
                      ref={editFileInputRef}
                      onChange={handleFileChange}
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                    />

                    {imagePreview ? (
                      <div className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-slate-50/60">
                        <div className="h-14 w-14 rounded-lg overflow-hidden border border-slate-200 relative shrink-0 bg-white">
                          <img
                            src={imagePreview}
                            alt="Category preview"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {imageFile?.name || "Current Image"}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {imageFile
                              ? `${(imageFile.size / 1024).toFixed(1)} KB`
                              : "Click change to select new image"}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => editFileInputRef.current?.click()}
                          className="text-xs rounded-lg"
                        >
                          Change
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={handleRemoveImage}
                          className="h-8 w-8 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        onClick={() => editFileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 hover:border-slate-400 hover:bg-slate-50/60 transition rounded-xl p-4 text-center cursor-pointer space-y-1.5"
                      >
                        <UploadCloud className="h-6 w-6 text-slate-400 mx-auto" />
                        <p className="text-xs font-semibold text-slate-700">
                          Click to upload replacement image
                        </p>
                        <p className="text-[11px] text-slate-400">
                          PNG, JPG, or WEBP up to 5MB
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="relative">
                      <Link2 className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        value={formData.imageUrl}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            imageUrl: e.target.value,
                          });
                          setImagePreview(e.target.value);
                        }}
                        placeholder="https://example.com/category.jpg"
                        className="pl-9"
                      />
                    </div>
                    {imagePreview && (
                      <div className="mt-2 h-14 w-14 rounded-lg overflow-hidden border border-slate-200 relative bg-slate-50">
                        <img
                          src={imagePreview}
                          alt="URL preview"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
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
            <DialogTitle>Delete Category?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-bold text-slate-900">
                &quot;{selectedCategory?.name}&quot;
              </span>
              ? This action cannot be undone.
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
