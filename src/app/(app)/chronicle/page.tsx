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
} from "lucide-react";

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
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="pb-4 border-b border-[#2e2e45]">
        <div className="inline-flex items-center gap-1.5 text-xs text-[#ffd166] font-pixel mb-1">
          <History className="w-3.5 h-3.5 text-[#ffd166]" />
          <span>GUILD ARCHIVES</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-pixel text-[#f5f1e8]">
          THE CHRONICLE
        </h1>
        <p className="text-xs text-[#9a97ab] mt-1">
          Immutable audit ledger of your conquered quests, shop acquisitions, and streak milestones
        </p>
      </div>

      {/* Lifetime Stats Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="notch-card p-5 rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] space-y-1">
          <div className="flex items-center justify-between text-[#9a97ab]">
            <span className="text-[11px] font-semibold">Conquered Quests</span>
            <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
          </div>
          <div className="font-pixel text-lg sm:text-xl text-[#f5f1e8]">
            {stats.totalQuestsCompleted}
          </div>
        </div>

        <div className="notch-card p-5 rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] space-y-1">
          <div className="flex items-center justify-between text-[#9a97ab]">
            <span className="text-[11px] font-semibold">Total XP Earned</span>
            <TrendingUp className="w-4 h-4 text-[#ff8c42]" />
          </div>
          <div className="font-pixel text-lg sm:text-xl text-[#ff8c42]">
            {stats.totalXpEarned.toLocaleString()}
          </div>
        </div>

        <div className="notch-card p-5 rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] space-y-1">
          <div className="flex items-center justify-between text-[#9a97ab]">
            <span className="text-[11px] font-semibold">Lifetime Gold</span>
            <Coins className="w-4 h-4 text-[#ffd166]" />
          </div>
          <div className="font-pixel text-lg sm:text-xl text-[#ffd166]">
            {stats.totalGoldEarned.toLocaleString()}g
          </div>
        </div>

        <div className="notch-card p-5 rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] space-y-1">
          <div className="flex items-center justify-between text-[#9a97ab]">
            <span className="text-[11px] font-semibold">Longest Streak</span>
            <Flame className="w-4 h-4 text-[#f87171]" />
          </div>
          <div className="font-pixel text-lg sm:text-xl text-[#f87171]">
            {stats.longestStreak} Days
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
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
              className={`px-3.5 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-[#ffd166] text-[#13131f] font-bold shadow-md"
                  : "bg-[#1e1e2e] border border-[#2e2e45] text-[#9a97ab] hover:text-[#f5f1e8] hover:border-[#ffd166]/40"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Timeline Stream */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="notch-card p-4 rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] h-20 animate-pulse"
            />
          ))}
        </div>
      ) : filteredTimeline.length === 0 ? (
        <div className="notch-card p-12 text-center rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] space-y-3 max-w-md mx-auto my-8">
          <History className="w-8 h-8 text-[#9a97ab] mx-auto opacity-50" />
          <h3 className="font-pixel text-xs sm:text-sm text-[#f5f1e8]">
            NO ENTRIES RECORDED
          </h3>
          <p className="text-xs text-[#9a97ab]">
            Complete quests or acquire cosmetics to begin etching your saga onto the ledger.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTimeline.map((item) => {
            let icon = <CheckCircle2 className="w-5 h-5 text-[#4ade80]" />;
            let borderColor = "border-[#2e2e45]";

            if (item.type === "SHOP_PURCHASE") {
              icon = <ShoppingBag className="w-5 h-5 text-[#ffd166]" />;
              borderColor = "border-[#ffd166]/30";
            } else if (item.type === "STREAK_BONUS" || item.type === "LEVEL_UP_BONUS") {
              icon = <Sparkles className="w-5 h-5 text-[#ff8c42]" />;
              borderColor = "border-[#ff8c42]/40";
            }

            return (
              <div
                key={item.id}
                className={`notch-card p-4 rounded-xl bg-[#1e1e2e] border-2 ${borderColor} flex items-center justify-between gap-4 transition-all hover:border-[#ffd166]/50`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="p-2.5 rounded-lg bg-[#13131f] border border-[#2e2e45] shrink-0">
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
                    <span className="px-2 py-0.5 rounded bg-[#ff8c42]/15 border border-[#ff8c42]/40 text-[#ff8c42] font-pixel text-[10px]">
                      +{item.xpChange} XP
                    </span>
                  )}

                  {item.goldChange !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded font-pixel text-[10px] border ${
                        item.goldChange < 0
                          ? "bg-[#f87171]/15 border-[#f87171]/40 text-[#f87171]"
                          : "bg-[#ffd166]/15 border-[#ffd166]/40 text-[#ffd166]"
                      }`}
                    >
                      {item.goldChange > 0 ? `+${item.goldChange}` : item.goldChange}g
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
