"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface GlyphMatrixProps extends React.HTMLAttributes<HTMLDivElement> {
  glyphs?: string;
  cellSize?: number;
  mutationRate?: number;
  interval?: number;
  fadeBottom?: number;
  color?: string;
  className?: string;
}

export function GlyphMatrix({
  glyphs = "01·•+*/\\<>=⚔✦✧ᚠᚱᛉᛊᛏᛒᛖᛗᛚ",
  cellSize = 14,
  mutationRate = 0.04,
  interval = 90,
  fadeBottom = 0.6,
  color = "#ff8c42",
  className,
  ...props
}: GlyphMatrixProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: Math.floor(entry.contentRect.width),
          height: Math.floor(entry.contentRect.height),
        });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;
    ctx.scale(dpr, dpr);

    const cols = Math.ceil(dimensions.width / cellSize);
    const rows = Math.ceil(dimensions.height / cellSize);
    const totalCells = cols * rows;

    const grid: string[] = [];
    const glyphList = Array.from(glyphs);

    for (let i = 0; i < totalCells; i++) {
      grid.push(glyphList[Math.floor(Math.random() * glyphList.length)]);
    }

    ctx.font = `${cellSize - 3}px "Press Start 2P", monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    let timer: NodeJS.Timeout;

    const render = () => {
      // Mutate a percentage of cells
      const mutations = Math.floor(totalCells * mutationRate);
      for (let m = 0; m < mutations; m++) {
        const idx = Math.floor(Math.random() * totalCells);
        grid[idx] = glyphList[Math.floor(Math.random() * glyphList.length)];
      }

      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
          const idx = col * rows + row;
          const char = grid[idx];
          const x = col * cellSize + cellSize / 2;
          const y = row * cellSize + cellSize / 2;

          // Vertical gradient fade
          const rowFraction = row / rows;
          let opacity = 0.4;
          if (rowFraction > fadeBottom) {
            opacity = Math.max(0, 0.4 * (1 - (rowFraction - fadeBottom) / (1 - fadeBottom)));
          }

          ctx.fillStyle = color;
          ctx.globalAlpha = opacity;
          ctx.fillText(char, x, y);
        }
      }

      timer = setTimeout(render, interval);
    };

    render();

    return () => {
      clearTimeout(timer);
    };
  }, [dimensions, glyphs, cellSize, mutationRate, interval, fadeBottom, color]);

  return (
    <div
      ref={containerRef}
      className={cn("size-full overflow-hidden pointer-events-none relative", className)}
      {...props}
    >
      <canvas ref={canvasRef} className="block pointer-events-none" />
    </div>
  );
}

export default GlyphMatrix;
