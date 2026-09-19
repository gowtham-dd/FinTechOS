"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DeployRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/audit");
  }, [router]);

  return (
    <div className="min-h-screen bg-pixel-pattern flex items-center justify-center font-mono text-xs">
      Redirecting to Audit Center...
    </div>
  );
}
