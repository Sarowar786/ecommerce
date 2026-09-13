"use client";

import Image from "next/image";
import { useState } from "react";
interface Props {
  images: string[];
}

const ProductImages = ({ images }: Props) => {
  const [currentImage, setCurrentImage] = useState(images[0]);
  return (
    <div className="flex items-start gap-2.5 w-full md:w-1/2 mr-10">
      <div>
        {images?.map((item, index) => (
          <div
            onClick={() => setCurrentImage(item)}
            key={index}
            className={`w-20 h-20 border p-1 mb-1 rounded-md ${
              item === currentImage ? "border-themeColor" : "border-gray-300"
            }`}
          >
            <Image
              src={item}
              alt="product-Image"
              width={200}
              height={200}
              className="w-full h-full object-contain"
            />
          </div>
        ))}
      </div>
      <Image
        src={currentImage}
        alt="product-image"
        width={500}
        height={500}
        className="w-full max-h-[500px] object-contain border border-themeColor/50 rounded-md"
      />
    </div>
  );
};

export default ProductImages;
