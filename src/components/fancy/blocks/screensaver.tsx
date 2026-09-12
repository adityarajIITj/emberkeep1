"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScreensaverProps {
  children: React.ReactNode;
  speed?: number;
  startPosition?: { x: number; y: number };
  startAngle?: number;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

export default function Screensaver({
  children,
  speed = 1.5,
  startPosition = { x: 50, y: 50 },
  startAngle = 45,
  containerRef,
  className = "",
}: ScreensaverProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(startPosition);

  useEffect(() => {
    let animId: number;
    let posX = startPosition.x;
    let posY = startPosition.y;

    const rad = (startAngle * Math.PI) / 180;
    let vx = Math.cos(rad) * speed;
    let vy = Math.sin(rad) * speed;

    const update = () => {
      const container = containerRef?.current || elementRef.current?.parentElement;
      const element = elementRef.current;

      if (container && element) {
        const cWidth = container.clientWidth;
        const cHeight = container.clientHeight;
        const eWidth = element.clientWidth;
        const eHeight = element.clientHeight;

        posX += vx;
        posY += vy;

        if (posX + eWidth >= cWidth) {
          posX = cWidth - eWidth;
          vx = -Math.abs(vx);
        } else if (posX <= 0) {
          posX = 0;
          vx = Math.abs(vx);
        }

        if (posY + eHeight >= cHeight) {
          posY = cHeight - eHeight;
          vy = -Math.abs(vy);
        } else if (posY <= 0) {
          posY = 0;
          vy = Math.abs(vy);
        }

        setPosition({ x: posX, y: posY });
      }

      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [speed, startAngle, startPosition.x, startPosition.y, containerRef]);

  return (
    <div
      ref={elementRef}
      style={{
        position: "absolute",
        left: `${position.x}px`,
        top: `${position.y}px`,
        willChange: "transform, left, top",
      }}
      className={`select-none pointer-events-auto ${className}`}
    >
      {children}
    </div>
  );
}
