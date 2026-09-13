"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useGetCategoriesQuery } from "@/redux/api/ecommerceApi";
import { cn } from "@/lib/utils";
import { RotateCcw, SlidersHorizontal } from "lucide-react";

export type FilterState = {
  categoryId: string;
  min_price: string;
  max_price: string;
  sortby: string;
  rating: string;
  searchTerm?: string;
};

interface MarketplaceSidebarProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onReset: () => void;
}

const SORT_OPTIONS = [
  { label: "Most Recent", value: "recent" },
  { label: "Price: Low to High", value: "price_low" },
  { label: "Price: High to Low", value: "price_high" },
  { label: "Title: A - Z", value: "asc" },
  { label: "Title: Z - A", value: "desc" },
];

const RATING_OPTIONS = [
  { label: "All Ratings", value: "" },
  { label: "4★ & above", value: "4" },
  { label: "3★ & above", value: "3" },
  { label: "2★ & above", value: "2" },
  { label: "1★ & above", value: "1" },
];

const PRICE_PRESETS = [
  { label: "$0 – $50", min: "0", max: "50" },
  { label: "$50 – $200", min: "50", max: "200" },
  { label: "$200 – $500", min: "200", max: "500" },
  { label: "$500 – $1500", min: "500", max: "1500" },
];

export default function ProductPageSidebar({
  filters,
  onFilterChange,
  onReset,
}: MarketplaceSidebarProps) {
  const { data: categoryData } = useGetCategoriesQuery(undefined);
  const categories: any[] = categoryData?.data || categoryData?.result || [];

  return (
    <div className="w-full flex flex-col gap-3 p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-700" />
          <h2 className="text-sm font-bold text-slate-900">Filters</h2>
        </div>
        <button
          onClick={onReset}
          className="text-xs font-semibold text-slate-400 hover:text-slate-900 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>

      {/* Quick search input */}
      <div className="relative my-1">
        <input
          type="text"
          placeholder="Filter by keyword..."
          value={filters.searchTerm || ""}
          onChange={(e) => onFilterChange({ searchTerm: e.target.value })}
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-slate-900 focus:bg-white transition-all pr-7"
        />
        {filters.searchTerm && (
          <button
            onClick={() => onFilterChange({ searchTerm: "" })}
            className="absolute right-2.5 top-2 text-slate-400 hover:text-red-500 text-xs font-bold cursor-pointer"
            title="Clear keyword filter"
          >
            &times;
          </button>
        )}
      </div>

      <Accordion
        type="multiple"
        defaultValue={["category", "price-range", "sort-by", "rating"]}
        className="w-full"
      >
        {/* Categories */}
        <AccordionItem
          value="category"
          className="border-b border-slate-100 py-1"
        >
          <AccordionTrigger className="hover:no-underline py-2.5 text-xs font-bold uppercase tracking-wider text-slate-800">
            Categories
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-1.5 pt-1 pb-3">
            {/* All option */}
            <button
              onClick={() => onFilterChange({ categoryId: "" })}
              className={cn(
                "text-left text-xs font-medium px-3 py-2 rounded-xl transition-all cursor-pointer",
                filters.categoryId === ""
                  ? "bg-black text-white shadow-xs font-semibold"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              All Categories
            </button>
            {categories.map((cat: any) => {
              const catName = cat.name || cat.categoryName || "";
              const isSelected =
                filters.categoryId === catName ||
                filters.categoryId === cat.id ||
                filters.categoryId === cat.slug ||
                (Boolean(filters.categoryId) &&
                  Boolean(catName) &&
                  filters.categoryId.toLowerCase() === catName.toLowerCase()) ||
                (Boolean(filters.categoryId) &&
                  Boolean(cat.slug) &&
                  filters.categoryId.toLowerCase() === cat.slug.toLowerCase());

              return (
                <button
                  key={cat.id || catName}
                  onClick={() =>
                    onFilterChange({
                      categoryId: isSelected ? "" : cat.slug || catName,
                    })
                  }
                  className={cn(
                    "text-left text-xs font-medium px-3 py-2 rounded-xl transition-all flex items-center justify-between cursor-pointer",
                    isSelected
                      ? "bg-black text-white shadow-xs font-semibold"
                      : "text-slate-600 hover:bg-slate-100",
                  )}
                >
                  <span className="truncate">{catName}</span>
                  {cat.productsCount !== undefined && (
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-md",
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-500",
                      )}
                    >
                      {cat.productsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </AccordionContent>
        </AccordionItem>

        {/* Price Range */}
        <AccordionItem
          value="price-range"
          className="border-b border-slate-100 py-1"
        >
          <AccordionTrigger className="hover:no-underline py-2.5 text-xs font-bold uppercase tracking-wider text-slate-800">
            Price Range
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-3 pt-1 pb-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  $
                </span>
                <Input
                  type="number"
                  min={0}
                  placeholder="Min"
                  value={filters.min_price}
                  onChange={(e) =>
                    onFilterChange({ min_price: e.target.value })
                  }
                  className="h-9 pl-6 text-xs border-slate-200 rounded-xl focus-visible:ring-black"
                />
              </div>
              <span className="text-slate-300 text-xs font-bold">—</span>
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  $
                </span>
                <Input
                  type="number"
                  min={0}
                  placeholder="Max"
                  value={filters.max_price}
                  onChange={(e) =>
                    onFilterChange({ max_price: e.target.value })
                  }
                  className="h-9 pl-6 text-xs border-slate-200 rounded-xl focus-visible:ring-black"
                />
              </div>
            </div>

            {/* Quick presets */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {PRICE_PRESETS.map((p) => {
                const isSelected =
                  filters.min_price === p.min && filters.max_price === p.max;
                return (
                  <button
                    key={p.label}
                    onClick={() =>
                      onFilterChange({ min_price: p.min, max_price: p.max })
                    }
                    className={cn(
                      "text-center text-[11px] font-medium py-1.5 px-2 rounded-lg border transition-all cursor-pointer",
                      isSelected
                        ? "bg-black text-white border-black font-semibold shadow-xs"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50",
                    )}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Sort By */}
        <AccordionItem
          value="sort-by"
          className="border-b border-slate-100 py-1"
        >
          <AccordionTrigger className="hover:no-underline py-2.5 text-xs font-bold uppercase tracking-wider text-slate-800">
            Sort By
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-1 pt-1 pb-3">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onFilterChange({ sortby: opt.value })}
                className={cn(
                  "text-left text-xs font-medium px-3 py-2 rounded-xl transition-all cursor-pointer",
                  filters.sortby === opt.value
                    ? "bg-black text-white shadow-xs font-semibold"
                    : "text-slate-600 hover:bg-slate-100",
                )}
              >
                {opt.label}
              </button>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* Rating */}
        <AccordionItem value="rating" className="border-none py-1">
          <AccordionTrigger className="hover:no-underline py-2.5 text-xs font-bold uppercase tracking-wider text-slate-800">
            Customer Rating
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-1 pt-1 pb-3">
            {RATING_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onFilterChange({ rating: opt.value })}
                className={cn(
                  "text-left text-xs font-medium px-3 py-2 rounded-xl transition-all cursor-pointer",
                  filters.rating === opt.value
                    ? "bg-black text-white shadow-xs font-semibold"
                    : "text-slate-600 hover:bg-slate-100",
                )}
              >
                {opt.label}
              </button>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
