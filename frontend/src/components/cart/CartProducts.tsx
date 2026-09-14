"use client";

import { useSelector } from "react-redux";
import { ProductType, StateType } from "../../../type";
import Container from "../Container";
import CartProduct from "./CartProduct";
import CartSummary from "./CartSummary";
import Link from "next/link";
import { RootState } from "@/redux/store";
import { useGetMyCartQuery } from "@/redux/api/ecommerceApi";
import { ShoppingBag, LogIn } from "lucide-react";

const CartProducts = () => {
  const token = useSelector((state: RootState) => state.auth?.token);
  const { cart } = useSelector((state: StateType) => state?.shopy);
  const { isLoading } = useGetMyCartQuery(undefined, { skip: !token });

  if (token && isLoading && (!cart || cart.length === 0)) {
    return (
      <Container>
        <div className="bg-white h-96 my-10 flex flex-col gap-4 items-center justify-center py-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="h-10 w-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading your cart items...</p>
        </div>
      </Container>
    );
  }

  if (!token) {
    return (
      <Container>
        <div className="bg-white h-96 my-10 flex flex-col gap-4 items-center justify-center py-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center mb-2">
            <LogIn className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Please Sign In
          </h1>
          <p className="text-sm max-w-md text-center text-slate-500">
            Sign in to access your saved cart items and proceed with your order.
          </p>
          <Link
            className="inline-flex items-center gap-2 bg-slate-950 text-white px-8 py-3.5 rounded-full hover:bg-amber-500 hover:text-slate-950 duration-200 uppercase text-xs font-bold tracking-wider transition shadow-sm"
            href="/login?callbackUrl=/cart"
          >
            Sign In Now
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      {cart?.length > 0 ? (
        <>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Shopping Cart
          </h1>
          <div className="mt-10 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12">
            <section className="lg:col-span-7">
              <div className="divide-y divide-slate-200 border-b border-t border-slate-200">
                {cart?.map((product: ProductType) => (
                  <CartProduct key={product?.id} product={product} />
                ))}
              </div>
            </section>
            <CartSummary cart={cart} />
          </div>
        </>
      ) : (
        <div className="bg-white h-96 my-10 flex flex-col gap-4 items-center justify-center py-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center mb-2">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Shopping Cart is Empty
          </h1>
          <p className="text-sm max-w-md text-center text-slate-500">
            Your shopping cart has no items. Explore our wide selection of products and find something you love!
          </p>
          <Link
            className="inline-flex items-center gap-2 bg-slate-950 text-white px-8 py-3.5 rounded-full hover:bg-amber-500 hover:text-slate-950 duration-200 uppercase text-xs font-bold tracking-wider transition shadow-sm"
            href="/products"
          >
            Continue Shopping
          </Link>
        </div>
      )}
    </Container>
  );
};

export default CartProducts;
