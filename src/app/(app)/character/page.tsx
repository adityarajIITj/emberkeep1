"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { DisciplineRadar } from "@/components/character/DisciplineRadar";
import { StreakHeatmap } from "@/components/character/StreakHeatmap";
import { xpProgressInLevel, getRankTitle } from "@/lib/server/rpg-engine";
import { MagicCard } from "@/components/ui/magic-card";
import { Particles } from "@/components/ui/particles";
import { MorphingText } from "@/components/ui/morphing-text";
import { Highlighter } from "@/components/ui/highlighter";
import { OrbitingCircles } from "@/components/ui/orbiting-circles";
import { IconCloud } from "@/components/ui/icon-cloud";
import {
  User,
  Crown,
  Shield,
  Award,
  Coins,
  Flame,
  CheckCircle2,
  Sparkles,
  Sword,
  Brain,
  Hammer,
  Target,
  Zap,
  BookOpen,
  Trophy,
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

  // Tech / Discipline skills for 3D IconCloud
  const disciplineCloudIcons = [
    <Sword key="body" className="w-5 h-5 text-[#ef4444]" />,
    <Brain key="mind" className="w-5 h-5 text-[#3b82f6]" />,
    <Sparkles key="spirit" className="w-5 h-5 text-[#ec4899]" />,
    <Hammer key="craft" className="w-5 h-5 text-[#f59e0b]" />,
    <Target key="focus" className="w-5 h-5 text-[#10b981]" />,
    <Crown key="crown" className="w-5 h-5 text-[#ffd166]" />,
    <Flame key="flame" className="w-5 h-5 text-[#ff8c42]" />,
    <Shield key="shield" className="w-5 h-5 text-[#60a5fa]" />,
    <Trophy key="trophy" className="w-5 h-5 text-[#fbbf24]" />,
    <Zap key="zap" className="w-5 h-5 text-[#38bdf8]" />,
    <Coins key="coins" className="w-5 h-5 text-[#eab308]" />,
    <BookOpen key="book" className="w-5 h-5 text-[#a855f7]" />,
  ];

  return (
    <div className="space-y-6 relative animate-fadeIn">
      {/* Ambient Cosmic Dust Particles */}
      <Particles className="opacity-30" quantity={35} color="#8b5cf6" />

      {/* Header with Morphing Philosophy Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#2e2e45] relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-[#ffd166] font-pixel mb-1">
            <User className="w-3.5 h-3.5 text-[#ffd166]" />
            <span>ADVENTURER DOSSIER</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-pixel text-[#f5f1e8] flex items-center gap-2">
            <span>CHARACTER SHEET</span>
          </h1>
          <p className="text-xs text-[#9a97ab] mt-1 flex items-center gap-1.5 flex-wrap">
            <span>Balanced harmony across</span>
            <Highlighter action="underline" color="#8b5cf6">
              Five Sacred Disciplines
            </Highlighter>
            <span>and lifetime guild progression</span>
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-[#1e1e2e]/80 border border-[#8b5cf6]/30 backdrop-blur-md">
          <div className="text-[10px] font-pixel text-[#ffd166] uppercase mb-0.5">
            MINDSET & ASCENSION
          </div>
          <MorphingText
            texts={[
              "PHYSICAL VESSEL & VITALITY",
              "COGNITIVE ACUITY & WISDOM",
              "INNER STILLNESS & SERENITY",
              "CREATIVE MASTERY & CODE",
              "UNWAVERING DEEP FOCUS",
            ]}
            className="text-xs font-pixel text-[#f5f1e8]"
          />
        </div>
      </div>

      {/* Bento Grid Top Row: Profile Card & Lifetime Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Profile MagicCard (8 cols) */}
        <MagicCard
          gradientColor="rgba(139, 92, 246, 0.22)"
          className="lg:col-span-8 p-6 rounded-2xl bg-[#1e1e2e]/90 border-2 border-[#2e2e45] hover:border-[#8b5cf6]/50 flex flex-col justify-between gap-6 shadow-xl transition-all"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar with Planetary Orbiting Ascension Circles */}
              <div className="relative flex items-center justify-center size-20 shrink-0">
                <OrbitingCircles radius={36} duration={14} reverse speed={1} iconSize={20} path={true}>
                  <Sparkles className="w-2.5 h-2.5 text-[#ffd166]" />
                </OrbitingCircles>
                <OrbitingCircles radius={36} duration={14} delay={7} reverse speed={1} iconSize={20} path={false}>
                  <Flame className="w-2.5 h-2.5 text-[#ff8c42]" />
                </OrbitingCircles>

                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ff8c42] to-[#8b5cf6] p-0.5 shadow-xl flex items-center justify-center font-pixel text-2xl text-[#13131f] z-10">
                  {character?.user?.display_name?.[0]?.toUpperCase() || "A"}
                </div>
              </div>

              <div>
                <h2 className="font-pixel text-base sm:text-lg text-[#f5f1e8]">
                  {character?.user?.display_name || "Adventurer"}
                </h2>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-pixel text-[#ffd166] bg-[#13131f] border border-[#ffd166]/40 flex items-center gap-1 shadow-sm">
                    <Crown className="w-3 h-3 text-[#ffd166]" />
                    {character?.equipped?.title?.name || rankTitle}
                  </span>
                  <Highlighter action="box" color="#ff8c42">
                    Rank LVL {character?.level || 1}
                  </Highlighter>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-[#13131f] border border-[#ffd166]/30 flex items-center gap-1.5 text-xs shadow-[0_0_12px_rgba(255,209,102,0.15)]">
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
                className="h-full bg-gradient-to-r from-[#ff8c42] via-[#ffd166] to-[#8b5cf6] rounded-full transition-all duration-500 relative shadow-[0_0_10px_rgba(255,140,66,0.5)]"
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
        </MagicCard>

        {/* Lifetime Badges MagicCard (4 cols) */}
        <MagicCard
          gradientColor="rgba(255, 209, 102, 0.18)"
          className="lg:col-span-4 p-6 rounded-2xl bg-[#1e1e2e]/90 border-2 border-[#2e2e45] hover:border-[#ffd166]/50 flex flex-col justify-between gap-3 shadow-xl transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="font-pixel text-xs text-[#f5f1e8]">LIFETIME STATS</span>
            <Trophy className="w-4 h-4 text-[#ffd166]" />
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-[#13131f] border border-[#2e2e45] flex items-center justify-between hover:border-[#ff8c42]/40 transition-colors">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#ff8c42]" />
                <span className="text-xs text-[#9a97ab]">Current Streak</span>
              </div>
              <Highlighter action="brush" color="#ff8c42">
                {character?.current_streak || 0}d
              </Highlighter>
            </div>

            <div className="p-3 rounded-xl bg-[#13131f] border border-[#2e2e45] flex items-center justify-between hover:border-[#ffd166]/40 transition-colors">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#ffd166]" />
                <span className="text-xs text-[#9a97ab]">Longest Streak</span>
              </div>
              <Highlighter action="brush" color="#ffd166">
                {character?.longest_streak || 0}d
              </Highlighter>
            </div>

            <div className="p-3 rounded-xl bg-[#13131f] border border-[#2e2e45] flex items-center justify-between hover:border-[#4ade80]/40 transition-colors">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#4ade80]" />
                <span className="text-xs text-[#9a97ab]">Equipped Frame</span>
              </div>
              <span className="text-xs text-[#f5f1e8] font-semibold">
                {character?.equipped?.frame?.name || "Standard Crest"}
              </span>
            </div>
          </div>
        </MagicCard>
      </div>

      {/* Middle Row: 5-Discipline Radar Chart & 3D Mastery Cloud + Discipline Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
        {/* Radar Chart + 3D Skill Cloud (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="notch-card p-6 rounded-2xl bg-[#1e1e2e]/90 border-2 border-[#2e2e45] shadow-xl space-y-4">
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

          {/* Interactive 3D Sphere of Runes & Attributes */}
          <MagicCard
            gradientColor="rgba(59, 130, 246, 0.2)"
            className="p-5 rounded-2xl bg-[#1e1e2e]/90 border-2 border-[#2e2e45] hover:border-[#3b82f6]/40 shadow-xl flex flex-col items-center justify-center relative overflow-hidden"
          >
            <div className="w-full flex items-center justify-between mb-2">
              <span className="font-pixel text-xs text-[#f5f1e8]">
                RUNIC SPHERE OF MASTERY
              </span>
              <span className="text-[10px] text-[#ffd166] font-mono">
                INTERACTIVE 3D
              </span>
            </div>

            <div className="py-2">
              <IconCloud
                radius={90}
                icons={disciplineCloudIcons}
                autoRotateSpeed={0.005}
              />
            </div>

            <p className="text-[11px] text-[#9a97ab] text-center mt-2 max-w-sm">
              Spin the runic sphere to align your inner elemental energies across all five sacred paths.
            </p>
          </MagicCard>
        </div>

        {/* 5 Disciplines Detailed List with Elemental MagicCards (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          {character?.disciplines?.map((ca: { id: string; xp: number; level: number; attribute: { key: string; label: string; description: string; color_hex: string } }) => {
            const discProgress = xpProgressInLevel(ca.xp);
            return (
              <MagicCard
                key={ca.id}
                gradientColor={`${ca.attribute.color_hex}33`}
                className="p-4 rounded-xl bg-[#1e1e2e]/90 border-2 border-[#2e2e45] hover:border-[#ff8c42]/40 space-y-2 shadow-lg transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-[0_0_10px_currentColor]"
                      style={{
                        backgroundColor: ca.attribute.color_hex,
                        color: ca.attribute.color_hex,
                      }}
                    />
                    <span className="font-pixel text-xs text-[#f5f1e8]">
                      {ca.attribute.label}
                    </span>
                    <span className="text-[10px] text-[#9a97ab] hidden sm:inline">
                      ({ca.attribute.description})
                    </span>
                  </div>

                  <span
                    className="text-[10px] font-pixel px-2 py-0.5 rounded border bg-[#13131f] shadow-sm"
                    style={{
                      color: ca.attribute.color_hex,
                      borderColor: `${ca.attribute.color_hex}66`,
                    }}
                  >
                    LVL {ca.level}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="h-2 bg-[#13131f] rounded-full overflow-hidden border border-[#2e2e45]">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${discProgress.progressPercentage}%`,
                        backgroundColor: ca.attribute.color_hex,
                        boxShadow: `0 0 10px ${ca.attribute.color_hex}`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#9a97ab]">
                    <span>{ca.xp.toLocaleString()} XP Total</span>
                    <span>{discProgress.progressPercentage}% to LVL {ca.level + 1}</span>
                  </div>
                </div>
              </MagicCard>
            );
          })}
        </div>
      </div>

      {/* Bottom Row: 35-Day Streak Activity Heatmap */}
      <div className="notch-card p-6 rounded-2xl bg-[#1e1e2e]/90 border-2 border-[#2e2e45] shadow-xl relative z-10">
        <StreakHeatmap
          currentStreak={character?.current_streak || 0}
          longestStreak={character?.longest_streak || 0}
          lastActivityDate={character?.last_activity_date}
        />
      </div>
    </div>
  );
}
