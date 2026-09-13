/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import Container from "@/components/Container";
import { useGetCategoriesWithProductCountQuery } from "@/redux/api/ecommerceApi";
import { Layers, Sparkles } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export default function FeaturedCategory() {
  const { data, isLoading, error } = useGetCategoriesWithProductCountQuery(undefined);

  const categories =
    data?.data || data?.result || (Array.isArray(data) ? data : []);

  if (isLoading) {
    return (
      <div className="w-full py-10 bg-slate-50/50 border-y border-slate-100">
        <Container>
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <div className="h-6 w-48 bg-slate-200 animate-pulse rounded-md" />
              <div className="h-3 w-64 bg-slate-100 animate-pulse rounded-md" />
            </div>
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="min-w-[150px] flex-1 h-40 bg-white border border-slate-200/80 animate-pulse rounded-2xl p-4 flex flex-col items-center justify-center space-y-3"
              >
                <div className="w-14 h-14 bg-slate-100 rounded-full" />
                <div className="w-20 h-4 bg-slate-100 rounded-md" />
                <div className="w-12 h-3 bg-slate-50 rounded-md" />
              </div>
            ))}
          </div>
        </Container>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-10 bg-slate-50/40 border-y border-slate-100">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Explore Collections</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Featured Categories
            </h2>
          </div>

          <Link
            href="/products"
            className="text-xs font-semibold text-slate-600 hover:text-black transition-colors"
          >
            View All Products &rarr;
          </Link>
        </div>

        {/* Carousel */}
        <Carousel
          opts={{
            align: "start",
            loop: categories.length > 6,
          }}
          className="w-full relative px-1"
        >
          <CarouselContent className="-ml-3 py-2">
            {categories.map((cat: any) => {
              const name = cat.name || cat.categoryName || "Category";
              const imageUrl = cat.image || cat.thumbnail;
              const count = cat.productsCount ?? cat._count?.products ?? 0;

              return (
                <CarouselItem
                  key={cat.id || name}
                  className="pl-3 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6"
                >
                  <Link
                    href={`/products?category=${encodeURIComponent(cat.slug || name)}`}
                    className="block group h-full"
                  >
                    <div className="bg-white border border-slate-200/90 group-hover:border-slate-900 rounded-2xl p-4 flex flex-col items-center justify-between text-center transition-all duration-300 shadow-2xs group-hover:shadow-md group-hover:-translate-y-1 h-[170px]">
                      {/* Icon / Image container */}
                      <div className="relative w-16 h-16 rounded-2xl bg-slate-50 group-hover:bg-slate-100/80 flex items-center justify-center overflow-hidden transition-colors shrink-0">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={name}
                            className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Layers className="h-7 w-7 stroke-[1.5]" />
                          </div>
                        )}
                      </div>

                      {/* Text details */}
                      <div className="w-full mt-2">
                        <h3 className="font-bold text-sm text-slate-800 group-hover:text-black truncate">
                          {name}
                        </h3>
                        <p className="text-[11px] font-medium text-slate-400 group-hover:text-slate-600 mt-0.5">
                          {count} {count === 1 ? "product" : "products"}
                        </p>
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              );
            })}
          </CarouselContent>

          {/* Nav Controls */}
          {categories.length > 6 && (
            <>
              <CarouselPrevious className="-left-4 bg-white/95 border-slate-200 hover:bg-black hover:text-white hover:border-black shadow-sm h-8 w-8 transition-colors" />
              <CarouselNext className="-right-4 bg-white/95 border-slate-200 hover:bg-black hover:text-white hover:border-black shadow-sm h-8 w-8 transition-colors" />
            </>
          )}
        </Carousel>
      </Container>
    </section>
  );
}
