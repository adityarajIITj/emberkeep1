"use client";

import React, { useId } from "react";
import { cn } from "@/lib/utils";

interface AnimatedPathTextProps {
  path: string;
  text: string;
  duration?: number;
  viewBox?: string;
  svgClassName?: string;
  textClassName?: string;
  textAnchor?: "start" | "middle" | "end";
  reverse?: boolean;
}

export function AnimatedPathText({
  path,
  text,
  duration = 20,
  viewBox = "0 0 300 300",
  svgClassName,
  textClassName,
  textAnchor = "start",
  reverse = false,
}: AnimatedPathTextProps) {
  const id = useId();
  const pathId = `path-${id.replace(/:/g, "-")}`;

  return (
    <svg
      viewBox={viewBox}
      className={cn("pointer-events-none select-none", svgClassName)}
    >
      <defs>
        <path id={pathId} d={path} fill="none" />
      </defs>

      <text
        className={cn(
          "font-pixel text-[11px] uppercase tracking-widest fill-[#ff8c42]",
          textClassName
        )}
      >
        <textPath
          href={`#${pathId}`}
          startOffset="0%"
          textAnchor={textAnchor}
          spacing="auto"
        >
          {text}
          <animate
            attributeName="startOffset"
            from={reverse ? "100%" : "0%"}
            to={reverse ? "0%" : "100%"}
            dur={`${duration}s`}
            repeatCount="indefinite"
          />
        </textPath>
      </text>
    </svg>
  );
}

export default AnimatedPathText;
