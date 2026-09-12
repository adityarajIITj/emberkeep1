"use client";

import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CarouselItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  description?: string;
  color?: string;
  icon?: React.ReactNode;
}

export interface BoxCarouselRef {
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
}

interface BoxCarouselProps {
  items: CarouselItem[];
  width?: number;
  height?: number;
  perspective?: number;
  autoRotate?: boolean;
  autoRotateInterval?: number;
  enableDrag?: boolean;
  className?: string;
  onIndexChange?: (index: number) => void;
}

export const BoxCarousel = React.forwardRef<BoxCarouselRef, BoxCarouselProps>(
  (
    {
      items,
      width = 300,
      height = 200,
      perspective = 1000,
      autoRotate = true,
      autoRotateInterval = 4000,
      enableDrag = true,
      className,
      onIndexChange,
    },
    ref
  ) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [rotation, setRotation] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartX = useRef(0);
    const currentRotationRef = useRef(0);

    const count = Math.max(items.length, 1);
    const anglePerItem = 360 / count;
    // Calculate translateZ so faces form a neat polygon
    const radius = Math.round((width / 2) / Math.tan(Math.PI / count)) + 15;

    const goTo = useCallback(
      (index: number) => {
        const normalized = ((index % count) + count) % count;
        setCurrentIndex(normalized);
        const newRot = -normalized * anglePerItem;
        setRotation(newRot);
        currentRotationRef.current = newRot;
        onIndexChange?.(normalized);
      },
      [count, anglePerItem, onIndexChange]
    );

    const next = useCallback(() => {
      goTo(currentIndex + 1);
    }, [goTo, currentIndex]);

    const prev = useCallback(() => {
      goTo(currentIndex - 1);
    }, [goTo, currentIndex]);

    useImperativeHandle(ref, () => ({
      next,
      prev,
      goTo,
    }));

    // Auto rotate
    useEffect(() => {
      if (!autoRotate || isDragging) return;
      const timer = setInterval(() => {
        next();
      }, autoRotateInterval);
      return () => clearInterval(timer);
    }, [autoRotate, autoRotateInterval, isDragging, next]);

    // Drag handlers
    const handleMouseDown = (e: React.MouseEvent) => {
      if (!enableDrag) return;
      setIsDragging(true);
      dragStartX.current = e.clientX;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartX.current;
      const dragSensitivity = 0.5;
      const tempRot = currentRotationRef.current + deltaX * dragSensitivity;
      setRotation(tempRot);
    };

    const handleMouseUp = (e: React.MouseEvent) => {
      if (!isDragging) return;
      setIsDragging(false);
      const deltaX = e.clientX - dragStartX.current;
      if (Math.abs(deltaX) > 40) {
        if (deltaX < 0) next();
        else prev();
      } else {
        goTo(currentIndex);
      }
    };

    return (
      <div className={cn("relative flex flex-col items-center select-none", className)}>
        {/* 3D Viewport */}
        <div
          style={{
            perspective: `${perspective}px`,
            width: `${width}px`,
            height: `${height}px`,
          }}
          className="relative flex items-center justify-center cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            style={{
              transform: `translateZ(-${radius}px) rotateY(${rotation}deg)`,
              transformStyle: "preserve-3d",
              transition: isDragging ? "none" : "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            className="relative size-full"
          >
            {items.map((item, index) => {
              const faceAngle = index * anglePerItem;
              const isSelected = index === currentIndex;

              return (
                <div
                  key={item.id}
                  style={{
                    transform: `rotateY(${faceAngle}deg) translateZ(${radius}px)`,
                    width: `${width}px`,
                    height: `${height}px`,
                    backfaceVisibility: "hidden",
                  }}
                  className={cn(
                    "absolute inset-0 rounded-2xl p-5 border-2 bg-gradient-to-br from-[#1e1e2e]/95 via-[#1a1a2e]/90 to-[#13131f]/95 backdrop-blur-xl shadow-2xl flex flex-col justify-between transition-colors",
                    isSelected
                      ? "border-[#ffd166] shadow-[0_0_25px_rgba(255,209,102,0.25)]"
                      : "border-[#2e2e45] opacity-85"
                  )}
                >
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="p-2 rounded-xl bg-[#13131f] border border-[#ff8c42]/40 text-[#ffd166] shadow-sm"
                        style={{ color: item.color || "#ffd166" }}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-[9px] font-pixel text-[#ffd166] uppercase tracking-wider">
                          {item.badge || "RELIC OF THE KEEP"}
                        </div>
                        <h4 className="font-pixel text-xs text-[#f5f1e8] mt-0.5">
                          {item.title}
                        </h4>
                      </div>
                    </div>
                    {item.subtitle && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-pixel text-[#ff8c42] bg-[#ff8c42]/10 border border-[#ff8c42]/30">
                        {item.subtitle}
                      </span>
                    )}
                  </div>

                  {/* Body description */}
                  {item.description && (
                    <p className="text-[11px] text-[#9a97ab] line-clamp-3 leading-relaxed mt-2">
                      {item.description}
                    </p>
                  )}

                  {/* Bottom indicator */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#2e2e45]/80 text-[10px] text-[#9a97ab]">
                    <span className="font-mono">
                      RELIC #{index + 1} / {count}
                    </span>
                    <span className="text-[#ffd166] font-pixel text-[9px]">
                      {isSelected ? "ACTIVE FOCUS" : "CLICK TO VIEW"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Navigation Arrows & Indicators */}
        <div className="flex items-center justify-center gap-3 mt-4 z-10">
          <button
            onClick={prev}
            aria-label="Previous Relic"
            className="p-1.5 rounded-lg bg-[#13131f] border border-[#2e2e45] hover:border-[#ff8c42] text-[#9a97ab] hover:text-[#ffd166] transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to item ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all cursor-pointer",
                  i === currentIndex
                    ? "w-5 bg-gradient-to-r from-[#ffd166] to-[#ff8c42]"
                    : "w-1.5 bg-[#2e2e45] hover:bg-[#9a97ab]"
                )}
              />
            ))}
          </div>

          <button
            onClick={next}
            aria-label="Next Relic"
            className="p-1.5 rounded-lg bg-[#13131f] border border-[#2e2e45] hover:border-[#ff8c42] text-[#9a97ab] hover:text-[#ffd166] transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }
);

BoxCarousel.displayName = "BoxCarousel";
export default BoxCarousel;
