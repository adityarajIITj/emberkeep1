"use client";

import React, { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Filter,
  Scroll,
  AlertCircle,
  RefreshCw,
  Layers,
  Flame,
  Sword,
  Sparkles,
  Shield,
  Trophy,
  Coins,
  Zap,
} from "lucide-react";
import { QuestCard, QuestItem } from "@/components/quest/QuestCard";
import { QuestModal, CategoryOption } from "@/components/quest/QuestModal";
import { OrbitingCircles } from "@/components/ui/orbiting-circles";
import { Particles } from "@/components/ui/particles";
import { MorphingText } from "@/components/ui/morphing-text";
import { Highlighter } from "@/components/ui/highlighter";
import { BorderBeam } from "@/components/effects/BorderBeam";
import { GlyphMatrix } from "@/components/ui/glyph-matrix";
import AnimatedPathText from "@/components/ui/text-along-path";
import VariableFontCursorProximity from "@/components/fancy/text/variable-font-cursor-proximity";
import { fireQuestConfetti } from "@/components/effects/Confetti";
import { sounds } from "@/lib/audio/retro-sound";

export default function QuestsPage() {
  const queryClient = useQueryClient();
  const questHeaderRef = useRef<HTMLDivElement>(null);

  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<QuestItem | null>(null);
  const [isSummoning, setIsSummoning] = useState(false);

  const disciplines = [
    { key: "ALL", label: "All Disciplines" },
    { key: "BODY", label: "Body" },
    { key: "MIND", label: "Mind" },
    { key: "SPIRIT", label: "Spirit" },
    { key: "CRAFT", label: "Craft" },
    { key: "FOCUS", label: "Focus" },
  ];

  // Fetch Quest Categories
  const { data: categories = [] } = useQuery<CategoryOption[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to load categories");
      return res.json();
    },
  });

  // Fetch Quests with active filters
  const {
    data: quests = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<QuestItem[]>({
    queryKey: ["quests", selectedDiscipline, selectedDifficulty],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedDiscipline !== "ALL") params.set("discipline", selectedDiscipline);
      if (selectedDifficulty !== "ALL") params.set("difficulty", selectedDifficulty);

      const res = await fetch(`/api/quests?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load quests");
      return res.json();
    },
  });

  // Create Quest Mutation
  const createMutation = useMutation({
    mutationFn: async (newQuest: {
      title: string;
      description?: string;
      categoryId: string;
      difficulty: "EASY" | "MEDIUM" | "HARD" | "EPIC";
      recurrence: "ONE_TIME" | "DAILY" | "WEEKLY";
    }) => {
      const res = await fetch("/api/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQuest),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "Failed to create quest");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quests"] });
      setIsModalOpen(false);
      sounds.playClick();
    },
  });

  // Update Quest Mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        title?: string;
        description?: string;
        categoryId?: string;
        difficulty?: string;
        recurrence?: string;
      };
    }) => {
      const res = await fetch(`/api/quests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update quest");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quests"] });
      setIsModalOpen(false);
      setEditingQuest(null);
      sounds.playClick();
    },
  });

  // Soft Delete Quest Mutation
  const deleteMutation = useMutation({
    mutationFn: async (questId: string) => {
      const res = await fetch(`/api/quests/${questId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to archive quest");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quests"] });
      sounds.playClick();
    },
  });

  // 1-Click Starter Bounties Summon
  const handleSummonStarters = async () => {
    if (isSummoning || categories.length === 0) return;
    setIsSummoning(true);

    const findCat = (key: string) =>
      categories.find((c) => c.attribute.key === key) || categories[0];

    const starters = [
      {
        title: "100 Pushups & Morning Sunlight",
        description: "Engage your physical vessel and awaken your stamina.",
        categoryId: findCat("BODY").id,
        difficulty: "EASY" as const,
        recurrence: "DAILY" as const,
      },
      {
        title: "Read 15 Pages of Deep Wisdom",
        description: "Sharpen your intellect and expand your cognitive realm.",
        categoryId: findCat("MIND").id,
        difficulty: "EASY" as const,
        recurrence: "DAILY" as const,
      },
      {
        title: "10-Minute Breath & Stillness",
        description: "Center your spirit and quiet the chaos of the realm.",
        categoryId: findCat("SPIRIT").id,
        difficulty: "EASY" as const,
        recurrence: "DAILY" as const,
      },
      {
        title: "Ship Code / Build Creative Artifact",
        description: "Forge tangible progress on your mastercraft project.",
        categoryId: findCat("CRAFT").id,
        difficulty: "MEDIUM" as const,
        recurrence: "DAILY" as const,
      },
      {
        title: "60-Min Distraction-Free Deep Sprint",
        description: "Conquer a high-priority bounty with single-minded intensity.",
        categoryId: findCat("FOCUS").id,
        difficulty: "HARD" as const,
        recurrence: "DAILY" as const,
      },
    ];

    try {
      for (const q of starters) {
        await createMutation.mutateAsync(q);
      }
      sounds.playLevelUp();
      fireQuestConfetti(0.5, 0.4);
    } catch (err) {
      console.error("Failed to summon starter bounties:", err);
    } finally {
      setIsSummoning(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingQuest(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (quest: QuestItem) => {
    setEditingQuest(quest);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (questData: {
    title: string;
    description?: string;
    categoryId: string;
    difficulty: "EASY" | "MEDIUM" | "HARD" | "EPIC";
    recurrence: "ONE_TIME" | "DAILY" | "WEEKLY";
  }) => {
    if (editingQuest) {
      await updateMutation.mutateAsync({
        id: editingQuest.id,
        data: questData,
      });
    } else {
      await createMutation.mutateAsync(questData);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Background Floating Embers */}
      <Particles className="opacity-35" quantity={40} color="#ff8c42" />

      {/* Page Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2e2e45] relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-[#ffd166] font-pixel mb-1">
            <Scroll className="w-3.5 h-3.5 text-[#ffd166]" />
            <span>GUILDHALL ROSTER</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-pixel text-[#f5f1e8] flex items-center gap-2">
            <span>THE QUEST BOARD</span>
          </h1>
          <p className="text-xs text-[#9a97ab] mt-1 flex items-center gap-1.5">
            <span>Master your daily bounties across</span>
            <Highlighter action="underline" color="#ffd166">
              Five Sacred Disciplines
            </Highlighter>
          </p>
        </div>

        <div
          ref={questHeaderRef}
          className="hidden lg:flex flex-col p-3 rounded-2xl bg-[#1e1e2e]/80 border border-[#ff8c42]/30 backdrop-blur-md"
        >
          <div className="text-[10px] font-pixel text-[#ffd166] uppercase mb-0.5">
            DAILY BOUNTY MOTTO (CURSOR PROXIMITY)
          </div>
          <VariableFontCursorProximity
            className="text-xs font-pixel text-[#f5f1e8] tracking-wide"
            fromFontVariationSettings="'wght' 400, 'slnt' 0"
            toFontVariationSettings="'wght' 900, 'slnt' -8"
            radius={140}
            containerRef={questHeaderRef}
          >
            FORGE CHARACTER THROUGH SACRED ACTION
          </VariableFontCursorProximity>
        </div>

        <div className="flex items-center gap-3">
          {quests.length === 0 && (
            <button
              onClick={handleSummonStarters}
              disabled={isSummoning || categories.length === 0}
              className="px-4 py-2.5 rounded-xl bg-[#1e1e2e] border-2 border-[#ffd166]/50 text-[#ffd166] font-pixel text-xs font-bold hover:bg-[#ffd166]/10 active:scale-95 transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4 text-[#ffd166]" />
              <span>{isSummoning ? "Summoning..." : "Summon 5 Starters"}</span>
            </button>
          )}

          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ffd166] via-[#ff8c42] to-[#ff5f2e] text-[#13131f] font-pixel text-xs font-bold shadow-[0_4px_20px_rgba(255,140,66,0.35)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-[#13131f]" />
            <span>Post Quest</span>
          </button>
        </div>
      </div>

      {/* Discipline Filters Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none relative z-10">
        {disciplines.map((d) => {
          const isActive = selectedDiscipline === d.key;
          return (
            <button
              key={d.key}
              onClick={() => setSelectedDiscipline(d.key)}
              aria-pressed={isActive}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-[#ffd166] to-[#ff8c42] text-[#13131f] font-bold shadow-md shadow-[#ff8c42]/20"
                  : "bg-[#1e1e2e]/90 backdrop-blur-md border border-[#2e2e45] text-[#9a97ab] hover:text-[#f5f1e8] hover:border-[#ff8c42]/50"
              }`}
            >
              {d.label}
            </button>
          );
        })}
      </div>

      {/* Secondary Difficulty Filter Chips */}
      <div className="flex items-center gap-2 flex-wrap text-xs text-[#9a97ab] relative z-10">
        <span className="flex items-center gap-1 text-[11px] font-semibold text-[#f5f1e8]">
          <Filter className="w-3 h-3 text-[#ffd166]" /> Tier:
        </span>
        {["ALL", "EASY", "MEDIUM", "HARD", "EPIC"].map((diff) => (
          <button
            key={diff}
            onClick={() => setSelectedDifficulty(diff)}
            className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              selectedDifficulty === diff
                ? "bg-[#ffd166]/15 text-[#ffd166] border border-[#ffd166]/50 shadow-sm"
                : "bg-[#1e1e2e]/60 border border-transparent hover:text-[#f5f1e8] hover:border-[#2e2e45]"
            }`}
          >
            {diff}
          </button>
        ))}
      </div>

      {/* Error state */}
      {isError && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-[#f87171]/10 border border-[#f87171]/40 flex items-center justify-between text-xs text-[#f87171] relative z-10"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Failed to load quests from server.</span>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1 px-3 py-1 rounded bg-[#1e1e2e] border border-[#f87171]/40 hover:bg-[#13131f] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="notch-card p-5 rounded-2xl bg-[#1e1e2e] border-2 border-[#2e2e45] h-44 animate-pulse flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="w-24 h-3 bg-[#2e2e45] rounded" />
                <div className="w-48 h-4 bg-[#2e2e45] rounded mt-2" />
                <div className="w-32 h-3 bg-[#2e2e45] rounded mt-1" />
              </div>
              <div className="w-full h-4 bg-[#2e2e45] rounded" />
            </div>
          ))}
        </div>
      )}

      {/* 🔮 Orbiting Ascension Altar (When Quests are Bare) */}
      {!isLoading && !isError && quests.length === 0 && (
        <div className="relative overflow-hidden notch-card p-8 sm:p-12 text-center rounded-3xl bg-gradient-to-b from-[#1e1e2e]/90 to-[#13131f]/95 backdrop-blur-2xl border-2 border-[#ff8c42]/40 shadow-2xl space-y-6 max-w-2xl mx-auto my-6 z-10">
          <BorderBeam size={260} duration={8} colorFrom="#ff8c42" colorTo="#ffd166" />

          {/* Background Glyph Matrix in Ascension Altar */}
          <div className="absolute inset-0 pointer-events-none opacity-25">
            <GlyphMatrix cellSize={14} mutationRate={0.03} interval={100} color="#ff8c42" />
          </div>

          {/* Interactive Orbiting Circles Portal */}
          <div className="relative flex h-60 w-full items-center justify-center overflow-hidden">
            {/* Center Hearth Flame with Circling Animated Path Text */}
            <div className="relative size-24 flex items-center justify-center z-10">
              <div className="absolute inset-0 size-full pointer-events-none flex items-center justify-center">
                <AnimatedPathText
                  path="M 48, 48 m -40, 0 a 40,40 0 1,0 80,0 a 40,40 0 1,0 -80,0"
                  viewBox="0 0 96 96"
                  text="✦ SACRED ALTAR ✦ FIVE PILLARS ✦"
                  duration={14}
                  textClassName="text-[6.5px] tracking-[0.2em] fill-[#ffd166]/70 font-pixel"
                  svgClassName="w-24 h-24"
                />
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#13131f] border-2 border-[#ff8c42]/60 shadow-[0_0_30px_rgba(255,140,66,0.4)] flex items-center justify-center">
                <Flame className="w-7 h-7 text-[#ff8c42] animate-pulse" />
              </div>
            </div>

            {/* Inner Orbit (Radius 70) */}
            <OrbitingCircles radius={70} duration={12} reverse speed={1.2} iconSize={32}>
              <Coins className="w-4 h-4 text-[#ffd166]" />
            </OrbitingCircles>
            <OrbitingCircles radius={70} duration={12} delay={6} reverse speed={1.2} iconSize={32}>
              <Sparkles className="w-4 h-4 text-[#ffd166]" />
            </OrbitingCircles>

            {/* Outer Orbit (Radius 120) with the 5 Disciplines */}
            <OrbitingCircles radius={120} duration={24} delay={0} iconSize={36}>
              <Sword className="w-4 h-4 text-[#ef4444]" />
            </OrbitingCircles>
            <OrbitingCircles radius={120} duration={24} delay={4.8} iconSize={36}>
              <Scroll className="w-4 h-4 text-[#3b82f6]" />
            </OrbitingCircles>
            <OrbitingCircles radius={120} duration={24} delay={9.6} iconSize={36}>
              <Sparkles className="w-4 h-4 text-[#ec4899]" />
            </OrbitingCircles>
            <OrbitingCircles radius={120} duration={24} delay={14.4} iconSize={36}>
              <Shield className="w-4 h-4 text-[#f59e0b]" />
            </OrbitingCircles>
            <OrbitingCircles radius={120} duration={24} delay={19.2} iconSize={36}>
              <Trophy className="w-4 h-4 text-[#10b981]" />
            </OrbitingCircles>
          </div>

          <div className="space-y-2">
            <MorphingText
              texts={[
                "YOUR BOARD IS BARE, ADVENTURER",
                "SUMMON 5 STARTER BOUNTIES",
                "THE HEARTH CALLS FOR EMBERS",
                "ASCEND THE FIVE SACRED DISCIPLINES",
              ]}
              className="text-base sm:text-lg text-[#ffd166]"
            />
            <p className="text-xs text-[#9a97ab] max-w-md mx-auto leading-relaxed">
              No active quests found on your roster. Populate your board with 5 starter bounties in one click, or post your own custom quest.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleSummonStarters}
              disabled={isSummoning || categories.length === 0}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#ffd166] via-[#ff8c42] to-[#ff5f2e] text-[#13131f] font-pixel text-xs font-bold shadow-[0_4px_25px_rgba(255,140,66,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4 text-[#13131f]" />
              <span>{isSummoning ? "Summoning Bounties..." : "Summon 5 Starter Bounties"}</span>
            </button>

            <button
              onClick={handleOpenCreate}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-[#13131f] border-2 border-[#2e2e45] hover:border-[#ff8c42]/50 text-xs font-pixel text-[#f5f1e8] hover:text-[#ffd166] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Craft Custom Quest</span>
            </button>
          </div>
        </div>
      )}

      {/* 🔮 Runic Roster Oracle Strip with Glyph Matrix */}
      {!isLoading && quests.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-[#1e1e2e]/85 border border-[#ff8c42]/30 p-3.5 flex items-center justify-between gap-4 z-10 shadow-lg">
          <div className="absolute inset-0 opacity-20 pointer-events-none -z-0">
            <GlyphMatrix cellSize={12} mutationRate={0.03} interval={100} color="#ff8c42" />
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2 rounded-xl bg-[#ff8c42]/15 border border-[#ff8c42]/40 text-[#ff8c42]">
              <Flame className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] font-pixel text-[#ffd166] uppercase tracking-wider">
                SACRED GUILD RUNES • ACTIVE BOUNTIES
              </div>
              <div className="text-xs text-[#9a97ab]">
                Showing <span className="text-[#ffd166] font-bold">{quests.length}</span> active quest {quests.length === 1 ? "bounty" : "bounties"} across the realm
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 relative z-10 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-[#13131f] border border-[#2e2e45] text-[#9a97ab] font-mono text-[11px]">
              TOTAL XP: <span className="text-[#ff8c42] font-bold">+{quests.reduce((acc, q) => acc + (q.reward_awarded?.xp || (q.difficulty === "EPIC" ? 100 : q.difficulty === "HARD" ? 50 : q.difficulty === "MEDIUM" ? 25 : 10)), 0)}</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#13131f] border border-[#2e2e45] text-[#9a97ab] font-mono text-[11px]">
              GOLD: <span className="text-[#ffd166] font-bold">+{quests.reduce((acc, q) => acc + (q.reward_awarded?.gold || (q.difficulty === "EPIC" ? 40 : q.difficulty === "HARD" ? 20 : q.difficulty === "MEDIUM" ? 10 : 4)), 0)}g</span>
            </span>
          </div>
        </div>
      )}

      {/* Quest Grid */}
      {!isLoading && quests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
          {quests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onEdit={handleOpenEdit}
              onDelete={(id) => deleteMutation.mutate(id)}
              isDeleting={deleteMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Quest Create / Edit Modal */}
      <QuestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        categories={categories}
        editingQuest={editingQuest}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
