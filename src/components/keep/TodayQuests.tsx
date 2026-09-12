"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fireQuestConfetti } from "@/components/effects/Confetti";
import { LevelUpModal } from "@/components/effects/LevelUpModal";
import { sounds } from "@/lib/audio/retro-sound";
import {
  Check,
  Award,
  Sparkles,
  Repeat,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { QuestItem } from "@/components/quest/QuestCard";
import { SpotlightCard } from "@/components/effects/SpotlightCard";

export function TodayQuests() {
  const queryClient = useQueryClient();

  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completedQuests, setCompletedQuests] = useState<Record<string, { xp: number; gold: number }>>({});
  const [levelUpData, setLevelUpData] = useState<{
    isOpen: boolean;
    previousLevel: number;
    newLevel: number;
    bonusGold: number;
  }>({
    isOpen: false,
    previousLevel: 1,
    newLevel: 1,
    bonusGold: 0,
  });

  const { data: quests = [], isLoading } = useQuery<QuestItem[]>({
    queryKey: ["quests"],
    queryFn: async () => {
      const res = await fetch("/api/quests");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const completeMutation = useMutation({
    mutationFn: async ({
      questId,
      clientX,
      clientY,
    }: {
      questId: string;
      clientX: number;
      clientY: number;
    }) => {
      setCompletingId(questId);

      const res = await fetch(`/api/quests/${questId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idempotencyKey: crypto.randomUUID() }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "Failed to complete quest");
      }

      const data = await res.json();
      return { data, clientX, clientY, questId };
    },
    onSuccess: ({ data, clientX, clientY, questId }) => {
      // 1. Particle Confetti explosion from click coordinates (§9)
      const normX = Math.min(Math.max(clientX / window.innerWidth, 0.1), 0.9);
      const normY = Math.min(Math.max(clientY / window.innerHeight, 0.1), 0.9);
      fireQuestConfetti(normX, normY);

      // Play retro audio chime!
      sounds.playQuestComplete();

      // 2. Mark completed for optimistic UI badge
      setCompletedQuests((prev) => ({
        ...prev,
        [questId]: { xp: data.rewards.xp, gold: data.rewards.gold },
      }));

      // 3. Invalidate caches for instant HUD updates
      queryClient.invalidateQueries({ queryKey: ["quests"] });
      queryClient.invalidateQueries({ queryKey: ["character"] });

      // 4. Trigger level up modal if leveled up!
      if (data.rewards.didLevelUp) {
        setLevelUpData({
          isOpen: true,
          previousLevel: data.rewards.previousLevel,
          newLevel: data.rewards.newLevel,
          bonusGold: data.rewards.levelUpBonusGold,
        });
      }
    },
    onSettled: () => {
      setCompletingId(null);
    },
  });

  const handleComplete = (
    e: React.MouseEvent,
    quest: QuestItem
  ) => {
    e.stopPropagation();
    if (completingId || completedQuests[quest.id]) return;

    completeMutation.mutate({
      questId: quest.id,
      clientX: e.clientX,
      clientY: e.clientY,
    });
  };

  const DIFFICULTY_XP: Record<string, number> = {
    EASY: 10,
    MEDIUM: 25,
    HARD: 50,
    EPIC: 100,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-pixel text-sm sm:text-base text-[#f5f1e8] tracking-wide">
            TODAY'S BOUNTIES
          </h2>
          <p className="text-xs text-[#9a97ab] mt-0.5">
            Complete daily objectives to maintain your Ember streak
          </p>
        </div>

        <Link
          href="/quests"
          className="inline-flex items-center gap-1 text-xs text-[#ff8c42] hover:text-[#ffd166] transition-colors font-semibold"
        >
          <span>All Quests</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2.5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="notch-card p-4 rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] h-16 animate-pulse"
            />
          ))}
        </div>
      ) : quests.length === 0 ? (
        <div className="notch-card p-8 text-center rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] space-y-3">
          <Layers className="w-8 h-8 text-[#ffd166] mx-auto opacity-60" />
          <h3 className="font-pixel text-xs text-[#f5f1e8]">ALL BOUNTIES CONQUERED!</h3>
          <p className="text-xs text-[#9a97ab] max-w-sm mx-auto">
            Your Ember burns with pride. Post a new bounty from the Quest Board to keep advancing.
          </p>
          <Link
            href="/quests"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-gradient-to-r from-[#ff8c42] to-[#ff5f2e] text-[#13131f] font-pixel text-xs font-bold"
          >
            Post New Bounty
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {quests.map((quest) => {
            const isFinished = Boolean(completedQuests[quest.id]);
            const isThisCompleting = completingId === quest.id;
            const reward = completedQuests[quest.id];

            return (
              <SpotlightCard
                key={quest.id}
                spotlightColor={`${quest.category.attribute.color_hex}25`}
                className={`p-3.5 sm:p-4 rounded-xl bg-[#1e1e2e]/90 backdrop-blur-md border-2 flex items-center justify-between gap-3 relative overflow-hidden transition-all ${
                  isFinished
                    ? "border-[#4ade80]/50 bg-[#4ade80]/5 opacity-70"
                    : "border-[#2e2e45] hover:border-[#ff8c42]/60"
                }`}
              >
                {/* Left: Checkbox & Quest Meta */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Interactive Checkbox Button (§9) */}
                  <button
                    onClick={(e) => handleComplete(e, quest)}
                    disabled={isFinished || isThisCompleting}
                    aria-label={`Complete quest ${quest.title}`}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                      isFinished
                        ? "bg-[#4ade80] border-[#4ade80] text-[#13131f]"
                        : "border-[#2e2e45] hover:border-[#ff8c42] bg-[#13131f] hover:scale-105 active:scale-95"
                    }`}
                  >
                    {isFinished && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  {/* Title & Category details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="w-2 h-2 rounded-full shrink-0 shadow-[0_0_8px_currentColor]"
                        style={{ backgroundColor: quest.category.attribute.color_hex, color: quest.category.attribute.color_hex }}
                      />
                      <span className="text-[10px] font-semibold text-[#9a97ab] uppercase truncate">
                        {quest.category.attribute.label} • {quest.category.label}
                      </span>
                    </div>

                    <h4
                      className={`text-xs sm:text-sm font-semibold truncate ${
                        isFinished ? "line-through text-[#9a97ab]" : "text-[#f5f1e8]"
                      }`}
                    >
                      {quest.title}
                    </h4>
                  </div>
                </div>

                {/* Right: Reward Badges or Floating Rewards */}
                <div className="flex items-center gap-2 shrink-0">
                  {isFinished ? (
                    <div className="px-2 py-1 rounded bg-[#4ade80]/20 border border-[#4ade80]/50 text-[10px] font-pixel text-[#4ade80] animate-bounce">
                      +{reward?.xp} XP / +{reward?.gold}g
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[10px] font-pixel">
                      <span className="px-2 py-0.5 rounded bg-[#13131f] border border-[#2e2e45] text-[#ffd166]">
                        +{DIFFICULTY_XP[quest.difficulty] || 10} XP
                      </span>
                      <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-[#13131f] border border-[#2e2e45] text-[#9a97ab]">
                        {quest.recurrence === "DAILY" ? "DAILY" : "ONE-TIME"}
                      </span>
                    </div>
                  )}
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      )}

      {/* Level Up Celebration Modal */}
      <LevelUpModal
        isOpen={levelUpData.isOpen}
        onClose={() => setLevelUpData((prev) => ({ ...prev, isOpen: false }))}
        previousLevel={levelUpData.previousLevel}
        newLevel={levelUpData.newLevel}
        bonusGold={levelUpData.bonusGold}
      />
    </div>
  );
}
