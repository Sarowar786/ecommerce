import { paymentImage } from "@/assets";
import Container from "@/components/Container";
import Image from "next/image";
import { FaRegEye } from "react-icons/fa";
import { MdStar } from "react-icons/md";
import { getData } from "@/app/helpers";
import ProductImage from "@/components/cart/ProductImage";
import PriceTag from "@/components/cart/Pricetag";
import PriceFormat from "@/components/PriceFormat";
import AddToCartButton from "@/components/AddToCartButton";

export const metadata = {
  title: "Product Details | Shofy Store",
  description: "Ecommerce product details and purchasing",
};

interface Props {
  params: {
    id: string;
  };
}

export default async function SingleProductPage({ params }: Props) {
  const { id } = params;
  const backendBase = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";

  // Try fetching product data from backend first
  let res = await getData(`${backendBase}/products/${id}`);
  let product = res?.data;

  // Fallback to dummyjson if not in backend DB
  if (!product || !product.id) {
    product = await getData(`https://dummyjson.com/products/${id}`);
  }

  if (!product || !product.id) {
    return (
      <Container className="py-20 text-center space-y-4">
        <h2 className="text-3xl font-extrabold text-slate-900">
          Product Not Found 😢
        </h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          The item you are looking for might have been removed or is temporarily unavailable.
        </p>
      </Container>
    );
  }

  // Ensure images array
  if (!product.images || product.images.length === 0) {
    product.images = product.thumbnail ? [product.thumbnail] : ["/images/logonav.png"];
  }

  const discountAmount = ((product.price * (product.discountPercentage || 0)) / 100);
  const regularPrice = product.price;
  const discountedPrice = Math.max(0, product.price - discountAmount);

  return (
    <Container className="py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* 🖼️ Product Image */}
        <div>
          <ProductImage product={product} />
        </div>

        {/* 📦 Product Details */}
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-bold">{product?.title}</h2>

          {/* ⭐ Ratings and Price */}
          <div className="flex items-center justify-between">
            <PriceTag
              regularPrice={regularPrice}
              discountedPrice={discountedPrice}
            />

            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, index) => {
                const rating = product?.rating || 5;
                const filled = index + 1 <= Math.floor(rating);
                const halfFilled =
                  index + 1 > Math.floor(rating) &&
                  index < Math.ceil(rating);
                return (
                  <MdStar
                    key={index}
                    className={`${
                      filled
                        ? "text-orange-600"
                        : halfFilled
                        ? "text-orange-500"
                        : "text-orange-300"
                    }`}
                  />
                );
              })}
              <p className="text-base font-semibold ml-1">
                ({(product?.rating || 5.0).toFixed(1)} rating)
              </p>
            </div>
          </div>

          {/* 👁️ View Count */}
          <p className="flex items-center text-sm text-slate-600">
            <FaRegEye className="mr-1.5 text-slate-400" />{" "}
            <span className="font-semibold mr-1 text-slate-900">250+</span> people are viewing
            this right now
          </p>

          {/* 💸 Discount info */}
          {product?.discountPercentage > 0 && (
            <p className="text-sm">
              You are saving{" "}
              <span className="text-base font-bold text-emerald-600">
                <PriceFormat amount={discountAmount} />
              </span>{" "}
              ({product.discountPercentage}%) upon purchase
            </p>
          )}

          {/* 📝 Description */}
          <div className="py-2">
            <p className="text-sm tracking-wide text-slate-600 leading-relaxed">{product?.description}</p>
            {product?.warrantyInformation && (
              <p className="text-xs font-semibold text-slate-500 mt-2">🛡️ {product?.warrantyInformation}</p>
            )}
          </div>

          {product?.brand && (
            <p className="text-sm">
              Brand: <span className="font-semibold text-slate-900">{product?.brand}</span>
            </p>
          )}

          <p className="text-sm">
            Category:{" "}
            <span className="font-semibold capitalize text-slate-900">{product?.category}</span>
          </p>

          {/* 🏷️ Tags */}
          {product?.tags && product.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-slate-500 font-medium">Tags:</span>
              {product?.tags?.map((item: string, index: number) => (
                <span key={index} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium capitalize">
                  {item}
                </span>
              ))}
            </div>
          )}

          {/* 🛒 Add To Cart */}
          <AddToCartButton
            product={product}
            className="rounded-xl uppercase font-bold py-3.5 shadow-md shadow-slate-900/10"
          />

          {/* 💳 Payment Section */}
          <div className="bg-[#f7f7f7] p-5 rounded-2xl flex flex-col items-center justify-center gap-2 border border-slate-100">
            <Image
              src={paymentImage}
              alt="payment"
              className="w-auto object-cover"
            />
            <p className="font-semibold text-xs text-slate-600">Guaranteed safe & secure checkout</p>
          </div>
        </div>
      </div>
    </Container>
  );
}
