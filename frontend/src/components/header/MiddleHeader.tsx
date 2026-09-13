"use client";

import Container from "../Container";
import Image from "next/image";
import { RiSearchLine, RiCloseLine } from "react-icons/ri";
import { useState } from "react";
import { LiaUser } from "react-icons/lia";
import { MdFavoriteBorder } from "react-icons/md";
import { BiShoppingBag } from "react-icons/bi";
import Link from "next/link";
import { logo } from "@/assets";
import { RiMenu3Fill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { StateType } from "../../../type";
import { RootState } from "@/redux/store";
import { logout } from "@/redux/features/authSlice";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard, LogOut, Package, User } from "lucide-react";

const MiddleHeader = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { cart, favoriteProduct } = useSelector((state: StateType) => state?.shopy || { cart: [], favoriteProduct: [] });
  const authUser = useSelector((state: RootState) => state.auth?.user);

  const [searchValue, setSearchValue] = useState("");

  const handleLogOut = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <div className="border-b-[1px] border-b-gray-200 bg-white sticky top-0 z-40">
      <Container className="py-4 flex items-center gap-4 md:gap-6 lg:gap-12 justify-between">
        <Link href={"/"} className="shrink-0">
          <Image src={logo} alt="logo" className="w-28" />
        </Link>

        {/* Search */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (searchValue.trim()) {
              router.push(`/products?searchTerm=${encodeURIComponent(searchValue.trim())}`);
            } else {
              router.push("/products");
            }
          }}
          className="hidden md:inline-flex flex-1 max-w-xl h-10 relative"
        >
          <input
            type="text"
            placeholder="Search products, brands and categories..."
            className="w-full h-full outline-none border border-slate-300 rounded-full px-4 pr-12 text-sm focus:border-black transition"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />

          {searchValue && (
            <RiCloseLine
              onClick={() => setSearchValue("")}
              className="text-lg absolute top-2.5 right-12 text-gray-400 hover:text-red-500 cursor-pointer duration-200"
            />
          )}

          <button
            type="submit"
            className="w-8 h-8 bg-black rounded-full inline-flex items-center justify-center text-white absolute top-1 right-1 hover:bg-slate-800 duration-200"
          >
            <RiSearchLine className="text-sm" />
          </button>
        </form>

        {/* Actions */}
        <div className="hidden md:inline-flex items-center gap-5">
          {/* Admin Dashboard Pill */}
          {authUser?.role === "ADMIN" && (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm transition"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Admin Portal
            </Link>
          )}

          {/* User Profile / Login */}
          {authUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer">
                <div className="h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase">
                  {authUser.name ? authUser.name[0] : "U"}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs text-slate-500 leading-tight">Hello,</p>
                  <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[100px]">
                    {authUser.name || authUser.email}
                  </p>
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="right" className="w-48 p-1.5">
                {authUser.role === "ADMIN" && (
                  <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                    <LayoutDashboard className="w-4 h-4 mr-2 text-amber-600" />
                    <span>Admin Dashboard</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className="w-4 h-4 mr-2" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogOut} className="text-red-600 hover:text-red-700">
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-black transition"
            >
              <div className="border border-slate-300 p-1.5 rounded-full text-lg">
                <LiaUser />
              </div>
              <div className="text-left">
                <p className="text-[11px] text-slate-500 leading-tight">Welcome</p>
                <p className="text-xs font-bold text-slate-900 leading-tight">Sign In / Register</p>
              </div>
            </Link>
          )}

          {/* Favorite Icon */}
          <Link href={"/favorite"} className="text-2xl relative text-slate-700 hover:text-black transition">
            <MdFavoriteBorder />
            <span className="absolute -top-1 -right-1 text-[10px] font-bold w-4 h-4 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center">
              {favoriteProduct?.length || 0}
            </span>
          </Link>

          {/* Cart Icon */}
          <Link href="/cart" className="text-2xl relative text-slate-700 hover:text-black transition">
            <BiShoppingBag />
            <span className="absolute -top-1 -right-1 text-[10px] font-bold w-4 h-4 bg-black text-white rounded-full flex items-center justify-center">
              {cart?.length || 0}
            </span>
          </Link>
        </div>

        {/* Mobile menu icon */}
        <div className="text-2xl md:hidden text-slate-700 hover:text-black cursor-pointer">
          <RiMenu3Fill />
        </div>
      </Container>
    </div>
  );
};

export default MiddleHeader;
