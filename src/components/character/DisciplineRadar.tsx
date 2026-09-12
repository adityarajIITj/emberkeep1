"use client";

import React, { useEffect, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface DisciplineData {
  attribute: {
    key: string;
    label: string;
    color_hex: string;
  };
  level: number;
  xp: number;
}

interface DisciplineRadarProps {
  disciplines?: DisciplineData[];
}

interface TooltipPayloadItem {
  payload: {
    discipline: string;
    level: number;
    xp: number;
    color: string;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

function CustomRadarTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 rounded-lg bg-[#1e1e2e] border-2 border-[#ff8c42] shadow-xl text-xs space-y-1">
        <div className="flex items-center gap-1.5 font-pixel text-[#f5f1e8]">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ backgroundColor: data.color }}
          />
          <span>{data.discipline}</span>
        </div>
        <div className="text-[#ffd166] font-semibold">Rank Level: {data.level}</div>
        <div className="text-[#9a97ab]">Total XP: {data.xp.toLocaleString()}</div>
      </div>
    );
  }
  return null;
}

export function DisciplineRadar({ disciplines = [] }: DisciplineRadarProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Eliminate Next.js SSR hydration mismatches with dynamic client mounting (§15)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-72 flex items-center justify-center text-xs text-[#9a97ab] animate-pulse">
        Kindling Discipline Matrix...
      </div>
    );
  }

  // Map the 5 Disciplines in consistent order
  const order = ["BODY", "MIND", "SPIRIT", "CRAFT", "FOCUS"];
  const chartData = order.map((key) => {
    const item = disciplines.find((d) => d.attribute.key === key);
    return {
      discipline: item?.attribute.label || key,
      level: item?.level || 1,
      xp: item?.xp || 0,
      color: item?.attribute.color_hex || "#ff8c42",
      fullMark: 20,
    };
  });

  return (
    <div className="w-full h-72 sm:h-80 relative">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
          <PolarGrid stroke="#2e2e45" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="discipline"
            tick={{
              fill: "#f5f1e8",
              fontSize: 11,
              fontFamily: "var(--font-pixel)",
            }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, "auto"]}
            stroke="#3e3e5e"
            tick={false}
          />
          <Tooltip content={<CustomRadarTooltip />} />
          <Radar
            name="Discipline Ranks"
            dataKey="level"
            stroke="#ff8c42"
            strokeWidth={2.5}
            fill="#ff8c42"
            fillOpacity={0.35}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
