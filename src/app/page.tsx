"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShaderBackground } from "@/components/ui/leonardo-primo-background-animato-1";
import WordListSwap from "@/components/ui/word-list-swap";
import { EyeCatchingButton_v1 } from "@/components/ui/button";
import PixelTrail from "@/components/fancy/background/pixel-trail";
import DragElements from "@/components/fancy/blocks/drag-elements";
import { Dock, DockIcon } from "@/components/ui/dock";
import { SpotlightCard } from "@/components/effects/SpotlightCard";
import { BorderBeam } from "@/components/effects/BorderBeam";
import { fireQuestConfetti } from "@/components/effects/Confetti";
import { sounds } from "@/lib/audio/retro-sound";
import Novatrix from "@/components/ui/novatrix-background";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import AnimatedPathText from "@/components/ui/text-along-path";
import {
  Flame,
  Shield,
  Sparkles,
  Sword,
  Scroll,
  Coins,
  Trophy,
  Check,
  ArrowRight,
  LayoutDashboard,
  ShoppingBag,
  History,
  User,
  Heart,
  Dumbbell,
  BookOpen,
} from "lucide-react";

export default function Home() {
  const [demoChecked, setDemoChecked] = useState(false);

  const handleDemoComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (demoChecked) return;
    setDemoChecked(true);

    const normX = Math.min(Math.max(e.clientX / window.innerWidth, 0.2), 0.8);
    const normY = Math.min(Math.max(e.clientY / window.innerHeight, 0.2), 0.8);
    fireQuestConfetti(normX, normY);
    sounds.playQuestComplete();
    sounds.playGoldChime();
  };

  const interactiveScrolls = [
    {
      title: "100 Pushups of Iron",
      category: "Body Discipline",
      xp: "+40 XP",
      gold: "+16g",
      icon: Dumbbell,
      color: "#f87171",
      rotation: -6,
      top: "12%",
      left: "8%",
    },
    {
      title: "Master TypeScript Generics",
      category: "Mind Discipline",
      xp: "+50 XP",
      gold: "+20g",
      icon: BookOpen,
      color: "#3b82f6",
      rotation: 5,
      top: "18%",
      left: "42%",
    },
    {
      title: "Sunset Zen Meditation",
      category: "Spirit Discipline",
      xp: "+25 XP",
      gold: "+10g",
      icon: Heart,
      color: "#ec4899",
      rotation: -3,
      top: "25%",
      left: "72%",
    },
    {
      title: "Forge Liquid UI & Shaders",
      category: "Craft Discipline",
      xp: "+35 XP",
      gold: "+14g",
      icon: Shield,
      color: "#f59e0b",
      rotation: 7,
      top: "55%",
      left: "15%",
    },
    {
      title: "Deep Work Sanctuary",
      category: "Focus Discipline",
      xp: "+45 XP",
      gold: "+18g",
      icon: Trophy,
      color: "#10b981",
      rotation: -5,
      top: "52%",
      left: "60%",
    },
  ];

  return (
    <main className="min-h-screen flex flex-col items-center justify-between p-4 sm:p-8 md:p-12 relative overflow-hidden bg-[#0d0d17] text-[#f5f1e8] scanlines selection:bg-[#ff8c42]/30 selection:text-[#ffd166]">
      {/* 1. 21st.dev WebGL Aurora Shader Background */}
      <div className="absolute inset-0 pointer-events-auto opacity-35 z-0">
        <ShaderBackground className="w-full h-full" />
      </div>

      {/* 2. Novatrix Silk Shader Background */}
      <div className="absolute inset-0 pointer-events-none opacity-25 z-0">
        <Novatrix color={[1.0, 0.45, 0.18]} amplitude={0.2} speed={0.7} />
      </div>

      {/* 3. Cyber Flickering Grid Matrix */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
        <FlickeringGrid
          className="size-full"
          squareSize={4}
          gridGap={8}
          color="#ff8c42"
          maxOpacity={0.35}
          flickerChance={0.12}
        />
      </div>

      {/* 4. Interactive Pixel Trail on Cursor */}
      <PixelTrail pixelSize={22} fadeDuration={500} />

      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-br from-[#ff8c42]/20 via-[#ffd166]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Top Guildhall Navigation */}
      <header className="w-full max-w-6xl flex items-center justify-between z-20 pb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#1e1e2e]/90 backdrop-blur-md border border-[#ff8c42]/50 shadow-[0_0_15px_rgba(255,140,66,0.3)]">
            <Flame className="w-5 h-5 text-[#ff8c42] animate-pulse" />
          </div>
          <span className="font-pixel text-sm sm:text-base text-[#f5f1e8] tracking-widest">
            EMBERKEEP
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl text-[#9a97ab] hover:text-[#f5f1e8] hover:bg-[#1e1e2e]/80 backdrop-blur-md border border-transparent hover:border-[#2e2e45] transition-all font-semibold"
          >
            Sign In
          </Link>
          <Link href="/signup">
            <EyeCatchingButton_v1>
              <span>Begin Quest</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </EyeCatchingButton_v1>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-4xl w-full z-10 space-y-7 text-center my-auto py-6">
        {/* Animated Central Hearth Emblem with BorderBeam and Circling Path Text */}
        <div className="relative inline-block">
          <div className="absolute -inset-8 flex items-center justify-center pointer-events-none z-10">
            <AnimatedPathText
              path="M 80, 80 m -64, 0 a 64,64 0 1,0 128,0 a 64,64 0 1,0 -128,0"
              viewBox="0 0 160 160"
              text="✦ EMBERKEEP ✦ TURN TO-DO INTO LEGEND ✦"
              duration={16}
              textClassName="text-[8px] tracking-[0.22em] fill-[#ff8c42]/80 font-pixel"
              svgClassName="w-44 h-44"
            />
          </div>

          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#1e1e2e]/90 backdrop-blur-xl border-2 border-[#ff8c42]/50 shadow-[0_0_50px_rgba(255,140,66,0.3)] flex items-center justify-center mx-auto overflow-hidden relative">
            <BorderBeam size={200} duration={6} colorFrom="#ff8c42" colorTo="#ffd166" />
            <Flame className="w-14 h-14 text-[#ff8c42] animate-pulse relative z-10" />
          </div>
        </div>

        {/* Cuicui WordListSwap Dynamic Headline */}
        <div className="space-y-4">
          <div className="inline-block px-3 py-1 text-[11px] font-pixel text-[#ffd166] bg-[#ffd166]/10 border border-[#ffd166]/30 rounded-lg">
            THE DEFINITIVE LIFE RPG
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-2xl sm:text-4xl md:text-5xl font-pixel text-[#f5f1e8] tracking-wide leading-tight max-w-3xl mx-auto">
            <span>EMBERKEEP IS</span>
            <WordListSwap
              texts={[
                "YOUR LEGEND ⚔️",
                "AN IMMUTABLE HEARTH",
                "REAL PRODUCTIVITY",
                "GAMIFIED HABITS ✽",
                "ASCENSION POWER",
              ]}
              mainClassName="text-[#13131f] px-3 py-1 bg-gradient-to-r from-[#ffd166] via-[#ff8c42] to-[#ff5f2e] shadow-lg rounded-xl"
            />
          </div>

          <p className="text-sm sm:text-base text-[#9a97ab] max-w-2xl mx-auto leading-relaxed pt-1">
            Turn your daily to-do list into a thriving character. Keep your Ember roaring, conquer bounties across five sacred disciplines, and equip legendary cosmetics from an ACID-logged vault.
          </p>
        </div>

        {/* Interactive "Try It Live" Demo Bounty */}
        <div className="max-w-md mx-auto notch-card p-4 rounded-xl bg-[#1e1e2e]/85 backdrop-blur-xl border-2 border-[#ffd166]/30 shadow-2xl text-left space-y-2 relative">
          <div className="flex items-center justify-between text-[10px] font-pixel text-[#ffd166]">
            <span>TRY IT LIVE • NO LOGIN REQUIRED</span>
            <Sparkles className="w-3.5 h-3.5 text-[#ffd166] animate-spin" />
          </div>

          <div
            onClick={handleDemoComplete}
            className={`p-3 rounded-lg border-2 flex items-center justify-between gap-3 cursor-pointer transition-all ${
              demoChecked
                ? "bg-[#4ade80]/20 border-[#4ade80] shadow-[0_0_20px_rgba(74,222,128,0.3)]"
                : "bg-[#13131f]/90 border-[#2e2e45] hover:border-[#ff8c42]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                  demoChecked
                    ? "bg-[#4ade80] border-[#4ade80] text-[#13131f]"
                    : "border-[#ffd166] bg-[#1e1e2e]"
                }`}
              >
                {demoChecked && <Check className="w-4 h-4 stroke-[3]" />}
              </div>
              <div>
                <h4 className={`text-xs font-semibold ${demoChecked ? "line-through text-[#9a97ab]" : "text-[#f5f1e8]"}`}>
                  Kindle the Hearth: Check this first bounty!
                </h4>
                <span className="text-[10px] text-[#9a97ab]">Mind Discipline • Easy Bounty</span>
              </div>
            </div>

            <span className="font-pixel text-[10px] text-[#ffd166] shrink-0">
              {demoChecked ? "+10 XP / +4g" : "+10 XP"}
            </span>
          </div>
        </div>

        {/* 5 Disciplines Spotlight Cards Preview */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 text-left">
          {[
            { name: "Body", icon: Sword, color: "#ef4444", desc: "Endurance & Workouts" },
            { name: "Mind", icon: Scroll, color: "#3b82f6", desc: "Intellect & Coding" },
            { name: "Spirit", icon: Sparkles, color: "#8b5cf6", desc: "Mindfulness & Peace" },
            { name: "Craft", icon: Shield, color: "#f59e0b", desc: "Creation & Mastery" },
            { name: "Focus", icon: Trophy, color: "#10b981", desc: "Deep Work & Chores" },
          ].map((d) => {
            const Icon = d.icon;
            return (
              <SpotlightCard
                key={d.name}
                spotlightColor={`${d.color}25`}
                className="p-4 rounded-xl border-2 border-[#2e2e45] bg-[#1e1e2e]/70 backdrop-blur-md hover:border-[#ff8c42]/50 transition-all group"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${d.color}20`, color: d.color }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="font-pixel text-xs text-[#f5f1e8]">{d.name}</div>
                <div className="text-[11px] text-[#9a97ab] mt-1 line-clamp-2">{d.desc}</div>
              </SpotlightCard>
            );
          })}
        </div>

        {/* Interactive Draggable Quest Parchment Sandbox */}
        <div className="pt-6">
          <div className="text-left mb-2 flex items-center justify-between">
            <span className="text-[11px] font-pixel text-[#ffd166]">
              ⚔️ DRAGGABLE REALM BOUNTIES • TOSS THEM AROUND
            </span>
            <span className="text-[10px] text-[#9a97ab]">Drag to inspect</span>
          </div>

          <DragElements className="w-full h-64 rounded-2xl bg-[#13131f]/80 backdrop-blur-md border-2 border-[#2e2e45] p-4 relative shadow-inner">
            {interactiveScrolls.map((scroll, i) => {
              const Icon = scroll.icon;
              return (
                <div
                  key={i}
                  style={{
                    top: scroll.top,
                    left: scroll.left,
                    transform: `rotate(${scroll.rotation}deg)`,
                  }}
                  className="p-3.5 rounded-xl bg-gradient-to-br from-[#1e1e2e] to-[#151522] border-2 border-[#ff8c42]/30 shadow-2xl w-48 sm:w-56 cursor-grab text-left space-y-1.5 active:cursor-grabbing hover:border-[#ffd166]"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="p-1 rounded-md"
                      style={{ backgroundColor: `${scroll.color}25`, color: scroll.color }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-pixel text-[9px] text-[#ffd166]">
                      {scroll.xp}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-[#f5f1e8] leading-tight line-clamp-1">
                    {scroll.title}
                  </div>
                  <div className="text-[10px] text-[#9a97ab]">
                    {scroll.category} • {scroll.gold}
                  </div>
                </div>
              );
            })}
          </DragElements>
        </div>
      </div>

      {/* Floating MacOS Style Dock (§9 & MagicUI) */}
      <div className="w-full max-w-md pt-4 pb-2 z-30">
        <Dock className="border-[#ff8c42]/30 bg-[#1e1e2e]/90">
          {[
            { label: "The Keep", href: "/keep", icon: LayoutDashboard },
            { label: "Quests", href: "/quests", icon: Scroll },
            { label: "Character", href: "/character", icon: User },
            { label: "Armory", href: "/armory", icon: Shield },
            { label: "Merchant", href: "/merchant", icon: ShoppingBag },
            { label: "Chronicle", href: "/chronicle", icon: History },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <DockIcon key={item.label}>
                <Link
                  href={item.href}
                  className="flex flex-col items-center justify-center w-full h-full text-[#9a97ab] hover:text-[#ffd166] transition-colors"
                  title={item.label}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              </DockIcon>
            );
          })}
        </Dock>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-6xl flex items-center justify-between text-xs text-[#9a97ab] border-t border-[#2e2e45] pt-4 z-10">
        <div>Built for the Web Hackathon with Next.js, Supabase, Prisma & Recharts.</div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hover:text-[#ffd166] transition-colors">
            Login
          </Link>
          <Link href="/signup" className="hover:text-[#ffd166] transition-colors">
            Sign Up
          </Link>
          <a
            href="https://github.com/themadjocker/Web_Hackathon"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#ff8c42] transition-colors font-semibold"
          >
            GitHub
          </a>
        </div>
      </footer>
    </main>
  );
}
