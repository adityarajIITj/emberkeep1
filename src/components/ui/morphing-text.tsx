"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface MorphingTextProps {
  className?: string;
  texts: string[];
  interval?: number;
}

export function MorphingText({
  className,
  texts,
  interval = 3000,
}: MorphingTextProps) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (texts.length <= 1) return;

    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        setIsAnimating(false);
      }, 400);
    }, interval);

    return () => clearInterval(timer);
  }, [texts.length, interval]);

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center font-pixel text-center transition-all duration-500",
        className
      )}
    >
      <span
        className={cn(
          "inline-block transition-all duration-300 ease-out transform",
          isAnimating
            ? "opacity-0 blur-[2px] translate-y-1.5 scale-98"
            : "opacity-100 blur-0 translate-y-0 scale-100"
        )}
      >
        {texts[currentTextIndex]}
      </span>
    </div>
  );
}

export default MorphingText;
