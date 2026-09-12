"use client";

import React from "react";
import { Flame, Calendar, Award } from "lucide-react";

interface StreakHeatmapProps {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string | null;
}

export function StreakHeatmap({
  currentStreak,
  longestStreak,
}: StreakHeatmapProps) {
  // Generate the last 35 days (5 weeks)
  const days: { dateStr: string; isActive: boolean; dayNum: number }[] = [];
  const now = new Date();

  for (let i = 34; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    // Active if within currentStreak range
    const isActive = i < currentStreak;
    days.push({ dateStr, isActive, dayNum: d.getDate() });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-[#ffd166] font-pixel text-[11px]">
          <Calendar className="w-3.5 h-3.5 text-[#ffd166]" />
          <span>EMBER ACTIVITY (LAST 35 DAYS)</span>
        </div>
        <div className="flex items-center gap-3 text-[#9a97ab]">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-[#13131f] border border-[#2e2e45]" />
            <span>Rest</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-[#ff8c42] shadow-[0_0_6px_#ff8c42]" />
            <span className="text-[#f5f1e8]">Ember Lit</span>
          </div>
        </div>
      </div>

      {/* Grid of 35 Days */}
      <div className="p-4 rounded-xl bg-[#13131f] border border-[#2e2e45] overflow-x-auto">
        <div className="grid grid-cols-7 gap-2 min-w-[280px]">
          {days.map((day, idx) => (
            <div
              key={idx}
              title={`${day.dateStr}: ${day.isActive ? "Quest Conquered (Ember Lit)" : "Rest Day"}`}
              className={`h-8 rounded-lg border flex flex-col items-center justify-center text-[10px] font-semibold transition-all ${
                day.isActive
                  ? "bg-gradient-to-br from-[#ff8c42] to-[#ff5f2e] border-[#ffd166]/50 text-[#13131f] shadow-[0_0_8px_rgba(255,140,66,0.4)] scale-105"
                  : "bg-[#1e1e2e] border-[#2e2e45] text-[#9a97ab]/60 hover:border-[#2e2e45]/80"
              }`}
            >
              <span>{day.dayNum}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
