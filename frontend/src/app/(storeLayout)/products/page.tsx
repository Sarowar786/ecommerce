"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PackageSearch, SlidersHorizontal, Sparkles } from "lucide-react";
import ProductPageSidebar, { FilterState } from "@/components/pages/ProductPageSidebar";
import { Pagination } from "@/components/shered/Pagination";
import { useGetCategoriesQuery, useGetProductsQuery } from "@/redux/api/ecommerceApi";
import ProductCard from "@/components/ProductCard";
import Container from "@/components/Container";

const DEFAULT_FILTERS: FilterState = {
  categoryId: "",
  min_price: "",
  max_price: "",
  sortby: "recent",
  rating: "",
  searchTerm: "",
};

const LIMIT = 12;

export default function ProductsCatalogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || searchParams.get("categoryId") || "";

  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    categoryId: initialCategory,
    searchTerm: searchParams.get("searchTerm") || searchParams.get("search") || "",
  });

  const { data: catData } = useGetCategoriesQuery(undefined);
  const categories: any[] = catData?.data || catData?.result || [];

  const matchedCat = categories.find(
    (c: any) =>
      c.id === filters.categoryId ||
      c.slug?.toLowerCase() === filters.categoryId?.toLowerCase() ||
      c.name?.toLowerCase() === filters.categoryId?.toLowerCase()
  );
  const activeCategoryDisplayName = matchedCat ? matchedCat.name : filters.categoryId;

  // Sync with searchParams when navigating or loading from external link (e.g. FeaturedCategory on homepage)
  useEffect(() => {
    const category = searchParams.get("category") || searchParams.get("categoryId") || "";
    const min_price = searchParams.get("min_price") || searchParams.get("minPrice") || "";
    const max_price = searchParams.get("max_price") || searchParams.get("maxPrice") || "";
    const sortby = searchParams.get("sortby") || searchParams.get("sortBy") || "recent";
    const rating = searchParams.get("rating") || "";
    const searchTerm = searchParams.get("searchTerm") || searchParams.get("search") || "";

    setFilters({
      categoryId: category,
      min_price,
      max_price,
      sortby,
      rating,
      searchTerm,
    });
    setCurrentPage(1);
  }, [searchParams]);

  // Build clean query params object for API
  const queryParams = {
    page: currentPage,
    limit: LIMIT,
    ...(filters.categoryId
      ? {
          category: matchedCat ? matchedCat.slug || matchedCat.name : filters.categoryId,
          categoryId: matchedCat ? matchedCat.id : filters.categoryId,
        }
      : {}),
    ...(filters.min_price ? { minPrice: filters.min_price } : {}),
    ...(filters.max_price ? { maxPrice: filters.max_price } : {}),
    ...(filters.sortby ? { sortby: filters.sortby } : {}),
    ...(filters.rating ? { rating: filters.rating } : {}),
    ...(filters.searchTerm
      ? { searchTerm: filters.searchTerm, search: filters.searchTerm }
      : {}),
  };

  const { data, isLoading, isFetching } = useGetProductsQuery(queryParams);

  const allProducts = data?.data || data?.products || [];
  const meta = data?.meta || {};
  const totalPages = meta.totalPages || 1;
  const totalProducts = meta.total !== undefined ? meta.total : allProducts.length;

  const handleFilterChange = useCallback((partial: Partial<FilterState>) => {
    setFilters((prev) => {
      const next = { ...prev, ...partial };
      // Keep URL search params in sync
      const params = new URLSearchParams();
      if (next.categoryId) params.set("category", next.categoryId);
      if (next.min_price) params.set("min_price", next.min_price);
      if (next.max_price) params.set("max_price", next.max_price);
      if (next.sortby && next.sortby !== "recent") params.set("sortby", next.sortby);
      if (next.rating) params.set("rating", next.rating);
      if (next.searchTerm) params.set("searchTerm", next.searchTerm);

      const qs = params.toString();
      router.replace(qs ? `/products?${qs}` : "/products", { scroll: false });
      return next;
    });
    setCurrentPage(1);
  }, [router]);

  const handleReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
    router.replace("/products", { scroll: false });
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50/30 py-8">
      <Container>
        {/* Page Breadcrumb / Heading */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <span>All Products</span>
              {filters.categoryId && (
                <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {activeCategoryDisplayName}
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Explore our wide range of premium products, electronics, and accessories.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-24">
            <ProductPageSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleReset}
            />
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1 w-full space-y-6">
            {/* Filter Pills & Result Counter */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <p className="text-xs text-slate-500">
                {isFetching ? (
                  <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
                    Updating results...
                  </span>
                ) : (
                  <>
                    Showing{" "}
                    <span className="font-bold text-slate-900">
                      {allProducts.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-slate-900">
                      {totalProducts}
                    </span>{" "}
                    products
                  </>
                )}
              </p>

              {/* Active Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {filters.searchTerm && (
                  <span className="inline-flex items-center gap-1 text-[11px] bg-sky-100 text-sky-900 px-2.5 py-1 rounded-lg font-medium border border-sky-200">
                    Search: "{filters.searchTerm}"
                    <button
                      onClick={() => {
                        handleFilterChange({ searchTerm: "" });
                        router.replace("/products");
                      }}
                      className="ml-1 hover:text-red-500 font-bold"
                      title="Clear search"
                    >
                      &times;
                    </button>
                  </span>
                )}
                {filters.categoryId && (
                  <span className="inline-flex items-center gap-1 text-[11px] bg-slate-900 text-white px-2.5 py-1 rounded-lg font-medium">
                    Category: {activeCategoryDisplayName}
                    <button
                      onClick={() => handleFilterChange({ categoryId: "" })}
                      className="ml-1 hover:text-red-300 font-bold"
                      title="Clear category"
                    >
                      &times;
                    </button>
                  </span>
                )}
                {(filters.min_price || filters.max_price) && (
                  <span className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium border border-slate-200">
                    ${filters.min_price || "0"} – ${filters.max_price || "Max"}
                    <button
                      onClick={() =>
                        handleFilterChange({ min_price: "", max_price: "" })
                      }
                      className="ml-1 hover:text-red-500 font-bold"
                      title="Clear price filter"
                    >
                      &times;
                    </button>
                  </span>
                )}
                {filters.rating && (
                  <span className="inline-flex items-center gap-1 text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg font-medium">
                    {filters.rating}★ & above
                    <button
                      onClick={() => handleFilterChange({ rating: "" })}
                      className="ml-1 hover:text-red-500 font-bold"
                      title="Clear rating"
                    >
                      &times;
                    </button>
                  </span>
                )}
              </div>
            </div>

            {/* Skeleton Loading */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 animate-pulse"
                  >
                    <div className="h-52 bg-slate-100 rounded-xl" />
                    <div className="h-4 bg-slate-100 rounded-md w-3/4" />
                    <div className="h-4 bg-slate-100 rounded-md w-1/3" />
                  </div>
                ))}
              </div>
            ) : allProducts.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-20 px-4 bg-white border border-slate-200/80 rounded-2xl text-center space-y-3">
                <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center">
                  <PackageSearch className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  No products matched your criteria
                </h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Try broadening your search or adjusting your price, category, and rating filters.
                </p>
                <button
                  onClick={handleReset}
                  className="mt-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              /* Product Grid */
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 transition-opacity duration-200 ${
                  isFetching ? "opacity-60 pointer-events-none" : "opacity-100"
                }`}
              >
                {allProducts.map((productItem: any) => (
                  <ProductCard key={productItem.id} product={productItem} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {!isLoading && totalPages > 1 && (
              <div className="flex items-center justify-center pt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
