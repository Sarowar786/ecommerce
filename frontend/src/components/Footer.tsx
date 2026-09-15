"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Container from "./Container";
import SocialLink from "./SocialLink";
import { logo, paymentImage } from "@/assets";
import toast from "react-hot-toast";
import {
  Truck,
  RotateCcw,
  ShieldCheck,
  Headphones,
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  ChevronUp,
  Lock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setIsSubscribed(true);
    toast.success("Thank you for subscribing to Shofy newsletter!");
    setEmail("");
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // const trustFeatures = [
  //   {
  //     icon: <Truck className="w-6 h-6 text-sky-400" />,
  //     title: "Free Express Shipping",
  //     description: "Free delivery on all orders over $99",
  //   },
  //   {
  //     icon: <RotateCcw className="w-6 h-6 text-amber-400" />,
  //     title: "30-Day Money Back",
  //     description: "Hassle-free 30 days return & exchange",
  //   },
  //   {
  //     icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
  //     title: "100% Secure Checkout",
  //     description: "Protected by 256-bit SSL encryption",
  //   },
  //   {
  //     icon: <Headphones className="w-6 h-6 text-purple-400" />,
  //     title: "24/7 Dedicated Support",
  //     description: "Friendly expert assistance around the clock",
  //   },
  // ];

  const categoryLinks = [
    { title: "Smartphones & Tablets", href: "/products" },
    { title: "Laptops & Computers", href: "/products" },
    { title: "Audio & Headphones", href: "/products" },
    { title: "Smart Watches", href: "/products" },
    { title: "Gaming & Accessories", href: "/products" },
    { title: "Cameras & Drones", href: "/products" },
  ];

  const customerCareLinks = [
    { title: "Track Your Order", href: "/orders" },
    { title: "Shipping & Delivery", href: "/products" },
    { title: "Returns & Refund Policy", href: "/products" },
    { title: "FAQs & Help Center", href: "/contact" },
    { title: "Terms of Service", href: "/contact" },
    { title: "Privacy Policy", href: "/contact" },
  ];

  const accountLinks = [
    { title: "My Profile", href: "/dashboard" },
    { title: "Shopping Cart", href: "/cart" },
    { title: "Wishlist & Favorites", href: "/favorite" },
    { title: "Order History", href: "/orders" },
    { title: "Special Offers", href: "/offers" },
    { title: "Contact Us", href: "/contact" },
  ];

  return (
    <footer id="contact" className="w-full bg-slate-950 text-slate-300 relative overflow-hidden border-t border-slate-800">
      {/* Decorative subtle background ambient glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* ================= 1. TRUST FEATURES STRIP ================= */}
      {/* <div className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        <Container className="py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/40 hover:border-slate-600/70 hover:bg-slate-800/70 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700/60 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-sky-300 transition-colors">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div> */}

      {/* ================= 2. NEWSLETTER CALLOUT BANNER ================= */}
      

      {/* ================= 3. MAIN FOOTER NAVIGATION ================= */}
      <Container className="py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Column 1: Brand & Bio (4 cols) */}
          <div className="lg:col-span-4 flex flex-col items-start gap-5">
            <Link
              href="/"
              className="inline-flex items-center justify-center bg-white px-3.5 py-2 rounded-xl shadow-md border border-slate-700/60 hover:scale-105 transition-transform duration-200"
            >
              <Image src={logo} alt="Shofy Logo" className="w-28 h-auto" />
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Shofy is your premier destination for modern electronics, smart
              wearables, and lifestyle gear. Delivering authentic, top-tier
              products with world-class support.
            </p>

            <div className="space-y-2.5 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400 shrink-0 group-hover:border-sky-500/40 transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Customer Hotline</span>
                  <a
                    href="tel:+18004139076"
                    className="font-medium text-white hover:text-sky-400 transition-colors"
                  >
                    +880 1308158614
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400 shrink-0 group-hover:border-sky-500/40 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Email Support</span>
                  <a
                    href="mailto:support@shofy.com"
                    className="font-medium text-white hover:text-sky-400 transition-colors"
                  >
                    support@shofy.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400 shrink-0 group-hover:border-sky-500/40 transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Headquarters</span>
                  <span className="text-slate-300">
                    792 Market Street, San Francisco, CA & Dhaka, BD
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">
                Connect With Us
              </span>
              <SocialLink variant="dark" />
            </div>
          </div>

          {/* Column 2: Categories (2.5 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-base font-bold text-white tracking-wide relative inline-block after:content-[''] after:block after:w-8 after:h-0.5 after:bg-sky-500 after:mt-1.5 after:rounded-full">
              Categories
            </h4>
            <ul className="space-y-2.5">
              {categoryLinks.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-400 hover:text-white flex items-center gap-2 group transition-colors duration-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-sky-400 group-hover:scale-125 transition-all" />
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {item.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Care (2.5 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-base font-bold text-white tracking-wide relative inline-block after:content-[''] after:block after:w-8 after:h-0.5 after:bg-sky-500 after:mt-1.5 after:rounded-full">
              Customer Service
            </h4>
            <ul className="space-y-2.5">
              {customerCareLinks.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-400 hover:text-white flex items-center gap-2 group transition-colors duration-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-sky-400 group-hover:scale-125 transition-all" />
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {item.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Quick Links / Safe Shopping (3 cols) */}
          <div className="lg:col-span-3 space-y-5">
            <div className="space-y-4">
              <h4 className="text-base font-bold text-white tracking-wide relative inline-block after:content-[''] after:block after:w-8 after:h-0.5 after:bg-sky-500 after:mt-1.5 after:rounded-full">
                My Account
              </h4>
              <ul className="grid grid-cols-2 gap-2.5">
                {accountLinks.map((item) => (
                  <li key={item.title}>
                    <Link
                      href={item.href}
                      className="text-sm text-slate-400 hover:text-white flex items-center gap-1.5 group transition-colors duration-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-sky-400 group-hover:scale-125 transition-all" />
                      <span className="group-hover:translate-x-1 transition-transform duration-200">
                        {item.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Operating Hours Box */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Working Hours</span>
              </div>
              <p className="text-xs text-slate-300">
                Mon – Sat: <span className="text-white font-medium">9:00 AM – 9:00 PM</span>
              </p>
              <p className="text-xs text-slate-400">
                Sunday: <span className="text-slate-300">10:00 AM – 6:00 PM</span>
              </p>
            </div>

            {/* Payment security badge */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                100% Secure Payment
              </span>
              <div className="bg-white/95 p-2 rounded-xl border border-slate-700/60 shadow-sm inline-block">
                <Image
                  src={paymentImage}
                  alt="Accepted Payment Methods"
                  className="h-6 w-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ================= 4. BOTTOM COPYRIGHT & TRUST BAR ================= */}
      <div className="border-t border-slate-800/80 bg-slate-950">
        <Container className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 text-xs text-slate-400">
            <p>
              © {new Date().getFullYear()}{" "}
              <span className="text-white font-semibold">Shofy</span>. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <Link href="/contact" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-white transition-colors">
                Terms of Use
              </Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-white transition-colors">
                Cookie Settings
              </Link>
            </div>
          </div>

          {/* Back to top button */}
          <button
            onClick={scrollToTop}
            aria-label="Back to Top"
            className="group flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900 border border-slate-700/80 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 hover:border-sky-500/50 transition-all duration-300 shadow-md"
          >
            <span>Back to top</span>
            <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-sky-400 group-hover:-translate-y-0.5 transition-all" />
          </button>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;
