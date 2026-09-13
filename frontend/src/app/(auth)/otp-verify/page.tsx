"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  useResendOtpMutation,
  useVerifyOtpMutation,
} from "@/redux/api/authApi";
import { useDispatch } from "react-redux";
import { setRefreshToken, setUser } from "@/redux/features/authSlice";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Mail, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { logo } from "@/assets";

type VerifyForm = {
  otp: string;
};

function VerifyOtpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const dispatch = useDispatch();

  const email = useMemo(() => params.get("email") || "", [params]);

  const [verifyOtp, { isLoading: verifying }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: resending }] = useResendOtpMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyForm>({
    defaultValues: { otp: "" },
  });

  const [cooldown, setCooldown] = useState(30);
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  useEffect(() => {
    if (!email) {
      toast.error("Email missing. Please register first.");
      router.push("/register");
    }
  }, [email, router]);

  const onSubmit = async (data: VerifyForm) => {
    const toastId = toast.loading("Verifying your code...");

    try {
      const res = await verifyOtp({
        email: email.trim().toLowerCase(),
        otp: data.otp.trim(),
      }).unwrap();

      if (res?.success) {
        toast.success(res?.message || "Email verified successfully!", {
          id: toastId,
        });

        const token = res?.data?.accessToken;
        const refresh = res?.data?.refreshToken;
        const user = res?.data?.user;

        if (token) {
          dispatch(setUser({ token, user }));
          if (refresh) {
            dispatch(setRefreshToken({ refresh_token: refresh }));
          }
          if (user?.role === "ADMIN") {
            router.push("/dashboard");
          } else {
            router.push("/");
          }
        } else {
          router.push("/login");
        }
      } else {
        toast.error(res?.message || "OTP verification failed!", {
          id: toastId,
        });
      }
    } catch (error: any) {
      console.log("VERIFY OTP ERROR:", error);
      const msg =
        error?.data?.message || error?.error || "Invalid or expired OTP.";
      toast.error(msg, { id: toastId });
    }
  };

  const handleResend = async () => {
    const toastId = toast.loading("Resending verification code...");

    try {
      const res = await resendOtp({
        email: email.trim().toLowerCase(),
      }).unwrap();

      if (res?.success) {
        toast.success(
          res?.message || "OTP resent successfully to your email!",
          {
            id: toastId,
          },
        );
        setCooldown(60);
      } else {
        toast.error(res?.message || "Resend failed!", { id: toastId });
      }
    } catch (error: any) {
      const msg =
        error?.data?.message || error?.error || "Failed to resend OTP.";
      toast.error(msg, { id: toastId });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 border border-slate-100">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="mb-4 inline-block">
            <Image
              src={logo}
              alt="logo"
              className="h-10 w-auto object-contain"
            />
          </Link>
          <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
            <Mail className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Verify Your Email
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            We sent a 6-digit verification code to
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-0.5 bg-slate-100 px-3 py-1 rounded-full">
            {email}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block text-center mb-2">
              Enter 6-Digit OTP Code
            </label>
            <input
              className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3.5 outline-none focus:border-black focus:ring-2 focus:ring-black/10 tracking-[0.4em] text-2xl font-bold text-center transition bg-slate-50 focus:bg-white"
              placeholder="000000"
              inputMode="numeric"
              maxLength={6}
              autoFocus
              {...register("otp", {
                required: "OTP is required",
                minLength: { value: 6, message: "Code must be 6 digits" },
              })}
            />
            {errors.otp?.message && (
              <p className="text-red-500 text-xs mt-2 text-center font-medium">
                {errors.otp.message}
              </p>
            )}
          </div>

          <Button
            disabled={verifying}
            className="w-full rounded-xl py-3 bg-black hover:bg-slate-800 text-white font-semibold transition disabled:opacity-60 shadow-lg shadow-black/10"
            type="submit"
          >
            {verifying ? "Verifying Code..." : "Verify & Continue"}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between text-sm">
          <Link
            href="/register"
            className="text-slate-500 hover:text-slate-900 font-medium flex items-center gap-1 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Change Email
          </Link>

          <button
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="text-amber-600 hover:text-amber-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition"
            type="button"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${resending ? "animate-spin" : ""}`}
            />
            {cooldown > 0 ? `Resend code (${cooldown}s)` : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-4 border-slate-900 border-t-transparent animate-spin" />
        </div>
      }
    >
      <VerifyOtpForm />
    </Suspense>
  );
}
