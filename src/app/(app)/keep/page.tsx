"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { EmberFlame } from "@/components/animations/EmberFlame";
import { BorderBeam } from "@/components/effects/BorderBeam";
import { MagicCard } from "@/components/ui/magic-card";
import { AnimatedNumber } from "@/components/effects/AnimatedNumber";
import { TodayQuests } from "@/components/keep/TodayQuests";
import { fireQuestConfetti } from "@/components/effects/Confetti";
import { sounds } from "@/lib/audio/retro-sound";
import { xpProgressInLevel, getRankTitle } from "@/lib/server/rpg-engine";
import { OrbitingCircles } from "@/components/ui/orbiting-circles";
import { Particles } from "@/components/ui/particles";
import { MorphingText } from "@/components/ui/morphing-text";
import { Highlighter } from "@/components/ui/highlighter";
import { IconCloud } from "@/components/ui/icon-cloud";
import {
  Flame,
  User,
  Shield,
  ShoppingBag,
  Coins,
  ArrowRight,
  Sparkles,
  Zap,
  Sword,
  BookOpen,
  Brain,
  Hammer,
  Target,
  Trophy,
  Crown,
  Scroll,
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

  // Days to next milestone calculation
  let nextMilestone = 7;
  if (streak >= 14) nextMilestone = 30;
  else if (streak >= 7) nextMilestone = 14;
  const daysToMilestone = Math.max(nextMilestone - streak, 0);

  const handleHearthClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playFlameIgnite();
    const normX = Math.min(Math.max(e.clientX / window.innerWidth, 0.2), 0.8);
    const normY = Math.min(Math.max(e.clientY / window.innerHeight, 0.2), 0.8);
    fireQuestConfetti(normX, normY);
  };

  // Icons for the 3D Sphere of Mastery
  const disciplineSphereIcons = [
    <Sword key="body" className="w-5 h-5 text-[#ef4444]" />,
    <Brain key="mind" className="w-5 h-5 text-[#3b82f6]" />,
    <Sparkles key="spirit" className="w-5 h-5 text-[#ec4899]" />,
    <Hammer key="craft" className="w-5 h-5 text-[#f59e0b]" />,
    <Target key="focus" className="w-5 h-5 text-[#10b981]" />,
    <Flame key="ember" className="w-5 h-5 text-[#ff8c42]" />,
    <Crown key="crown" className="w-5 h-5 text-[#ffd166]" />,
    <Coins key="gold" className="w-5 h-5 text-[#ffd166]" />,
    <Shield key="shield" className="w-5 h-5 text-[#8b5cf6]" />,
    <Trophy key="trophy" className="w-5 h-5 text-[#fbbf24]" />,
    <Zap key="zap" className="w-5 h-5 text-[#38bdf8]" />,
    <BookOpen key="lore" className="w-5 h-5 text-[#a855f7]" />,
  ];

  return (
    <div className="space-y-6 relative animate-fadeIn">
      {/* Dynamic Ambient Particles */}
      <Particles className="opacity-35" quantity={35} color="#ff8c42" />

      {/* Guildhall Mantras Header Banner */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#1e1e2e]/70 backdrop-blur-xl border border-[#ff8c42]/30 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#ff8c42]/15 border border-[#ff8c42]/40 text-[#ff8c42]">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] font-pixel text-[#ffd166] uppercase tracking-wider">
              Guildhall Sanctuary • Daily Oath
            </div>
            <MorphingText
              texts={[
                "FEED YOUR SACRED EMBER TODAY",
                "FORGE INDOMITABLE DISCIPLINE",
                "DEFEAT PROCRASTINATION",
                "ASCEND TO GUILD LEGEND",
              ]}
              className="text-sm sm:text-base font-pixel text-[#f5f1e8]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#9a97ab]">Current Status:</span>
          <Highlighter action="box" color={streak > 0 ? "#4ade80" : "#ff8c42"}>
            {streak > 0 ? `${streak}-DAY HEARTH ROARING` : "KINDLE FIRST FLAME"}
          </Highlighter>
        </div>
      </div>

      {/* 3-Column Guildhall Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
        {/* Left Column: Character Dossier & Rank Progress (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Character Magic Card with Interactive Spotlight */}
          <MagicCard
            gradientColor="rgba(255, 140, 66, 0.22)"
            className="p-5 rounded-2xl bg-[#1e1e2e]/90 backdrop-blur-xl border-2 border-[#2e2e45] hover:border-[#ff8c42]/50 space-y-4 shadow-xl transition-all"
          >
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
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff8c42] to-[#8b5cf6] p-0.5 shadow-lg flex items-center justify-center font-pixel text-lg text-[#13131f] shrink-0">
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
                  className="h-full bg-gradient-to-r from-[#ff8c42] via-[#ffd166] to-[#ff5f2e] rounded-full transition-all duration-500 relative shadow-[0_0_12px_rgba(255,140,66,0.5)]"
                  style={{ width: `${xpProgress.progressPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-[#9a97ab]">
                <span>
                  <AnimatedNumber value={xpProgress.xpIntoLevel} /> XP
                </span>
                <span>{xpProgress.progressPercentage}% to LVL {xpProgress.currentLevel + 1}</span>
              </div>
            </div>

            <Link
              href="/character"
              className="w-full py-2.5 px-3 rounded-xl bg-[#13131f] border border-[#2e2e45] hover:border-[#ff8c42]/50 text-xs text-[#9a97ab] hover:text-[#f5f1e8] flex items-center justify-between transition-all mt-2 group"
            >
              <span>Inspect 5 Disciplines</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </MagicCard>

          {/* Quick Treasury Magic Card */}
          <MagicCard
            gradientColor="rgba(255, 209, 102, 0.2)"
            className="p-5 rounded-2xl bg-[#1e1e2e]/90 backdrop-blur-xl border-2 border-[#2e2e45] hover:border-[#ffd166]/50 flex items-center justify-between shadow-xl transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#13131f] border border-[#ffd166]/30 text-[#ffd166] shadow-[0_0_15px_rgba(255,209,102,0.2)]">
                <Coins className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="text-[10px] text-[#9a97ab] font-semibold uppercase">Treasury Balance</div>
                <div className="font-pixel text-base text-[#ffd166]">
                  <AnimatedNumber value={character?.gold || 0} />g
                </div>
              </div>
            </div>
            <Link
              href="/merchant"
              className="p-2.5 rounded-xl bg-[#13131f] border border-[#2e2e45] hover:border-[#ffd166]/50 text-[#9a97ab] hover:text-[#ffd166] transition-all hover:scale-105 active:scale-95"
              title="Visit Merchant Bazaar"
            >
              <ShoppingBag className="w-4 h-4" />
            </Link>
          </MagicCard>

          {/* 🌟 3D Sphere of Mastery (IconCloud Interactive Relic) */}
          <div className="p-5 rounded-2xl bg-[#1e1e2e]/90 backdrop-blur-xl border-2 border-[#2e2e45] hover:border-[#ff8c42]/40 shadow-xl flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="w-full flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs text-[#ffd166] font-pixel">
                <Sparkles className="w-3.5 h-3.5 text-[#ffd166]" />
                <span>SPHERE OF MASTERY</span>
              </div>
              <span className="text-[10px] text-[#9a97ab] font-mono">DRAG TO ROTATE</span>
            </div>

            <div className="py-2">
              <IconCloud
                radius={85}
                icons={disciplineSphereIcons}
                autoRotateSpeed={0.005}
              />
            </div>

            <p className="text-[11px] text-[#9a97ab] text-center mt-1">
              Harness the unified power of the 5 Pillars to fuel your ascent.
            </p>
          </div>
        </div>

        {/* Center Column: Central Hearth & Today's Quests (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Central Ember Hearth Card with BorderBeam, Orbiting Circles & Click Interaction */}
          <div
            onClick={handleHearthClick}
            className="cursor-pointer relative overflow-hidden notch-card p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-[#1e1e2e] via-[#1a1a2b] to-[#13131f] border-2 border-[#ff8c42]/40 shadow-[0_4px_35px_rgba(255,140,66,0.2)] hover:border-[#ffd166] transition-all group"
          >
            <BorderBeam size={220} duration={8} colorFrom="#ff8c42" colorTo="#ffd166" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#ff8c42]/15 border border-[#ff8c42]/40 text-[#ff8c42] text-[10px] font-pixel">
                  <Flame className="w-3 h-3 text-[#ff8c42] animate-pulse" />
                  <span>THE CENTRAL EMBER • CLICK TO STOKE</span>
                </div>
                <h2 className="font-pixel text-base sm:text-lg text-[#f5f1e8] group-hover:text-[#ffd166] transition-colors">
                  KEEP YOUR FIRE ROARING
                </h2>
                <p className="text-xs text-[#9a97ab] max-w-xs leading-relaxed">
                  {streak > 0 ? (
                    <>
                      Streak active for <Highlighter action="underline" color="#ff8c42">{streak} days</Highlighter>. XP Multiplier: <span className="text-[#ffd166] font-bold">+{Math.min(streak, 30)}%</span>.
                    </>
                  ) : (
                    "No active streak today. Complete a bounty below to kindle your fire!"
                  )}
                </p>
                {daysToMilestone > 0 && (
                  <div className="text-[11px] text-[#ffd166] font-semibold mt-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#ffd166]" />
                    <span>{daysToMilestone} days to {nextMilestone}-day milestone bonus!</span>
                  </div>
                )}
              </div>

              {/* Central Hearth with Planetary Orbiting Sparks */}
              <div className="shrink-0 relative flex flex-col items-center justify-center group-hover:scale-105 transition-transform size-32">
                {/* Orbiting Spark Ring */}
                <OrbitingCircles radius={48} duration={10} reverse speed={1.5} iconSize={24} path={true}>
                  <Zap className="w-3 h-3 text-[#ffd166]" />
                </OrbitingCircles>
                <OrbitingCircles radius={48} duration={10} delay={5} reverse speed={1.5} iconSize={24} path={false}>
                  <Sparkles className="w-3 h-3 text-[#ff8c42]" />
                </OrbitingCircles>

                <div className="relative z-10 flex flex-col items-center">
                  <EmberFlame streak={streak} size="lg" showLabel={false} />
                  <span className="font-pixel text-xs text-[#ffd166] mt-1 drop-shadow">
                    {streak} {streak === 1 ? "DAY" : "DAYS"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Quests Checklist Component */}
          <TodayQuests />
        </div>

        {/* Right Column: 5 Disciplines Mini Radar & Quick Actions (3 cols) */}
        <div className="lg:col-span-3 space-y-5">
          <MagicCard
            gradientColor="rgba(255, 140, 66, 0.18)"
            className="p-5 rounded-2xl bg-[#1e1e2e]/90 backdrop-blur-xl border-2 border-[#2e2e45] hover:border-[#ff8c42]/40 space-y-3.5 shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-pixel text-xs text-[#f5f1e8]">DISCIPLINES</span>
              <Highlighter action="box" color="#ffd166">
                5 Pillars
              </Highlighter>
            </div>

            <div className="space-y-3">
              {character?.disciplines?.map((ca: { id: string; xp: number; level: number; attribute: { label: string; color_hex: string } }) => (
                <div key={ca.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-[#f5f1e8]">
                      <span
                        className="w-2 h-2 rounded-full inline-block shadow-[0_0_8px_currentColor]"
                        style={{ backgroundColor: ca.attribute.color_hex, color: ca.attribute.color_hex }}
                      />
                      {ca.attribute.label}
                    </span>
                    <span className="font-pixel text-[10px] text-[#ffd166]">
                      LVL {ca.level}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#13131f] rounded-full overflow-hidden border border-[#2e2e45]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${xpProgressInLevel(ca.xp).progressPercentage}%`,
                        backgroundColor: ca.attribute.color_hex,
                        boxShadow: `0 0 8px ${ca.attribute.color_hex}`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/character"
              className="w-full mt-2 py-2.5 px-3 rounded-xl bg-[#13131f] border border-[#2e2e45] hover:border-[#ff8c42]/50 text-xs text-[#9a97ab] hover:text-[#f5f1e8] flex items-center justify-between transition-all group"
            >
              <span>View Radar Pentagon</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </MagicCard>

          {/* Armory Cosmetic Spotlight */}
          <MagicCard
            gradientColor="rgba(255, 209, 102, 0.18)"
            className="p-5 rounded-2xl bg-[#1e1e2e]/90 backdrop-blur-xl border-2 border-[#2e2e45] hover:border-[#ffd166]/40 space-y-3 shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-pixel text-xs text-[#f5f1e8]">THE ARMORY</span>
              <Shield className="w-3.5 h-3.5 text-[#ffd166]" />
            </div>
            <p className="text-xs text-[#9a97ab] leading-relaxed">
              Equip unlocked cosmetic titles, banner themes, and frames to stand out across the realm.
            </p>
            <Link
              href="/armory"
              className="w-full py-2.5 px-3 rounded-xl bg-[#13131f] border border-[#2e2e45] hover:border-[#ff8c42]/50 text-xs text-[#ffd166] flex items-center justify-between transition-all font-semibold group"
            >
              <span>Open Armory Vault</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </MagicCard>
        </div>
      </div>
    </div>
  );
}
