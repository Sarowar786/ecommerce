"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  useGetMyCartQuery,
  useGetMyWishlistQuery,
} from "@/redux/api/ecommerceApi";
import {
  setCart,
  setFavoriteProduct,
  resetCart,
  resetFavoriteProduct,
} from "@/redux/shofySlice";
import { ProductType } from "../../../type";

export default function AuthSync() {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth?.token);
  const prevTokenRef = useRef<string | null>(null);

  // Queries only execute if token is present
  const { data: cartData, isSuccess: cartSuccess } = useGetMyCartQuery(
    undefined,
    { skip: !token, refetchOnMountOrArgChange: true }
  );

  const { data: wishlistData, isSuccess: wishlistSuccess } =
    useGetMyWishlistQuery(undefined, {
      skip: !token,
      refetchOnMountOrArgChange: true,
    });

  // 1. Sync backend cart into Redux
  useEffect(() => {
    if (token && cartSuccess && cartData) {
      const rawItems =
        cartData?.data?.items ||
        (Array.isArray(cartData?.data) ? cartData.data : []);

      const formattedCart: ProductType[] = rawItems
        .filter((item: any) => item && (item.product || item.productId))
        .map((item: any) => {
          const product = item.product || {};
          return {
            ...product,
            id: item.productId || product.id || item.id,
            cartItemId: item.id,
            quantity: item.quantity || 1,
            color: item.color,
            size: item.size,
          };
        });

      dispatch(setCart(formattedCart));
    }
  }, [token, cartSuccess, cartData, dispatch]);

  // 2. Sync backend wishlist into Redux
  useEffect(() => {
    if (token && wishlistSuccess && wishlistData) {
      const rawItems = Array.isArray(wishlistData?.data)
        ? wishlistData.data
        : wishlistData?.data?.items || [];

      const formattedWishlist: ProductType[] = rawItems
        .filter((item: any) => item && (item.product || item.productId))
        .map((item: any) => {
          const product = item.product || {};
          return {
            ...product,
            id: item.productId || product.id || item.id,
            wishlistItemId: item.id,
          };
        });

      dispatch(setFavoriteProduct(formattedWishlist));
    }
  }, [token, wishlistSuccess, wishlistData, dispatch]);

  // 3. Clear local cart & wishlist when token is removed (logout)
  useEffect(() => {
    if (!token && prevTokenRef.current) {
      dispatch(resetCart());
      dispatch(resetFavoriteProduct());
    }
    prevTokenRef.current = token || null;
  }, [token, dispatch]);

  return null;
}
