"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ProductType, StateType } from "../../../type";
import Container from "../Container";
import Link from "next/link";
import Image from "next/image";
import PriceFormat from "../PriceFormat";
import AddToCartButton from "../AddToCartButton";
import { IoClose } from "react-icons/io5";
import { addToFavorite } from "@/redux/shofySlice";
import { RootState } from "@/redux/store";
import { useToggleWishlistMutation } from "@/redux/api/ecommerceApi";
import toast from "react-hot-toast";
import { Heart, ShoppingBag } from "lucide-react";

const FavoriteProducts = () => {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth?.token);
  const { favoriteProduct } = useSelector(
    (state: StateType) => state?.shopy || { favoriteProduct: [] }
  );
  const [toggleWishlist] = useToggleWishlistMutation();

  const handleRemove = async (product: ProductType) => {
    dispatch(addToFavorite(product));
    toast.success(`${product?.title?.substring(0, 20)} removed from wishlist`);

    if (token && product?.id) {
      try {
        await toggleWishlist(String(product.id)).unwrap();
      } catch (err) {
        console.error("Failed to sync wishlist deletion to backend:", err);
      }
    }
  };

  return (
    <Container className="py-10">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-8 h-8 text-red-500 fill-red-500" />
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          My Wishlist
        </h1>
        <span className="text-sm font-semibold text-slate-500 bg-slate-200/80 px-2.5 py-0.5 rounded-full">
          {favoriteProduct?.length || 0} items
        </span>
      </div>

      {favoriteProduct && favoriteProduct.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favoriteProduct.map((product: ProductType) => {
            const regularPrice = product?.price;
            const discountedPrice =
              product?.price + (product?.discountPercentage || 0) / 100;

            return (
              <div
                key={product?.id}
                className="relative bg-white rounded-xl border border-slate-200 hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                {/* Remove button */}
                <button
                  onClick={() => handleRemove(product)}
                  title="Remove from wishlist"
                  className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/90 hover:bg-red-50 hover:text-red-600 rounded-full flex items-center justify-center text-slate-500 border border-slate-200 transition"
                >
                  <IoClose className="text-lg" />
                </button>

                {/* Product image link */}
                <Link
                  href={`/products/${product?.id}`}
                  className="block bg-slate-50 p-4 relative"
                >
                  <Image
                    src={
                      product?.images?.[0] ||
                      product?.thumbnail ||
                      "/images/logonav.png"
                    }
                    alt={product?.title || "Product"}
                    width={400}
                    height={400}
                    className="w-full h-48 object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  {product?.discountPercentage ? (
                    <span className="absolute top-2 left-2 bg-red-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                      -{product.discountPercentage}%
                    </span>
                  ) : null}
                </Link>

                {/* Product details */}
                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <p className="text-xs text-slate-400 capitalize mb-1">
                      {product?.category || "General"}
                    </p>
                    <Link
                      href={`/products/${product?.id}`}
                      className="font-semibold text-sm line-clamp-2 text-slate-800 hover:text-amber-600 transition"
                    >
                      {product?.title}
                    </Link>

                    <div className="mt-2 flex items-center gap-2">
                      <PriceFormat
                        className="text-xs text-slate-400 line-through"
                        amount={discountedPrice}
                      />
                      <PriceFormat
                        className="text-base font-bold text-slate-900"
                        amount={regularPrice}
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-2">
                    <AddToCartButton product={product} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-sm my-12">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Your wishlist is empty
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Explore our vast catalog of top-tier products and save your favorites here.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white font-semibold text-sm px-6 py-3 rounded-full transition-all duration-200 shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            Browse Products
          </Link>
        </div>
      )}
    </Container>
  );
};

export default FavoriteProducts;
