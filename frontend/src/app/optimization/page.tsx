"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OptimizationRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/robustness");
  }, [router]);

  return (
    <div className="min-h-screen bg-pixel-pattern flex items-center justify-center font-mono text-xs">
      Redirecting to Robustness & Regimes...
    </div>
  );
}
