"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGetCategoriesQuery } from "@/redux/api/ecommerceApi";
import {
  ChevronDown,
  ChevronRight,
  Layers,
  Package,
  FolderTree,
  ArrowRight,
  Sparkles,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CategoriesDropdown() {
  const router = useRouter();
  const { data, isLoading } = useGetCategoriesQuery(undefined);
  const categories: any[] = data?.data || data?.result || (Array.isArray(data) ? data : []);

  const [isOpen, setIsOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string>("");
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Set initial active category when categories load
  useEffect(() => {
    if (categories.length > 0 && !activeCategoryId) {
      setActiveCategoryId(categories[0].id);
    }
  }, [categories, activeCategoryId]);

  const activeCategory =
    categories.find((c) => c.id === activeCategoryId) || categories[0] || null;

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const handleCategoryClick = (cat: any) => {
    setIsOpen(false);
    const catParam = encodeURIComponent(cat.slug || cat.name);
    router.push(`/products?category=${catParam}&categoryId=${cat.id}`);
  };

  const handleSubcategoryClick = (cat: any, sub: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    const catParam = encodeURIComponent(cat.slug || cat.name);
    const subParam = encodeURIComponent(sub.slug || sub.name);
    router.push(
      `/products?category=${catParam}&categoryId=${cat.id}&subcategory=${subParam}&subcategoryId=${sub.id}`
    );
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "flex items-center gap-1.5 py-1 text-xs md:text-sm font-medium transition-colors cursor-pointer group",
          isOpen ? "text-themeColor font-semibold" : "text-slate-800 hover:text-themeColor"
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>Categories</span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 transition-transform duration-200 text-slate-400 group-hover:text-slate-700",
            isOpen && "rotate-180 text-themeColor"
          )}
        />
      </button>

      {/* Invisible hover bridge to prevent premature closing */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 h-2 bg-transparent z-50" />
      )}

      {/* Mega Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute left-0 top-full mt-2 z-50 flex w-[680px] max-w-[95vw] rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150"
          role="menu"
        >
          {/* ================= LEFT COLUMN: CATEGORIES ================= */}
          <div className="w-[270px] shrink-0 border-r border-slate-100 flex flex-col bg-white">
            {/* Header */}
            <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                <Layers className="w-3.5 h-3.5 text-themeColor" />
                <span>All Categories</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                {categories.length}
              </span>
            </div>

            {/* Category List */}
            <div className="overflow-y-auto max-h-[380px] p-2 space-y-1 scrollbar-thin">
              {isLoading ? (
                <div className="p-4 space-y-2 text-xs text-slate-400">
                  <div className="h-8 bg-slate-100 rounded-lg animate-pulse" />
                  <div className="h-8 bg-slate-100 rounded-lg animate-pulse" />
                  <div className="h-8 bg-slate-100 rounded-lg animate-pulse" />
                </div>
              ) : categories.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No categories found
                </div>
              ) : (
                categories.map((cat) => {
                  const isHovered = activeCategory?.id === cat.id;
                  const catImage = cat.image || cat.imageUrl;
                  const subCount = cat.subcategories?.length || 0;

                  return (
                    <div
                      key={cat.id}
                      onMouseEnter={() => setActiveCategoryId(cat.id)}
                      onClick={() => handleCategoryClick(cat)}
                      className={cn(
                        "group/cat flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 text-xs font-semibold select-none",
                        isHovered
                          ? "bg-slate-900 text-white shadow-sm"
                          : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Thumbnail / Icon */}
                        <div
                          className={cn(
                            "w-7 h-7 rounded-lg shrink-0 flex items-center justify-center p-1 transition-colors overflow-hidden",
                            isHovered
                              ? "bg-white/10 text-white"
                              : "bg-slate-100 text-slate-500 group-hover/cat:bg-white"
                          )}
                        >
                          {catImage ? (
                            <img
                              src={catImage}
                              alt={cat.name}
                              className="w-full h-full object-contain rounded"
                            />
                          ) : (
                            <Layers className="w-3.5 h-3.5" />
                          )}
                        </div>

                        {/* Title */}
                        <span className="truncate">{cat.name}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {subCount > 0 && (
                          <span
                            className={cn(
                              "text-[10px] px-1.5 py-0.2 rounded font-bold",
                              isHovered
                                ? "bg-white/20 text-white"
                                : "bg-slate-100 text-slate-500"
                            )}
                          >
                            {subCount}
                          </span>
                        )}
                        <ChevronRight
                          className={cn(
                            "w-3.5 h-3.5 transition-transform",
                            isHovered
                              ? "text-white translate-x-0.5"
                              : "text-slate-400 group-hover/cat:text-slate-700"
                          )}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom link: View All Products */}
            <div className="p-2 border-t border-slate-100 bg-slate-50/50 mt-auto">
              <Link
                href="/products"
                onClick={() => setIsOpen(false)}
                className="w-full py-2 px-3 text-[11px] font-bold text-slate-600 hover:text-black hover:bg-white rounded-lg flex items-center justify-between transition-colors border border-transparent hover:border-slate-200"
              >
                <span>View Full Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: SUBCATEGORIES SIDEBAR ================= */}
          <div className="flex-1 bg-slate-50/70 p-4 flex flex-col justify-between overflow-hidden">
            {activeCategory ? (
              <div className="flex flex-col h-full">
                {/* Active Category Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3">
                  <div className="min-w-0 pr-2">
                    <h3 className="text-sm font-extrabold text-slate-900 truncate">
                      {activeCategory.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {activeCategory.description || "Browse all subcategories and collections"}
                    </p>
                  </div>

                  <button
                    onClick={() => handleCategoryClick(activeCategory)}
                    className="shrink-0 text-xs font-bold text-themeColor hover:text-sky-700 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>Shop All</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Subcategories Grid */}
                <div className="flex-1 overflow-y-auto max-h-[300px] scrollbar-thin pr-1">
                  {activeCategory.subcategories &&
                  activeCategory.subcategories.length > 0 ? (
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        <FolderTree className="w-3 h-3 text-amber-500" />
                        <span>Subcategories</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {activeCategory.subcategories.map((sub: any) => {
                          const subImage = sub.image || sub.imageUrl;

                          return (
                            <div
                              key={sub.id || sub.name}
                              onClick={(e) =>
                                handleSubcategoryClick(activeCategory, sub, e)
                              }
                              className="group/sub bg-white border border-slate-200/80 hover:border-slate-900 rounded-xl p-2.5 flex items-center gap-2.5 cursor-pointer transition-all duration-150 hover:shadow-xs hover:-translate-y-0.5"
                            >
                              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center p-1 shrink-0 group-hover/sub:border-slate-300 transition-colors overflow-hidden">
                                {subImage ? (
                                  <img
                                    src={subImage}
                                    alt={sub.name}
                                    className="w-full h-full object-contain rounded"
                                  />
                                ) : (
                                  <Package className="w-3.5 h-3.5 text-slate-400 group-hover/sub:text-slate-900 transition-colors" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <span className="text-xs font-bold text-slate-800 group-hover/sub:text-black truncate block transition-colors">
                                  {sub.name}
                                </span>
                                <span className="text-[10px] text-slate-400 group-hover/sub:text-slate-600 block">
                                  Explore items &rarr;
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* No Subcategories Fallback */
                    <div className="h-full min-h-[180px] flex flex-col items-center justify-center text-center p-6 bg-white/60 rounded-2xl border border-dashed border-slate-200">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
                        <Package className="w-5 h-5" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 mb-1">
                        Direct Collection
                      </h4>
                      <p className="text-[11px] text-slate-400 max-w-[200px] mb-3">
                        Products in {activeCategory.name} are organized directly without subcategories.
                      </p>
                      <button
                        onClick={() => handleCategoryClick(activeCategory)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition"
                      >
                        <span>Browse {activeCategory.name}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Subcategory Footer Promo Pill */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                    <Sparkles className="w-3 h-3" />
                    <span>Official Warranty Guaranteed</span>
                  </div>
                  <button
                    onClick={() => handleCategoryClick(activeCategory)}
                    className="text-slate-700 font-semibold hover:text-black hover:underline cursor-pointer"
                  >
                    View All &rarr;
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-400">
                Hover over any category to view its subcategories
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
