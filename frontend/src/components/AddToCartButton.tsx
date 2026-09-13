"use client";

import {
  addToCart,
  decreaseQuantity,
  increaseQuantity,
} from "@/redux/shofySlice";
import { useDispatch, useSelector } from "react-redux";
import { ProductType, StateType } from "../../type";
import toast, { Toaster } from "react-hot-toast";
import { FaPlus } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
interface PropsType {
  product?: ProductType;
  className?: string;
}

const AddToCartButton = ({ product, className }: PropsType) => {
  const { cart } = useSelector((state: StateType) => state?.shopy);
  const [existingProduct, setExistingProduct] = useState<ProductType | null>(
    null
  );
  const dispatch = useDispatch();

  useEffect(() => {
    const availableProduct = cart?.find((item) => item?.id === product?.id);
    if (availableProduct) {
      setExistingProduct(availableProduct);
    }
  }, [cart, product]);

  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart(product));
      toast.success(
        `${product?.title.substring(0, 10)}... added successfully!`
      );
    }
  };

  const handleAdd = () => {
    dispatch(increaseQuantity(product?.id));
    toast.success(`${product?.title.substring(0, 10)}... added successfully!`);
  };
  const handleMinus = () => {
    if (existingProduct?.quantity! > 1) {
      dispatch(decreaseQuantity(product?.id));
      toast.success(`Quantity decreased successfully!`);
    } else {
      toast.error("Quantity can not decrease less than 1");
    }
  };

  return (
    <>
      {existingProduct ? (
        <div
          className={twMerge(
            "flex items-center gap-x-5 h-10 rounded-full",
            className
          )}
        >
          <button
            disabled={existingProduct?.quantity === 1}
            onClick={handleMinus}
            className="bg-gray-100 h-full w-10 rounded-full flex items-center justify-center border hover:border-skyColor hover:bg-transparent duration-200 disabled:text-gray-500 disabled:bg-white"
          >
            <FaMinus />
          </button>{" "}
          <p className="text-base font-semibold">{existingProduct?.quantity}</p>{" "}
          <button
            onClick={handleAdd}
            className="bg-gray-100 h-full w-10 rounded-full flex items-center justify-center border hover:border-skyColor hover:bg-transparent duration-200"
          >
            <FaPlus />
          </button>
        </div>
      ) : (
        <button
          onClick={handleAddToCart}
          className="bg-transparent border border-skyColor text-black rounded-full py-1.5 hover:bg-skyColor hover:text-white duration-300 my-2"
        >
          Add to cart
        </button>
      )}
    </>
  );
};

export default AddToCartButton;
