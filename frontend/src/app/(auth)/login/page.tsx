"use client";

import { Suspense } from "react";

import Link from "next/link";
import Image from "next/image";
import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { logo } from "@/assets";
import { useLoginMutation } from "@/redux/api/authApi";
import { useDispatch } from "react-redux";
import { setRefreshToken, setUser } from "@/redux/features/authSlice";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Sparkles, ShoppingBag, ShieldCheck, ArrowRight } from "lucide-react";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .nonempty("Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),
});

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [loginUser, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const router = useRouter();

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const onSubmit = async (data: FieldValues) => {
    const payload = {
      email: String(data.email).trim().toLowerCase(),
      password: String(data.password),
    };

    try {
      const response = await loginUser(payload).unwrap();

      const token = response?.data?.accessToken || response?.data?.access;
      const refresh = response?.data?.refreshToken || response?.data?.refresh;
      const user = response?.data?.user;

      if (token) {
        dispatch(setUser({ token, user }));
        if (refresh) {
          dispatch(setRefreshToken({ refresh_token: refresh }));
        }
        toast.success("Login Successful!");

        const role = String(user?.role || "").toUpperCase();
        if (role === "ADMIN" || role === "SUPER_ADMIN") {
          router.push("/dashboard");
        } else {
          // Customer user directly goes to store homepage
          const target = callbackUrl && callbackUrl !== "/dashboard" ? callbackUrl : "/";
          router.push(target);
        }
        return;
      }
    } catch (err: any) {
      console.log("LOGIN ERROR:", err);

      const backend = err?.data;
      let msg = "Invalid credentials. Please try again.";

      if (backend) {
        if (backend?.message) {
          msg = backend.message;
        } else if (backend?.error) {
          if (typeof backend.error === "string") {
            msg = backend.error;
          } else {
            const firstKey = Object.keys(backend.error)[0];
            if (firstKey && backend.error[firstKey]?.length > 0) {
              msg = backend.error[firstKey][0];
            }
          }
        }
      }

      toast.error(msg, {
        style: {
          background: "#FEF2F2",
          color: "#991B1B",
          border: "1px solid #FCA5A5",
        },
      });

      if (msg.toLowerCase().includes("verify your email")) {
        router.push(`/otp-verify?email=${encodeURIComponent(payload.email)}`);
      }
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* Left: Premium Branding Banner */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-amber-500/30">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <span className="text-2xl font-black tracking-tight">Shofy Store</span>
        </div>

        <div className="relative z-10 my-auto max-w-md space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-amber-400 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            Next Generation Ecommerce Experience
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
            Seamless shopping, powerful management.
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            Discover thousands of hand-crafted products, track orders in real time, and enjoy swift, secure checkout.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <span className="text-xs text-slate-300 font-medium">Bank-grade Security</span>
            </div>
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <span className="text-xs text-slate-300 font-medium">24/7 Priority Support</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400 flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} Shofy Inc. All rights reserved.</span>
          <Link href="/" className="hover:text-white transition flex items-center gap-1">
            Back to Store <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex items-center justify-center px-6 py-12 bg-slate-50/50">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <Link href="/" className="mb-4 inline-block transition hover:opacity-80">
              <Image src={logo} alt="logo" className="h-10 w-auto object-contain" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-8 space-y-4"
            noValidate
          >
            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                className={`mt-1.5 w-full rounded-xl border px-4 py-3 text-sm outline-none transition bg-slate-50/50 focus:bg-white
                  ${errors.email ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-slate-200 focus:border-black focus:ring-1 focus:ring-black"}
                `}
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 font-medium">
                  {errors.email.message as string}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forget-password"
                  className="text-xs font-medium text-amber-600 hover:text-amber-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className={`mt-1.5 w-full rounded-xl border px-4 py-3 text-sm outline-none transition bg-slate-50/50 focus:bg-white
                  ${errors.password ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-slate-200 focus:border-black focus:ring-1 focus:ring-black"}
                `}
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 font-medium">
                  {errors.password.message as string}
                </p>
              )}
            </div>

            {/* Login button */}
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full rounded-xl py-3 bg-black hover:bg-slate-800 text-white font-semibold transition disabled:opacity-60 shadow-lg shadow-black/10 mt-2"
            >
              {isSubmitting || isLoading ? "Signing in..." : "Sign In"}
            </Button>

            {/* Demo Credentials Card */}
            {/* <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-semibold text-amber-700">👑 Admin (Dashboard):</span>
                <span className="font-mono text-[11px]">sarowar2287@gmail.com / 12345678</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 pt-1 border-t border-slate-200">
                <span className="font-semibold text-emerald-700">🛍️ Customer (Store):</span>
                <span className="font-mono text-[11px]">customer@shofy.com / 12345678</span>
              </div>
            </div> */}

            {/* Footer */}
            <p className="text-center text-sm text-slate-500 mt-6">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-amber-600 font-semibold hover:underline"
              >
                Create Account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="h-8 w-8 rounded-full border-4 border-slate-900 border-t-transparent animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
