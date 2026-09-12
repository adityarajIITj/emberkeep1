"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PointerProps {
  children?: React.ReactNode;
  className?: string;
}

export function Pointer({ children, className = "" }: PointerProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  if (!pos) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`pointer-events-none fixed z-50 transition-transform duration-75 ${className}`}
          style={{
            left: pos.x,
            top: pos.y,
            transform: "translate(-50%, -50%)",
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
        >
          {children || (
            <div className="w-4 h-4 rounded-full bg-[#ff8c42] shadow-[0_0_15px_#ff8c42] animate-ping" />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
