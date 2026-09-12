"use client";

import React, { useEffect, useRef } from "react";

interface PixelTrailProps {
  pixelSize?: number;
  fadeDuration?: number;
  pixelClassName?: string;
  className?: string;
}

export default function PixelTrail({
  pixelSize = 24,
  fadeDuration = 600,
  className = "",
}: PixelTrailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    // Map of active glowing pixels: key -> { x, y, timestamp, color }
    const activePixels = new Map<string, { x: number; y: number; time: number; color: string }>();

    const colors = ["#ff8c42", "#ffd166", "#ff5f2e", "#f59e0b", "#8b5cf6"];

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x >= 0 && x <= width && y >= 0 && y <= height) {
        const gridX = Math.floor(x / pixelSize) * pixelSize;
        const gridY = Math.floor(y / pixelSize) * pixelSize;
        const key = `${gridX}_${gridY}`;
        const color = colors[Math.floor(Math.random() * colors.length)];
        activePixels.set(key, { x: gridX, y: gridY, time: performance.now(), color });
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    let animationFrame: number;

    const render = (now: number) => {
      ctx.clearRect(0, 0, width, height);

      // Render glowing pixels
      activePixels.forEach((pixel, key) => {
        const elapsed = now - pixel.time;
        if (elapsed > fadeDuration) {
          activePixels.delete(key);
        } else {
          const alpha = 1 - elapsed / fadeDuration;
          ctx.fillStyle = pixel.color;
          ctx.globalAlpha = alpha * 0.45;
          ctx.fillRect(pixel.x + 1, pixel.y + 1, pixelSize - 2, pixelSize - 2);

          // Subtle inner core
          ctx.fillStyle = "#ffffff";
          ctx.globalAlpha = alpha * 0.25;
          ctx.fillRect(pixel.x + pixelSize / 4, pixel.y + pixelSize / 4, pixelSize / 2, pixelSize / 2);
        }
      });

      ctx.globalAlpha = 1;
      animationFrame = requestAnimationFrame(render);
    };

    animationFrame = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      cancelAnimationFrame(animationFrame);
    };
  }, [pixelSize, fadeDuration]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 z-10 ${className}`}
    />
  );
}
