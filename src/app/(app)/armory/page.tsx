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
  Zap,
  Flame,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { BorderBeam } from "@/components/effects/BorderBeam";
import { MagicCard } from "@/components/ui/magic-card";
import { Particles } from "@/components/ui/particles";
import { MorphingText } from "@/components/ui/morphing-text";
import { Highlighter } from "@/components/ui/highlighter";
import { OrbitingCircles } from "@/components/ui/orbiting-circles";
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
    frameBorder = "border-[#4ade80] shadow-[0_0_20px_rgba(74,222,128,0.5)]";
  } else if (character?.equipped?.frame?.key === "frame_ember") {
    frameBorder = "border-[#ff8c42] shadow-[0_0_25px_rgba(255,140,66,0.6)]";
  } else if (character?.equipped?.frame?.key === "frame_celestial") {
    frameBorder = "border-[#ffd166] shadow-[0_0_30px_rgba(255,209,102,0.7)]";
  }

  return (
    <div className="space-y-6 relative animate-fadeIn">
      {/* Ambient Mana Dust Particles */}
      <Particles className="opacity-30" quantity={30} color="#a855f7" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#2e2e45] relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-[#ffd166] font-pixel mb-1">
            <Shield className="w-3.5 h-3.5 text-[#ffd166]" />
            <span>GUILD VAULT</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-pixel text-[#f5f1e8] flex items-center gap-2">
            <span>THE ARMORY</span>
          </h1>
          <p className="text-xs text-[#9a97ab] mt-1 flex items-center gap-1.5 flex-wrap">
            <span>Equip and wield your unlocked</span>
            <Highlighter action="underline" color="#a855f7">
              Prestige Titles, Crests & Themes
            </Highlighter>
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-[#1e1e2e]/80 border border-[#a855f7]/30 backdrop-blur-md">
          <div className="text-[10px] font-pixel text-[#ffd166] uppercase mb-0.5">
            ARMORY SANCTUM
          </div>
          <MorphingText
            texts={[
              "CUSTOMIZE YOUR AVATAR HALO",
              "EQUIP CONQUERED TITLES",
              "DISPLAY YOUR ASCENDED CREST",
              "STAND OUT IN THE GUILDHALL",
            ]}
            className="text-xs font-pixel text-[#f5f1e8]"
          />
        </div>
      </div>

      {/* Active Equipment Showcase Pane with Orbiting Circles Halo */}
      <div className="relative overflow-hidden notch-card p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#1e1e2e]/95 via-[#1a1a2b]/95 to-[#13131f]/95 border-2 border-[#ffd166]/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 z-10">
        <BorderBeam size={240} duration={8} colorFrom="#ffd166" colorTo="#ff8c42" />

        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          {/* Avatar with Orbiting Relic Rings */}
          <div className="relative flex items-center justify-center size-28 shrink-0">
            <OrbitingCircles radius={48} duration={10} reverse speed={1.2} iconSize={22} path={true}>
              <Crown className="w-3 h-3 text-[#ffd166]" />
            </OrbitingCircles>
            <OrbitingCircles radius={48} duration={10} delay={5} reverse speed={1.2} iconSize={22} path={false}>
              <Sparkles className="w-3 h-3 text-[#a855f7]" />
            </OrbitingCircles>

            <div
              className={`w-16 h-16 rounded-2xl bg-[#13131f] border-2 ${frameBorder} flex items-center justify-center font-pixel text-2xl text-[#ffd166] transition-all z-10`}
            >
              {character?.user?.display_name?.[0]?.toUpperCase() || "A"}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-pixel text-[#9a97ab] uppercase tracking-wider">
              ACTIVE AVATAR CREST
            </div>
            <h2 className="font-pixel text-base sm:text-lg text-[#f5f1e8]">
              {character?.user?.display_name || "Adventurer"}
            </h2>
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-pixel text-[#ffd166] bg-[#13131f] border border-[#ffd166]/40 flex items-center gap-1 shadow-sm">
                <Crown className="w-3 h-3" />
                {character?.equipped?.title?.name || "Novice"}
              </span>
              <Highlighter action="box" color="#ff8c42">
                Level {character?.level || 1}
              </Highlighter>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs w-full md:w-auto justify-center">
          <div className="p-3.5 rounded-2xl bg-[#13131f]/90 border border-[#2e2e45] text-center min-w-[120px] shadow-md">
            <span className="text-[10px] text-[#9a97ab] block font-pixel uppercase">Equipped Frame</span>
            <span className="font-semibold text-[#f5f1e8] text-xs">
              {character?.equipped?.frame?.name || "None"}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#13131f]/90 border border-[#2e2e45] text-center min-w-[120px] shadow-md">
            <span className="text-[10px] text-[#9a97ab] block font-pixel uppercase">Banner Theme</span>
            <span className="font-semibold text-[#ffd166] text-xs">
              {character?.equipped?.theme?.name || "Standard Dark"}
            </span>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none relative z-10">
        {tabs.map((t) => {
          const isActive = selectedTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setSelectedTab(t.key)}
              aria-pressed={isActive}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-[#ff8c42] to-[#ffd166] text-[#13131f] font-bold shadow-md shadow-[#ff8c42]/20"
                  : "bg-[#1e1e2e]/90 backdrop-blur-md border border-[#2e2e45] text-[#9a97ab] hover:text-[#f5f1e8] hover:border-[#ff8c42]/40"
              }`}
            >
              {t.label} ({t.count})
            </button>
          );
        })}
      </div>

      {/* Inventory Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="notch-card p-5 rounded-2xl bg-[#1e1e2e] border-2 border-[#2e2e45] h-44 animate-pulse"
            />
          ))}
        </div>
      ) : filteredInventory.length === 0 ? (
        <div className="relative overflow-hidden notch-card p-10 text-center rounded-3xl bg-gradient-to-b from-[#1e1e2e]/90 to-[#13131f]/95 border-2 border-[#2e2e45] space-y-4 max-w-lg mx-auto my-8 z-10">
          <OrbitingCircles radius={45} duration={10} iconSize={24}>
            <Sparkles className="w-3.5 h-3.5 text-[#ffd166]" />
          </OrbitingCircles>
          <div className="w-14 h-14 rounded-2xl bg-[#13131f] border-2 border-[#ffd166]/40 flex items-center justify-center mx-auto z-10 relative">
            <Shield className="w-7 h-7 text-[#ffd166]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-pixel text-sm text-[#f5f1e8]">
              NO ARTIFACTS IN THIS VAULT SLOT
            </h3>
            <p className="text-xs text-[#9a97ab] leading-relaxed">
              Visit The Merchant Bazaar to acquire cosmetics and equip them to your character.
            </p>
          </div>
          <Link
            href="/merchant"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#ffd166] to-[#ff8c42] text-[#13131f] font-pixel text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Visit Merchant Bazaar</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
          {filteredInventory.map((item) => {
            const isEquipped = item.equipped;
            return (
              <MagicCard
                key={item.id}
                gradientColor={isEquipped ? "rgba(255, 209, 102, 0.25)" : "rgba(168, 85, 247, 0.2)"}
                className={`p-5 rounded-2xl bg-[#1e1e2e]/90 backdrop-blur-xl border-2 flex flex-col justify-between gap-4 transition-all shadow-xl ${
                  isEquipped
                    ? "border-[#ffd166] shadow-[0_0_25px_rgba(255,209,102,0.25)] bg-[#ffd166]/5"
                    : "border-[#2e2e45] hover:border-[#ff8c42]/60"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Highlighter action="box" color={isEquipped ? "#ffd166" : "#a855f7"}>
                      {item.shop_item.type.replace("_", " ")}
                    </Highlighter>
                    {isEquipped && (
                      <span className="flex items-center gap-1 text-[10px] font-pixel text-[#ffd166] animate-pulse">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <h3 className="font-pixel text-sm text-[#f5f1e8]">
                    {item.shop_item.name}
                  </h3>
                  <p className="text-xs text-[#9a97ab] leading-relaxed">
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
                  {isEquipped ? "Unequip Relic" : "Equip Relic"}
                </button>
              </MagicCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
