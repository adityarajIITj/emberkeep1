"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { EmberFlame } from "@/components/animations/EmberFlame";
import { BorderBeam } from "@/components/effects/BorderBeam";
import { TodayQuests } from "@/components/keep/TodayQuests";
import { xpProgressInLevel, getRankTitle } from "@/lib/server/rpg-engine";
import {
  Flame,
  User,
  Shield,
  ShoppingBag,
  Coins,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from "lucide-react";

export default function KeepPage() {
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
  const streak = character?.current_streak || 0;

  // Days to next milestone calculation (§7)
  let nextMilestone = 7;
  if (streak >= 14) nextMilestone = 30;
  else if (streak >= 7) nextMilestone = 14;
  const daysToMilestone = Math.max(nextMilestone - streak, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 3-Column Guildhall Layout (§9 Screen 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Character Dossier & Rank Progress (3 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Character Card */}
          <div className="notch-card p-5 rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-[#ffd166] font-pixel">
                <User className="w-3.5 h-3.5 text-[#ffd166]" />
                <span>ADVENTURER</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-pixel text-[#ffd166] bg-[#13131f] border border-[#ffd166]/40">
                {character?.equipped?.title?.name || rankTitle}
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff8c42] to-[#8b5cf6] p-0.5 shadow-lg flex items-center justify-center font-pixel text-lg text-[#13131f]">
                {character?.user?.display_name?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="min-w-0">
                <h3 className="font-pixel text-sm text-[#f5f1e8] truncate">
                  {character?.user?.display_name || "Adventurer"}
                </h3>
                <p className="text-xs text-[#9a97ab] truncate">
                  {character?.user?.email}
                </p>
              </div>
            </div>

            {/* Level & XP Liquid Bar */}
            <div className="space-y-2 pt-2 border-t border-[#2e2e45]">
              <div className="flex justify-between text-xs">
                <span className="text-[#9a97ab]">Rank Progression</span>
                <span className="font-pixel text-[#ff8c42] text-xs">
                  LVL {xpProgress.currentLevel}
                </span>
              </div>
              <div
                className="h-2.5 bg-[#13131f] rounded-full overflow-hidden border border-[#2e2e45] relative"
                title={`${xpProgress.xpIntoLevel} / ${xpProgress.xpNeededForNext} XP`}
              >
                <div
                  className="h-full bg-gradient-to-r from-[#ff8c42] via-[#ffd166] to-[#ff5f2e] rounded-full transition-all duration-500 relative"
                  style={{ width: `${xpProgress.progressPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-[#9a97ab]">
                <span>{xpProgress.xpIntoLevel.toLocaleString()} XP</span>
                <span>{xpProgress.progressPercentage}% to LVL {xpProgress.currentLevel + 1}</span>
              </div>
            </div>

            <Link
              href="/character"
              className="w-full py-2 px-3 rounded bg-[#13131f] border border-[#2e2e45] hover:border-[#ff8c42]/50 text-xs text-[#9a97ab] hover:text-[#f5f1e8] flex items-center justify-between transition-colors mt-2"
            >
              <span>Inspect 5 Disciplines</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Quick Treasury Peek */}
          <div className="notch-card p-5 rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#13131f] border border-[#ffd166]/30 text-[#ffd166]">
                <Coins className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="text-[10px] text-[#9a97ab] font-semibold">TREASURY BALANCE</div>
                <div className="font-pixel text-base text-[#ffd166]">
                  {(character?.gold || 0).toLocaleString()}g
                </div>
              </div>
            </div>
            <Link
              href="/merchant"
              className="p-2 rounded bg-[#13131f] border border-[#2e2e45] hover:border-[#ffd166]/50 text-[#9a97ab] hover:text-[#ffd166] transition-colors"
              title="Visit Merchant"
            >
              <ShoppingBag className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Center Column: Central Hearth & Today's Quests (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Central Ember Hearth Card with 21st.dev style BorderBeam */}
          <div className="relative notch-card p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-[#1e1e2e] via-[#1a1a2b] to-[#13131f] border-2 border-[#ff8c42]/40 shadow-[0_4px_30px_rgba(255,140,66,0.15)] overflow-hidden">
            <BorderBeam size={220} duration={8} colorFrom="#ff8c42" colorTo="#ffd166" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#ff8c42]/15 border border-[#ff8c42]/40 text-[#ff8c42] text-[10px] font-pixel">
                  <Flame className="w-3 h-3 text-[#ff8c42] animate-pulse" />
                  <span>THE CENTRAL EMBER</span>
                </div>
                <h2 className="font-pixel text-base sm:text-lg text-[#f5f1e8]">
                  KEEP YOUR FIRE LIT
                </h2>
                <p className="text-xs text-[#9a97ab] max-w-xs">
                  {streak > 0
                    ? `Streak active for ${streak} days. XP Multiplier: +${Math.min(streak, 30)}%.`
                    : "No active streak today. Complete a bounty below to kindle your fire!"}
                </p>
                {daysToMilestone > 0 && (
                  <div className="text-[11px] text-[#ffd166] font-semibold mt-1">
                    {daysToMilestone} days to {nextMilestone}-day milestone bonus!
                  </div>
                )}
              </div>

              <div className="shrink-0 flex flex-col items-center">
                <EmberFlame streak={streak} size="lg" showLabel={false} />
                <span className="font-pixel text-sm text-[#ffd166] mt-2">
                  {streak} {streak === 1 ? "DAY" : "DAYS"}
                </span>
              </div>
            </div>
          </div>

          {/* Today's Quests Checklist Component */}
          <TodayQuests />
        </div>

        {/* Right Column: 5 Disciplines Mini Radar & Quick Actions (3 cols) */}
        <div className="lg:col-span-3 space-y-5">
          <div className="notch-card p-5 rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="font-pixel text-xs text-[#f5f1e8]">DISCIPLINES</span>
              <span className="text-[10px] text-[#9a97ab]">5 Pillars</span>
            </div>

            <div className="space-y-2.5">
              {character?.disciplines?.map((ca: { id: string; xp: number; level: number; attribute: { label: string; color_hex: string } }) => (
                <div key={ca.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-[#f5f1e8]">
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: ca.attribute.color_hex }}
                      />
                      {ca.attribute.label}
                    </span>
                    <span className="font-pixel text-[10px] text-[#ffd166]">
                      LVL {ca.level}
                    </span>
                  </div>
                  <div className="h-1 bg-[#13131f] rounded-full overflow-hidden border border-[#2e2e45]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${xpProgressInLevel(ca.xp).progressPercentage}%`,
                        backgroundColor: ca.attribute.color_hex,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/character"
              className="w-full mt-2 py-2 px-3 rounded bg-[#13131f] border border-[#2e2e45] hover:border-[#ff8c42]/50 text-xs text-[#9a97ab] hover:text-[#f5f1e8] flex items-center justify-between transition-colors"
            >
              <span>View Radar Pentagon</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Armory Cosmetic Spotlight */}
          <div className="notch-card p-5 rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-pixel text-xs text-[#f5f1e8]">THE ARMORY</span>
              <Shield className="w-3.5 h-3.5 text-[#ffd166]" />
            </div>
            <p className="text-xs text-[#9a97ab]">
              Equip unlocked cosmetic titles, banner themes, and frames to stand out.
            </p>
            <Link
              href="/armory"
              className="w-full py-2 px-3 rounded bg-[#13131f] border border-[#2e2e45] hover:border-[#ff8c42]/50 text-xs text-[#ffd166] flex items-center justify-between transition-colors font-semibold"
            >
              <span>Open Armory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
