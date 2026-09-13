"use client";

import { useState } from "react";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
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
} from "lucide-react";
import toast from "react-hot-toast";

export default function CategoriesManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, isLoading } = useGetCategoriesQuery(undefined);

  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
  });

  const categories = data?.data || [];

  const filteredCategories = categories.filter((c: any) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setFormData({ name: "", slug: "", description: "", image: "" });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (cat: any) => {
    setSelectedCategory(cat);
    setFormData({
      name: cat.name || "",
      slug: cat.slug || "",
      description: cat.description || "",
      image: cat.image || "",
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (cat: any) => {
    setSelectedCategory(cat);
    setIsDeleteOpen(true);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Category name is required");
      return;
    }

    const toastId = toast.loading("Adding category...");
    try {
      await createCategory(formData).unwrap();
      toast.success("Category created successfully!", { id: toastId });
      setIsAddOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create category", { id: toastId });
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;

    const toastId = toast.loading("Updating category...");
    try {
      await updateCategory({ id: selectedCategory.id, ...formData }).unwrap();
      toast.success("Category updated successfully!", { id: toastId });
      setIsEditOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update category", { id: toastId });
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
      toast.error(err?.data?.message || "Failed to delete category", { id: toastId });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Categories Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize and classify products across your ecommerce catalog.
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="bg-black hover:bg-slate-800 text-white rounded-xl shadow-md flex items-center gap-2 font-semibold h-10 px-4"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Search */}
      <Card className="rounded-2xl border-slate-200/80 shadow-sm bg-white p-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search category by name..."
            className="pl-9 rounded-xl border-slate-200 bg-slate-50/60 focus:bg-white text-xs h-10"
          />
        </div>
      </Card>

      {/* Categories Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-full p-12 text-center text-sm text-slate-400">
            <div className="inline-block h-6 w-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mb-2" />
            <p>Loading categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="col-span-full p-12 text-center text-sm text-slate-400 space-y-3 bg-white rounded-2xl border border-slate-200/80">
            <FolderOpen className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700">No categories found</p>
          </div>
        ) : (
          filteredCategories.map((cat: any) => (
            <Card
              key={cat.id}
              className="rounded-2xl border-slate-200/80 shadow-sm hover:shadow-md transition bg-white overflow-hidden flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-slate-900">
                        {cat.name}
                      </CardTitle>
                      <CardDescription className="text-[11px] font-mono text-slate-400">
                        /{cat.slug}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      onClick={() => handleOpenEdit(cat)}
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-lg text-slate-600 hover:bg-slate-100"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      onClick={() => handleOpenDelete(cat)}
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {cat.description || "No description provided."}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* ================= ADD MODAL ================= */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>
              Create a new category for products classification.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitAdd} className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700">Category Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Gaming & VR"
                className="mt-1"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Slug (optional)</label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g. gaming-vr"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief category summary..."
                className="mt-1"
                rows={3}
              />
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
                {isCreating ? "Creating..." : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= EDIT MODAL ================= */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update category details.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitEdit} className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700">Category Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Slug</label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1"
                rows={3}
              />
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

      {/* ================= DELETE MODAL ================= */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Category?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-bold text-slate-900">&quot;{selectedCategory?.name}&quot;</span>?
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
