"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { cn } from "@/lib/utils";

export interface IconCloudProps {
  className?: string;
  images?: string[];
  icons?: React.ReactNode[];
  radius?: number;
  autoRotateSpeed?: number;
}

export function IconCloud({
  className,
  images = [],
  icons = [],
  radius = 150,
  autoRotateSpeed = 0.004,
}: IconCloudProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState<{ rx: number; ry: number }>({
    rx: 0.2,
    ry: 0.3,
  });
  const isDragging = useRef(false);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const velocity = useRef<{ vx: number; vy: number }>({ vx: 0.002, vy: 0.003 });
  const animFrameId = useRef<number | null>(null);

  // Combine images and custom icons into a unified list
  const allItems = useMemo(() => {
    const list: Array<{ type: "image" | "icon"; content: React.ReactNode | string }> = [];
    images.forEach((img) => list.push({ type: "image", content: img }));
    icons.forEach((ic) => list.push({ type: "icon", content: ic }));
    return list;
  }, [images, icons]);

  // Compute 3D Fibonacci sphere positions
  const basePoints = useMemo(() => {
    const count = allItems.length;
    if (count === 0) return [];
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle ~2.399 rad

    return allItems.map((_, i) => {
      const y = 1 - (i / (count - 1 || 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      return { x: x * radius, y: y * radius, z: z * radius };
    });
  }, [allItems, radius]);

  // Handle continuous rotation animation + inertia
  useEffect(() => {
    const update = () => {
      if (!isDragging.current) {
        setRotation((prev) => ({
          rx: prev.rx + velocity.current.vx,
          ry: prev.ry + velocity.current.vy,
        }));
        // Gentle friction towards default auto-spin
        velocity.current.vx = velocity.current.vx * 0.96 + autoRotateSpeed * 0.04;
        velocity.current.vy = velocity.current.vy * 0.96 + autoRotateSpeed * 0.04;
      }
      animFrameId.current = requestAnimationFrame(update);
    };

    animFrameId.current = requestAnimationFrame(update);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [autoRotateSpeed]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    const speedFactor = 0.008;
    velocity.current = {
      vx: -dy * speedFactor,
      vy: dx * speedFactor,
    };

    setRotation((prev) => ({
      rx: prev.rx - dy * speedFactor,
      ry: prev.ry + dx * speedFactor,
    }));
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDragging.current = true;
      lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - lastMousePos.current.x;
    const dy = e.touches[0].clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

    const speedFactor = 0.008;
    setRotation((prev) => ({
      rx: prev.rx - dy * speedFactor,
      ry: prev.ry + dx * speedFactor,
    }));
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  // Transform 3D coordinates using current rotation matrices
  const cosX = Math.cos(rotation.rx);
  const sinX = Math.sin(rotation.rx);
  const cosY = Math.cos(rotation.ry);
  const sinY = Math.sin(rotation.ry);

  const projectedItems = basePoints.map((point, index) => {
    // Rotate around Y axis
    const x1 = point.x * cosY - point.z * sinY;
    const z1 = point.z * cosY + point.x * sinY;

    // Rotate around X axis
    const y2 = point.y * cosX - z1 * sinX;
    const z2 = z1 * cosX + point.y * sinX;

    // Perspective projection
    const fov = 350;
    const scale = (fov / (fov + z2)) * 1.0;
    const alpha = Math.max(0.2, Math.min(1, ((z2 + radius) / (2 * radius)) * 0.8 + 0.2));

    return {
      index,
      item: allItems[index],
      x: x1,
      y: y2,
      z: z2,
      scale,
      alpha,
    };
  });

  // Sort by Z index so items further back render behind
  projectedItems.sort((a, b) => a.z - b.z);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={cn(
        "relative flex items-center justify-center select-none cursor-grab active:cursor-grabbing",
        className
      )}
      style={{
        width: `${radius * 2.2}px`,
        height: `${radius * 2.2}px`,
      }}
    >
      {projectedItems.map(({ index, item, x, y, z, scale, alpha }) => (
        <div
          key={index}
          className="absolute flex items-center justify-center transform-gpu transition-transform duration-75"
          style={{
            transform: `translate3d(${x}px, ${y}px, 0px) scale(${scale})`,
            opacity: alpha,
            zIndex: Math.floor(z + radius),
          }}
        >
          <div className="p-2 rounded-2xl bg-[#1e1e2e]/90 backdrop-blur-md border border-[#ff8c42]/30 shadow-[0_0_15px_rgba(255,140,66,0.2)] hover:border-[#ffd166] hover:scale-115 transition-all flex items-center justify-center">
            {item.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.content as string}
                alt="Cloud Icon"
                className="w-6 h-6 object-contain pointer-events-none filter drop-shadow"
                loading="lazy"
              />
            ) : (
              <div className="pointer-events-none flex items-center justify-center">
                {item.content}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default IconCloud;
