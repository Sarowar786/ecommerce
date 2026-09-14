import Image from "next/image";
import Link from "next/link";
import Container from "@/components/Container";
import { bannerImage } from "@/assets";
import { GoArrowRight } from "react-icons/go";
import { Sparkles, ShieldCheck, Truck, RotateCcw } from "lucide-react";

const Banner = () => {
  return (
    <div className="relative w-full min-h-[480px] sm:min-h-[540px] md:min-h-[600px] lg:min-h-[640px] flex items-center overflow-hidden bg-slate-950">
      {/* Background Image */}
      <Image
        src={bannerImage}
        alt="Banner Background"
        fill
        priority
        quality={90}
        className="object-cover object-center md:object-right select-none"
      />

      {/* Layered Gradient Overlays for High-Contrast Left-Side Text */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-800/40 to-transparent z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-850/40 z-[1]" />

      {/* Hero Content on the Left */}
      <div className="relative z-10 py-16 md:py-24 container mx-auto">
        <div className="max-w-2xl flex flex-col items-start gap-5 md:gap-7 text-white">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-md shadow-sm animate-pulse">
            {/* <Sparkles className="w-4 h-4 text-amber-400" /> */}
            <span>Exclusive Deals • Up to 40% Off</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] text-white">
            Discover Premium Picks For Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200">
              Modern Life
            </span>
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed font-normal">
            Explore our hand-crafted selection of flagship tech, trending essentials,
            and luxury collections designed for performance and sophistication.
          </p>

          {/* Call-to-action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold px-7 py-3.5 rounded-xl text-sm transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] group"
            >
              <span>Explore Collection</span>
              <GoArrowRight className="text-lg transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/categories"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3.5 rounded-xl text-sm border border-white/20 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Browse Categories
            </Link>
          </div>

          {/* Perks Bar */}
          <div className="pt-4 border-t border-white/10 w-full flex flex-wrap items-center gap-5 sm:gap-8 text-xs text-slate-300 font-medium">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Free Fast Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Official Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-sky-400" />
              <span>7-Day Return Policy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
