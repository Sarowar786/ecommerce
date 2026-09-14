"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Loader2,
  ArrowRight,
  TrendingUp,
  Clock,
  PackageSearch,
  ShoppingBag,
} from "lucide-react";
import { useGetProductsQuery } from "@/redux/api/ecommerceApi";
import { ProductType } from "../../../type";
import PriceFormat from "../PriceFormat";

interface GlobalSearchProps {
  className?: string;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

const POPULAR_SEARCHES = [
  "iPhone",
  "Laptop",
  "Headphones",
  "Smart Watch",
  "Sneakers",
  "Backpack",
];

const RECENT_SEARCHES_KEY = "shopping_recent_searches";

export default function GlobalSearch({
  className = "",
  isMobile = false,
  onCloseMobile,
}: GlobalSearchProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored).slice(0, 5));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const saveRecentSearch = useCallback(
    (term: string) => {
      const cleanTerm = term.trim();
      if (!cleanTerm) return;
      try {
        const existing = recentSearches.filter(
          (item) => item.toLowerCase() !== cleanTerm.toLowerCase()
        );
        const updated = [cleanTerm, ...existing].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {
        // Ignore localStorage errors
      }
    },
    [recentSearches]
  );

  const removeRecentSearch = (e: React.MouseEvent, termToRemove: string) => {
    e.stopPropagation();
    try {
      const updated = recentSearches.filter((item) => item !== termToRemove);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const clearAllRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Ignore
    }
  };

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue.trim());
      setSelectedIndex(-1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue]);

  // Query products when debouncedSearch is non-empty
  const { data: searchData, isFetching } = useGetProductsQuery(
    {
      searchTerm: debouncedSearch,
      limit: 6,
    },
    {
      skip: !debouncedSearch,
    }
  );

  const products: ProductType[] =
    searchData?.data || searchData?.products || [];
  const totalCount = searchData?.meta?.total ?? products.length;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Execute search / navigate to catalog
  const handleSearchSubmit = (term?: string) => {
    const query = (term !== undefined ? term : searchValue).trim();
    setIsOpen(false);
    if (onCloseMobile) onCloseMobile();
    if (inputRef.current) inputRef.current.blur();

    if (query) {
      saveRecentSearch(query);
      router.push(`/products?searchTerm=${encodeURIComponent(query)}`);
    } else {
      router.push("/products");
    }
  };

  // Handle selecting a specific product
  const handleProductSelect = (product: ProductType) => {
    setIsOpen(false);
    if (onCloseMobile) onCloseMobile();
    saveRecentSearch(product.title);
    router.push(`/products/${product.id}`);
  };

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown") setIsOpen(true);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (products.length > 0) {
        setSelectedIndex((prev) => (prev < products.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (products.length > 0) {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : products.length - 1));
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && products[selectedIndex]) {
        handleProductSelect(products[selectedIndex]);
      } else {
        handleSearchSubmit();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
    >
      {/* Search Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearchSubmit();
        }}
        className="w-full h-10 relative flex items-center"
      >
        <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
          {isFetching ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search products, brands and categories..."
          className="w-full h-full outline-none bg-slate-50/80 hover:bg-slate-100/70 focus:bg-white border border-slate-300/80 focus:border-black rounded-full pl-10 pr-20 text-xs sm:text-sm text-slate-800 placeholder-slate-400 shadow-2xs transition-all duration-200"
          autoComplete="off"
        />

        {/* Clear Button */}
        {searchValue && (
          <button
            type="button"
            onClick={() => {
              setSearchValue("");
              setDebouncedSearch("");
              inputRef.current?.focus();
            }}
            className="absolute right-11 text-slate-400 hover:text-slate-700 p-1 rounded-full transition"
            title="Clear"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Submit Search Button */}
        <button
          type="submit"
          className="w-7 h-7 bg-slate-900 hover:bg-black rounded-full inline-flex items-center justify-center text-white absolute right-1.5 shadow-sm transition hover:scale-105 active:scale-95"
          title="Search"
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Search Results / Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 duration-150 max-h-[80vh] flex flex-col">
          {/* STATE 1: Debounced Search is Active */}
          {debouncedSearch ? (
            <div>
              {/* While fetching & no initial products */}
              {isFetching && products.length === 0 ? (
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
                    <span>Searching products...</span>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-2 rounded-xl animate-pulse"
                    >
                      <div className="w-12 h-12 rounded-lg bg-slate-200 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 bg-slate-200 rounded w-3/4" />
                        <div className="h-3 bg-slate-100 rounded w-1/3" />
                      </div>
                      <div className="h-4 bg-slate-200 rounded w-12" />
                    </div>
                  ))}
                </div>
              ) : products.length > 0 ? (
                /* Found Products */
                <div className="flex flex-col">
                  <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Products ({products.length} of {totalCount})
                    </span>
                    {isFetching && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Updating...
                      </span>
                    )}
                  </div>

                  <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 p-1.5">
                    {products.map((product, idx) => {
                      const isSelected = selectedIndex === idx;
                      const thumbnailSrc =
                        product.thumbnail ||
                        product.images?.[0] ||
                        "/images/logonav.png";

                      return (
                        <div
                          key={product.id}
                          onClick={() => handleProductSelect(product)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`flex items-center gap-3.5 p-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                            isSelected
                              ? "bg-slate-100 text-slate-950 shadow-xs"
                              : "hover:bg-slate-50 text-slate-800"
                          }`}
                        >
                          {/* Thumbnail */}
                          <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200/80 shrink-0 overflow-hidden flex items-center justify-center p-1 relative">
                            {/* Standard img tag handles any external or local URLs safely */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={thumbnailSrc}
                              alt={product.title}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                  "/images/logonav.png";
                              }}
                            />
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-semibold text-slate-900 truncate leading-tight">
                              {product.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              {product.category && (
                                <span className="text-[10px] uppercase font-semibold text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded">
                                  {product.category}
                                </span>
                              )}
                              {product.brand && (
                                <span className="text-[11px] text-slate-400 truncate hidden sm:inline">
                                  by {product.brand}
                                </span>
                              )}
                              {product.stock !== undefined && (
                                <span
                                  className={`text-[10px] font-medium ${
                                    product.stock > 0
                                      ? "text-emerald-600"
                                      : "text-red-500 font-semibold"
                                  }`}
                                >
                                  {product.stock > 0 ? "In Stock" : "Out of stock"}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Price & Discount */}
                          <div className="text-right shrink-0">
                            <div className="text-xs sm:text-sm font-bold text-slate-900">
                              <PriceFormat amount={product.price} />
                            </div>
                            {product.discountPercentage ? (
                              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                                -{Math.round(product.discountPercentage)}%
                              </span>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* View all results footer */}
                  <div className="p-2 border-t border-slate-100 bg-slate-50/60">
                    <button
                      type="button"
                      onClick={() => handleSearchSubmit()}
                      className="w-full py-2.5 px-4 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs transition"
                    >
                      <span>View all results for "{debouncedSearch}"</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* No Products Found */
                <div className="py-8 px-6 text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                    <PackageSearch className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    No products found
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    We couldn't find any products matching "
                    <span className="font-semibold text-slate-800">
                      {debouncedSearch}
                    </span>
                    ". Try checking for typos or use broader search terms.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleSearchSubmit("")}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 transition"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Browse all products</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* STATE 2: Empty Input State (Recent Searches & Popular Terms) */
            <div className="p-4 space-y-4">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Recent Searches
                    </span>
                    <button
                      type="button"
                      onClick={clearAllRecentSearches}
                      className="text-[11px] text-slate-400 hover:text-red-500 transition font-medium"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((term) => (
                      <div
                        key={term}
                        onClick={() => {
                          setSearchValue(term);
                          handleSearchSubmit(term);
                        }}
                        className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-xs text-slate-700 cursor-pointer transition"
                      >
                        <Clock className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                        <span>{term}</span>
                        <button
                          type="button"
                          onClick={(e) => removeRecentSearch(e, term)}
                          className="text-slate-400 hover:text-red-500 ml-0.5 p-0.5 rounded"
                          title="Remove"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
