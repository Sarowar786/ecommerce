"use client";

import Container from "../Container";
import Link from "next/link";
import { navigation } from "@/constants";
// import { useDispatch, useSelector } from "react-redux";
// import { RootState } from "@/redux/store";
// import { logout } from "@/redux/features/authSlice";
// import toast from "react-hot-toast";
import CategoriesDropdown from "./CategoriesDropdown";

const BottomHeader = () => {
  // const dispatch = useDispatch();
  // const authUser = useSelector((state: RootState) => state.auth?.user);

  // const handleSignOut = () => {
  //   dispatch(logout());
  //   toast.success("Signed out successfully");
  // };

  return (
    <div className="border-b border-b-gray-200 bg-white relative z-30">
      <Container className="flex items-center justify-between py-2">
        <div className="text-xs md:text-sm font-medium flex items-center gap-6">
          {navigation?.map((item) => {
            if (item.title === "Categories") {
              return <CategoriesDropdown key={item.title} />;
            }

            return (
              <Link
                key={item?.title}
                href={item?.href}
                className="text-slate-800 hover:text-themeColor transition-colors py-1"
              >
                {item?.title}
              </Link>
            );
          })}

          {/* {authUser && (
            <button
              onClick={handleSignOut}
              className="text-xs text-red-600 hover:text-red-700 hover:underline cursor-pointer transition font-semibold"
            >
              Sign out
            </button>
          )} */}
        </div>

        <p className="text-xs text-gray-500 font-medium hidden md:inline-flex items-center gap-1.5">
          <span>Hotline:</span>
          <a
            href="tel:+8801308158614"
            className="text-slate-900 font-bold hover:text-themeColor transition"
          >
            +880 1308158614
          </a>
        </p>
      </Container>
    </div>
  );
};

export default BottomHeader;
