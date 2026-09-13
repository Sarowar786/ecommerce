"use client";

import Link from "next/link";
import Image from "next/image";
import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { logo } from "@/assets";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useRegisterMutation } from "@/redux/api/authApi";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  ArrowRight,
  UserPlus,
} from "lucide-react";

const registerSchema = z
  .object({
    full_name: z.string().trim().nonempty("Full Name is required"),
    email: z
      .string()
      .trim()
      .nonempty("Email is required")
      .email("Invalid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password is too long"),
    confirm_password: z.string().min(6, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

export default function SignupPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  const [registerUser, { isLoading }] = useRegisterMutation();

  const onSubmit = async (data: FieldValues) => {
    const toastId = toast.loading("Creating your account...");

    try {
      const payload = {
        name: data.full_name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
      };

      const res = await registerUser(payload).unwrap();

      if (res?.success) {
        const email = res?.data?.email || data.email.trim().toLowerCase();

        toast.success(
          res?.message || "Registration successful! Verification OTP sent.",
          {
            id: toastId,
          },
        );

        router.push(`/otp-verify?email=${encodeURIComponent(email)}`);
      } else {
        toast.error(res?.message || "Registration failed!", { id: toastId });
      }
    } catch (error: any) {
      console.log("REGISTER ERROR:", error);

      const backend = error?.data;
      let msg = "Registration failed. Please try again.";

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

      toast.error(msg, { id: toastId });
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* Left: Branding */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-amber-500/30">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <span className="text-2xl font-black tracking-tight">
            Shofy Store
          </span>
        </div>

        <div className="relative z-10 my-auto max-w-md space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-amber-400 text-xs font-semibold">
            <UserPlus className="h-3.5 w-3.5" />
            Join our growing shopping community
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
            Create your account in seconds.
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            Get instant access to exclusive member deals, express checkout, and
            seamless order management across all devices.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <span className="text-xs text-slate-300 font-medium">
                Safe & Verified
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <span className="text-xs text-slate-300 font-medium">
                Free Member Perks
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400 flex items-center justify-between">
          <span>
            &copy; {new Date().getFullYear()} Shofy Inc. All rights reserved.
          </span>
          <Link
            href="/"
            className="hover:text-white transition flex items-center gap-1"
          >
            Back to Store <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex items-center justify-center px-6 py-12 bg-slate-50/50">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex flex-col items-center text-center">
            <Link
              href="/"
              className="mb-4 inline-block transition hover:opacity-80"
            >
              <Image
                src={logo}
                alt="logo"
                className="h-10 w-auto object-contain"
              />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Create an account
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Enter your details below to register
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-8 space-y-4"
            noValidate
          >
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                className={`mt-1.5 w-full rounded-xl border px-4 py-3 text-sm outline-none transition bg-slate-50/50 focus:bg-white
                  ${errors.full_name ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-slate-200 focus:border-black focus:ring-1 focus:ring-black"}
                `}
                {...register("full_name")}
              />
              {errors.full_name && (
                <p className="mt-1 text-xs text-red-600 font-medium">
                  {errors.full_name.message as string}
                </p>
              )}
            </div>

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

            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password
              </label>
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

            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className={`mt-1.5 w-full rounded-xl border px-4 py-3 text-sm outline-none transition bg-slate-50/50 focus:bg-white
                  ${errors.confirm_password ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-slate-200 focus:border-black focus:ring-1 focus:ring-black"}
                `}
                {...register("confirm_password")}
              />
              {errors.confirm_password && (
                <p className="mt-1 text-xs text-red-600 font-medium">
                  {errors.confirm_password.message as string}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full rounded-xl py-3 bg-black hover:bg-slate-800 text-white font-semibold transition disabled:opacity-60 shadow-lg shadow-black/10 mt-2"
            >
              {isSubmitting || isLoading
                ? "Creating Account..."
                : "Create Account"}
            </Button>

            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-amber-600 font-semibold hover:underline"
              >
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
