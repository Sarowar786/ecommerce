"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/Sidebar/AppSidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth?.user);
  const token = useSelector((state: RootState) => state.auth?.token);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const cookieToken = Cookies.get("accessToken");
    if (!token && !cookieToken) {
      router.push("/login?callbackUrl=/dashboard");
    }
  }, [token, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-8 w-8 rounded-full border-4 border-slate-900 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-4 sm:px-6">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-5 bg-slate-200" />
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Portal
              </span>
              <span className="text-slate-300">/</span>
              <span className="text-sm font-bold text-slate-900 truncate">
                Admin Center
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 pl-2 sm:pl-3">
            <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold uppercase shrink-0">
              {user?.name ? user.name[0] : "A"}
            </div>
            <div className="hidden md:flex flex-col text-left min-w-0">
              <span className="text-xs font-bold text-slate-900 leading-tight truncate">
                {user?.name || "Administrator"}
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                {user?.email || "sarowar2287@gmail.com"}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 w-full max-w-full overflow-x-hidden">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
