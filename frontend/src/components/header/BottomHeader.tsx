"use client";
import Container from "../Container";
import Link from "next/link";
import { navigation } from "@/constants";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { logout } from "@/redux/features/authSlice";
import toast from "react-hot-toast";

const BottomHeader = () => {
  const dispatch = useDispatch();
  const authUser = useSelector((state: RootState) => state.auth?.user);

  const handleSignOut = () => {
    dispatch(logout());
    toast.success("Signed out successfully");
  };

  return (
    <div className="border-b border-b-gray-400">
      <Container className="flex items-center justify-between py-1">
        <div className="text-xs md:text-sm font-medium flex items-center gap-5">
          {navigation?.map((item) => (
            <Link key={item?.title} href={item?.href}>
              {item?.title}
            </Link>
          ))}
          {authUser && (
            <button
              onClick={handleSignOut}
              className="text-xs text-red-600 hover:underline cursor-pointer"
            >
              Sign out
            </button>
          )}
        </div>
        <p className="text-xs text-gray-400 font-medium hidden md:inline-flex">
          Hotline: <span className="text-black">+88 01012345678</span>
        </p>
      </Container>
    </div>
  );
};

export default BottomHeader;
