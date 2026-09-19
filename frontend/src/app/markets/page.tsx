"use client";
import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function MarketsRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const symbol = searchParams.get("symbol") || "SPX";
    router.replace(`/assets?symbol=${symbol}`);
  }, [searchParams, router]);

  return null;
}

export default function MarketsPage() {
  return (
    <Suspense fallback={null}>
      <MarketsRedirect />
    </Suspense>
  );
}
