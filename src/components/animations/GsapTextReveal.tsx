"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

interface GsapTextRevealProps {
  text: string;
  className?: string;
  delay?: number;
}

/**
 * GSAP text reveal splitting into words with staggered slide and glow
 */
export function GsapTextReveal({
  text,
  className = "",
  delay = 0.2,
}: GsapTextRevealProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const words = containerRef.current.querySelectorAll(".reveal-word");
    gsap.fromTo(
      words,
      {
        opacity: 0,
        y: 20,
        filter: "blur(4px)",
      },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.8,
        stagger: 0.1,
        delay,
        ease: "power3.out",
      }
    );
  }, [text, delay]);

  const words = text.split(" ");

  return (
    <h1 ref={containerRef} className={className}>
      {words.map((word, idx) => (
        <span key={idx} className="reveal-word inline-block mr-[0.3em]">
          {word}
        </span>
      ))}
    </h1>
  );
}
