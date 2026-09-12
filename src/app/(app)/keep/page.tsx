"use client";

import React, { useRef } from "react";
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
import BoxCarousel, { CarouselItem } from "@/components/ui/box-carousel";
import AnimatedPathText from "@/components/ui/text-along-path";
import VariableFontCursorProximity from "@/components/fancy/text/variable-font-cursor-proximity";
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
  const bannerRef = useRef<HTMLDivElement>(null);

  const { data: character } = useQuery({
    queryKey: ["character"],
    queryFn: async () => {
      const res = await fetch("/api/character");
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 1000 * 30,
  });

  const realmRelics: CarouselItem[] = [
    {
      id: "relic-1",
      title: "Aegis of Will",
      subtitle: "LEGENDARY",
      badge: "RELIC OF DEFENSE",
      description: "Infused with the discipline of 100 finished bounties. Shields your hearth from cold winds.",
      color: "#ff8c42",
      icon: <Shield className="w-4 h-4 text-[#ff8c42]" />,
    },
    {
      id: "relic-2",
      title: "Sunken Blade",
      subtitle: "MYTHIC",
      badge: "CHRONO EDGE",
      description: "Forged in the depths of uninterrupted focus. Slices cleanly through procrastination.",
      color: "#ffd166",
      icon: <Sword className="w-4 h-4 text-[#ffd166]" />,
    },
    {
      id: "relic-3",
      title: "Ancient Tome",
      subtitle: "ARTIFACT",
      badge: "DEEP LORE",
      description: "Contains forgotten scrolls of wisdom and mastery across the five sacred pillars.",
      color: "#38bdf8",
      icon: <BookOpen className="w-4 h-4 text-[#38bdf8]" />,
    },
    {
      id: "relic-4",
      title: "Phoenix Amulet",
      subtitle: "SACRED",
      badge: "STREAK WARD",
      description: "Channeling primal fire to resurrect streaks on days of sudden adversity.",
      color: "#ec4899",
      icon: <Sparkles className="w-4 h-4 text-[#ec4899]" />,
    },
    {
      id: "relic-5",
      title: "Hearth Crown",
      subtitle: "CHAMPION",
      badge: "EMBER MAJESTY",
      description: "Reserved for guild legends whose roaring fire illuminates the entire realm.",
      color: "#f59e0b",
      icon: <Crown className="w-4 h-4 text-[#f59e0b]" />,
    },
  ];

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
      {/* Rich Atmospheric RPG Sanctuary Background */}
      <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[550px] overflow-hidden -z-10">
        {/* Ambient Central Hearth Glow */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[680px] h-[380px] bg-[radial-gradient(ellipse_at_center,rgba(255,140,66,0.15)_0%,rgba(255,209,102,0.06)_45%,transparent_75%)] blur-3xl" />
        {/* Atmospheric Celestial Rune Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ff8c420c_1px,transparent_1px),linear-gradient(to_bottom,#ff8c420c_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-80" />
      </div>

      {/* Dynamic Ambient Particles */}
      <Particles className="opacity-40" quantity={40} color="#ff8c42" />

      {/* 1. Guildhall Mantras Header Banner */}
      <div
        ref={bannerRef}
        className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#1e1e2e]/80 backdrop-blur-xl border border-[#ff8c42]/35 shadow-lg group"
      >
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#ff8c42]/15 border border-[#ff8c42]/40 text-[#ff8c42] shadow-sm">
            <Flame className="w-5 h-5 animate-pulse text-[#ff8c42]" />
          </div>
          <div>
            <div className="text-[10px] font-pixel text-[#ffd166] uppercase tracking-wider mb-1">
              Guildhall Sanctuary • Daily Oath
            </div>
            <VariableFontCursorProximity
              className="text-xs sm:text-sm font-pixel text-[#f5f1e8] tracking-wide"
              fromFontVariationSettings="'wght' 400, 'slnt' 0"
              toFontVariationSettings="'wght' 900, 'slnt' -8"
              radius={160}
              containerRef={bannerRef}
            >
              FEED YOUR SACRED EMBER TODAY • FORGE INDOMITABLE DISCIPLINE
            </VariableFontCursorProximity>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#9a97ab] hidden sm:inline">Hearth Status:</span>
          <div className="px-3 py-1.5 rounded-xl bg-[#13131f] border border-[#ff8c42]/40 text-[#ffd166] font-pixel text-xs flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
            <span>{streak > 0 ? `${streak}-DAY HEARTH ROARING` : "KINDLE FIRST FLAME"}</span>
          </div>
        </div>
      </div>

      {/* 2. TOP DECK: 2-Column Command Center (8 cols + 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative z-10">
        {/* Left Hero (8 cols): Unified Central Ember & Adventurer Hearth */}
        <div
          onClick={handleHearthClick}
          className="lg:col-span-8 cursor-pointer relative overflow-hidden notch-card p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-[#1e1e2e]/95 via-[#1a1a2b]/95 to-[#13131f]/95 border-2 border-[#ff8c42]/40 shadow-[0_4px_35px_rgba(255,140,66,0.2)] hover:border-[#ffd166] transition-all group flex flex-col justify-between"
        >
          <BorderBeam size={260} duration={8} colorFrom="#ff8c42" colorTo="#ffd166" />

          {/* Top Info Strip: Adventurer Dossier & Treasury */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2e2e45]/80">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff8c42] to-[#8b5cf6] p-0.5 shadow-lg flex items-center justify-center font-pixel text-lg text-[#13131f] shrink-0">
                {character?.user?.display_name?.[0]?.toUpperCase() || "A"}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-pixel text-sm sm:text-base text-[#f5f1e8]">
                    {character?.user?.display_name || "Adventurer"}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-pixel text-[#ffd166] bg-[#13131f] border border-[#ffd166]/40">
                    {character?.equipped?.title?.name || rankTitle}
                  </span>
                </div>
                <div className="text-xs text-[#9a97ab] font-mono mt-0.5">
                  Rank LVL {xpProgress.currentLevel} • {xpProgress.xpIntoLevel} / {xpProgress.xpNeededForNext} XP
                </div>
              </div>
            </div>

            {/* Treasury Quick Vault Link */}
            <Link
              href="/merchant"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#13131f] border border-[#ffd166]/40 hover:border-[#ffd166] text-[#ffd166] transition-all hover:scale-105 active:scale-95 shadow-md self-start sm:self-auto group/vault"
            >
              <Coins className="w-4 h-4 text-[#ffd166] animate-pulse" />
              <div className="text-left">
                <div className="text-[9px] text-[#9a97ab] font-pixel uppercase">Treasury</div>
                <div className="font-pixel text-xs text-[#ffd166] leading-none">
                  <AnimatedNumber value={character?.gold || 0} />g
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#ffd166] ml-1 group-hover/vault:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Middle Body: Central Hearth Flame & Motivation */}
          <div className="py-5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2.5 text-center md:text-left flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#ff8c42]/15 border border-[#ff8c42]/40 text-[#ff8c42] text-[10px] font-pixel">
                <Flame className="w-3 h-3 text-[#ff8c42] animate-pulse" />
                <span>THE SACRED HEARTH • CLICK TO STOKE</span>
              </div>
              <h2 className="font-pixel text-lg sm:text-2xl text-[#f5f1e8] group-hover:text-[#ffd166] transition-colors leading-tight">
                KEEP YOUR FIRE ROARING
              </h2>
              <p className="text-xs sm:text-sm text-[#9a97ab] max-w-md leading-relaxed">
                {streak > 0 ? (
                  <>
                    Streak roaring for <span className="text-[#ffd166] font-bold">{streak} consecutive days</span>. Multiplier: <span className="text-[#4ade80] font-bold">+{Math.min(streak, 30)}% XP</span>.
                  </>
                ) : (
                  "No active streak today. Complete a bounty below to ignite your flame!"
                )}
              </p>
              {daysToMilestone > 0 && (
                <div className="text-xs text-[#ffd166] font-semibold flex items-center justify-center md:justify-start gap-1.5 pt-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#ffd166]" />
                  <span>{daysToMilestone} days until the {nextMilestone}-day milestone bonus!</span>
                </div>
              )}
            </div>

            {/* Hearth Flame Graphic with Path Text & Orbiting Sparks */}
            <div className="shrink-0 relative flex flex-col items-center justify-center p-2">
              <div className="relative size-36 sm:size-40 flex items-center justify-center">
                <div className="absolute inset-0 size-full pointer-events-none flex items-center justify-center -z-0">
                  <AnimatedPathText
                    path="M 80, 80 m -62, 0 a 62,62 0 1,0 124,0 a 62,62 0 1,0 -124,0"
                    viewBox="0 0 160 160"
                    text="✦ SACRED EMBER ✦ ROARING HEARTH ✦ STOKE THE FLAME ✦"
                    duration={16}
                    textClassName="text-[8px] tracking-[0.22em] fill-[#ff8c42]/70 font-pixel"
                    svgClassName="w-36 sm:w-40 h-36 sm:h-40"
                  />
                </div>

                <OrbitingCircles radius={44} duration={12} reverse speed={1.2} iconSize={20} path={true}>
                  <Zap className="w-2.5 h-2.5 text-[#ffd166]" />
                </OrbitingCircles>
                <OrbitingCircles radius={44} duration={12} delay={6} reverse speed={1.2} iconSize={20} path={false}>
                  <Sparkles className="w-2.5 h-2.5 text-[#ff8c42]" />
                </OrbitingCircles>

                <div className="relative z-10 p-3 rounded-2xl bg-[#13131f] border-2 border-[#ff8c42]/60 shadow-[0_0_30px_rgba(255,140,66,0.4)] flex items-center justify-center">
                  <Flame className="w-8 sm:w-10 h-8 sm:h-10 text-[#ff8c42] animate-pulse filter drop-shadow-[0_0_12px_rgba(255,140,66,0.6)]" />
                </div>
              </div>

              <div className="mt-1 text-center">
                <span className="font-pixel text-xs sm:text-sm text-[#ffd166] tracking-wider drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  {streak} {streak === 1 ? "DAY" : "DAYS"}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom XP Bar */}
          <div className="space-y-2 pt-3 border-t border-[#2e2e45]/80">
            <div className="flex justify-between text-xs">
              <span className="text-[#9a97ab]">Rank Progression</span>
              <span className="font-pixel text-[#ff8c42] text-xs">
                {xpProgress.progressPercentage}% to LVL {xpProgress.currentLevel + 1}
              </span>
            </div>
            <div className="h-2.5 bg-[#13131f] rounded-full overflow-hidden border border-[#2e2e45] relative">
              <div
                className="h-full bg-gradient-to-r from-[#ff8c42] via-[#ffd166] to-[#ff5f2e] rounded-full transition-all duration-500 relative shadow-[0_0_12px_rgba(255,140,66,0.5)]"
                style={{ width: `${xpProgress.progressPercentage}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-shimmer" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Hero (4 cols): 3D Realm Relics Carousel (BoxCarousel) */}
        <div className="lg:col-span-4 p-5 sm:p-6 rounded-2xl bg-[#1e1e2e]/90 backdrop-blur-xl border-2 border-[#2e2e45] hover:border-[#ffd166]/40 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="w-full flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-[#ffd166]" />
              <span className="font-pixel text-xs text-[#f5f1e8]">
                REALM RELICS
              </span>
            </div>
            <span className="text-[10px] text-[#ffd166] font-pixel">
              3D CUBE
            </span>
          </div>
          <p className="text-xs text-[#9a97ab] mb-2 leading-relaxed">
            Legendary artifacts imbued with the discipline of guild champions.
          </p>

          <div className="flex-1 flex items-center justify-center py-2">
            <BoxCarousel
              items={realmRelics}
              width={260}
              height={170}
              perspective={850}
              autoRotateInterval={4500}
            />
          </div>

          <Link
            href="/armory"
            className="w-full mt-3 py-2.5 px-3 rounded-xl bg-[#13131f] border border-[#2e2e45] hover:border-[#ff8c42]/50 text-xs text-[#ffd166] flex items-center justify-between transition-all font-semibold group"
          >
            <span>Visit The Armory</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* 3. BOTTOM DECK: Today's Bounties (8 cols) + Disciplines & Mastery (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
        {/* Left (8 cols): Today's Quests Checklist */}
        <div className="lg:col-span-8">
          <TodayQuests />
        </div>

        {/* Right (4 cols): The 5 Pillars & Sphere of Mastery */}
        <div className="lg:col-span-4 space-y-6">
          {/* Disciplines Card */}
          <MagicCard
            gradientColor="rgba(255, 140, 66, 0.18)"
            className="p-5 sm:p-6 rounded-2xl bg-[#1e1e2e]/90 backdrop-blur-xl border-2 border-[#2e2e45] hover:border-[#ff8c42]/40 space-y-4 shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-pixel text-xs text-[#f5f1e8]">DISCIPLINES</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-pixel text-[#ffd166] bg-[#ffd166]/10 border border-[#ffd166]/30">
                5 PILLARS
              </span>
            </div>

            <div className="space-y-3.5">
              {character?.disciplines?.map((ca: { id: string; xp: number; level: number; attribute: { label: string; color_hex: string } }) => (
                <div key={ca.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-[#f5f1e8]">
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

          {/* Sphere of Mastery Card */}
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
      </div>
    </div>
  );
}
