import BottomHeader from "@/components/header/BottomHeader";
import Banner from "@/components/pages/Banner";
import ProductList from "@/components/ProductList";
import { getData } from "@/app/helpers";
import FeaturedCategory from "@/components/pages/FeaturedCategory";

export const dynamic = "force-dynamic";

export default async function Home() {
  const backendBase = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";
  
  let products: any[] = [];
  try {
    const productData = await getData(`${backendBase}/products?limit=50`);
    if (productData?.data && Array.isArray(productData.data) && productData.data.length > 0) {
      products = productData.data;
    } else {
      const fallbackData = await getData("https://dummyjson.com/products");
      products = fallbackData?.products || [];
    }
  } catch (err) {
    console.error("Home page fetch error:", err);
  }

  return (
    <main>
      <Banner />
      <FeaturedCategory/>
      <ProductList product={{ products: products || [] }} />
    </main>
  );
}
