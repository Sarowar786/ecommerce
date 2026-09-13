"use client";

import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { logo } from "@/assets";
import {
  useForgotPasswordMutation,
  useVerifyResetOtpMutation,
} from "@/redux/api/authApi";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  KeyRound,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

type ForgotFormValues = {
  email: string;
  otp?: string;
};

const emailOnlySchema = z.object({
  email: z
    .string()
    .trim()
    .nonempty("Email is required")
    .email("Invalid email address"),
});

const emailOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .nonempty("Email is required")
    .email("Invalid email address"),
  otp: z
    .string()
    .trim()
    .nonempty("OTP is required")
    .length(6, "OTP must be 6 digits"),
});

export default function ForgetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"SEND" | "VERIFY">("SEND");
  const schema = useMemo(
    () => (step === "SEND" ? emailOnlySchema : emailOtpSchema),
    [step],
  );

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      otp: "",
    },
    mode: "onTouched",
  });

  const [forgotPassword, { isLoading: isSending }] =
    useForgotPasswordMutation();
  const [verifyResetOtp, { isLoading: isVerifying }] =
    useVerifyResetOtpMutation();

  const onSubmit = async (data: ForgotFormValues) => {
    try {
      if (step === "SEND") {
        const res = await forgotPassword({
          email: data.email.trim().toLowerCase(),
        }).unwrap();
        toast.success(res?.message || "Password reset OTP sent to your email!");
        setStep("VERIFY");
        return;
      }

      const res = await verifyResetOtp({
        email: data.email.trim().toLowerCase(),
        otp: (data.otp || "").trim(),
      }).unwrap();

      toast.success("OTP verified! Please set your new password.");

      const resetToken = res?.data?.resetToken;
      if (resetToken) {
        router.push(`/reset-password?token=${encodeURIComponent(resetToken)}`);
      } else {
        router.push("/reset-password");
      }
    } catch (err: any) {
      console.log("FORGOT/VERIFY ERROR:", err);
      toast.error(
        err?.data?.message || err?.error || "Invalid OTP code or request.",
      );
    }
  };

  const loading = isSubmitting || isSending || isVerifying;

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* Left: Branding */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-amber-500/30">
            <KeyRound className="h-5 w-5" />
          </div>
          <span className="text-2xl font-black tracking-tight">
            Account Recovery
          </span>
        </div>

        <div className="relative z-10 my-auto max-w-md space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-amber-400 text-xs font-semibold">
            <ShieldCheck className="h-3.5 w-3.5" />
            Guaranteed Secure Reset Process
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
            Forgot your password? We&apos;ve got your back.
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            Follow the quick 2-step verification to securely recover your
            account credentials.
          </p>
        </div>

        <div className="relative z-10 text-xs text-slate-400 flex items-center justify-between">
          <span>
            &copy; {new Date().getFullYear()} Shofy Inc. All rights reserved.
          </span>
          <Link
            href="/login"
            className="hover:text-white transition flex items-center gap-1"
          >
            Back to Sign In <ArrowRight className="h-3 w-3" />
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
              {step === "SEND" ? "Forgot Password?" : "Enter Recovery OTP"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {step === "SEND"
                ? "Enter your email address to receive a verification code"
                : "Enter the 6-digit OTP code sent to your email"}
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-8 space-y-4"
            noValidate
          >
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
                disabled={step === "VERIFY"}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 font-medium">
                  {errors.email.message as string}
                </p>
              )}
            </div>

            {step === "VERIFY" && (
              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  className={`mt-1.5 w-full rounded-xl border px-4 py-3 text-lg font-bold text-center tracking-[0.3em] outline-none transition bg-slate-50/50 focus:bg-white
                    ${errors.otp ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-slate-200 focus:border-black focus:ring-1 focus:ring-black"}
                  `}
                  {...register("otp")}
                  autoFocus
                />
                {errors.otp && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {errors.otp.message as string}
                  </p>
                )}

                <div className="flex justify-between items-center mt-2">
                  <button
                    type="button"
                    className="text-xs text-slate-500 hover:text-slate-900 transition flex items-center gap-1"
                    onClick={() => setStep("SEND")}
                  >
                    <ArrowLeft className="h-3 w-3" /> Change email
                  </button>

                  <button
                    type="button"
                    className="text-xs text-amber-600 hover:underline font-semibold"
                    onClick={async () => {
                      try {
                        const email = getValues("email");
                        const res = await forgotPassword({
                          email: email.trim().toLowerCase(),
                        }).unwrap();
                        toast.success(res?.message || "New OTP code sent!");
                      } catch (err: any) {
                        toast.error(err?.data?.message || "Failed to resend");
                      }
                    }}
                  >
                    Resend code
                  </button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3 bg-black hover:bg-slate-800 text-white font-semibold transition disabled:opacity-60 shadow-lg shadow-black/10 mt-2"
            >
              {step === "SEND"
                ? isSending
                  ? "Sending Code..."
                  : "Send Recovery Code"
                : isVerifying
                  ? "Verifying..."
                  : "Verify & Reset Password"}
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
