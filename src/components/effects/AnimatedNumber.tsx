"use client";

import React, { useEffect } from "react";
import { useMotionValue, useSpring, useTransform, motion } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  className?: string;
  suffix?: string;
}

/**
 * 21st.dev style rolling spring odometer counter for Gold and XP.
 */
export function AnimatedNumber({ value, className = "", suffix = "" }: AnimatedNumberProps) {
  const motionValue = useMotionValue(value);
  const spring = useSpring(motionValue, {
    damping: 25,
    stiffness: 120,
  });

  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString()
  );

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  return (
    <span className={className}>
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  );
}
