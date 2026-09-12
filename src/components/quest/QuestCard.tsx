"use client";

import React from "react";
import { Edit2, Trash2, Calendar, Repeat, Award } from "lucide-react";

export interface QuestItem {
  id: string;
  title: string;
  description?: string | null;
  difficulty: string;
  recurrence: string;
  status: string;
  due_date?: string | null;
  category: {
    id: string;
    label: string;
    color_hex: string;
    icon_key: string;
    attribute: {
      key: string;
      label: string;
      color_hex: string;
    };
  };
}

interface QuestCardProps {
  quest: QuestItem;
  onEdit?: (quest: QuestItem) => void;
  onDelete?: (questId: string) => void;
  isDeleting?: boolean;
}

const DIFFICULTY_XP: Record<string, { xp: number; gold: number; color: string; border: string }> = {
  EASY: { xp: 10, gold: 4, color: "text-[#4ade80]", border: "border-[#4ade80]/40" },
  MEDIUM: { xp: 25, gold: 10, color: "text-[#3b82f6]", border: "border-[#3b82f6]/40" },
  HARD: { xp: 50, gold: 20, color: "text-[#f59e0b]", border: "border-[#f59e0b]/40" },
  EPIC: { xp: 100, gold: 40, color: "text-[#ec4899]", border: "border-[#ec4899]/40" },
};

export function QuestCard({ quest, onEdit, onDelete, isDeleting }: QuestCardProps) {
  const diffInfo = DIFFICULTY_XP[quest.difficulty] || DIFFICULTY_XP.EASY;

  return (
    <div className="notch-card-interactive p-4 sm:p-5 rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] flex flex-col justify-between gap-3 group">
      {/* Top row: Category tag & Difficulty badge */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ backgroundColor: quest.category.attribute.color_hex }}
          />
          <span className="text-[11px] font-semibold tracking-wider text-[#9a97ab] uppercase">
            {quest.category.attribute.label} • {quest.category.label}
          </span>
        </div>

        <div
          className={`px-2 py-0.5 rounded text-[10px] font-pixel border ${diffInfo.color} ${diffInfo.border} bg-[#13131f]`}
        >
          {quest.difficulty} (+{diffInfo.xp} XP)
        </div>
      </div>

      {/* Main Content: Title & Description */}
      <div className="space-y-1">
        <h3 className="font-semibold text-sm sm:text-base text-[#f5f1e8] group-hover:text-[#ff8c42] transition-colors line-clamp-2">
          {quest.title}
        </h3>
        {quest.description && (
          <p className="text-xs text-[#9a97ab] line-clamp-2">{quest.description}</p>
        )}
      </div>

      {/* Bottom row: Recurrence chip, Gold reward & Action buttons */}
      <div className="pt-2 border-t border-[#2e2e45]/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[11px] text-[#9a97ab]">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#13131f] border border-[#2e2e45]">
            <Repeat className="w-3 h-3 text-[#ffd166]" />
            {quest.recurrence.replace("_", "-")}
          </span>

          <span className="inline-flex items-center gap-1 text-[#ffd166]">
            <Award className="w-3 h-3 text-[#ffd166]" />
            +{diffInfo.gold}g
          </span>
        </div>

        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={() => onEdit(quest)}
              className="p-1.5 rounded hover:bg-[#13131f] text-[#9a97ab] hover:text-[#f5f1e8] transition-colors cursor-pointer"
              title="Edit Quest"
              aria-label={`Edit ${quest.title}`}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(quest.id)}
              disabled={isDeleting}
              className="p-1.5 rounded hover:bg-[#13131f] text-[#9a97ab] hover:text-[#f87171] transition-colors disabled:opacity-50 cursor-pointer"
              title="Archive Quest"
              aria-label={`Archive ${quest.title}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
