"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface DockProps {
  className?: string;
  children: React.ReactNode;
  direction?: "top" | "middle" | "bottom";
}

export function Dock({ className, children }: DockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto flex h-16 items-end gap-3 rounded-2xl border-2 border-[#ff8c42]/30 bg-[#1e1e2e]/85 backdrop-blur-xl px-4 pb-2.5 shadow-2xl z-40",
        className
      )}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<{ mouseX: typeof mouseX }>, { mouseX });
        }
        return child;
      })}
    </motion.div>
  );
}

interface DockIconProps {
  className?: string;
  children: React.ReactNode;
  mouseX?: ReturnType<typeof useMotionValue<number>>;
  label?: string;
}

export function DockIcon({ className, children, mouseX, label }: DockIconProps) {
  const ref = useRef<HTMLDivElement>(null);

  const defaultMouseX = useMotionValue(Infinity);
  const activeMouseX = mouseX || defaultMouseX;

  const distance = useTransform(activeMouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-150, 0, 150], [42, 64, 42]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <div className="relative flex flex-col items-center group/dock">
      {label && (
        <div className="absolute -top-8 whitespace-nowrap px-2.5 py-1 rounded-lg bg-[#1e1e2e] border border-[#ff8c42]/60 text-[10px] font-pixel text-[#ffd166] shadow-[0_4px_16px_rgba(0,0,0,0.9)] pointer-events-none opacity-0 group-hover/dock:opacity-100 group-hover/dock:-translate-y-1.5 transition-all duration-200 z-50">
          {label}
        </div>
      )}
      <motion.div
        ref={ref}
        style={{ width, height: width }}
        className={cn(
          "flex aspect-square cursor-pointer items-center justify-center rounded-xl bg-[#13131f] border border-[#2e2e45] text-[#f5f1e8] hover:border-[#ff8c42] hover:shadow-[0_0_15px_rgba(255,140,66,0.3)] transition-colors",
          className
        )}
      >
        {children}
      </motion.div>
    </div>
  );
}
