/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  useGetCategoriesQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
} from "@/redux/api/ecommerceApi";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Plus,
  Trash2,
  UploadCloud,
  X,
  Image as ImageIcon,
  Video,
  Loader2,
  CheckCircle2,
  Layers,
  Sparkles,
  Link as LinkIcon,
  HelpCircle,
} from "lucide-react";
import Label from "@/components/ui/label";

// Form Validation Schema
const productSchema = z.object({
  productName: z.string().min(2, "Product name must be at least 2 characters"),
  brand: z.string().min(1, "Brand name is required"),
  categoryId: z.string().min(1, "Please select a category"),
  price: z
    .string()
    .min(1, "Price is required")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      "Price must be a valid number greater than 0",
    ),
  discountPercentage: z.string().optional(),
  deliveryTimeline: z.string().min(1, "Delivery timeline is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  videoUrl: z.string().optional(),
  specifications: z
    .array(
      z.object({
        key: z.string().min(1, "Specification title is required"),
        value: z.string().min(1, "Specification value is required"),
      }),
    )
    .min(1, "Add at least one specification"),
  variants: z
    .array(
      z.object({
        color: z.string().min(1, "Color is required"),
        size: z.string().min(1, "Size is required"),
        stock: z.string().min(1, "Stock is required"),
      }),
    )
    .min(1, "Add at least one product variant"),
});

type ProductFormData = z.infer<typeof productSchema>;

const PRESET_COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Gray", hex: "#6B7280" },
  { name: "Navy", hex: "#1E3A8A" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Red", hex: "#EF4444" },
  { name: "Green", hex: "#10B981" },
  { name: "Beige", hex: "#D4B996" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Purple", hex: "#8B5CF6" },
];

const PRESET_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "One Size"];

