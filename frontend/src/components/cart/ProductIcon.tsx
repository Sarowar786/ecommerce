"use client";

import { useEffect, useState } from "react";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";

import { ProductType, StateType } from "../../../type";
import { addToFavorite } from "@/redux/shofySlice";

interface Props {
  discountPercentage: number;
  product: ProductType;
}

const ProductIcon = ({ discountPercentage, product }: Props) => {
  const { favoriteProduct } = useSelector((state: StateType) => state?.shopy);
  const dispatch = useDispatch();

  // ✅ FIX 1: Product → ProductType
  const [existingProduct, setExistingProduct] =
    useState<ProductType | null>(null);

  useEffect(() => {
    const availableItem = favoriteProduct.find(
      (item: ProductType) => item.id === product.id
    );

    setExistingProduct(availableItem || null);
  }, [product, favoriteProduct]);

  // ✅ FIX 2: proper event type
  const handleFavorite = (
    e: React.MouseEvent<HTMLSpanElement>
  ) => {
    e.preventDefault();

    dispatch(addToFavorite(product));
    toast.success(
      existingProduct
        ? `${product.title.substring(0, 10)} removed successfully!`
        : `${product.title.substring(0, 10)} added successfully!`
    );
  };

  return (
    <div className="absolute top-2 right-2 flex items-center gap-2">
      <p className="bg-transparent text-amazonBlue border border-amazonBlue group-hover:bg-amazonBlue group-hover:text-white duration-200 text-xs rounded-full py-1 px-2">
        {discountPercentage}%
      </p>

      <span onClick={handleFavorite} className="text-xl z-40 cursor-pointer">
        {existingProduct ? <MdFavorite /> : <MdFavoriteBorder />}
      </span>
    </div>
  );
};

export default ProductIcon;
