"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface VariableFontCursorProximityProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  children: string;
  fromFontVariationSettings?: string;
  toFontVariationSettings?: string;
  radius?: number;
  falloff?: "linear" | "exponential" | "gaussian";
  containerRef?: React.RefObject<HTMLElement | null>;
  className?: string;
}

// Parses string like "'wght' 400, 'slnt' 0" into map { wght: 400, slnt: 0 }
function parseVariationSettings(settingsStr: string): Record<string, number> {
  const result: Record<string, number> = {};
  if (!settingsStr) return result;

  const pairs = settingsStr.split(",");
  for (const pair of pairs) {
    const match = pair.trim().match(/['"]?([a-zA-Z0-9_]{4})['"]?\s+([-\d.]+)/);
    if (match) {
      result[match[1]] = parseFloat(match[2]);
    }
  }
  return result;
}

export function VariableFontCursorProximity({
  children,
  fromFontVariationSettings = "'wght' 400, 'slnt' 0",
  toFontVariationSettings = "'wght' 900, 'slnt' -10",
  radius = 200,
  falloff = "linear",
  containerRef,
  className,
  ...props
}: VariableFontCursorProximityProps) {
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [weights, setWeights] = useState<number[]>([]);

  const fromParsed = useMemo(
    () => parseVariationSettings(fromFontVariationSettings),
    [fromFontVariationSettings]
  );
  const toParsed = useMemo(
    () => parseVariationSettings(toFontVariationSettings),
    [toFontVariationSettings]
  );

  const letters = useMemo(() => Array.from(children), [children]);

  useEffect(() => {
    letterRefs.current = letterRefs.current.slice(0, letters.length);
  }, [letters]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const newWeights: number[] = [];

      letters.forEach((_, index) => {
        const el = letterRefs.current[index];
        if (!el) {
          newWeights.push(0);
          return;
        }

        const rect = el.getBoundingClientRect();
        const charCenterX = rect.left + rect.width / 2;
        const charCenterY = rect.top + rect.height / 2;

        const distance = Math.hypot(mouseX - charCenterX, mouseY - charCenterY);

        if (distance > radius) {
          newWeights.push(0);
        } else {
          let factor = 1 - distance / radius;
          if (falloff === "exponential") {
            factor = Math.pow(factor, 2);
          } else if (falloff === "gaussian") {
            factor = Math.exp(-Math.pow(distance / (radius / 2), 2));
          }
          newWeights.push(Math.max(0, Math.min(1, factor)));
        }
      });

      setWeights(newWeights);
    };

    const targetEl = containerRef?.current || window;
    targetEl.addEventListener("mousemove", handleMouseMove as EventListener);

    return () => {
      targetEl.removeEventListener("mousemove", handleMouseMove as EventListener);
    };
  }, [letters, radius, falloff, containerRef]);

  const getStyleForLetter = (index: number) => {
    const t = weights[index] || 0;

    // Interpolate font-variation-settings
    const interpolatedPairs: string[] = [];
    for (const key of Object.keys(toParsed)) {
      const fromVal = fromParsed[key] ?? 400;
      const toVal = toParsed[key] ?? 900;
      const currentVal = fromVal + (toVal - fromVal) * t;
      interpolatedPairs.push(`'${key}' ${Math.round(currentVal * 10) / 10}`);
    }

    const fontVariation = interpolatedPairs.join(", ");
    const fromW = fromParsed["wght"] || 400;
    const toW = toParsed["wght"] || 900;
    const currentWeight = Math.round(fromW + (toW - fromW) * t);

    return {
      fontVariationSettings: fontVariation,
      fontWeight: currentWeight,
      display: "inline-block",
      transition: "font-variation-settings 0.05s ease-out, transform 0.05s ease-out",
      transform: t > 0.1 ? `scale(${1 + t * 0.1})` : "scale(1)",
    };
  };

  return (
    <span
      className={cn("inline-flex flex-wrap select-none", className)}
      {...props}
    >
      {letters.map((char, index) => (
        <span
          key={index}
          ref={(el) => {
            letterRefs.current[index] = el;
          }}
          style={getStyleForLetter(index)}
          className="transition-transform duration-75"
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}

export default VariableFontCursorProximity;
