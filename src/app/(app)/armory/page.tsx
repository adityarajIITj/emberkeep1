"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Shield,
  Crown,
  Palette,
  CheckCircle2,
  Sparkles,
  User,
  Check,
} from "lucide-react";
import Link from "next/link";
import { BorderBeam } from "@/components/effects/BorderBeam";
import { SpotlightCard } from "@/components/effects/SpotlightCard";
import { sounds } from "@/lib/audio/retro-sound";

interface InventoryItemData {
  id: string;
  equipped: boolean;
  acquired_at: string;
  shop_item: {
    id: string;
    key: string;
    name: string;
    description: string;
    type: "TITLE" | "BADGE" | "AVATAR_FRAME" | "THEME";
    icon_key: string;
  };
}

export default function ArmoryPage() {
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState<string>("ALL");

  const { data: character } = useQuery({
    queryKey: ["character"],
    queryFn: async () => {
      const res = await fetch("/api/character");
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 1000 * 30,
  });

  const { data: inventory = [], isLoading } = useQuery<InventoryItemData[]>({
    queryKey: ["inventory"],
    queryFn: async () => {
      const res = await fetch("/api/inventory");
      if (!res.ok) throw new Error("Failed to load inventory");
      return res.json();
    },
  });

  // Equip / Unequip Mutation
  const equipMutation = useMutation({
    mutationFn: async ({ id, equip }: { id: string; equip: boolean }) => {
      const res = await fetch(`/api/inventory/${id}/equip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equip }),
      });
      if (!res.ok) throw new Error("Failed to update equipment");
      return res.json();
    },
    onSuccess: () => {
      sounds.playClick();
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["character"] });
      queryClient.invalidateQueries({ queryKey: ["shop"] });
    },
  });

  const filteredInventory =
    selectedTab === "ALL"
      ? inventory
      : inventory.filter((item) => item.shop_item.type === selectedTab);

  const tabs = [
    { key: "ALL", label: "All Items", count: inventory.length },
    {
      key: "TITLE",
      label: "Titles",
      count: inventory.filter((i) => i.shop_item.type === "TITLE").length,
    },
    {
      key: "AVATAR_FRAME",
      label: "Frames",
      count: inventory.filter((i) => i.shop_item.type === "AVATAR_FRAME").length,
    },
    {
      key: "THEME",
      label: "Themes",
      count: inventory.filter((i) => i.shop_item.type === "THEME").length,
    },
  ];

  // Dynamic Avatar Frame border based on equipped cosmetic
  let frameBorder = "border-[#2e2e45]";
  if (character?.equipped?.frame?.key === "frame_verdant") {
    frameBorder = "border-[#4ade80] shadow-[0_0_15px_rgba(74,222,128,0.5)]";
  } else if (character?.equipped?.frame?.key === "frame_ember") {
    frameBorder = "border-[#ff8c42] shadow-[0_0_20px_rgba(255,140,66,0.6)]";
  } else if (character?.equipped?.frame?.key === "frame_celestial") {
    frameBorder = "border-[#ffd166] shadow-[0_0_25px_rgba(255,209,102,0.7)]";
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="pb-4 border-b border-[#2e2e45]">
        <div className="inline-flex items-center gap-1.5 text-xs text-[#ffd166] font-pixel mb-1">
          <Shield className="w-3.5 h-3.5 text-[#ffd166]" />
          <span>GUILD VAULT</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-pixel text-[#f5f1e8]">
          THE ARMORY
        </h1>
        <p className="text-xs text-[#9a97ab] mt-1">
          Equip your earned titles, avatar crests, and keep themes
        </p>
      </div>

      {/* Active Equipment Showcase Pane (§9 Screen 9) with BorderBeam */}
      <div className="relative overflow-hidden notch-card p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-[#1e1e2e] via-[#1a1a2b] to-[#13131f] border-2 border-[#ffd166]/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <BorderBeam size={220} duration={8} colorFrom="#ffd166" colorTo="#ff8c42" />
        <div className="flex items-center gap-4">
          <div
            className={`w-16 h-16 rounded-2xl bg-[#13131f] border-2 ${frameBorder} flex items-center justify-center font-pixel text-2xl text-[#ffd166] transition-all`}
          >
            {character?.user?.display_name?.[0]?.toUpperCase() || "A"}
          </div>
          <div>
            <div className="text-[10px] font-pixel text-[#9a97ab] uppercase">
              ACTIVE AVATAR CREST
            </div>
            <h2 className="font-pixel text-base text-[#f5f1e8]">
              {character?.user?.display_name || "Adventurer"}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-pixel text-[#ffd166] bg-[#13131f] border border-[#ffd166]/40 flex items-center gap-1">
                <Crown className="w-3 h-3" />
                {character?.equipped?.title?.name || "Novice"}
              </span>
              <span className="text-xs text-[#9a97ab]">Level {character?.level || 1}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#13131f] border border-[#2e2e45] text-center min-w-[100px]">
            <span className="text-[10px] text-[#9a97ab] block">Equipped Frame</span>
            <span className="font-semibold text-[#f5f1e8]">
              {character?.equipped?.frame?.name || "None"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#13131f] border border-[#2e2e45] text-center min-w-[100px]">
            <span className="text-[10px] text-[#9a97ab] block">Banner Theme</span>
            <span className="font-semibold text-[#ffd166]">
              {character?.equipped?.theme?.name || "Standard Dark"}
            </span>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map((t) => {
          const isActive = selectedTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setSelectedTab(t.key)}
              aria-pressed={isActive}
              className={`px-3.5 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-[#ff8c42] text-[#13131f] font-bold shadow-md"
                  : "bg-[#1e1e2e] border border-[#2e2e45] text-[#9a97ab] hover:text-[#f5f1e8] hover:border-[#ff8c42]/40"
              }`}
            >
              {t.label} ({t.count})
            </button>
          );
        })}
      </div>

      {/* Inventory Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="notch-card p-5 rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] h-40 animate-pulse"
            />
          ))}
        </div>
      ) : filteredInventory.length === 0 ? (
        <div className="notch-card p-12 text-center rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] space-y-3 max-w-md mx-auto my-8">
          <Sparkles className="w-8 h-8 text-[#ffd166] mx-auto opacity-70" />
          <h3 className="font-pixel text-xs sm:text-sm text-[#f5f1e8]">
            NO ARTIFACTS IN THIS SLOT
          </h3>
          <p className="text-xs text-[#9a97ab]">
            Visit The Merchant Bazaar to acquire cosmetics and equip them here.
          </p>
          <Link
            href="/merchant"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-gradient-to-r from-[#ffd166] to-[#ff8c42] text-[#13131f] font-pixel text-xs font-bold"
          >
            Visit Merchant
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredInventory.map((item) => {
            const isEquipped = item.equipped;
            return (
              <SpotlightCard
                key={item.id}
                spotlightColor={isEquipped ? "rgba(255, 209, 102, 0.2)" : "rgba(255, 140, 66, 0.15)"}
                className={`p-5 rounded-2xl bg-[#1e1e2e]/90 backdrop-blur-xl border-2 flex flex-col justify-between gap-4 transition-all ${
                  isEquipped
                    ? "border-[#ffd166] shadow-[0_0_25px_rgba(255,209,102,0.25)] bg-[#ffd166]/5"
                    : "border-[#2e2e45] hover:border-[#ff8c42]/60"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-pixel text-[#9a97ab] uppercase">
                      {item.shop_item.type.replace("_", " ")}
                    </span>
                    {isEquipped && (
                      <span className="flex items-center gap-1 text-[10px] font-pixel text-[#ffd166]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <h3 className="font-pixel text-sm text-[#f5f1e8]">
                    {item.shop_item.name}
                  </h3>
                  <p className="text-xs text-[#9a97ab]">
                    {item.shop_item.description}
                  </p>
                </div>

                <button
                  onClick={() =>
                    equipMutation.mutate({ id: item.id, equip: !isEquipped })
                  }
                  disabled={equipMutation.isPending}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-pixel font-bold transition-all cursor-pointer shadow-md ${
                    isEquipped
                      ? "bg-[#13131f] border border-[#2e2e45] text-[#9a97ab] hover:text-[#f87171] hover:border-[#f87171]/50"
                      : "bg-gradient-to-r from-[#ffd166] to-[#ff8c42] text-[#13131f] hover:brightness-110 active:scale-95"
                  }`}
                >
                  {isEquipped ? "Unequip" : "Equip Item"}
                </button>
              </SpotlightCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
