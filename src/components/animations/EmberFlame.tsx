"use client";

import React from "react";
import { Flame, Sparkles } from "lucide-react";

interface EmberFlameProps {
  streak: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function EmberFlame({
  streak,
  size = "md",
  showLabel = true,
}: EmberFlameProps) {
  // Determine flame tier (§4 & §8)
  let tierName = "Flickering Ember";
  let flameColor = "text-[#ff8c42]";
  let glowColor = "rgba(255,140,66,0.4)";
  let containerBorder = "border-[#ff8c42]/40";
  let bgGlow = "from-[#ff8c42]/20 to-[#ff5f2e]/5";
  let pulseSpeed = "animate-pulse";

  if (streak >= 30) {
    tierName = "Eternal Blaze";
    flameColor = "text-[#ffd166]";
    glowColor = "rgba(255,209,102,0.6)";
    containerBorder = "border-[#ffd166]/70 shadow-[0_0_25px_rgba(255,209,102,0.5)]";
    bgGlow = "from-[#ffd166]/30 via-[#ff8c42]/20 to-[#8b5cf6]/20";
    pulseSpeed = "animate-bounce";
  } else if (streak >= 14) {
    tierName = "Roaring Bonfire";
    flameColor = "text-[#ff8c42]";
    glowColor = "rgba(255,140,66,0.6)";
    containerBorder = "border-[#ff8c42]/60 shadow-[0_0_20px_rgba(255,140,66,0.4)]";
    bgGlow = "from-[#ff8c42]/25 to-[#ff5f2e]/15";
  } else if (streak >= 7) {
    tierName = "Torch Fire";
    flameColor = "text-[#ff8c42]";
    glowColor = "rgba(255,140,66,0.4)";
    containerBorder = "border-[#ff8c42]/50 shadow-[0_0_15px_rgba(255,140,66,0.3)]";
    bgGlow = "from-[#ff8c42]/20 to-[#ff5f2e]/10";
  }

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-10 h-10",
  };

  const containerPaddings = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-4",
  };

  return (
    <div className="flex items-center gap-2">
      <div
        title={`${tierName} (${streak} Day Streak)`}
        className={`relative rounded-xl bg-gradient-to-br ${bgGlow} ${containerPaddings[size]} border ${containerBorder} flex items-center justify-center transition-all duration-300 group`}
      >
        {/* Ambient background bloom */}
        <div
          className="absolute inset-0 rounded-xl blur-sm opacity-60 pointer-events-none"
          style={{ backgroundColor: glowColor }}
        />

        {/* Flame Icon with Tiered Pulsing */}
        <Flame
          className={`relative z-10 ${iconSizes[size]} ${flameColor} ${pulseSpeed} filter drop-shadow-[0_0_8px_${glowColor}]`}
        />

        {streak >= 14 && (
          <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-[#ffd166] animate-spin" />
        )}
      </div>

      {showLabel && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="font-pixel text-xs sm:text-sm text-[#f5f1e8]">
              {streak} {streak === 1 ? "DAY" : "DAYS"}
            </span>
          </div>
          <span className="text-[10px] text-[#ff8c42] font-semibold tracking-wide">
            {tierName}
          </span>
        </div>
      )}
    </div>
  );
}
