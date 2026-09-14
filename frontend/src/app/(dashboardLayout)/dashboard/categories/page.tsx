/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef } from "react";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useCreateSubcategoryMutation,
  useUpdateSubcategoryMutation,
  useDeleteSubcategoryMutation,
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
  UploadCloud,
  X,
  Link2,
  ChevronRight,
  ChevronDown,
  GitBranch,
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

  const [createSubcategory, { isLoading: isCreatingSub }] =
    useCreateSubcategoryMutation();
  const [updateSubcategory, { isLoading: isUpdatingSub }] =
    useUpdateSubcategoryMutation();
  const [deleteSubcategory, { isLoading: isDeletingSub }] =
    useDeleteSubcategoryMutation();

  // Accordion Expand State for Method 1
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});

  const toggleExpand = (catId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // Category Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  // Subcategory Modal States
  const [isAddSubOpen, setIsAddSubOpen] = useState(false);
  const [isEditSubOpen, setIsEditSubOpen] = useState(false);
  const [isDeleteSubOpen, setIsDeleteSubOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<any>(null);

  // Category Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
  });

  // Subcategory Form state
  const [subFormData, setSubFormData] = useState({
    name: "",
    slug: "",
    description: "",
    categoryId: "",
    imageUrl: "",
  });

  // Category Image Upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageInputMode, setImageInputMode] = useState<"file" | "url">("file");

  // Subcategory Image Upload state
  const [subImageFile, setSubImageFile] = useState<File | null>(null);
  const [subImagePreview, setSubImagePreview] = useState<string>("");
  const [subImageInputMode, setSubImageInputMode] = useState<"file" | "url">("file");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const subFileInputRef = useRef<HTMLInputElement>(null);
  const editSubFileInputRef = useRef<HTMLInputElement>(null);

  const categories = data?.data || [];

  const filteredCategories = categories.filter(
    (c: any) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.subcategories &&
        c.subcategories.some(
          (s: any) =>
            s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.slug?.toLowerCase().includes(searchTerm.toLowerCase())
        ))
  );

  // Category Handlers
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
      cat.image && !cat.image.includes("/uploads/") ? "url" : "file"
    );
    setIsEditOpen(true);
  };

  const handleOpenDelete = (cat: any) => {
    setSelectedCategory(cat);
    setIsDeleteOpen(true);
  };

  // Subcategory Handlers
  const handleOpenAddSub = (parentCat?: any) => {
    const defaultCatId = parentCat?.id || categories[0]?.id || "";
    setSubFormData({
      name: "",
      slug: "",
      description: "",
      categoryId: defaultCatId,
      imageUrl: "",
    });
    setSubImageFile(null);
    setSubImagePreview("");
    setSubImageInputMode("file");
    setIsAddSubOpen(true);
  };

  const handleOpenEditSub = (sub: any, parentCat?: any) => {
    setSelectedSubcategory(sub);
    setSubFormData({
      name: sub.name || "",
      slug: sub.slug || "",
      description: sub.description || "",
      categoryId: sub.categoryId || parentCat?.id || "",
      imageUrl: sub.image || "",
    });
    setSubImageFile(null);
    setSubImagePreview(sub.image || "");
    setSubImageInputMode(
      sub.image && !sub.image.includes("/uploads/") ? "url" : "file"
    );
    setIsEditSubOpen(true);
  };

  const handleOpenDeleteSub = (sub: any) => {
    setSelectedSubcategory(sub);
    setIsDeleteSubOpen(true);
  };

  // Image Upload Handlers
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

  const handleSubFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB limit");
        return;
      }
      setSubImageFile(file);
      setSubImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (editFileInputRef.current) editFileInputRef.current.value = "";
  };

  const handleRemoveSubImage = () => {
    setSubImageFile(null);
    setSubImagePreview("");
    setSubFormData((prev) => ({ ...prev, imageUrl: "" }));
    if (subFileInputRef.current) subFileInputRef.current.value = "";
    if (editSubFileInputRef.current) editSubFileInputRef.current.value = "";
  };

  // Submit Category Add
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
        await createCategory({
          name: formData.name.trim(),
          slug: formData.slug.trim() || undefined,
          description: formData.description.trim() || undefined,
          image: formData.imageUrl.trim() || undefined,
        }).unwrap();
      }

      toast.success("Category created successfully", { id: toastId });
      setIsAddOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create category", {
        id: toastId,
      });
    }
  };

  // Submit Category Edit
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory?.id) return;

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
        await updateCategory({
          id: selectedCategory.id,
          name: formData.name.trim(),
          slug: formData.slug.trim() || undefined,
          description: formData.description.trim() || undefined,
          image: formData.imageUrl.trim() || undefined,
        }).unwrap();
      }

      toast.success("Category updated successfully", { id: toastId });
      setIsEditOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update category", {
        id: toastId,
      });
    }
  };

  // Confirm Category Delete
  const handleConfirmDelete = async () => {
    if (!selectedCategory?.id) return;
    const toastId = toast.loading("Deleting category...");
    try {
      await deleteCategory(selectedCategory.id).unwrap();
      toast.success("Category deleted successfully", { id: toastId });
      setIsDeleteOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete category", {
        id: toastId,
      });
    }
  };

  // Submit Subcategory Add
  const handleSubmitAddSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subFormData.name.trim()) {
      toast.error("Subcategory name is required");
      return;
    }
    if (!subFormData.categoryId) {
      toast.error("Please select a parent category");
      return;
    }

    const toastId = toast.loading("Creating subcategory...");
    try {
      if (subImageFile) {
        const payload = new FormData();
        payload.append("name", subFormData.name.trim());
        payload.append("categoryId", subFormData.categoryId);
        if (subFormData.slug.trim()) payload.append("slug", subFormData.slug.trim());
        if (subFormData.description.trim())
          payload.append("description", subFormData.description.trim());
        payload.append("image", subImageFile);
        await createSubcategory(payload).unwrap();
      } else {
        await createSubcategory({
          name: subFormData.name.trim(),
          categoryId: subFormData.categoryId,
          slug: subFormData.slug.trim() || undefined,
          description: subFormData.description.trim() || undefined,
          image: subFormData.imageUrl.trim() || undefined,
        }).unwrap();
      }

      // Automatically expand parent category so new subcategory is visible
      setExpandedCategories((prev) => ({
        ...prev,
        [subFormData.categoryId]: true,
      }));

      toast.success("Subcategory created successfully", { id: toastId });
      setIsAddSubOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create subcategory", {
        id: toastId,
      });
    }
  };

  // Submit Subcategory Edit
  const handleSubmitEditSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubcategory?.id) return;

    const toastId = toast.loading("Updating subcategory...");
    try {
      if (subImageFile) {
        const payload = new FormData();
        payload.append("id", selectedSubcategory.id);
        payload.append("name", subFormData.name.trim());
        if (subFormData.categoryId)
          payload.append("categoryId", subFormData.categoryId);
        if (subFormData.slug.trim()) payload.append("slug", subFormData.slug.trim());
        if (subFormData.description.trim())
          payload.append("description", subFormData.description.trim());
        payload.append("image", subImageFile);
        await updateSubcategory(payload).unwrap();
      } else {
        await updateSubcategory({
          id: selectedSubcategory.id,
          name: subFormData.name.trim(),
          categoryId: subFormData.categoryId || undefined,
          slug: subFormData.slug.trim() || undefined,
          description: subFormData.description.trim() || undefined,
          image: subFormData.imageUrl.trim() || undefined,
        }).unwrap();
      }

      toast.success("Subcategory updated successfully", { id: toastId });
      setIsEditSubOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update subcategory", {
        id: toastId,
      });
    }
  };

  // Confirm Subcategory Delete
  const handleConfirmDeleteSub = async () => {
    if (!selectedSubcategory?.id) return;
    const toastId = toast.loading("Deleting subcategory...");
    try {
      await deleteSubcategory(selectedSubcategory.id).unwrap();
      toast.success("Subcategory deleted successfully", { id: toastId });
      setIsDeleteSubOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete subcategory", {
        id: toastId,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Layers className="h-6 w-6 text-black" />
            Categories & Subcategories
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize catalog hierarchy, manage categories and nested subcategories across your store.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => handleOpenAddSub()}
            variant="outline"
            className="rounded-xl shadow-xs flex items-center gap-2 font-semibold h-10 px-4 border-slate-300 hover:bg-slate-50 text-slate-800"
          >
            <GitBranch className="h-4 w-4 text-slate-600" />
            Add Subcategory
          </Button>

          <Button
            onClick={handleOpenAdd}
            className="bg-black hover:bg-slate-800 text-white rounded-xl shadow-md flex items-center gap-2 font-semibold h-10 px-4"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card className="rounded-2xl border-slate-200/80 shadow-sm bg-white p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search category or subcategory by name, slug, or description..."
              className="pl-9 rounded-xl border-slate-200 bg-slate-50/60 focus:bg-white text-xs h-10"
            />
          </div>

          <div className="flex items-center justify-start sm:justify-end gap-2">
            <Badge
              variant="secondary"
              className="bg-slate-100 text-slate-700 text-xs px-3 py-2 rounded-xl font-semibold"
            >
              {filteredCategories.length} Categories
            </Badge>
          </div>
        </div>
      </Card>

      {/* Categories Table (Method 1: Hierarchical Expandable Rows) */}
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
                    Category / Subcategories
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
                {filteredCategories.map((item: any) => {
                  const isExpanded = !!expandedCategories[item.id];
                  const subcategories: any[] = item.subcategories || [];

                  return (
                    <div key={item.id} className="contents">
                      {/* Main Category Row */}
                      <TableRow
                        className={`transition group border-b border-slate-100 ${
                          isExpanded ? "bg-slate-50/80" : "hover:bg-slate-50/60"
                        }`}
                      >
                        <TableCell className="py-3.5 px-6">
                          <div className="flex items-center gap-2">
                            {/* Expand Toggle Chevron */}
                            <button
                              type="button"
                              onClick={() => toggleExpand(item.id)}
                              className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-500 hover:text-slate-900 transition shrink-0"
                              title={
                                isExpanded
                                  ? "Collapse subcategories"
                                  : "Expand subcategories"
                              }
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-slate-800" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </button>

                            {/* Category Thumbnail */}
                            <div className="h-11 w-11 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative shrink-0 flex items-center justify-center">
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

                            {/* Category Info */}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                                  {item.name}
                                </span>

                                {/* Subcategories count badge */}
                                <button
                                  type="button"
                                  onClick={() => toggleExpand(item.id)}
                                  className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full transition ${
                                    subcategories.length > 0
                                      ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                      : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                                  }`}
                                >
                                  <GitBranch className="w-2.5 h-2.5" />
                                  <span>
                                    {subcategories.length}{" "}
                                    {subcategories.length === 1
                                      ? "subcategory"
                                      : "subcategories"}
                                  </span>
                                </button>
                              </div>

                              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                                {item.createdAt
                                  ? new Date(item.createdAt).toLocaleDateString()
                                  : "Active"}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-3.5 px-4">
                          <code className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                            /{item.slug}
                          </code>
                        </TableCell>

                        <TableCell className="py-3.5 px-4">
                          <span className="text-xs text-slate-500 line-clamp-1 max-w-xs">
                            {item.description || "—"}
                          </span>
                        </TableCell>

                        <TableCell className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            {item.productsCount ?? 0} products
                          </span>
                        </TableCell>

                        <TableCell className="py-3.5 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Quick Add Subcategory button */}
                            <Button
                              onClick={() => handleOpenAddSub(item)}
                              size="sm"
                              variant="outline"
                              className="h-8 px-2.5 rounded-lg text-xs font-semibold gap-1 text-slate-700 hover:bg-slate-100 hover:text-black border-slate-200"
                              title="Add Subcategory"
                            >
                              <Plus className="h-3 w-3" />
                              <span className="hidden lg:inline">Subcategory</span>
                            </Button>

                            <Button
                              onClick={() => handleOpenEdit(item)}
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                              title="Edit Category"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>

                            <Button
                              onClick={() => handleOpenDelete(item)}
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700"
                              title="Delete Category"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Subcategories Sub-Table (Method 1) */}
                      {isExpanded && (
                        <TableRow className="bg-slate-50/60 hover:bg-slate-50/60 border-b border-slate-200/80">
                          <TableCell colSpan={5} className="p-0">
                            <div className="py-3 px-6 sm:pl-16 pr-6">
                              <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-3">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                  <div className="flex items-center gap-2">
                                    <GitBranch className="h-4 w-4 text-slate-600" />
                                    <span className="text-xs font-bold text-slate-900">
                                      Subcategories of &quot;{item.name}&quot;
                                    </span>
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px] py-0 px-2 font-bold bg-slate-100 text-slate-700"
                                    >
                                      {subcategories.length}
                                    </Badge>
                                  </div>

                                  <Button
                                    onClick={() => handleOpenAddSub(item)}
                                    size="sm"
                                    className="h-7 px-3 text-xs bg-black hover:bg-slate-800 text-white rounded-lg flex items-center gap-1.5 font-semibold"
                                  >
                                    <Plus className="h-3 w-3" />
                                    <span>Add Subcategory</span>
                                  </Button>
                                </div>

                                {subcategories.length === 0 ? (
                                  <div className="py-6 text-center text-xs text-slate-400 space-y-1">
                                    <p>No subcategories created for this category yet.</p>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenAddSub(item)}
                                      className="text-slate-900 font-bold hover:underline cursor-pointer"
                                    >
                                      + Create first subcategory
                                    </button>
                                  </div>
                                ) : (
                                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                                    {subcategories.map((sub: any) => (
                                      <div
                                        key={sub.id}
                                        className="flex items-center justify-between p-2.5 hover:bg-slate-50/80 transition"
                                      >
                                        <div className="flex items-center gap-3 min-w-0">
                                          <div className="h-9 w-9 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                            {sub.image ? (
                                              <img
                                                src={sub.image}
                                                alt={sub.name}
                                                className="h-full w-full object-cover"
                                              />
                                            ) : (
                                              <FolderOpen className="h-4 w-4 text-slate-400" />
                                            )}
                                          </div>
                                          <div className="min-w-0">
                                            <div className="text-xs font-bold text-slate-900 truncate">
                                              {sub.name}
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                              <code className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                                                /{sub.slug}
                                              </code>
                                              {sub.description && (
                                                <span className="truncate max-w-xs text-slate-500 hidden sm:inline">
                                                  • {sub.description}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0">
                                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                            {sub.productsCount ?? 0} products
                                          </span>
                                          <div className="flex items-center gap-1">
                                            <Button
                                              onClick={() =>
                                                handleOpenEditSub(sub, item)
                                              }
                                              size="icon"
                                              variant="ghost"
                                              className="h-7 w-7 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                                              title="Edit Subcategory"
                                            >
                                              <Edit2 className="h-3 w-3" />
                                            </Button>
                                            <Button
                                              onClick={() =>
                                                handleOpenDeleteSub(sub)
                                              }
                                              size="icon"
                                              variant="ghost"
                                              className="h-7 w-7 rounded-md text-red-500 hover:bg-red-50 hover:text-red-700"
                                              title="Delete Subcategory"
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </div>
                  );
                })}
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
              Create a new top-level category for storefront catalog and navigation.
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
                  placeholder="e.g. Electronics, Fashion, Home"
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
                  placeholder="e.g. electronics (auto-generated if empty)"
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
              Update category details, slug, and thumbnail image.
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
                {isUpdating ? "Saving Changes..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= DELETE CATEGORY MODAL ================= */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Category
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedCategory?.name}&quot;?
              This will also remove its subcategories. Products will lose their category association.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 mt-3">
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
              variant="destructive"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="rounded-xl"
            >
              {isDeleting ? "Deleting..." : "Yes, Delete Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================= ADD SUBCATEGORY MODAL ================= */}
      <Dialog open={isAddSubOpen} onOpenChange={setIsAddSubOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-slate-800" />
              Add New Subcategory
            </DialogTitle>
            <DialogDescription>
              Create a child subcategory under a parent category.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitAddSub} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Parent Category Selection */}
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">
                  Parent Category *
                </label>
                <select
                  value={subFormData.categoryId}
                  onChange={(e) =>
                    setSubFormData({
                      ...subFormData,
                      categoryId: e.target.value,
                    })
                  }
                  className="w-full mt-1 h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-950"
                  required
                >
                  <option value="" disabled>
                    Select Parent Category
                  </option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory Name */}
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">
                  Subcategory Name *
                </label>
                <Input
                  value={subFormData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const autoSlug = name
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)+/g, "");
                    setSubFormData({
                      ...subFormData,
                      name,
                      slug: autoSlug,
                    });
                  }}
                  placeholder="e.g. Wireless Headphones, Smart Watches, T-Shirts"
                  className="mt-1"
                  required
                />
              </div>

              {/* Subcategory Slug */}
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">
                  Subcategory Slug (optional)
                </label>
                <Input
                  value={subFormData.slug}
                  onChange={(e) =>
                    setSubFormData({ ...subFormData, slug: e.target.value })
                  }
                  placeholder="e.g. wireless-headphones"
                  className="mt-1 font-mono text-xs"
                />
              </div>

              {/* Subcategory Image Field */}
              <div className="sm:col-span-2 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    Subcategory Image (Optional)
                  </label>
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px]">
                    <button
                      type="button"
                      onClick={() => setSubImageInputMode("file")}
                      className={`px-2 py-0.5 rounded-md font-medium transition ${
                        subImageInputMode === "file"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubImageInputMode("url")}
                      className={`px-2 py-0.5 rounded-md font-medium transition ${
                        subImageInputMode === "url"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {subImageInputMode === "file" ? (
                  <div>
                    <input
                      type="file"
                      ref={subFileInputRef}
                      onChange={handleSubFileChange}
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                    />

                    {subImagePreview ? (
                      <div className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-slate-50/60">
                        <div className="h-14 w-14 rounded-lg overflow-hidden border border-slate-200 relative shrink-0 bg-white">
                          <img
                            src={subImagePreview}
                            alt="Subcategory preview"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {subImageFile?.name || "Selected Image"}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {subImageFile
                              ? `${(subImageFile.size / 1024).toFixed(1)} KB`
                              : "Ready to upload"}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={handleRemoveSubImage}
                          className="h-8 w-8 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        onClick={() => subFileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 hover:border-slate-400 hover:bg-slate-50/60 transition rounded-xl p-4 text-center cursor-pointer space-y-1.5"
                      >
                        <UploadCloud className="h-6 w-6 text-slate-400 mx-auto" />
                        <p className="text-xs font-semibold text-slate-700">
                          Click to upload subcategory image or icon
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
                        value={subFormData.imageUrl}
                        onChange={(e) => {
                          setSubFormData({
                            ...subFormData,
                            imageUrl: e.target.value,
                          });
                          setSubImagePreview(e.target.value);
                        }}
                        placeholder="https://example.com/subcategory.jpg"
                        className="pl-9"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Subcategory Description */}
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">
                  Description (Optional)
                </label>
                <Textarea
                  value={subFormData.description}
                  onChange={(e) =>
                    setSubFormData({
                      ...subFormData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Brief description of this subcategory..."
                  className="mt-1"
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddSubOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreatingSub}
                className="bg-black hover:bg-slate-800 text-white rounded-xl"
              >
                {isCreatingSub ? "Saving Subcategory..." : "Create Subcategory"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= EDIT SUBCATEGORY MODAL ================= */}
      <Dialog open={isEditSubOpen} onOpenChange={setIsEditSubOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-slate-800" />
              Edit Subcategory
            </DialogTitle>
            <DialogDescription>
              Update subcategory name, parent category, and details.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitEditSub} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Parent Category Selection */}
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">
                  Parent Category *
                </label>
                <select
                  value={subFormData.categoryId}
                  onChange={(e) =>
                    setSubFormData({
                      ...subFormData,
                      categoryId: e.target.value,
                    })
                  }
                  className="w-full mt-1 h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-950"
                  required
                >
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory Name */}
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">
                  Subcategory Name *
                </label>
                <Input
                  value={subFormData.name}
                  onChange={(e) =>
                    setSubFormData({ ...subFormData, name: e.target.value })
                  }
                  className="mt-1"
                  required
                />
              </div>

              {/* Subcategory Slug */}
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">
                  Subcategory Slug
                </label>
                <Input
                  value={subFormData.slug}
                  onChange={(e) =>
                    setSubFormData({ ...subFormData, slug: e.target.value })
                  }
                  className="mt-1 font-mono text-xs"
                />
              </div>

              {/* Subcategory Image Field */}
              <div className="sm:col-span-2 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    Subcategory Image
                  </label>
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px]">
                    <button
                      type="button"
                      onClick={() => setSubImageInputMode("file")}
                      className={`px-2 py-0.5 rounded-md font-medium transition ${
                        subImageInputMode === "file"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubImageInputMode("url")}
                      className={`px-2 py-0.5 rounded-md font-medium transition ${
                        subImageInputMode === "url"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {subImageInputMode === "file" ? (
                  <div>
                    <input
                      type="file"
                      ref={editSubFileInputRef}
                      onChange={handleSubFileChange}
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                    />

                    {subImagePreview ? (
                      <div className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-slate-50/60">
                        <div className="h-14 w-14 rounded-lg overflow-hidden border border-slate-200 relative shrink-0 bg-white">
                          <img
                            src={subImagePreview}
                            alt="Subcategory preview"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {subImageFile?.name || "Current Image"}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {subImageFile
                              ? `${(subImageFile.size / 1024).toFixed(1)} KB`
                              : "Click change to select new image"}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => editSubFileInputRef.current?.click()}
                          className="text-xs rounded-lg"
                        >
                          Change
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={handleRemoveSubImage}
                          className="h-8 w-8 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        onClick={() => editSubFileInputRef.current?.click()}
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
                        value={subFormData.imageUrl}
                        onChange={(e) => {
                          setSubFormData({
                            ...subFormData,
                            imageUrl: e.target.value,
                          });
                          setSubImagePreview(e.target.value);
                        }}
                        placeholder="https://example.com/subcategory.jpg"
                        className="pl-9"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Subcategory Description */}
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">
                  Description
                </label>
                <Textarea
                  value={subFormData.description}
                  onChange={(e) =>
                    setSubFormData({
                      ...subFormData,
                      description: e.target.value,
                    })
                  }
                  className="mt-1"
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditSubOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdatingSub}
                className="bg-black hover:bg-slate-800 text-white rounded-xl"
              >
                {isUpdatingSub ? "Saving Changes..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= DELETE SUBCATEGORY MODAL ================= */}
      <Dialog open={isDeleteSubOpen} onOpenChange={setIsDeleteSubOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Subcategory
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete subcategory &quot;
              {selectedSubcategory?.name}&quot;? Products with this subcategory
              will have their subcategory association removed.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 mt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteSubOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeletingSub}
              onClick={handleConfirmDeleteSub}
              className="rounded-xl"
            >
              {isDeletingSub ? "Deleting..." : "Yes, Delete Subcategory"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
