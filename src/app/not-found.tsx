"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { Compass, Flame, ArrowLeft, Shield, Sparkles } from "lucide-react";
import Screensaver from "@/components/fancy/blocks/screensaver";
import { BorderBeam } from "@/components/effects/BorderBeam";

export default function NotFound() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#0d0d17] text-[#f5f1e8] flex flex-col items-center justify-center p-6 text-center scanlines relative overflow-hidden"
    >
      {/* Floating DVD Screensaver Bouncing Relics in Background */}
      <Screensaver
        speed={1.4}
        startPosition={{ x: 80, y: 120 }}
        startAngle={35}
        containerRef={containerRef}
        className="opacity-35 hover:opacity-100 transition-opacity pointer-events-none"
      >
        <div className="p-3 rounded-2xl bg-[#1e1e2e] border border-[#ff8c42]/50 shadow-[0_0_20px_rgba(255,140,66,0.3)]">
          <Flame className="w-8 h-8 text-[#ff8c42] animate-bounce" />
        </div>
      </Screensaver>

      <Screensaver
        speed={1.0}
        startPosition={{ x: 280, y: 300 }}
        startAngle={140}
        containerRef={containerRef}
        className="opacity-25 hover:opacity-80 transition-opacity pointer-events-none"
      >
        <div className="p-3 rounded-2xl bg-[#1e1e2e] border border-[#ffd166]/50 shadow-[0_0_20px_rgba(255,209,102,0.3)]">
          <Sparkles className="w-7 h-7 text-[#ffd166] animate-spin" />
        </div>
      </Screensaver>

      {/* Main 404 Glass Card */}
      <div className="max-w-md w-full relative z-10 notch-card p-8 rounded-2xl bg-[#1e1e2e]/85 backdrop-blur-2xl border-2 border-[#ff8c42]/40 space-y-6 shadow-[0_15px_50px_rgba(0,0,0,0.6)]">
        <BorderBeam size={220} duration={7} colorFrom="#ff8c42" colorTo="#ffd166" />

        <div className="w-16 h-16 rounded-2xl bg-[#13131f] border border-[#ff8c42]/40 flex items-center justify-center mx-auto text-[#ff8c42] shadow-[0_0_25px_rgba(255,140,66,0.3)]">
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
          className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-[#ffd166] via-[#ff8c42] to-[#ff5f2e] text-[#13131f] font-pixel text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to The Keep</span>
        </Link>
      </div>
    </div>
  );
}
