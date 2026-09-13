"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="p-4 bg-red-50 text-red-700 rounded-full mb-4 text-3xl">⚠️</div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong!</h2>
      <p className="text-sm text-slate-600 max-w-md mb-6">
        {error?.message || "An unexpected error occurred. Please try again."}
      </p>
      <Button onClick={() => reset()} className="px-6">
        Try Again
      </Button>
    </div>
  );
}
