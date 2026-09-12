"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Filter, Scroll, AlertCircle, RefreshCw, Layers } from "lucide-react";
import { QuestCard, QuestItem } from "@/components/quest/QuestCard";
import { QuestModal, CategoryOption } from "@/components/quest/QuestModal";

export default function QuestsPage() {
  const queryClient = useQueryClient();

  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<QuestItem | null>(null);

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
    },
  });

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
    <div className="space-y-6">
      {/* Page Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2e2e45]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-[#ffd166] font-pixel mb-1">
            <Scroll className="w-3.5 h-3.5 text-[#ffd166]" />
            <span>GUILDHALL ROSTER</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-pixel text-[#f5f1e8]">
            THE QUEST BOARD
          </h1>
          <p className="text-xs text-[#9a97ab] mt-1">
            Manage your personal bounties across the five Disciplines
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded bg-gradient-to-r from-[#ff8c42] to-[#ff5f2e] text-[#13131f] font-pixel text-xs font-bold shadow-[0_4px_15px_rgba(255,140,66,0.3)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#13131f]" />
          <span>Post Quest</span>
        </button>
      </div>

      {/* Discipline Filters Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {disciplines.map((d) => {
          const isActive = selectedDiscipline === d.key;
          return (
            <button
              key={d.key}
              onClick={() => setSelectedDiscipline(d.key)}
              aria-pressed={isActive}
              className={`px-3.5 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-[#ff8c42] text-[#13131f] font-bold shadow-md"
                  : "bg-[#1e1e2e] border border-[#2e2e45] text-[#9a97ab] hover:text-[#f5f1e8] hover:border-[#ff8c42]/40"
              }`}
            >
              {d.label}
            </button>
          );
        })}
      </div>

      {/* Secondary Difficulty Filter Chips */}
      <div className="flex items-center gap-2 flex-wrap text-xs text-[#9a97ab]">
        <span className="flex items-center gap-1 text-[11px] font-semibold text-[#f5f1e8]">
          <Filter className="w-3 h-3 text-[#ffd166]" /> Tier:
        </span>
        {["ALL", "EASY", "MEDIUM", "HARD", "EPIC"].map((diff) => (
          <button
            key={diff}
            onClick={() => setSelectedDifficulty(diff)}
            className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer ${
              selectedDifficulty === diff
                ? "bg-[#2e2e45] text-[#ffd166] font-semibold border border-[#ffd166]/40"
                : "hover:text-[#f5f1e8]"
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
          className="p-4 rounded-xl bg-[#f87171]/10 border border-[#f87171]/40 flex items-center justify-between text-xs text-[#f87171]"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="notch-card p-5 rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] h-40 animate-pulse flex flex-col justify-between"
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

      {/* Empty State */}
      {!isLoading && !isError && quests.length === 0 && (
        <div className="notch-card p-12 text-center rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] space-y-4 max-w-xl mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-[#13131f] border border-[#2e2e45] flex items-center justify-center mx-auto text-[#ffd166]">
            <Layers className="w-8 h-8 opacity-60" />
          </div>
          <div className="space-y-1">
            <h3 className="font-pixel text-sm text-[#f5f1e8]">YOUR BOARD IS BARE</h3>
            <p className="text-xs text-[#9a97ab]">
              {selectedDiscipline !== "ALL" || selectedDifficulty !== "ALL"
                ? "No quests match your active filters. Try loosening your selection or post a new bounty."
                : "No active quests found. Post your first Quest to start feeding your Ember."}
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded bg-gradient-to-r from-[#ff8c42] to-[#ff5f2e] text-[#13131f] font-pixel text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Post First Quest</span>
          </button>
        </div>
      )}

      {/* Quest Grid */}
      {!isLoading && quests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
