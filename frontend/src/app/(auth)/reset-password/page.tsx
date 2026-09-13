"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { logo } from "@/assets";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useResetPasswordMutation } from "@/redux/api/authApi";
import { Button } from "@/components/ui/Button";
import { Lock, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password is too long"),
    confirm: z
      .string()
      .min(6, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

function ResetPasswordForm() {
  const router = useRouter();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const searchParams = useSearchParams();
  const resetToken = searchParams.get("token") || "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirm: "",
    },
  });

  const onSubmit = async (data: FieldValues) => {
    if (!resetToken) {
      toast.error("Reset token is missing. Please initiate forgot password first.");
      router.push("/forget-password");
      return;
    }

    const toastId = toast.loading("Updating your password...");

    try {
      const payload = {
        resetToken,
        newPassword: data.password,
      };

      const res = await resetPassword(payload).unwrap();
      toast.success(res?.message || "Password updated successfully! Please login.", {
        id: toastId,
      });
      router.push("/login");
    } catch (err: any) {
      console.log("RESET PASSWORD ERROR:", err);
      toast.error(err?.data?.message || err?.error || "Failed to reset password.", {
        id: toastId,
      });
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
            <Lock className="h-5 w-5" />
          </div>
          <span className="text-2xl font-black tracking-tight">Set New Password</span>
        </div>

        <div className="relative z-10 my-auto max-w-md space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-amber-400 text-xs font-semibold">
            <ShieldCheck className="h-3.5 w-3.5" />
            Zero-knowledge Cryptographic Hashing
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
            Protect your account with a strong password.
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            Create a unique password with at least 6 characters to keep your data and purchases secure.
          </p>
        </div>

        <div className="relative z-10 text-xs text-slate-400 flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} Shofy Inc. All rights reserved.</span>
          <Link href="/login" className="hover:text-white transition flex items-center gap-1">
            Back to Sign In <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex items-center justify-center px-6 py-12 bg-slate-50/50">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex flex-col items-center text-center">
            <Link href="/" className="mb-4 inline-block transition hover:opacity-80">
              <Image src={logo} alt="logo" className="h-10 w-auto object-contain" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Create New Password
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Choose a secure password for your account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                New Password
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
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className={`mt-1.5 w-full rounded-xl border px-4 py-3 text-sm outline-none transition bg-slate-50/50 focus:bg-white
                  ${errors.confirm ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-slate-200 focus:border-black focus:ring-1 focus:ring-black"}
                `}
                {...register("confirm")}
              />
              {errors.confirm && (
                <p className="mt-1 text-xs text-red-600 font-medium">
                  {errors.confirm.message as string}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full rounded-xl py-3 bg-black hover:bg-slate-800 text-white font-semibold transition disabled:opacity-60 shadow-lg shadow-black/10 mt-2"
            >
              {isSubmitting || isLoading ? "Updating Password..." : "Reset Password"}
            </Button>

            <p className="text-center text-sm text-slate-500 mt-6">
              Remember your password?{" "}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="h-8 w-8 rounded-full border-4 border-slate-900 border-t-transparent animate-spin" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
