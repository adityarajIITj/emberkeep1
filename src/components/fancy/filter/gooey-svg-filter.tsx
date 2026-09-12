"use client";

import React from "react";

interface GooeySvgFilterProps {
  id?: string;
  strength?: number;
}

export default function GooeySvgFilter({
  id = "gooey-filter",
  strength = 10,
}: GooeySvgFilterProps) {
  return (
    <svg className="pointer-events-none fixed top-0 left-0 w-0 h-0" aria-hidden="true">
      <defs>
        <filter id={id} colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation={strength} result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
}
