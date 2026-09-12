import React from "react";
import Link from "next/link";
import { Compass, Flame, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#13131f] text-[#f5f1e8] flex flex-col items-center justify-center p-6 text-center scanlines">
      <div className="max-w-md w-full notch-card p-8 rounded-2xl bg-[#1e1e2e] border-2 border-[#2e2e45] space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-[#13131f] border border-[#ff8c42]/40 flex items-center justify-center mx-auto text-[#ff8c42] shadow-[0_0_20px_rgba(255,140,66,0.25)]">
          <Compass className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <div className="text-xs font-pixel text-[#ffd166]">ERROR 404</div>
          <h1 className="font-pixel text-lg text-[#f5f1e8]">
            THIS ROAD LEADS NOWHERE
          </h1>
          <p className="text-xs text-[#9a97ab] leading-relaxed">
            You have ventured beyond the torchlit borders of the realm. Turn back before your Ember gutters in the wilderness.
          </p>
        </div>

        <Link
          href="/keep"
          className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-[#ff8c42] to-[#ff5f2e] text-[#13131f] font-pixel text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to The Keep</span>
        </Link>
      </div>
    </div>
  );
}
