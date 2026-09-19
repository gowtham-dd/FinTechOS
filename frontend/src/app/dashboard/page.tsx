"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/assets");
  }, [router]);

  return (
    <div className="min-h-screen bg-pixel-pattern flex items-center justify-center font-mono text-xs">
      Redirecting to Assets & Indicators...
    </div>
  );
}
