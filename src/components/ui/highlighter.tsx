"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface HighlighterProps {
  children: React.ReactNode;
  action?: "highlight" | "underline" | "brush" | "box";
  color?: string;
  className?: string;
}

export function Highlighter({
  children,
  action = "highlight",
  color = "#ff8c42",
  className,
}: HighlighterProps) {
  if (action === "underline") {
    return (
      <span className={cn("relative inline-block font-semibold", className)}>
        <span className="relative z-10">{children}</span>
        <svg
          className="absolute -bottom-1 left-0 w-full h-2 text-current overflow-visible pointer-events-none"
          viewBox="0 0 100 10"
          preserveAspectRatio="none"
        >
          <path
            d="M0 5 Q 25 1, 50 6 T 100 4"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            className="animate-pulse"
          />
        </svg>
      </span>
    );
  }

  if (action === "brush") {
    return (
      <span className={cn("relative inline-block font-semibold mx-1", className)}>
        <span
          className="absolute inset-0 -skew-y-1 -rotate-1 rounded-md opacity-30 blur-[1px] transform transition-transform"
          style={{ backgroundColor: color }}
        />
        <span
          className="absolute inset-0 skew-y-0.5 rounded-sm opacity-25"
          style={{ backgroundColor: color }}
        />
        <span className="relative z-10 px-1 text-[#f5f1e8] font-bold drop-shadow">
          {children}
        </span>
      </span>
    );
  }

  if (action === "box") {
    return (
      <span
        className={cn(
          "relative inline-flex items-center px-2 py-0.5 rounded-lg border font-pixel text-xs tracking-wider",
          className
        )}
        style={{
          borderColor: `${color}80`,
          backgroundColor: `${color}15`,
          color: color,
          boxShadow: `0 0 12px ${color}33`,
        }}
      >
        {children}
      </span>
    );
  }

  return (
    <span className={cn("relative inline-block px-1.5 py-0.5 rounded font-bold", className)}>
      <span
        className="absolute inset-0 -skew-x-3 rounded-md shadow-sm"
        style={{ backgroundColor: color }}
      />
      <span className="relative z-10 text-[#13131f]">{children}</span>
    </span>
  );
}

export default Highlighter;
