"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { DisciplineRadar } from "@/components/character/DisciplineRadar";
import { StreakHeatmap } from "@/components/character/StreakHeatmap";
import { xpProgressInLevel, getRankTitle } from "@/lib/server/rpg-engine";
import {
  User,
  Crown,
  Shield,
  Award,
  Coins,
  Flame,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function CharacterPage() {
  const { data: character } = useQuery({
    queryKey: ["character"],
    queryFn: async () => {
      const res = await fetch("/api/character");
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 1000 * 30,
  });

  const xpProgress = xpProgressInLevel(character?.total_xp || 0);
  const rankTitle = character ? getRankTitle(character.level) : "Novice";

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="pb-4 border-b border-[#2e2e45]">
        <div className="inline-flex items-center gap-1.5 text-xs text-[#ffd166] font-pixel mb-1">
          <User className="w-3.5 h-3.5 text-[#ffd166]" />
          <span>ADVENTURER DOSSIER</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-pixel text-[#f5f1e8]">
          CHARACTER SHEET
        </h1>
        <p className="text-xs text-[#9a97ab] mt-1">
          Inspect your overall rank, 5-Discipline Radar Pentagon, and lifetime activity heatmap
        </p>
      </div>

      {/* Bento Grid Top Row: Profile Card & Lifetime Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Card (8 cols) */}
        <div className="lg:col-span-8 notch-card p-6 rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] flex flex-col justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ff8c42] to-[#8b5cf6] p-0.5 shadow-xl flex items-center justify-center font-pixel text-2xl text-[#13131f]">
                {character?.user?.display_name?.[0]?.toUpperCase() || "A"}
              </div>
              <div>
                <h2 className="font-pixel text-base sm:text-lg text-[#f5f1e8]">
                  {character?.user?.display_name || "Adventurer"}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-pixel text-[#ffd166] bg-[#13131f] border border-[#ffd166]/40 flex items-center gap-1">
                    <Crown className="w-3 h-3 text-[#ffd166]" />
                    {character?.equipped?.title?.name || rankTitle}
                  </span>
                  <span className="text-xs text-[#ff8c42] font-semibold">
                    Rank LVL {character?.level || 1}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-lg bg-[#13131f] border border-[#ffd166]/30 flex items-center gap-1.5 text-xs">
                <Coins className="w-4 h-4 text-[#ffd166]" />
                <span className="font-pixel text-xs text-[#ffd166]">
                  {(character?.gold || 0).toLocaleString()}g
                </span>
              </div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="space-y-2 pt-4 border-t border-[#2e2e45]">
            <div className="flex justify-between text-xs">
              <span className="text-[#9a97ab]">Total Experience</span>
              <span className="font-pixel text-[#ff8c42]">
                {(character?.total_xp || 0).toLocaleString()} XP
              </span>
            </div>
            <div className="h-3 bg-[#13131f] rounded-full overflow-hidden border border-[#2e2e45] relative">
              <div
                className="h-full bg-gradient-to-r from-[#ff8c42] via-[#ffd166] to-[#ff5f2e] rounded-full transition-all duration-500 relative"
                style={{ width: `${xpProgress.progressPercentage}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-shimmer" />
              </div>
            </div>
            <div className="flex justify-between text-[10px] text-[#9a97ab]">
              <span>Current: LVL {xpProgress.currentLevel}</span>
              <span>Next: LVL {xpProgress.currentLevel + 1} ({xpProgress.progressPercentage}%)</span>
            </div>
          </div>
        </div>

        {/* Lifetime Badges Card (4 cols) */}
        <div className="lg:col-span-4 notch-card p-6 rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] flex flex-col justify-between gap-3">
          <span className="font-pixel text-xs text-[#f5f1e8]">LIFETIME STATS</span>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-[#13131f] border border-[#2e2e45] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#ff8c42]" />
                <span className="text-xs text-[#9a97ab]">Current Streak</span>
              </div>
              <span className="font-pixel text-xs text-[#ff8c42]">
                {character?.current_streak || 0}d
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#13131f] border border-[#2e2e45] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#ffd166]" />
                <span className="text-xs text-[#9a97ab]">Longest Streak</span>
              </div>
              <span className="font-pixel text-xs text-[#ffd166]">
                {character?.longest_streak || 0}d
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#13131f] border border-[#2e2e45] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#4ade80]" />
                <span className="text-xs text-[#9a97ab]">Equipped Frame</span>
              </div>
              <span className="text-xs text-[#f5f1e8] font-semibold">
                {character?.equipped?.frame?.name || "Standard Crest"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: 5-Discipline Radar Chart & Discipline Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Radar Chart (6 cols) */}
        <div className="lg:col-span-6 notch-card p-6 rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-pixel text-xs sm:text-sm text-[#f5f1e8]">
                DISCIPLINE RADAR PENTAGON
              </h3>
              <p className="text-[11px] text-[#9a97ab] mt-0.5">
                Visualizing balance across the five foundational life pillars
              </p>
            </div>
          </div>

          {/* Recharts Pentagon */}
          <DisciplineRadar disciplines={character?.disciplines || []} />
        </div>

        {/* 5 Disciplines Detailed List (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          {character?.disciplines?.map((ca: { id: string; xp: number; level: number; attribute: { key: string; label: string; description: string; color_hex: string } }) => {
            const discProgress = xpProgressInLevel(ca.xp);
            return (
              <div
                key={ca.id}
                className="notch-card p-4 rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: ca.attribute.color_hex }}
                    />
                    <span className="font-pixel text-xs text-[#f5f1e8]">
                      {ca.attribute.label}
                    </span>
                    <span className="text-[10px] text-[#9a97ab] hidden sm:inline">
                      ({ca.attribute.description})
                    </span>
                  </div>

                  <span
                    className="text-[10px] font-pixel px-2 py-0.5 rounded border bg-[#13131f]"
                    style={{
                      color: ca.attribute.color_hex,
                      borderColor: `${ca.attribute.color_hex}66`,
                    }}
                  >
                    LVL {ca.level}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="h-1.5 bg-[#13131f] rounded-full overflow-hidden border border-[#2e2e45]">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${discProgress.progressPercentage}%`,
                        backgroundColor: ca.attribute.color_hex,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#9a97ab]">
                    <span>{ca.xp.toLocaleString()} XP Total</span>
                    <span>{discProgress.progressPercentage}% to LVL {ca.level + 1}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Row: 35-Day Streak Activity Heatmap */}
      <div className="notch-card p-6 rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45]">
        <StreakHeatmap
          currentStreak={character?.current_streak || 0}
          longestStreak={character?.longest_streak || 0}
          lastActivityDate={character?.last_activity_date}
        />
      </div>
    </div>
  );
}
