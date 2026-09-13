"use client";

import React from "react";
import { ProductType, StateType } from "../../type";
import Image from "next/image";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";
import { FiShoppingCart } from "react-icons/fi";
import { LuEye } from "react-icons/lu";
import AddToCartButton from "./AddToCartButton";
import Link from "next/link";
import ProductPrice from "./ProductPrice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { addToCart, addToFavorite } from "@/redux/shofySlice";
import {
  useAddToCartBackendMutation,
  useToggleWishlistMutation,
} from "@/redux/api/ecommerceApi";
import toast from "react-hot-toast";

interface Props {
  product: ProductType;
}

const SideBar = ({ product }: { product: ProductType }) => {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth?.token);
  const favoriteProduct = useSelector(
    (state: StateType) => state?.shopy?.favoriteProduct || []
  );
  const [toggleWishlistApi] = useToggleWishlistMutation();
  const [addToCartBackend] = useAddToCartBackendMutation();

  const isFavorite = favoriteProduct?.some(
    (item: ProductType) => item?.id === product?.id
  );

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dispatch(addToFavorite(product));
    if (isFavorite) {
      toast.success("Removed from wishlist");
    } else {
      toast.success("Added to wishlist");
    }

    if (token && product?.id) {
      try {
        await toggleWishlistApi(String(product.id)).unwrap();
      } catch (err) {
        console.error("Failed to sync wishlist to backend:", err);
      }
    }
  };

  const handleQuickCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dispatch(addToCart(product));
    toast.success(
      `${product?.title ? product.title.substring(0, 15) : "Product"}... added to cart!`
    );

    if (token && product?.id) {
      try {
        await addToCartBackend({ productId: String(product.id), quantity: 1 }).unwrap();
      } catch (err) {
        console.error("Failed to sync cart to backend:", err);
      }
    }
  };

  return (
    <div className="absolute right-2 bottom-12 border flex flex-col text-xl border-slate-200 bg-white/95 backdrop-blur-sm rounded-lg shadow-md overflow-hidden transform translate-x-20 group-hover:translate-x-0 duration-300 z-10">
      <button
        onClick={handleQuickCart}
        title="Quick add to cart"
        className="p-2.5 hover:bg-amber-500 hover:text-slate-950 duration-200 text-slate-700 transition"
      >
        <FiShoppingCart />
      </button>
      <Link
        href={`/products/${product?.id}`}
        title="View details"
        className="p-2.5 hover:bg-amber-500 hover:text-slate-950 duration-200 border-y border-y-slate-200 text-slate-700 transition flex items-center justify-center"
      >
        <LuEye />
      </Link>
      <button
        onClick={handleFavoriteToggle}
        title={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
        className="p-2.5 hover:bg-amber-500 duration-200 text-slate-700 transition"
      >
        {isFavorite ? (
          <MdFavorite className="text-red-500 animate-in zoom-in-50" />
        ) : (
          <MdFavoriteBorder className="hover:text-red-500" />
        )}
      </button>
    </div>
  );
};

const ProductCard = ({ product }: Props) => {
  const regularPrice = product?.price;
  const discountedPrice =
    product?.price + (product?.discountPercentage || 0) / 100;

  return (
    <div className="border border-slate-200 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50 duration-300 rounded-xl group overflow-hidden bg-white flex flex-col justify-between">
      <div className="relative overflow-hidden bg-slate-50">
        <Link href={`/products/${product?.id}`} className="block relative">
          <Image
            src={
              product?.images?.[0] || product?.thumbnail || "/images/logonav.png"
            }
            alt={product?.title || "product"}
            width={500}
            height={500}
            priority={false}
            className="w-full h-60 object-contain p-4 group-hover:scale-105 duration-300 transition-transform"
          />
          {product?.discountPercentage ? (
            <p className="absolute top-2 right-2 bg-red-500 text-white font-bold py-0.5 px-2 text-[11px] rounded-full shadow-sm">
              -{product?.discountPercentage}%
            </p>
          ) : null}
        </Link>
        <SideBar product={product} />
      </div>

      <div className="p-4 flex flex-col justify-between flex-1">
        <div className="flex flex-col mb-3">
          <p className="text-xs text-slate-400 capitalize font-medium mb-1">
            {product?.category || "General"}
          </p>

          <Link
            href={`/products/${product?.id}`}
            className="font-semibold text-sm line-clamp-2 text-slate-800 hover:text-amber-600 transition"
          >
            {product?.title}
          </Link>

          <div className="mt-2">
            <ProductPrice
              regularPrice={regularPrice}
              discountedPrice={discountedPrice}
              product={product}
            />
          </div>
        </div>
        <AddToCartButton product={product} />
      </div>
    </div>
  );
};

export default ProductCard;
