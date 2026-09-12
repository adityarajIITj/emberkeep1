"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          variant === "default" &&
            "bg-[#ff8c42] text-[#13131f] hover:bg-[#ff8c42]/90 font-semibold shadow-md",
          variant === "outline" &&
            "border border-[#2e2e45] bg-transparent hover:bg-[#1e1e2e] text-[#f5f1e8]",
          variant === "ghost" && "hover:bg-[#1e1e2e] text-[#9a97ab] hover:text-[#f5f1e8]",
          size === "default" && "h-10 px-4 py-2 text-sm",
          size === "sm" && "h-8 rounded-lg px-3 text-xs",
          size === "lg" && "h-12 rounded-xl px-8 text-base",
          size === "icon" && "h-10 w-10",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export const EyeCatchingButton_v1 = ({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <div className="relative inline-block overflow-hidden rounded-xl bg-[#13131f] shadow-lg border border-[#ff8c42]/40 group p-[2px]">
      {/* Radiant Rotating Conic Gradient Beam */}
      <span className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite_reverse] bg-[conic-gradient(from_90deg_at_50%_50%,#ffd166_0%,#ff8c42_15%,transparent_35%)] group-hover:opacity-80 transition-opacity" />
      <button
        {...props}
        className={cn(
          "relative h-11 px-6 rounded-[10px] font-pixel text-xs text-[#13131f] bg-gradient-to-r from-[#ffd166] via-[#ff8c42] to-[#ff5f2e] backdrop-blur-xl flex items-center justify-center gap-2.5 font-bold transition-all hover:brightness-110 active:scale-95 cursor-pointer z-10 shadow-md",
          className
        )}
      >
        {children}
      </button>
    </div>
  );
};
