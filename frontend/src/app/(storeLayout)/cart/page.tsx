import CartProducts from "@/components/cart/CartProducts";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Cart | Ecommerce",
  description: "View items in your shopping cart and proceed to checkout.",
};

const CartPage = () => {
  return (
    <div className="py-10 min-h-[70vh] bg-slate-50/50">
      <CartProducts />
    </div>
  );
};

export default CartPage;
