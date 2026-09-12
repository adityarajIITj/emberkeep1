"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";

interface DragElementsProps {
  children: React.ReactNode;
  className?: string;
  dragMomentum?: boolean;
}

export default function DragElements({
  children,
  className = "",
  dragMomentum = false,
}: DragElementsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {React.Children.map(children, (child, idx) => (
        <motion.div
          key={idx}
          drag
          dragConstraints={containerRef}
          dragMomentum={dragMomentum}
          whileDrag={{ scale: 1.08, zIndex: 50, cursor: "grabbing" }}
          whileHover={{ scale: 1.03, cursor: "grab" }}
          className="absolute touch-none select-none"
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}
