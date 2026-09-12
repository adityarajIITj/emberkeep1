"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { EmberFlame } from "@/components/animations/EmberFlame";
import { xpProgressInLevel, getRankTitle } from "@/lib/server/rpg-engine";
import {
  Flame,
  Scroll,
  Plus,
  Coins,
  Compass,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function KeepPage() {
  const { data: character } = useQuery({
    queryKey: ["character"],
    queryFn: async () => {
      const res = await fetch("/api/character");
      if (!res.ok) return null;
      return res.json();
    },
  });

  const { data: quests = [] } = useQuery({
    queryKey: ["quests"],
    queryFn: async () => {
      const res = await fetch("/api/quests");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const xpProgress = xpProgressInLevel(character?.total_xp || 0);
  const rankTitle = character ? getRankTitle(character.level) : "Novice";
  const streak = character?.current_streak || 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero: The Hearth of Emberkeep */}
      <div className="relative notch-card p-6 sm:p-10 rounded-2xl bg-gradient-to-br from-[#1e1e2e] to-[#171725] border-2 border-[#ff8c42]/30 shadow-2xl overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#ff8c42]/15 border border-[#ff8c42]/40 text-[#ff8c42] text-[11px] font-pixel">
              <Flame className="w-3.5 h-3.5 text-[#ff8c42] animate-pulse" />
              <span>THE CENTRAL HEARTH</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-pixel text-[#f5f1e8] tracking-wide">
              WELCOME BACK, {character?.user?.display_name?.toUpperCase() || "ADVENTURER"}
            </h1>
            <p className="text-xs sm:text-sm text-[#9a97ab] leading-relaxed">
              Your hearth burns bright. Tend to your daily bounties to keep your
              streak alive and fuel your legend across the five Disciplines.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-3 p-4 rounded-xl bg-[#13131f]/80 border border-[#2e2e45] shadow-inner">
            <EmberFlame streak={streak} size="lg" />
            <div className="text-center md:text-right">
              <div className="text-[11px] text-[#ffd166] font-semibold">
                XP Multiplier: +{Math.min(streak, 30)}%
              </div>
              <div className="text-[10px] text-[#9a97ab]">
                Longest Streak: {character?.longest_streak || 0} days
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Character Sheet Quick Card */}
        <div className="notch-card p-5 rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-pixel text-xs text-[#f5f1e8]">CHARACTER SHEET</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-pixel text-[#ffd166] bg-[#13131f] border border-[#ffd166]/40">
              {rankTitle}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#9a97ab]">Current Rank</span>
              <span className="font-pixel text-[#ff8c42]">LEVEL {xpProgress.currentLevel}</span>
            </div>
            <div className="h-2 bg-[#13131f] rounded-full overflow-hidden border border-[#2e2e45]">
              <div
                className="h-full bg-gradient-to-r from-[#ff8c42] to-[#ff5f2e] rounded-full"
                style={{ width: `${xpProgress.progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#9a97ab]">
              <span>Progress</span>
              <span>{xpProgress.xpIntoLevel} / {xpProgress.xpNeededForNext} XP</span>
            </div>
          </div>

          <Link
            href="/character"
            className="w-full mt-2 py-2 px-3 rounded bg-[#13131f] border border-[#2e2e45] hover:border-[#ff8c42]/50 text-xs text-[#9a97ab] hover:text-[#f5f1e8] flex items-center justify-between transition-colors"
          >
            <span>View 5 Disciplines</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Quest Status Quick Card */}
        <div className="notch-card p-5 rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-pixel text-xs text-[#f5f1e8]">ACTIVE QUESTS</span>
            <span className="text-xs text-[#ff8c42] font-semibold">{quests.length} Active</span>
          </div>

          <div className="space-y-2 text-xs">
            {quests.length === 0 ? (
              <p className="text-[#9a97ab] py-3">No active quests on your board.</p>
            ) : (
              quests.slice(0, 2).map((q: { id: string; title: string; difficulty: string }) => (
                <div
                  key={q.id}
                  className="p-2.5 rounded bg-[#13131f] border border-[#2e2e45] flex items-center justify-between"
                >
                  <span className="truncate pr-2">{q.title}</span>
                  <span className="text-[10px] font-pixel text-[#ffd166]">{q.difficulty}</span>
                </div>
              ))
            )}
          </div>

          <Link
            href="/quests"
            className="w-full mt-2 py-2 px-3 rounded bg-[#13131f] border border-[#2e2e45] hover:border-[#ff8c42]/50 text-xs text-[#9a97ab] hover:text-[#f5f1e8] flex items-center justify-between transition-colors"
          >
            <span>Open Quest Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Economy Vault Quick Card */}
        <div className="notch-card p-5 rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-pixel text-xs text-[#f5f1e8]">TREASURY</span>
            <Coins className="w-4 h-4 text-[#ffd166]" />
          </div>

          <div className="py-2 text-center">
            <div className="font-pixel text-2xl text-[#ffd166]">
              {(character?.gold || 0).toLocaleString()}
            </div>
            <div className="text-xs text-[#9a97ab] mt-1">Available Gold Coins</div>
          </div>

          <Link
            href="/merchant"
            className="w-full mt-2 py-2 px-3 rounded bg-[#13131f] border border-[#2e2e45] hover:border-[#ff8c42]/50 text-xs text-[#9a97ab] hover:text-[#f5f1e8] flex items-center justify-between transition-colors"
          >
            <span>Visit The Merchant</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
