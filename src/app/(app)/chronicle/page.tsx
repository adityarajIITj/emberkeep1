"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { History, Flame, Award, Calendar } from "lucide-react";

export default function ChroniclePage() {
  const { data: character } = useQuery({
    queryKey: ["character"],
    queryFn: async () => {
      const res = await fetch("/api/character");
      if (!res.ok) return null;
      return res.json();
    },
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="pb-4 border-b border-[#2e2e45]">
        <div className="inline-flex items-center gap-1.5 text-xs text-[#ffd166] font-pixel mb-1">
          <History className="w-3.5 h-3.5 text-[#ffd166]" />
          <span>GUILD ARCHIVES</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-pixel text-[#f5f1e8]">
          THE CHRONICLE
        </h1>
        <p className="text-xs text-[#9a97ab] mt-1">
          Historical ledger of your quest completions and streak milestones
        </p>
      </div>

      {/* Stats Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="notch-card p-5 rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] flex items-center gap-3">
          <Flame className="w-8 h-8 text-[#ff8c42]" />
          <div>
            <div className="text-xs text-[#9a97ab]">Current Streak</div>
            <div className="font-pixel text-lg text-[#f5f1e8]">
              {character?.current_streak || 0} Days
            </div>
          </div>
        </div>

        <div className="notch-card p-5 rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] flex items-center gap-3">
          <Award className="w-8 h-8 text-[#ffd166]" />
          <div>
            <div className="text-xs text-[#9a97ab]">Longest Streak</div>
            <div className="font-pixel text-lg text-[#ffd166]">
              {character?.longest_streak || 0} Days
            </div>
          </div>
        </div>

        <div className="notch-card p-5 rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] flex items-center gap-3">
          <Calendar className="w-8 h-8 text-[#3b82f6]" />
          <div>
            <div className="text-xs text-[#9a97ab]">Member Since</div>
            <div className="text-xs text-[#f5f1e8] font-semibold mt-1">
              Active Adventurer
            </div>
          </div>
        </div>
      </div>

      {/* Chronicle Log Placeholder */}
      <div className="notch-card p-8 rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] text-center space-y-2">
        <History className="w-8 h-8 text-[#9a97ab] mx-auto opacity-50" />
        <h3 className="font-pixel text-xs text-[#f5f1e8]">APPEND-ONLY IMMUTABLE LEDGER</h3>
        <p className="text-xs text-[#9a97ab] max-w-md mx-auto">
          Every quest completion, streak bonus, and shop purchase is permanently recorded on the server ledger. Complete quests to record your saga.
        </p>
      </div>
    </div>
  );
}
