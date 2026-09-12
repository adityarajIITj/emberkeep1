"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, TargetAndTransition, Transition } from "framer-motion";

interface WordListSwapProps {
  texts: string[];
  mainClassName?: string;
  splitLevelClassName?: string;
  rotationInterval?: number;
  transition?: Transition;
  staggerDuration?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initial?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  animate?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exit?: any;
  staggerFrom?: "first" | "last";
}

export default function WordListSwap({
  texts,
  mainClassName = "text-white px-2 py-1 bg-[#ff8c42] rounded-lg inline-flex items-center",
  splitLevelClassName = "overflow-hidden",
  rotationInterval = 2200,
  transition = { type: "spring", damping: 25, stiffness: 350 },
  initial = { y: "100%", opacity: 0 },
  animate = { y: 0, opacity: 1 },
  exit = { y: "-120%", opacity: 0 },
}: WordListSwapProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (texts.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, rotationInterval);
    return () => clearInterval(timer);
  }, [texts.length, rotationInterval]);

  return (
    <span className={`inline-flex relative overflow-hidden ${mainClassName}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={texts[index]}
          initial={initial}
          animate={animate}
          exit={exit}
          transition={transition}
          className={`inline-block whitespace-nowrap font-pixel text-inherit ${splitLevelClassName}`}
        >
          {texts[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
