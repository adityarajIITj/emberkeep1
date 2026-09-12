"use client";

import React, { useEffect } from "react";
import { fireLevelUpConfetti } from "./Confetti";
import { Crown, Sparkles, Coins, ArrowRight, Flame } from "lucide-react";
import { getRankTitle } from "@/lib/server/rpg-engine";

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  previousLevel: number;
  newLevel: number;
  bonusGold: number;
}

export function LevelUpModal({
  isOpen,
  onClose,
  previousLevel,
  newLevel,
  bonusGold,
}: LevelUpModalProps) {
  useEffect(() => {
    if (isOpen) {
      fireLevelUpConfetti();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const newRankTitle = getRankTitle(newLevel);
  const oldRankTitle = getRankTitle(previousLevel);
  const unlockedNewTitle = newRankTitle !== oldRankTitle;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
    >
      <div
        className="w-full max-w-md notch-card p-8 rounded-2xl bg-gradient-to-b from-[#1e1e2e] to-[#13131f] border-2 border-[#ffd166] shadow-[0_0_50px_rgba(255,209,102,0.3)] text-center relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Sunburst Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-[#ffd166]/20 via-[#ff8c42]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Crown Icon with Golden Particles */}
        <div className="relative inline-block mb-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#ffd166] to-[#ff8c42] p-0.5 shadow-2xl flex items-center justify-center mx-auto">
            <div className="w-full h-full rounded-2xl bg-[#13131f] flex items-center justify-center">
              <Crown className="w-10 h-10 text-[#ffd166] animate-bounce" />
            </div>
          </div>
          <Sparkles className="w-5 h-5 text-[#ffd166] absolute -top-2 -right-2 animate-spin" />
        </div>

        {/* Level Up Announcement */}
        <div className="space-y-1 mb-6 relative z-10">
          <div className="text-[11px] font-pixel text-[#ff8c42] tracking-widest uppercase">
            Ascension Achieved
          </div>
          <h2 className="text-2xl sm:text-3xl font-pixel text-[#f5f1e8] tracking-wider">
            LEVEL UP!
          </h2>
          <p className="text-xs text-[#9a97ab] mt-1">
            Your deeds echo in the annals of Emberkeep
          </p>
        </div>

        {/* Level Progression Indicator */}
        <div className="flex items-center justify-center gap-4 py-3 px-4 rounded-xl bg-[#13131f] border border-[#2e2e45] mb-6 relative z-10">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-[#9a97ab]">Previous</span>
            <span className="font-pixel text-sm text-[#9a97ab]">LVL {previousLevel}</span>
          </div>

          <ArrowRight className="w-5 h-5 text-[#ffd166]" />

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-[#ffd166]">New Rank</span>
            <span className="font-pixel text-lg text-[#ffd166]">LVL {newLevel}</span>
          </div>
        </div>

        {/* Rewards Box */}
        <div className="space-y-2 mb-6 text-left relative z-10">
          <div className="p-3 rounded-lg bg-[#13131f] border border-[#2e2e45] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#ffd166]" />
              <span className="text-xs text-[#f5f1e8]">Ascension Gold Bonus</span>
            </div>
            <span className="font-pixel text-xs text-[#ffd166]">+{bonusGold}g</span>
          </div>

          {unlockedNewTitle && (
            <div className="p-3 rounded-lg bg-[#ffd166]/10 border border-[#ffd166]/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-[#ffd166]" />
                <span className="text-xs text-[#ffd166] font-semibold">New Rank Title</span>
              </div>
              <span className="font-pixel text-xs text-[#f5f1e8]">{newRankTitle}</span>
            </div>
          )}
        </div>

        {/* Claim CTA */}
        <button
          onClick={onClose}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#ffd166] to-[#ff8c42] text-[#13131f] font-pixel text-xs font-bold shadow-[0_4px_20px_rgba(255,209,102,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer relative z-10"
        >
          Claim Glory & Continue
        </button>
      </div>
    </div>
  );
}
