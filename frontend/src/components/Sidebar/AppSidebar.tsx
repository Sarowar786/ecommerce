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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
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
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { logout } from "@/redux/features/authSlice";
import { RootState } from "@/redux/store";
import { Button } from "../ui/button";

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

  const handleLogOut = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <Sidebar {...props}>
      {/* ================= HEADER ================= */}
      <SidebarHeader>
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-2 py-3 transition hover:opacity-90"
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-black to-slate-800 text-white flex items-center justify-center font-bold shadow-md">
            <Sparkles className="h-4 w-4 text-amber-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-slate-900 leading-tight">
              Shofy Admin
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              Management Portal
            </span>
          </div>
        </Link>
      </SidebarHeader>

      {/* ================= MENU ================= */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-slate-400 font-semibold px-3 mb-2">
            Main Management
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.url
                  : pathname.startsWith(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`gap-3 px-3 py-2.5 rounded-xl transition font-medium text-sm ${
                        isActive
                          ? "bg-slate-900 text-white shadow-sm font-semibold"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <Link
                        href={item.url}
                        className="flex items-center gap-3 w-full"
                      >
                        <item.icon
                          className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-slate-400"}`}
                        />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-slate-400 font-semibold px-3 mb-2">
            Storefront
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl px-3 py-2.5 transition text-sm"
                >
                  <Link
                    href="/"
                    className="flex items-center gap-3 w-full"
                    target="_blank"
                  >
                    <Store className="w-4 h-4 text-emerald-500" />
                    <span>Live Customer Store</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ================= FOOTER ================= */}
      <SidebarFooter>
        {user && (
          <div className="px-3 py-2 bg-slate-50 rounded-xl mb-2 border border-slate-100 flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase">
              {user.name ? user.name[0] : "A"}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-900 truncate">
                {user.name}
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                {user.email}
              </span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
              {user.role}
            </span>
          </div>
        )}

        <Button
          onClick={handleLogOut}
          variant="outline"
          className="w-full flex items-center justify-center gap-2 text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700 rounded-xl transition text-xs font-semibold h-9"
        >
          <LogOut className="w-3.5 h-3.5" />
          Log Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
