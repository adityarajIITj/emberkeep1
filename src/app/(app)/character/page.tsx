"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { User, Shield, Sparkles, Award } from "lucide-react";
import { xpProgressInLevel, getRankTitle } from "@/lib/server/rpg-engine";

export default function CharacterPage() {
  const { data: character, isLoading } = useQuery({
    queryKey: ["character"],
    queryFn: async () => {
      const res = await fetch("/api/character");
      if (!res.ok) return null;
      return res.json();
    },
  });

  const xpProgress = xpProgressInLevel(character?.total_xp || 0);
  const rankTitle = character ? getRankTitle(character.level) : "Novice";

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="pb-4 border-b border-[#2e2e45]">
        <div className="inline-flex items-center gap-1.5 text-xs text-[#ffd166] font-pixel mb-1">
          <User className="w-3.5 h-3.5 text-[#ffd166]" />
          <span>ADVENTURER DOSSIER</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-pixel text-[#f5f1e8]">
          CHARACTER SHEET
        </h1>
        <p className="text-xs text-[#9a97ab] mt-1">
          Track your overall rank and progression across the five Disciplines
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="notch-card p-6 rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ff8c42] to-[#8b5cf6] p-1 flex items-center justify-center font-pixel text-2xl text-[#13131f] shadow-lg">
            {character?.user?.display_name?.[0]?.toUpperCase() || "A"}
          </div>
          <div>
            <h2 className="font-pixel text-lg text-[#f5f1e8]">
              {character?.user?.display_name || "Adventurer"}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-pixel text-[#ffd166] bg-[#13131f] border border-[#ffd166]/40">
                {character?.equipped?.title?.name || rankTitle}
              </span>
              <span className="text-xs text-[#9a97ab]">Level {character?.level || 1}</span>
            </div>
          </div>
        </div>

        <div className="w-full md:w-72 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-[#9a97ab]">Total Experience</span>
            <span className="font-pixel text-[#ff8c42]">
              {(character?.total_xp || 0).toLocaleString()} XP
            </span>
          </div>
          <div className="h-2 bg-[#13131f] rounded-full overflow-hidden border border-[#2e2e45]">
            <div
              className="h-full bg-gradient-to-r from-[#ff8c42] to-[#ff5f2e] rounded-full"
              style={{ width: `${xpProgress.progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[#9a97ab]">
            <span>Level {xpProgress.currentLevel}</span>
            <span>Level {xpProgress.currentLevel + 1} ({xpProgress.progressPercentage}%)</span>
          </div>
        </div>
      </div>

      {/* 5 Disciplines Grid */}
      <div>
        <h3 className="font-pixel text-sm text-[#f5f1e8] mb-4">THE FIVE DISCIPLINES</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {character?.disciplines?.map((ca: { id: string; xp: number; level: number; attribute: { key: string; label: string; color_hex: string } }) => {
            const discProgress = xpProgressInLevel(ca.xp);
            return (
              <div
                key={ca.id}
                className="notch-card p-4 rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: ca.attribute.color_hex }}
                    />
                    <span className="font-pixel text-xs text-[#f5f1e8]">
                      {ca.attribute.label}
                    </span>
                  </div>
                  <span
                    className="text-[10px] font-pixel px-2 py-0.5 rounded border bg-[#13131f]"
                    style={{
                      color: ca.attribute.color_hex,
                      borderColor: `${ca.attribute.color_hex}66`,
                    }}
                  >
                    LVL {ca.level}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="h-1.5 bg-[#13131f] rounded-full overflow-hidden border border-[#2e2e45]">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${discProgress.progressPercentage}%`,
                        backgroundColor: ca.attribute.color_hex,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#9a97ab]">
                    <span>{ca.xp.toLocaleString()} XP</span>
                    <span>{discProgress.progressPercentage}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