export default function AddOrEditProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");
  const isEditMode = Boolean(productId);

  // Queries & Mutations
  const { data: catData, isLoading: isCatLoading } =
    useGetCategoriesQuery(undefined);
  const categories = catData?.data || [];

  const { data: productResponse, isLoading: isProductLoading } =
    useGetProductByIdQuery(productId as string, { skip: !productId });
  const existingProduct = productResponse?.data;

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const isSubmitting = isCreating || isUpdating;

  // Media States
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [videoTab, setVideoTab] = useState<"upload" | "url">("upload");

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // React Hook Form
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productName: "",
      brand: "",
      categoryId: "",
      price: "",
      discountPercentage: "0",
      deliveryTimeline: "2-3 business days",
      description: "",
      videoUrl: "",
      specifications: [
        { key: "Brand", value: "" },
        { key: "Condition", value: "Brand New" },
        { key: "Warranty", value: "1 Year Official Warranty" },
        { key: "Shipping", value: "Standard Insured Shipping" },
      ],
      variants: [{ color: "Black", size: "M", stock: "10" }],
    },
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
  });

  const {
    fields: specFields,
    append: appendSpec,
    remove: removeSpec,
  } = useFieldArray({
    control,
    name: "specifications",
  });

  const currentVariants = watch("variants") || [];
  const totalStock = currentVariants.reduce(
    (sum, v) => sum + (Number(v?.stock) || 0),
    0,
  );

  // Pre-fill form in edit mode
  useEffect(() => {
    if (isEditMode && existingProduct) {
      let specs = [
        { key: "Brand", value: existingProduct.brand || "" },
        { key: "Condition", value: "Brand New" },
        {
          key: "Warranty",
          value: existingProduct.warrantyInformation || "1 Year Warranty",
        },
      ];
      if (
        Array.isArray(existingProduct.specifications) &&
        existingProduct.specifications.length > 0
      ) {
        specs = existingProduct.specifications;
      }

      let vars = [
        {
          color: "Black",
          size: "M",
          stock: String(existingProduct.stock || 10),
        },
      ];
      if (
        Array.isArray(existingProduct.variants) &&
        existingProduct.variants.length > 0
      ) {
        vars = existingProduct.variants.map((v: any) => ({
          color: v.color || "Black",
          size: v.size || "M",
          stock: String(v.stock ?? 10),
        }));
      }

      reset({
        productName: existingProduct.title || existingProduct.productName || "",
        brand: existingProduct.brand || "",
        categoryId: existingProduct.categoryId || "",
        price: String(existingProduct.price ?? ""),
        discountPercentage: String(existingProduct.discountPercentage ?? 0),
        deliveryTimeline:
          existingProduct.deliveryTimeline ||
          existingProduct.shippingInformation ||
          "2-3 business days",
        description: existingProduct.description || "",
        videoUrl:
          typeof existingProduct.video === "string"
            ? existingProduct.video
            : "",
        specifications: specs,
        variants: vars,
      });

      // Populate existing images
      const initialImages: string[] = [];
      if (
        Array.isArray(existingProduct.images) &&
        existingProduct.images.length > 0
      ) {
        initialImages.push(...existingProduct.images);
      } else if (existingProduct.thumbnail) {
        initialImages.push(existingProduct.thumbnail);
      }
      setExistingImages(initialImages);

      if (existingProduct.video && typeof existingProduct.video === "string") {
        setVideoTab("url");
      }
    }
  }, [isEditMode, existingProduct, reset]);

  // Handle new image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validFiles: File[] = [];
    const previews: string[] = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image.`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 10MB limit.`);
        continue;
      }
      validFiles.push(file);
      previews.push(URL.createObjectURL(file));
    }

    setNewImageFiles((prev) => [...prev, ...validFiles]);
    setNewImagePreviews((prev) => [...prev, ...previews]);

    // Reset input so user can pick the same file again if desired
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  // Remove existing image
  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove newly added image
  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Set as primary cover image
  const setExistingAsPrimary = (index: number) => {
    if (index === 0) return;
    setExistingImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.unshift(item);
      return copy;
    });
  };

  const setNewAsPrimary = (index: number) => {
    // If there are existing images, move this new one ahead or adjust
    setNewImageFiles((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.unshift(item);
      return copy;
    });
    setNewImagePreviews((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.unshift(item);
      return copy;
    });
  };

  // Handle video selection
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (!file.type.startsWith("video/")) {
      toast.error("Please upload a valid video file (MP4, WebM, etc.).");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast.error("Video file size cannot exceed 100MB.");
      return;
    }

    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }

    setVideoFile(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
  };

  const removeVideo = () => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setVideoFile(null);
    setVideoPreviewUrl(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  // Form Submission
  const onSubmit = async (data: ProductFormData) => {
    const totalImagesCount = existingImages.length + newImageFiles.length;
    if (totalImagesCount === 0) {
      toast.error("Please upload at least one product image.");
      return;
    }

    const toastId = toast.loading(
      isEditMode ? "Updating product details..." : "Publishing new product...",
    );

    try {
      const formData = new FormData();

      // Basic fields
      formData.append("productName", data.productName);
      formData.append("title", data.productName);
      formData.append("brand", data.brand);
      formData.append("categoryId", data.categoryId);
      formData.append("price", data.price);
      formData.append("discountPercentage", data.discountPercentage || "0");
      formData.append("deliveryTimeline", data.deliveryTimeline);
      formData.append("shippingInformation", data.deliveryTimeline);
      formData.append("description", data.description);

      // JSON stringified arrays
      formData.append("variants", JSON.stringify(data.variants));
      formData.append("specifications", JSON.stringify(data.specifications));

      // Calculate total stock from variants
      formData.append("stock", String(totalStock));

      // In edit mode: keep preserved existing images
      if (existingImages.length > 0) {
        formData.append("images", JSON.stringify(existingImages));
        formData.append("thumbnail", existingImages[0]);
      }

      // Append new image files
      newImageFiles.forEach((file) => {
        formData.append("productImages", file);
      });

      // Video handling
      if (videoTab === "upload" && videoFile) {
        formData.append("productVideos", videoFile);
      } else if (data.videoUrl && data.videoUrl.trim() !== "") {
        formData.append("video", data.videoUrl.trim());
      }

      if (isEditMode) {
        formData.append("id", productId as string);
        await updateProduct({
          id: productId as string,
          data: formData,
        }).unwrap();
        toast.success("Product updated successfully!", { id: toastId });
      } else {
        await createProduct(formData).unwrap();
        toast.success("Product created successfully!", { id: toastId });
      }

      router.push("/dashboard/products");
    } catch (err: any) {
      console.error("Save product error:", err);
      toast.error(
        err?.data?.message ||
          err?.message ||
          "Failed to save product. Please try again.",
        { id: toastId },
      );
    }
  };

  const onInvalid = (formErrors: any) => {
    console.warn("Form validation errors:", formErrors);
    const errorKeys = Object.keys(formErrors);
    if (errorKeys.length > 0) {
      const firstErr = formErrors[errorKeys[0]];
      const message =
        firstErr?.message ||
        (Array.isArray(firstErr)
          ? "Please check variants and specifications."
          : "Please fill in all required fields correctly.");
      toast.error(
        typeof message === "string"
          ? message
          : "Please fill in all required fields.",
      );
    }
  };

  if (isEditMode && isProductLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-slate-700" />
        <p className="text-sm font-medium text-slate-500">
          Loading product information...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-500">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/products">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-xl border-slate-200 hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4 text-slate-700" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              {isEditMode ? "Edit Product" : "Add New Product"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditMode
                ? `Editing catalog item: ${existingProduct?.title || productId}`
                : "Create a complete product listing with variants, media, and specifications."}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        {/* ================= 1. BASIC INFORMATION ================= */}
        <Card className="rounded-2xl border-slate-200/80 shadow-sm bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white text-xs font-bold">
                1
              </span>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Basic Product Information
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Essential details that identify this product across the store.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Product Title / Name */}
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                  Product Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="e.g. Sony WH-1000XM5 Wireless Noise-Canceling Headphones"
                  className={`h-11 rounded-xl border-slate-200 text-sm ${
                    errors.productName ? "border-red-500" : ""
                  }`}
                  {...register("productName")}
                />
                {errors.productName && (
                  <p className="text-xs text-red-500 font-medium">
                    {errors.productName.message}
                  </p>
                )}
              </div>

              {/* Brand */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                  Brand <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="e.g. Sony, Apple, Nike, Samsung"
                  className={`h-11 rounded-xl border-slate-200 text-sm ${
                    errors.brand
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }`}
                  {...register("brand")}
                />
                {errors.brand && (
                  <p className="text-xs text-red-500 font-medium">
                    {errors.brand.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  className={`h-11 rounded-xl border-slate-200 text-sm ${
                    errors.categoryId ? "border-red-500" : ""
                  }`}
                  {...register("categoryId")}
                >
                  <option value="">
                    {isCatLoading
                      ? "Loading categories..."
                      : "Select a Category"}
                  </option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
                {errors.categoryId && (
                  <p className="text-xs text-red-500 font-medium">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>

              {/* Base Price */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                  Base Price ($) <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="299.99"
                  className={`h-11 rounded-xl border-slate-200 text-sm ${
                    errors.price
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }`}
                  {...register("price")}
                />
                {errors.price && (
                  <p className="text-xs text-red-500 font-medium">
                    {errors.price.message}
                  </p>
                )}
              </div>

              {/* Discount Percentage */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Discount Percentage (%)
                </Label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  placeholder="0"
                  className="h-11 rounded-xl border-slate-200 text-sm"
                  {...register("discountPercentage")}
                />
              </div>

              {/* Delivery Timeline */}
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                  Delivery Timeline <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="e.g. 2-3 business days, Ships within 24 hours"
                  className={`h-11 rounded-xl border-slate-200 text-sm ${
                    errors.deliveryTimeline
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }`}
                  {...register("deliveryTimeline")}
                />
                {errors.deliveryTimeline && (
                  <p className="text-xs text-red-500 font-medium">
                    {errors.deliveryTimeline.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ================= 2. INVENTORY VARIANTS ================= */}
        <Card className="rounded-2xl border-slate-200/80 shadow-sm bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white text-xs font-bold">
                  2
                </span>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Product Inventory Variants
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Define color, size, and stock quantities for each SKU
                    variant.
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className="font-semibold text-xs px-2.5 py-1"
                >
                  Total Stock: {totalStock} units
                </Badge>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendVariant({ color: "Black", size: "M", stock: "10" })
                  }
                  className="rounded-xl border-slate-300 text-xs font-semibold h-8 flex items-center gap-1.5 hover:bg-slate-100"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Variant
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {variantFields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-slate-50/80 transition-colors"
              >
                {/* Color Selector / Input */}
                <div className="sm:col-span-4 space-y-1">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Color
                  </Label>
                  <div className="flex items-center gap-2">
                    <Select
                      className="h-10 text-xs rounded-xl border-slate-200 bg-white"
                      {...register(`variants.${index}.color`)}
                    >
                      {PRESET_COLORS.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                      <option value="Custom">Custom / Other</option>
                    </Select>
                  </div>
                  {errors.variants?.[index]?.color && (
                    <p className="text-[11px] text-red-500 font-medium">
                      {errors.variants[index]?.color?.message}
                    </p>
                  )}
                </div>

                {/* Size Selector */}
                <div className="sm:col-span-4 space-y-1">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Size
                  </Label>
                  <Select
                    className="h-10 text-xs rounded-xl border-slate-200 bg-white"
                    {...register(`variants.${index}.size`)}
                  >
                    {PRESET_SIZES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                    <option value="Standard">Standard</option>
                  </Select>
                  {errors.variants?.[index]?.size && (
                    <p className="text-[11px] text-red-500 font-medium">
                      {errors.variants[index]?.size?.message}
                    </p>
                  )}
                </div>

                {/* Stock Quantity */}
                <div className="sm:col-span-3 space-y-1">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Stock Units
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="10"
                    className="h-10 text-xs rounded-xl border-slate-200 bg-white"
                    {...register(`variants.${index}.stock`)}
                  />
                  {errors.variants?.[index]?.stock && (
                    <p className="text-[11px] text-red-500 font-medium">
                      {errors.variants[index]?.stock?.message}
                    </p>
                  )}
                </div>

                {/* Delete button */}
                <div className="sm:col-span-1 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={variantFields.length === 1}
                    onClick={() => removeVariant(index)}
                    className="h-10 w-10 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {errors.variants?.root && (
              <p className="text-xs text-red-500 font-medium">
                {errors.variants.root.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* ================= 3. MEDIA UPLOADER ================= */}
        <Card className="rounded-2xl border-slate-200/80 shadow-sm bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white text-xs font-bold">
                3
              </span>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Product Media (Images & Video)
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  High quality visuals increase sales. The first image will be
                  used as the storefront cover.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* --- IMAGES SECTION --- */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-slate-500" />
                  Product Images <span className="text-red-500">*</span>
                </Label>
                <span className="text-xs text-slate-400">
                  Total {existingImages.length + newImageFiles.length} image(s)
                  selected
                </span>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => imageInputRef.current?.click()}
                className="group border-2 border-dashed border-slate-300 hover:border-slate-900 hover:bg-slate-50/60 transition-all rounded-2xl p-6 text-center cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <input
                  ref={imageInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="h-12 w-12 rounded-2xl bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center transition-colors">
                  <UploadCloud className="h-6 w-6 text-slate-600 group-hover:text-slate-900" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Click to browse or drag & drop product photos
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    PNG, JPG, WEBP up to 10MB each. Multiple files supported.
                  </p>
                </div>
              </div>

              {/* Image Previews Grid */}
              {(existingImages.length > 0 || newImagePreviews.length > 0) && (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
                  {/* Existing Saved Images */}
                  {existingImages.map((url, idx) => (
                    <div
                      key={`existing-${idx}`}
                      className="group relative rounded-xl border border-slate-200 overflow-hidden bg-slate-100 aspect-square shadow-xs"
                    >
                      <img
                        src={url}
                        alt={`Product existing ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute top-2 left-2 bg-black/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                          Cover
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExistingAsPrimary(idx);
                            }}
                            title="Set as Cover"
                            className="bg-white/90 hover:bg-white text-slate-900 rounded-lg p-1.5 text-[10px] font-bold shadow-xs cursor-pointer"
                          >
                            Set Cover
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeExistingImage(idx);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white rounded-lg p-1.5 shadow-xs cursor-pointer"
                          title="Remove image"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Newly Added Images */}
                  {newImagePreviews.map((preview, idx) => {
                    const isOverallFirst =
                      existingImages.length === 0 && idx === 0;
                    return (
                      <div
                        key={`new-${idx}`}
                        className="group relative rounded-xl border border-slate-200 overflow-hidden bg-slate-100 aspect-square shadow-xs ring-2 ring-emerald-500/50"
                      >
                        <img
                          src={preview}
                          alt={`New preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {isOverallFirst ? (
                          <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                            Cover (New)
                          </span>
                        ) : (
                          <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md">
                            New
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                          {!isOverallFirst && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setNewAsPrimary(idx);
                              }}
                              title="Set as Cover"
                              className="bg-white/90 hover:bg-white text-slate-900 rounded-lg p-1.5 text-[10px] font-bold shadow-xs cursor-pointer"
                            >
                              Set Cover
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNewImage(idx);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-lg p-1.5 shadow-xs cursor-pointer"
                            title="Remove image"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* --- VIDEO SECTION --- */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Video className="h-4 w-4 text-slate-500" />
                  Product Video (Optional)
                </Label>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setVideoTab("upload")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      videoTab === "upload"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Upload Video
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoTab("url")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      videoTab === "url"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Embed URL
                  </button>
                </div>
              </div>

              {videoTab === "upload" ? (
                <div>
                  {videoFile ? (
                    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-slate-200 flex items-center justify-center">
                          <Video className="h-5 w-5 text-slate-700" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 line-clamp-1">
                            {videoFile.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={removeVideo}
                        className="text-red-500 hover:bg-red-50 rounded-lg h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      onClick={() => videoInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-slate-800 rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-1"
                    >
                      <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleVideoChange}
                        className="hidden"
                      />
                      <Video className="h-6 w-6 text-slate-400" />
                      <p className="text-xs font-semibold text-slate-700">
                        Click to select product showcase video (MP4, WebM up to
                        100MB)
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <Input
                    placeholder="https://www.youtube.com/watch?v=... or direct MP4 URL"
                    className="h-11 rounded-xl border-slate-200 text-sm"
                    {...register("videoUrl")}
                  />
                  <p className="text-[11px] text-slate-400">
                    Supports YouTube, Vimeo, or direct public video stream link.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ================= 4. DESCRIPTION ================= */}
        <Card className="rounded-2xl border-slate-200/80 shadow-sm bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white text-xs font-bold">
                4
              </span>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Product Description
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Detailed product highlights, features, and specs for the
                  customer.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-2">
            <Textarea
              rows={5}
              placeholder="Describe the product key features, specifications, materials, warranty, and benefits..."
              className={`rounded-xl border-slate-200 text-sm leading-relaxed ${
                errors.description
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }`}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-red-500 font-medium">
                {errors.description.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* ================= 5. SPECIFICATIONS ================= */}
        <Card className="rounded-2xl border-slate-200/80 shadow-sm bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white text-xs font-bold">
                  5
                </span>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Product Specifications
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Structured key-value technical specs displayed in the
                    product page table.
                  </CardDescription>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendSpec({ key: "", value: "" })}
                className="rounded-xl border-slate-300 text-xs font-semibold h-8 flex items-center gap-1.5 hover:bg-slate-100"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Specification
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-3">
            {specFields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
              >
                <div className="sm:col-span-5">
                  <Input
                    placeholder="Key (e.g. Weight, Battery, Material)"
                    className={`h-10 text-xs rounded-xl border-slate-200 ${
                      errors.specifications?.[index]?.key
                        ? "border-red-500"
                        : ""
                    }`}
                    {...register(`specifications.${index}.key`)}
                  />
                  {errors.specifications?.[index]?.key && (
                    <p className="text-[10px] text-red-500 mt-0.5">
                      {errors.specifications[index]?.key?.message}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-6">
                  <Input
                    placeholder="Value (e.g. 250g, 30 Hours, Titanium)"
                    className={`h-10 text-xs rounded-xl border-slate-200 ${
                      errors.specifications?.[index]?.value
                        ? "border-red-500"
                        : ""
                    }`}
                    {...register(`specifications.${index}.value`)}
                  />
                  {errors.specifications?.[index]?.value && (
                    <p className="text-[10px] text-red-500 mt-0.5">
                      {errors.specifications[index]?.value?.message}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-1 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={specFields.length === 1}
                    onClick={() => removeSpec(index)}
                    className="h-10 w-10 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {errors.specifications?.root && (
              <p className="text-xs text-red-500 font-medium">
                {errors.specifications.root.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* ================= BOTTOM ACTION BUTTONS ================= */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Link href="/dashboard/products">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl h-11 px-6 text-slate-600 border-slate-200 hover:bg-slate-50 font-medium"
            >
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl h-11 px-8 bg-black hover:bg-slate-800 text-white font-semibold shadow-md flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>
                  {isEditMode ? "Updating Product..." : "Creating Product..."}
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>{isEditMode ? "Save Changes" : "Publish Product"}</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
