"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Meteors } from "@/components/effects/Meteors";
import { BorderBeam } from "@/components/effects/BorderBeam";
import { SpotlightCard } from "@/components/effects/SpotlightCard";
import { GsapTextReveal } from "@/components/animations/GsapTextReveal";
import { fireQuestConfetti } from "@/components/effects/Confetti";
import { sounds } from "@/lib/audio/retro-sound";
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
  Crown,
  Play,
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

  return (
    <main className="min-h-screen flex flex-col items-center justify-between p-6 md:p-12 relative overflow-hidden bg-[#13131f] text-[#f5f1e8] scanlines">
      {/* 21st.dev Meteors Falling Star Shower Effect */}
      <Meteors number={25} />

      {/* Background ambient radial gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#ff8c42]/15 via-[#ffd166]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="w-full max-w-6xl flex items-center justify-between z-20 pb-8">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#1e1e2e] border border-[#ff8c42]/50 shadow-[0_0_12px_rgba(255,140,66,0.3)]">
            <Flame className="w-5 h-5 text-[#ff8c42] animate-pulse" />
          </div>
          <span className="font-pixel text-sm sm:text-base text-[#f5f1e8] tracking-widest">
            EMBERKEEP
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <Link
            href="/login"
            className="px-3.5 py-1.5 rounded text-[#9a97ab] hover:text-[#f5f1e8] hover:bg-[#1e1e2e] transition-colors font-semibold"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 rounded bg-gradient-to-r from-[#ff8c42] to-[#ff5f2e] text-[#13131f] font-pixel text-[11px] font-bold hover:brightness-110 active:scale-95 transition-all shadow-md"
          >
            Begin Quest
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-4xl w-full z-10 space-y-8 text-center my-auto py-8">
        {/* Animated Central Hearth Emblem with BorderBeam */}
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-3xl bg-[#1e1e2e] border-2 border-[#ff8c42]/40 shadow-[0_0_40px_rgba(255,140,66,0.25)] flex items-center justify-center mx-auto overflow-hidden relative">
            <BorderBeam size={180} duration={6} colorFrom="#ff8c42" colorTo="#ffd166" />
            <Flame className="w-12 h-12 text-[#ff8c42] animate-pulse relative z-10" />
          </div>
        </div>

        {/* GSAP Staggered Title Reveal */}
        <div className="space-y-3">
          <div className="inline-block px-3 py-1 text-[11px] font-pixel text-[#ffd166] bg-[#ffd166]/10 border border-[#ffd166]/30 rounded">
            THE DEFINITIVE LIFE RPG
          </div>
          <GsapTextReveal
            text="TURN YOUR TO-DO LIST INTO YOUR LEGEND"
            className="text-2xl sm:text-4xl md:text-5xl font-pixel text-[#f5f1e8] tracking-wide leading-tight max-w-3xl mx-auto"
          />
          <p className="text-sm sm:text-base text-[#9a97ab] max-w-2xl mx-auto leading-relaxed pt-2">
            The Keep stays warm only if your Ember streak is kept roaring. Complete real-world bounties, earn Gold for cosmetic relics, and ascend your character across five sacred disciplines.
          </p>
        </div>

        {/* Interactive "Try It Live" Demo Bounty */}
        <div className="max-w-md mx-auto notch-card p-4 rounded-xl bg-gradient-to-r from-[#1e1e2e] to-[#171727] border-2 border-[#ffd166]/30 shadow-xl text-left space-y-2 relative">
          <div className="flex items-center justify-between text-[10px] font-pixel text-[#ffd166]">
            <span>TRY IT LIVE • NO LOGIN REQUIRED</span>
            <Sparkles className="w-3.5 h-3.5 text-[#ffd166] animate-spin" />
          </div>

          <div
            onClick={handleDemoComplete}
            className={`p-3 rounded-lg border-2 flex items-center justify-between gap-3 cursor-pointer transition-all ${
              demoChecked
                ? "bg-[#4ade80]/15 border-[#4ade80] shadow-[0_0_15px_rgba(74,222,128,0.3)]"
                : "bg-[#13131f] border-[#2e2e45] hover:border-[#ff8c42]"
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
                <span className="text-[10px] text-[#9a97ab]">Mind Discipline • Easy</span>
              </div>
            </div>

            <span className="font-pixel text-[10px] text-[#ffd166] shrink-0">
              {demoChecked ? "+10 XP / +4g" : "+10 XP"}
            </span>
          </div>
        </div>

        {/* Call to Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/signup"
            className="px-7 py-3.5 bg-gradient-to-r from-[#ffd166] via-[#ff8c42] to-[#ff5f2e] text-[#13131f] font-pixel text-xs rounded-xl font-bold shadow-[0_4px_25px_rgba(255,140,66,0.4)] hover:brightness-110 transition-all active:scale-95 flex items-center gap-2"
          >
            <span>Ignite Your Ember</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/keep"
            className="px-5 py-3.5 bg-[#1e1e2e] border-2 border-[#2e2e45] hover:border-[#ffd166]/50 rounded-xl text-xs text-[#f5f1e8] font-semibold transition-all hover:bg-[#13131f]"
          >
            Enter The Keep
          </Link>
        </div>

        {/* 5 Disciplines Spotlight Cards Preview */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6 text-left">
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
                className="p-4 rounded-xl border-2 border-[#2e2e45] hover:border-[#ff8c42]/50 transition-all group"
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
      </div>

      {/* Footer */}
      <footer className="w-full max-w-6xl flex items-center justify-between text-xs text-[#9a97ab] border-t border-[#2e2e45] pt-6 z-10">
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
