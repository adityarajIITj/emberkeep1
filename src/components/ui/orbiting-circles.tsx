"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface OrbitingCirclesProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
  reverse?: boolean;
  duration?: number;
  delay?: number;
  radius?: number;
  path?: boolean;
  iconSize?: number;
  speed?: number;
}

export function OrbitingCircles({
  className,
  children,
  reverse,
  duration = 20,
  delay = 10,
  radius = 160,
  path = true,
  iconSize = 40,
  speed = 1,
  ...props
}: OrbitingCirclesProps) {
  const calculatedDuration = duration / speed;
  return (
    <>
      {path && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          className="pointer-events-none absolute inset-0 size-full stroke-[#ff8c42]/20 stroke-1"
        >
          <circle
            className="stroke-dasharray-4-4"
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
          />
        </svg>
      )}

      <div
        style={
          {
            "--duration": `${calculatedDuration}s`,
            "--radius": `${radius}px`,
            "--delay": `-${delay}s`,
            "--icon-size": `${iconSize}px`,
          } as React.CSSProperties
        }
        className={cn(
          "absolute top-[calc(50%-var(--icon-size)/2)] left-[calc(50%-var(--icon-size)/2)] flex size-[var(--icon-size)] transform-gpu animate-orbit items-center justify-center rounded-full bg-[#1e1e2e] border border-[#ff8c42]/40 shadow-[0_0_15px_rgba(255,140,66,0.25)] text-[#f5f1e8]",
          { "[animation-direction:reverse]": reverse },
          className
        )}
        {...props}
      >
        {children}
      </div>
    </>
  );
}

export default OrbitingCircles;
