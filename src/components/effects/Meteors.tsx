"use client";

import React, { useEffect, useState } from "react";

interface MeteorsProps {
  number?: number;
  className?: string;
}

export function Meteors({ number = 20, className = "" }: MeteorsProps) {
  const [meteorStyles, setMeteorStyles] = useState<React.CSSProperties[]>([]);

  useEffect(() => {
    const styles = [...new Array(number)].map(() => ({
      top: `${Math.floor(Math.random() * 100)}%`,
      left: `${Math.floor(Math.random() * 100)}%`,
      animationDelay: `${Math.random() * 1 + 0.2}s`,
      animationDuration: `${Math.floor(Math.random() * 8 + 2)}s`,
    }));
    setMeteorStyles(styles);
  }, [number]);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {meteorStyles.map((style, idx) => (
        <span
          key={idx}
          className="pointer-events-none absolute left-1/2 top-1/2 h-0.5 w-0.5 rotate-[215deg] animate-meteor rounded-[9999px] bg-[#ffd166] shadow-[0_0_0_1px_#ffffff10]"
          style={style}
        >
          {/* Meteor Tail */}
          <div className="pointer-events-none absolute top-1/2 -z-10 h-[1px] w-[50px] -translate-y-1/2 bg-gradient-to-r from-[#ffd166] to-transparent" />
        </span>
      ))}
    </div>
  );
}
