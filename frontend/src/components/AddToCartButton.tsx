"use client";

import {
  addToCart,
  decreaseQuantity,
  increaseQuantity,
} from "@/redux/shofySlice";
import { useDispatch, useSelector } from "react-redux";
import { ProductType, StateType } from "../../type";
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import {
  useAddToCartBackendMutation,
  useUpdateCartQuantityMutation,
} from "@/redux/api/ecommerceApi";

interface PropsType {
  product?: ProductType;
  className?: string;
}

const AddToCartButton = ({ product, className }: PropsType) => {
  const router = useRouter();
  const { cart } = useSelector((state: StateType) => state?.shopy);
  const token = useSelector((state: RootState) => state.auth?.token);
  const [existingProduct, setExistingProduct] = useState<ProductType | null>(
    null
  );
  const dispatch = useDispatch();
  const [addToCartBackend] = useAddToCartBackendMutation();
  const [updateCartQuantity] = useUpdateCartQuantityMutation();

  useEffect(() => {
    const availableProduct = cart?.find((item) => item?.id === product?.id);
    if (availableProduct) {
      setExistingProduct(availableProduct);
    } else {
      setExistingProduct(null);
    }
  }, [cart, product]);

  const handleAddToCart = async () => {
    if (!token) {
      toast.error("Please login to add items to your cart");
      router.push("/login?callbackUrl=/cart");
      return;
    }

    if (product) {
      dispatch(addToCart(product));
      toast.success(
        `${product?.title ? product.title.substring(0, 15) : "Item"}... added successfully!`
      );

      if (token && product?.id) {
        try {
          await addToCartBackend({
            productId: String(product.id),
            quantity: 1,
          }).unwrap();
        } catch (err) {
          console.error("Failed to sync cart to backend:", err);
        }
      }
    }
  };

  const handleAdd = async () => {
    if (!token) {
      toast.error("Please login to manage your cart");
      router.push("/login?callbackUrl=/cart");
      return;
    }

    if (!product) return;
    dispatch(increaseQuantity(product?.id));
    toast.success(
      `${product?.title ? product.title.substring(0, 15) : "Item"}... added successfully!`
    );

    if (token && product?.id) {
      const nextQty = (existingProduct?.quantity || 1) + 1;
      try {
        await updateCartQuantity({
          id: String(product.id),
          quantity: nextQty,
        }).unwrap();
      } catch (err) {
        console.error("Failed to update cart quantity on backend:", err);
      }
    }
  };

  const handleMinus = async () => {
    if (!product) return;
    if (existingProduct?.quantity! > 1) {
      dispatch(decreaseQuantity(product?.id));
      toast.success(`Quantity decreased successfully!`);

      if (token && product?.id) {
        const nextQty = (existingProduct?.quantity || 2) - 1;
        try {
          await updateCartQuantity({
            id: String(product.id),
            quantity: nextQty,
          }).unwrap();
        } catch (err) {
          console.error("Failed to update cart quantity on backend:", err);
        }
      }
    } else {
      toast.error("Quantity can not decrease less than 1");
    }
  };

  return (
    <>
      {existingProduct ? (
        <div
          className={twMerge(
            "flex items-center justify-between border border-slate-200 bg-slate-50 h-9 px-3 rounded-full shadow-sm",
            className
          )}
        >
          <button
            disabled={existingProduct?.quantity === 1}
            onClick={handleMinus}
            className="h-6 w-6 rounded-full flex items-center justify-center bg-white border border-slate-200 hover:bg-amber-500 hover:border-amber-500 text-slate-700 hover:text-slate-950 duration-200 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-700 transition"
          >
            <FaMinus className="text-[10px]" />
          </button>
          <span className="text-sm font-semibold px-3 text-slate-800">
            {existingProduct?.quantity}
          </span>
          <button
            onClick={handleAdd}
            className="h-6 w-6 rounded-full flex items-center justify-center bg-white border border-slate-200 hover:bg-amber-500 hover:border-amber-500 text-slate-700 hover:text-slate-950 duration-200 transition"
          >
            <FaPlus className="text-[10px]" />
          </button>
        </div>
      ) : (
        <button
          onClick={handleAddToCart}
          className="w-full bg-slate-950 text-white font-medium text-xs tracking-wide uppercase py-2.5 px-4 rounded-lg hover:bg-amber-500 hover:text-slate-950 transition-all duration-200 shadow-sm active:scale-95"
        >
          Add to Cart
        </button>
      )}
    </>
  );
};

export default AddToCartButton;
