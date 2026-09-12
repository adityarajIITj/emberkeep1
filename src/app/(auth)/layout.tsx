"use client";

import Link from "next/link";
import { Flame } from "lucide-react";
import Novatrix from "@/components/ui/novatrix-background";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-[#0d0d17] text-[#f5f1e8] scanlines selection:bg-[#ff8c42]/30 selection:text-[#ffd166]">
      {/* Novatrix WebGL Fluid Silk Wave Background */}
      <div className="absolute inset-0 pointer-events-auto opacity-55 z-0">
        <Novatrix
          color={[0.99, 0.45, 0.18]}
          amplitude={0.3}
          speed={0.8}
          className="w-full h-full"
        />
      </div>

      {/* Ambient center radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-[#ff8c42]/15 via-[#ffd166]/10 to-transparent rounded-full blur-3xl pointer-events-none z-0" />

      {/* Brand Header */}
      <div className="mb-6 text-center z-10">
        <Link href="/" className="inline-flex items-center gap-3 group focus:outline-none">
          <div className="p-2.5 rounded-2xl bg-[#1e1e2e]/90 backdrop-blur-xl border border-[#ff8c42]/50 shadow-[0_0_25px_rgba(255,140,66,0.3)] group-hover:border-[#ffd166] transition-colors">
            <Flame className="w-8 h-8 text-[#ff8c42] animate-pulse" />
          </div>
          <span className="font-pixel text-xl sm:text-2xl text-[#f5f1e8] tracking-widest group-hover:text-[#ffd166] transition-colors">
            EMBERKEEP
          </span>
        </Link>
      </div>

      {/* Auth Card Container */}
      <div className="w-full max-w-md z-10">{children}</div>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-[#9a97ab] z-10">
        <p>Keep your Ember lit. Turn daily tasks into your legend.</p>
      </div>
    </div>
  );
}
