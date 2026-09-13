import React, { useEffect, useState } from "react";
import Title from "../Title";
import Button from "../ui/button";
import PriceFormat from "../PriceFormat";
import { ProductType } from "../../../type";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { loadStripe } from "@stripe/stripe-js";
import toast from "react-hot-toast";

interface Props {
  cart: ProductType[];
}

const CartSummary = ({ cart }: Props) => {
  const [totalAmt, setTotalAmt] = useState(0);
  const [discountAmt, setDiscountAmt] = useState(0);
  const [loading, setLoading] = useState(false);

  const authUser = useSelector((state: RootState) => state.auth?.user);

  useEffect(() => {
    let amt = 0;
    let discount = 0;
    cart?.map((item) => {
      amt += item?.price * (item?.quantity || 1);
      discount +=
        (((item?.price || 0) * (item?.discountPercentage || 0)) / 100) *
        (item?.quantity || 1);
    });

    setTotalAmt(amt);
    setDiscountAmt(discount);
  }, [cart]);

  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder",
  );

  const handleCheckout = async () => {
    if (!authUser) {
      toast.error("Please login to proceed to checkout");
      return;
    }
    setLoading(true);
    try {
      const stripe = await stripePromise;
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart,
          email: authUser?.email,
        }),
      });
      const checkoutSession = await response?.json();
      if (checkoutSession?.id) {
        const result: any = await stripe?.redirectToCheckout({
          sessionId: checkoutSession.id,
        });
        if (result?.error) {
          toast.error(result.error.message);
        }
      } else {
        toast.success("Order recorded successfully!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to proceed to checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-lg bg-gray-100 px-4 py-6 sm:p-10 lg:col-span-5 mt-16 lg:mt-0">
      <Title>Cart Summary</Title>
      <div className="mt-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Title className="text-lg font-medium">Sub Total</Title>
          <PriceFormat amount={totalAmt + discountAmt} />
        </div>
        <div className="flex items-center justify-between">
          <Title className="text-lg font-medium">Discount</Title>
          <PriceFormat amount={discountAmt} />
        </div>
        <div className="flex items-center justify-between">
          <Title className="text-lg font-medium">Payable Amount</Title>
          <PriceFormat amount={totalAmt} className="text-lg font-bold" />
        </div>
        <Button onClick={handleCheckout}>Checkout</Button>
      </div>
    </section>
  );
};

export default CartSummary;
