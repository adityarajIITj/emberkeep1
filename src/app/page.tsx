import Link from "next/link";
import { Flame, Shield, Sparkles, Sword, Scroll, Coins, Trophy } from "lucide-react";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative scanlines">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-[#ff8c42]/20 to-[#ff5f2e]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl w-full z-10 space-y-8 text-center">
        {/* Ember Icon / Flame */}
        <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-[#1e1e2e] border-2 border-[#ff8c42]/40 shadow-[0_0_30px_rgba(255,140,66,0.3)] animate-pulse">
          <Flame className="w-16 h-16 text-[#ff8c42]" />
        </div>

        <div className="space-y-3">
          <div className="inline-block px-3 py-1 text-xs font-pixel text-[#ffd166] bg-[#ffd166]/10 border border-[#ffd166]/30 rounded">
            LIFE RPG ADVENTURE
          </div>
          <h1 className="text-3xl md:text-5xl font-pixel text-[#f5f1e8] tracking-wide leading-tight">
            EMBERKEEP
          </h1>
          <p className="text-lg md:text-xl text-[#9a97ab] max-w-2xl mx-auto">
            Turn your to-do list into your legend. Keep your Ember roaring, conquer daily quests, and level up your character across five sacred disciplines.
          </p>
        </div>

        {/* 5 Disciplines Preview Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4">
          {[
            { name: "Body", icon: Sword, color: "text-[#ef4444]", desc: "Fitness & Strength" },
            { name: "Mind", icon: Scroll, color: "text-[#3b82f6]", desc: "Knowledge & Logic" },
            { name: "Spirit", icon: Sparkles, color: "text-[#8b5cf6]", desc: "Mindfulness & Peace" },
            { name: "Craft", icon: Shield, color: "text-[#f59e0b]", desc: "Skills & Mastery" },
            { name: "Focus", icon: Trophy, color: "text-[#10b981]", desc: "Deep Work & Chores" },
          ].map((discipline) => {
            const Icon = discipline.icon;
            return (
              <div
                key={discipline.name}
                className="notch-card p-4 rounded text-left transition-all hover:border-[#ff8c42]/50 hover:-translate-y-1"
              >
                <Icon className={`w-6 h-6 mb-2 ${discipline.color}`} />
                <div className="font-pixel text-xs text-[#f5f1e8]">{discipline.name}</div>
                <div className="text-[11px] text-[#9a97ab] mt-1">{discipline.desc}</div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/keep"
            className="px-6 py-3 bg-gradient-to-r from-[#ff8c42] to-[#ff5f2e] text-[#13131f] font-pixel text-xs rounded font-bold shadow-[0_4px_15px_rgba(255,140,66,0.4)] hover:brightness-110 transition-all active:scale-95"
          >
            Enter The Keep
          </Link>
          <div className="inline-flex items-center gap-2 px-4 py-3 bg-[#1e1e2e] border border-[#2e2e45] rounded text-xs text-[#ffd166]">
            <Coins className="w-4 h-4 text-[#ffd166]" />
            <span>Phase 0 & 1 Online</span>
          </div>
        </div>
      </div>
    </main>
  );
}
