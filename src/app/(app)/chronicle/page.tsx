"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  History,
  Flame,
  Award,
  Coins,
  CheckCircle2,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Scroll,
} from "lucide-react";
import { MagicCard } from "@/components/ui/magic-card";
import { Particles } from "@/components/ui/particles";
import { MorphingText } from "@/components/ui/morphing-text";
import { Highlighter } from "@/components/ui/highlighter";
import { OrbitingCircles } from "@/components/ui/orbiting-circles";

interface TimelineEvent {
  id: string;
  type: "QUEST_COMPLETION" | "SHOP_PURCHASE" | "STREAK_BONUS" | "LEVEL_UP_BONUS";
  title: string;
  subtitle?: string;
  xpChange?: number;
  goldChange?: number;
  disciplineLabel?: string;
  disciplineColor?: string;
  timestamp: string;
}

interface ChronicleData {
  stats: {
    totalQuestsCompleted: number;
    totalXpEarned: number;
    totalGoldEarned: number;
    currentStreak: number;
    longestStreak: number;
  };
  timeline: TimelineEvent[];
}

export default function ChroniclePage() {
  const [filterType, setFilterType] = useState<string>("ALL");

  const { data, isLoading } = useQuery<ChronicleData>({
    queryKey: ["chronicle"],
    queryFn: async () => {
      const res = await fetch("/api/chronicle");
      if (!res.ok) throw new Error("Failed to load chronicle");
      return res.json();
    },
    staleTime: 1000 * 30,
  });

  const timeline = data?.timeline || [];
  const stats = data?.stats || {
    totalQuestsCompleted: 0,
    totalXpEarned: 0,
    totalGoldEarned: 0,
    currentStreak: 0,
    longestStreak: 0,
  };

  const filteredTimeline =
    filterType === "ALL"
      ? timeline
      : timeline.filter((item) => {
          if (filterType === "QUEST") return item.type === "QUEST_COMPLETION";
          if (filterType === "PURCHASE") return item.type === "SHOP_PURCHASE";
          if (filterType === "BONUS")
            return item.type === "STREAK_BONUS" || item.type === "LEVEL_UP_BONUS";
          return true;
        });

  const formatEventDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6 relative animate-fadeIn">
      {/* Ambient Blue Lore Particles */}
      <Particles className="opacity-25" quantity={30} color="#3b82f6" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#2e2e45] relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-[#ffd166] font-pixel mb-1">
            <History className="w-3.5 h-3.5 text-[#ffd166]" />
            <span>GUILD ARCHIVES</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-pixel text-[#f5f1e8] flex items-center gap-2">
            <span>THE CHRONICLE</span>
          </h1>
          <p className="text-xs text-[#9a97ab] mt-1 flex items-center gap-1.5 flex-wrap">
            <span>Immutable audit ledger of your</span>
            <Highlighter action="underline" color="#3b82f6">
              conquered quests & acquisitions
            </Highlighter>
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-[#1e1e2e]/80 border border-[#3b82f6]/30 backdrop-blur-md">
          <div className="text-[10px] font-pixel text-[#ffd166] uppercase mb-0.5">
            CHRONICLE OF AGES
          </div>
          <MorphingText
            texts={[
              "IMMUTABLE LEDGER OF ACTION",
              "EVERY BOUNTY ETCHED IN GOLD",
              "DISCIPLINE RECORDED FOR ETERNITY",
              "YOUR ADVENTURE UNFOLDS",
            ]}
            className="text-xs font-pixel text-[#f5f1e8]"
          />
        </div>
      </div>

      {/* Lifetime Stats Bento Grid with MagicCards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        <MagicCard
          gradientColor="rgba(74, 222, 128, 0.2)"
          className="p-5 rounded-2xl bg-[#1e1e2e]/90 border-2 border-[#2e2e45] hover:border-[#4ade80]/50 space-y-1 shadow-lg transition-all"
        >
          <div className="flex items-center justify-between text-[#9a97ab]">
            <span className="text-[11px] font-semibold">Conquered Quests</span>
            <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
          </div>
          <div className="font-pixel text-lg sm:text-2xl text-[#f5f1e8]">
            {stats.totalQuestsCompleted}
          </div>
        </MagicCard>

        <MagicCard
          gradientColor="rgba(255, 140, 66, 0.2)"
          className="p-5 rounded-2xl bg-[#1e1e2e]/90 border-2 border-[#2e2e45] hover:border-[#ff8c42]/50 space-y-1 shadow-lg transition-all"
        >
          <div className="flex items-center justify-between text-[#9a97ab]">
            <span className="text-[11px] font-semibold">Total XP Earned</span>
            <TrendingUp className="w-4 h-4 text-[#ff8c42]" />
          </div>
          <div className="font-pixel text-lg sm:text-2xl text-[#ff8c42]">
            {stats.totalXpEarned.toLocaleString()}
          </div>
        </MagicCard>

        <MagicCard
          gradientColor="rgba(255, 209, 102, 0.2)"
          className="p-5 rounded-2xl bg-[#1e1e2e]/90 border-2 border-[#2e2e45] hover:border-[#ffd166]/50 space-y-1 shadow-lg transition-all"
        >
          <div className="flex items-center justify-between text-[#9a97ab]">
            <span className="text-[11px] font-semibold">Lifetime Gold</span>
            <Coins className="w-4 h-4 text-[#ffd166]" />
          </div>
          <div className="font-pixel text-lg sm:text-2xl text-[#ffd166]">
            {stats.totalGoldEarned.toLocaleString()}g
          </div>
        </MagicCard>

        <MagicCard
          gradientColor="rgba(248, 113, 113, 0.2)"
          className="p-5 rounded-2xl bg-[#1e1e2e]/90 border-2 border-[#2e2e45] hover:border-[#f87171]/50 space-y-1 shadow-lg transition-all"
        >
          <div className="flex items-center justify-between text-[#9a97ab]">
            <span className="text-[11px] font-semibold">Longest Streak</span>
            <Flame className="w-4 h-4 text-[#f87171]" />
          </div>
          <div className="font-pixel text-lg sm:text-2xl text-[#f87171]">
            {stats.longestStreak} Days
          </div>
        </MagicCard>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none relative z-10">
        {[
          { key: "ALL", label: "All Activities" },
          { key: "QUEST", label: "Quest Completions" },
          { key: "PURCHASE", label: "Bazaar Purchases" },
          { key: "BONUS", label: "Milestones & Bonuses" },
        ].map((tab) => {
          const isActive = filterType === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilterType(tab.key)}
              aria-pressed={isActive}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-[#ffd166] to-[#ff8c42] text-[#13131f] font-bold shadow-md shadow-[#ff8c42]/20"
                  : "bg-[#1e1e2e]/90 backdrop-blur-md border border-[#2e2e45] text-[#9a97ab] hover:text-[#f5f1e8] hover:border-[#ffd166]/40"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Timeline Stream */}
      {isLoading ? (
        <div className="space-y-3 relative z-10">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="notch-card p-4 rounded-2xl bg-[#1e1e2e] border-2 border-[#2e2e45] h-20 animate-pulse"
            />
          ))}
        </div>
      ) : filteredTimeline.length === 0 ? (
        <div className="relative overflow-hidden notch-card p-12 text-center rounded-3xl bg-gradient-to-b from-[#1e1e2e]/90 to-[#13131f]/95 border-2 border-[#2e2e45] space-y-4 max-w-lg mx-auto my-8 z-10">
          <OrbitingCircles radius={45} duration={12} iconSize={26}>
            <Scroll className="w-3.5 h-3.5 text-[#ffd166]" />
          </OrbitingCircles>
          <div className="w-14 h-14 rounded-2xl bg-[#13131f] border-2 border-[#3b82f6]/40 flex items-center justify-center mx-auto z-10 relative">
            <History className="w-7 h-7 text-[#3b82f6]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-pixel text-sm text-[#f5f1e8]">
              NO ENTRIES RECORDED IN ARCHIVE
            </h3>
            <p className="text-xs text-[#9a97ab] leading-relaxed">
              Complete quests or acquire cosmetics to begin etching your saga onto the guild ledger.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3 relative z-10">
          {filteredTimeline.map((item) => {
            let icon = <CheckCircle2 className="w-5 h-5 text-[#4ade80]" />;
            let spotlight = "rgba(74, 222, 128, 0.18)";

            if (item.type === "SHOP_PURCHASE") {
              icon = <ShoppingBag className="w-5 h-5 text-[#ffd166]" />;
              spotlight = "rgba(255, 209, 102, 0.18)";
            } else if (item.type === "STREAK_BONUS" || item.type === "LEVEL_UP_BONUS") {
              icon = <Sparkles className="w-5 h-5 text-[#ff8c42]" />;
              spotlight = "rgba(255, 140, 66, 0.22)";
            }

            return (
              <MagicCard
                key={item.id}
                gradientColor={spotlight}
                className="p-4 rounded-2xl bg-[#1e1e2e]/90 backdrop-blur-xl border-2 border-[#2e2e45] hover:border-[#ffd166]/50 flex items-center justify-between gap-4 transition-all shadow-md"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="p-2.5 rounded-xl bg-[#13131f] border border-[#2e2e45] shrink-0 shadow-inner">
                    {icon}
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-semibold text-xs sm:text-sm text-[#f5f1e8] truncate">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-[#9a97ab] mt-0.5">
                      <span>{item.subtitle}</span>
                      <span>•</span>
                      <span>{formatEventDate(item.timestamp)}</span>
                    </div>
                  </div>
                </div>

                {/* Reward Delta Pill */}
                <div className="flex items-center gap-2 shrink-0">
                  {item.xpChange !== undefined && (
                    <span className="px-2.5 py-1 rounded-lg bg-[#ff8c42]/15 border border-[#ff8c42]/40 text-[#ff8c42] font-pixel text-[10px] shadow-sm">
                      +{item.xpChange} XP
                    </span>
                  )}

                  {item.goldChange !== undefined && (
                    <span
                      className={`px-2.5 py-1 rounded-lg font-pixel text-[10px] border shadow-sm ${
                        item.goldChange < 0
                          ? "bg-[#f87171]/15 border-[#f87171]/40 text-[#f87171]"
                          : "bg-[#ffd166]/15 border-[#ffd166]/40 text-[#ffd166]"
                      }`}
                    >
                      {item.goldChange > 0 ? `+${item.goldChange}` : item.goldChange}g
                    </span>
                  )}
                </div>
              </MagicCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
