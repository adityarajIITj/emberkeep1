"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface FlickeringGridProps extends React.HTMLAttributes<HTMLDivElement> {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  color?: string;
  width?: number;
  height?: number;
  className?: string;
  maxOpacity?: number;
}

export function FlickeringGrid({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.15,
  color = "#ff8c42",
  width,
  height,
  className,
  maxOpacity = 0.35,
  ...props
}: FlickeringGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const memoizedColor = useMemo(() => {
    const toRGBA = (colorStr: string) => {
      if (typeof window === "undefined") {
        return `rgba(255, 140, 66,`;
      }
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext("2d");
      if (!ctx) return "rgba(255, 140, 66,";
      ctx.fillStyle = colorStr;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data);
      return `rgba(${r}, ${g}, ${b},`;
    };
    return toRGBA(color);
  }, [color]);

  const setupCanvas = useCallback(
    (canvas: HTMLCanvasElement, widthVal: number, heightVal: number) => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = widthVal * dpr;
      canvas.height = heightVal * dpr;
      canvas.style.width = `${widthVal}px`;
      canvas.style.height = `${heightVal}px`;
      const cols = Math.floor(widthVal / (squareSize + gridGap));
      const rows = Math.floor(heightVal / (squareSize + gridGap));

      const squares = new Float32Array(cols * rows);
      for (let i = 0; i < squares.length; i++) {
        squares[i] = Math.random() * maxOpacity;
      }

      return { cols, rows, squares, dpr };
    },
    [squareSize, gridGap, maxOpacity]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setCanvasSize({
          width: width || entry.contentRect.width,
          height: height || entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0 }
    );

    intersectionObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [width, height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasSize.width === 0 || canvasSize.height === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const { cols, rows, squares, dpr } = setupCanvas(
      canvas,
      canvasSize.width,
      canvasSize.height
    );

    let lastTime = 0;
    const interval = 1000 / 30; // 30 FPS for optimal battery and smooth flicker

    const animate = (time: number) => {
      if (!isInView) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      const deltaTime = time - lastTime;

      if (deltaTime >= interval) {
        lastTime = time - (deltaTime % interval);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            const index = i * rows + j;
            if (Math.random() < flickerChance) {
              squares[index] = Math.random() * maxOpacity;
            }

            const opacity = squares[index];
            if (opacity > 0.01) {
              ctx.fillStyle = `${memoizedColor} ${opacity})`;
              ctx.fillRect(
                i * (squareSize + gridGap) * dpr,
                j * (squareSize + gridGap) * dpr,
                squareSize * dpr,
                squareSize * dpr
              );
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [memoizedColor, squareSize, gridGap, flickerChance, maxOpacity, canvasSize, isInView, setupCanvas]);

  return (
    <div
      ref={containerRef}
      className={cn("size-full overflow-hidden pointer-events-none", className)}
      {...props}
    >
      <canvas ref={canvasRef} className="pointer-events-none block" />
    </div>
  );
}

export default FlickeringGrid;
