"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Store,
  LogOut,
  Sparkles,
  X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { logout } from "@/redux/features/authSlice";
import { RootState } from "@/redux/store";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    title: "Products",
    url: "/dashboard/products",
    icon: Package,
  },
  {
    title: "Categories",
    url: "/dashboard/categories",
    icon: Layers,
  },
  {
    title: "Orders",
    url: "/dashboard/orders",
    icon: ShoppingBag,
  },
  {
    title: "Users",
    url: "/dashboard/users",
    icon: Users,
  },
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth?.user);
  const { open, isMobile, setOpenMobile } = useSidebar();

  const isCollapsed = !open && !isMobile;

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleLogOut = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    router.push("/");
  };

  return (
    <Sidebar {...props}>
      {/* ================= HEADER ================= */}
      <SidebarHeader className={isCollapsed ? "p-3 border-b border-gray-100" : "p-4 border-b border-gray-100"}>
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            onClick={handleLinkClick}
            title="Shofy Admin - Management Portal"
            className={cn(
              "flex items-center transition hover:opacity-90",
              isCollapsed ? "justify-center w-full" : "gap-3 px-1 py-1"
            )}
          >
            <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-tr from-black to-slate-800 text-white flex items-center justify-center font-bold shadow-md hover:scale-105 transition-transform">
              <Sparkles className="h-4 w-4 text-amber-400" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-base font-extrabold tracking-tight text-slate-900 leading-tight truncate">
                  Shofy Admin
                </span>
                <span className="text-[11px] font-medium text-slate-400 truncate">
                  Management Portal
                </span>
              </div>
            )}
          </Link>

          {/* Mobile Close Button */}
          {isMobile && (
            <button
              onClick={() => setOpenMobile(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </SidebarHeader>

      {/* ================= MENU ================= */}
      <SidebarContent className={isCollapsed ? "px-2 py-4 space-y-4" : "p-3 space-y-4"}>
        <SidebarGroup>
          {!isCollapsed ? (
            <SidebarGroupLabel className="text-xs uppercase tracking-wider text-slate-400 font-semibold px-3 mb-2">
              Main Management
            </SidebarGroupLabel>
          ) : (
            <div className="w-8 h-[1px] bg-slate-200/80 mx-auto my-2" />
          )}

          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.url
                  : pathname.startsWith(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <Link
                      href={item.url}
                      onClick={handleLinkClick}
                      title={isCollapsed ? item.title : undefined}
                      className={cn(
                        "flex items-center rounded-xl transition-all duration-200 font-medium text-sm group",
                        isCollapsed
                          ? "w-10 h-10 mx-auto justify-center"
                          : "gap-3 px-3 py-2.5 w-full",
                        isActive
                          ? "bg-slate-900 text-white shadow-sm font-semibold"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "shrink-0 transition-transform group-hover:scale-110",
                          isCollapsed ? "w-5 h-5" : "w-4 h-4",
                          isActive ? "text-amber-400" : "text-slate-400 group-hover:text-slate-700"
                        )}
                      />
                      {!isCollapsed && <span className="truncate">{item.title}</span>}
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!isCollapsed ? (
            <SidebarGroupLabel className="text-xs uppercase tracking-wider text-slate-400 font-semibold px-3 mb-2">
              Storefront
            </SidebarGroupLabel>
          ) : (
            <div className="w-8 h-[1px] bg-slate-200/80 mx-auto my-2" />
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link
                  href="/"
                  target="_blank"
                  onClick={handleLinkClick}
                  title={isCollapsed ? "Live Customer Store" : undefined}
                  className={cn(
                    "flex items-center rounded-xl transition-all duration-200 font-medium text-sm group",
                    isCollapsed
                      ? "w-10 h-10 mx-auto justify-center text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
                      : "gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 w-full"
                  )}
                >
                  <Store
                    className={cn(
                      "text-emerald-500 shrink-0 transition-transform group-hover:scale-110",
                      isCollapsed ? "w-5 h-5" : "w-4 h-4"
                    )}
                  />
                  {!isCollapsed && <span className="truncate">Live Customer Store</span>}
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ================= FOOTER ================= */}
      <SidebarFooter className={isCollapsed ? "p-2 border-t border-gray-100 mt-auto flex flex-col items-center" : "p-3 border-t border-gray-100 mt-auto"}>
        <Button
          onClick={handleLogOut}
          variant="outline"
          title={isCollapsed ? "Log Out" : undefined}
          className={cn(
            "flex items-center justify-center text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700 rounded-xl transition text-xs font-semibold",
            isCollapsed ? "w-10 h-10 p-0" : "w-full gap-2 h-9"
          )}
        >
          <LogOut className={isCollapsed ? "w-4 h-4" : "w-3.5 h-3.5"} />
          {!isCollapsed && <span>Log Out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
