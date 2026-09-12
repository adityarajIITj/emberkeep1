"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global runtime error caught by boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#13131f] text-[#f5f1e8] flex flex-col items-center justify-center p-6 text-center scanlines">
      <div className="max-w-md w-full notch-card p-8 rounded-2xl bg-[#1e1e2e] border-2 border-[#f87171]/40 space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-[#13131f] border border-[#f87171]/40 flex items-center justify-center mx-auto text-[#f87171] shadow-[0_0_20px_rgba(248,113,113,0.25)]">
          <AlertTriangle className="w-8 h-8 animate-bounce" />
        </div>

        <div className="space-y-2">
          <div className="text-xs font-pixel text-[#f87171]">ANOMALY ENCOUNTERED</div>
          <h1 className="font-pixel text-lg text-[#f5f1e8]">
            THE FLAME FLICKERS
          </h1>
          <p className="text-xs text-[#9a97ab] leading-relaxed">
            An unforeseen disturbance occurred in the guildhall. The ledger remains safe and intact.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 py-3 px-4 rounded-xl bg-[#13131f] border border-[#2e2e45] text-xs text-[#f5f1e8] hover:border-[#ff8c42] flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          <Link
            href="/keep"
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#ff8c42] to-[#ff5f2e] text-[#13131f] font-pixel text-xs font-bold hover:brightness-110 flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <Home className="w-4 h-4" />
            <span>The Keep</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
