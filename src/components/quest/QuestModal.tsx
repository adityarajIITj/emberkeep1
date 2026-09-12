"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, Plus, Check } from "lucide-react";
import { DIFFICULTIES, RECURRENCES } from "@/lib/validation/quest";
import { QuestItem } from "./QuestCard";

export interface CategoryOption {
  id: string;
  label: string;
  color_hex: string;
  icon_key: string;
  attribute: {
    key: string;
    label: string;
    color_hex: string;
  };
}

interface QuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (questData: {
    title: string;
    description?: string;
    categoryId: string;
    difficulty: "EASY" | "MEDIUM" | "HARD" | "EPIC";
    recurrence: "ONE_TIME" | "DAILY" | "WEEKLY";
  }) => Promise<void>;
  categories: CategoryOption[];
  editingQuest?: QuestItem | null;
  isSubmitting?: boolean;
}

export function QuestModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  editingQuest,
  isSubmitting = false,
}: QuestModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD" | "EPIC">("MEDIUM");
  const [recurrence, setRecurrence] = useState<"ONE_TIME" | "DAILY" | "WEEKLY">("ONE_TIME");
  const [titleError, setTitleError] = useState<string | null>(null);

  useEffect(() => {
    if (editingQuest) {
      setTitle(editingQuest.title);
      setDescription(editingQuest.description || "");
      setCategoryId(editingQuest.category.id);
      setDifficulty(editingQuest.difficulty as "EASY" | "MEDIUM" | "HARD" | "EPIC");
      setRecurrence(editingQuest.recurrence as "ONE_TIME" | "DAILY" | "WEEKLY");
    } else {
      setTitle("");
      setDescription("");
      if (categories.length > 0) {
        setCategoryId(categories[0].id);
      }
      setDifficulty("MEDIUM");
      setRecurrence("ONE_TIME");
    }
    setTitleError(null);
  }, [editingQuest, categories, isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTitleError(null);

    // Client-side edge-case validation: block empty task title (§1D & §9)
    if (!title.trim()) {
      setTitleError("Quest title cannot be empty");
      document.getElementById("quest-title-input")?.focus();
      return;
    }

    if (!categoryId && categories.length > 0) {
      setCategoryId(categories[0].id);
    }

    await onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      categoryId: categoryId || categories[0]?.id,
      difficulty,
      recurrence,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quest-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
    >
      <div
        className="w-full max-w-lg notch-card rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2e2e45] mb-5">
          <h2 id="quest-modal-title" className="font-pixel text-sm sm:text-base text-[#f5f1e8]">
            {editingQuest ? "EDIT QUEST" : "POST NEW QUEST"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#9a97ab] hover:text-[#f5f1e8] hover:bg-[#13131f] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <div>
            <label
              htmlFor="quest-title-input"
              className="block text-xs font-semibold text-[#f5f1e8] mb-1.5"
            >
              Quest Objective <span className="text-[#f87171]">*</span>
            </label>
            <input
              id="quest-title-input"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError(null);
              }}
              placeholder="e.g. Conquer 45-minute Strength Training"
              className={`w-full px-3.5 py-2.5 rounded bg-[#13131f] border text-sm text-[#f5f1e8] placeholder-[#9a97ab]/50 focus:outline-none transition-colors ${
                titleError
                  ? "border-[#f87171] focus:border-[#f87171]"
                  : "border-[#2e2e45] focus:border-[#ff8c42]"
              }`}
            />
            {titleError && (
              <p className="mt-1.5 text-xs text-[#f87171]">{titleError}</p>
            )}
          </div>

          {/* Description Input */}
          <div>
            <label
              htmlFor="quest-desc-input"
              className="block text-xs font-semibold text-[#f5f1e8] mb-1.5"
            >
              Lore & Details <span className="text-[#9a97ab] font-normal">(optional)</span>
            </label>
            <textarea
              id="quest-desc-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Add key notes, reps, chapters, or goals..."
              className="w-full px-3.5 py-2.5 rounded bg-[#13131f] border border-[#2e2e45] text-sm text-[#f5f1e8] placeholder-[#9a97ab]/50 focus:outline-none focus:border-[#ff8c42] transition-colors resize-none"
            />
          </div>

          {/* Discipline Category Select */}
          <div>
            <label
              htmlFor="quest-category-select"
              className="block text-xs font-semibold text-[#f5f1e8] mb-1.5"
            >
              Discipline & Category
            </label>
            <select
              id="quest-category-select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded bg-[#13131f] border border-[#2e2e45] text-sm text-[#f5f1e8] focus:outline-none focus:border-[#ff8c42] transition-colors cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  [{cat.attribute.label}] {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Selection */}
          <div>
            <span className="block text-xs font-semibold text-[#f5f1e8] mb-1.5">
              Difficulty Tier
            </span>
            <div className="grid grid-cols-4 gap-2">
              {DIFFICULTIES.map((d) => {
                const isSelected = difficulty === d;
                const xpMap: Record<string, string> = {
                  EASY: "10 XP",
                  MEDIUM: "25 XP",
                  HARD: "50 XP",
                  EPIC: "100 XP",
                };
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`py-2 px-1 rounded text-center border text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#ff8c42]/20 border-[#ff8c42] text-[#ff8c42]"
                        : "bg-[#13131f] border-[#2e2e45] text-[#9a97ab] hover:border-[#2e2e45]/80"
                    }`}
                  >
                    <div className="font-pixel text-[10px]">{d}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">{xpMap[d]}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recurrence Selection */}
          <div>
            <span className="block text-xs font-semibold text-[#f5f1e8] mb-1.5">
              Recurrence
            </span>
            <div className="grid grid-cols-3 gap-2">
              {RECURRENCES.map((r) => {
                const isSelected = recurrence === r;
                const labelMap: Record<string, string> = {
                  ONE_TIME: "One-Time",
                  DAILY: "Daily Quest",
                  WEEKLY: "Weekly Bounty",
                };
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRecurrence(r)}
                    className={`py-2 px-2 rounded text-center border text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#ffd166]/15 border-[#ffd166] text-[#ffd166]"
                        : "bg-[#13131f] border-[#2e2e45] text-[#9a97ab] hover:border-[#2e2e45]/80"
                    }`}
                  >
                    {labelMap[r]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2e2e45]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-[#13131f] border border-[#2e2e45] text-xs text-[#9a97ab] hover:text-[#f5f1e8] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded bg-gradient-to-r from-[#ff8c42] to-[#ff5f2e] text-[#13131f] font-pixel text-xs font-bold shadow-[0_2px_10px_rgba(255,140,66,0.3)] hover:brightness-110 active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Recording...</span>
                </>
              ) : editingQuest ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Update Quest</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Post Quest</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
