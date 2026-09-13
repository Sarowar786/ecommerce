import FavoriteProducts from "@/components/favorite/FavoriteProducts";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Wishlist | Ecommerce",
  description: "View and manage your saved favorite products.",
};

const FavoritePage = () => {
  return (
    <div className="py-6 min-h-[70vh] bg-slate-50/50">
      <FavoriteProducts />
    </div>
  );
};

export default FavoritePage;
