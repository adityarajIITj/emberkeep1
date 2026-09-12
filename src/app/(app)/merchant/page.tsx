"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fireQuestConfetti } from "@/components/effects/Confetti";
import {
  ShoppingBag,
  Coins,
  Check,
  AlertCircle,
  Sparkles,
  Shield,
  Crown,
  Palette,
  CheckCircle2,
} from "lucide-react";

interface ShopItemData {
  id: string;
  key: string;
  name: string;
  description: string;
  type: "TITLE" | "BADGE" | "AVATAR_FRAME" | "THEME";
  price_gold: number;
  icon_key: string;
  isOwned: boolean;
  isEquipped: boolean;
  inventoryId: string | null;
}

export default function MerchantPage() {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const { data: character } = useQuery({
    queryKey: ["character"],
    queryFn: async () => {
      const res = await fetch("/api/character");
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 1000 * 30,
  });

  const { data: catalog = [], isLoading } = useQuery<ShopItemData[]>({
    queryKey: ["shop"],
    queryFn: async () => {
      const res = await fetch("/api/shop");
      if (!res.ok) throw new Error("Failed to load catalog");
      return res.json();
    },
  });

  // Purchase Mutation
  const purchaseMutation = useMutation({
    mutationFn: async (itemId: string) => {
      setPurchaseError(null);
      const res = await fetch(`/api/shop/${itemId}/purchase`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "Failed to purchase item");
      }
      return res.json();
    },
    onSuccess: () => {
      fireQuestConfetti(0.5, 0.4);
      queryClient.invalidateQueries({ queryKey: ["shop"] });
      queryClient.invalidateQueries({ queryKey: ["character"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (err: Error) => {
      setPurchaseError(err.message);
    },
  });

  // Equip Mutation (Equip Now action from the shop!)
  const equipMutation = useMutation({
    mutationFn: async ({ inventoryId }: { inventoryId: string }) => {
      const res = await fetch(`/api/inventory/${inventoryId}/equip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equip: true }),
      });
      if (!res.ok) throw new Error("Failed to equip item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop"] });
      queryClient.invalidateQueries({ queryKey: ["character"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });

  const filteredCatalog =
    selectedType === "ALL"
      ? catalog
      : catalog.filter((item) => item.type === selectedType);

  const filterTabs = [
    { key: "ALL", label: "All Relics" },
    { key: "THEME", label: "Themes" },
    { key: "TITLE", label: "Titles" },
    { key: "AVATAR_FRAME", label: "Frames" },
  ];

  const renderCosmeticPreview = (item: ShopItemData) => {
    if (item.type === "THEME") {
      let gradient = "from-[#ff8c42] to-[#ff5f2e]";
      if (item.key === "theme_twilight") gradient = "from-[#8b5cf6] via-[#ec4899] to-[#ff8c42]";
      if (item.key === "theme_citadel") gradient = "from-[#ffd166] via-[#10b981] to-[#3b82f6]";
      if (item.key === "theme_abyss") gradient = "from-[#dc2626] via-[#7c3aed] to-[#1e1e2e]";

      return (
        <div className="w-full h-14 rounded-lg bg-[#13131f] border border-[#2e2e45] p-1.5 flex items-center justify-center">
          <div className={`w-full h-full rounded-md bg-gradient-to-r ${gradient} opacity-80 flex items-center justify-center`}>
            <Palette className="w-4 h-4 text-[#13131f]" />
          </div>
        </div>
      );
    }

    if (item.type === "TITLE") {
      return (
        <div className="w-full h-14 rounded-lg bg-[#13131f] border border-[#2e2e45] flex items-center justify-center px-3">
          <div className="px-2.5 py-1 rounded bg-[#ffd166]/10 border border-[#ffd166]/40 text-[#ffd166] font-pixel text-[11px] flex items-center gap-1.5">
            <Crown className="w-3 h-3" />
            <span>{item.name}</span>
          </div>
        </div>
      );
    }

    if (item.type === "AVATAR_FRAME") {
      let borderColor = "border-[#4ade80]";
      if (item.key === "frame_ember") borderColor = "border-[#ff8c42] shadow-[0_0_12px_#ff8c42]";
      if (item.key === "frame_celestial") borderColor = "border-[#ffd166] shadow-[0_0_15px_#ffd166]";

      return (
        <div className="w-full h-14 rounded-lg bg-[#13131f] border border-[#2e2e45] flex items-center justify-center">
          <div className={`w-10 h-10 rounded-xl bg-[#1e1e2e] border-2 ${borderColor} flex items-center justify-center`}>
            <Shield className="w-4 h-4 text-[#9a97ab]" />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2e2e45]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-[#ffd166] font-pixel mb-1">
            <ShoppingBag className="w-3.5 h-3.5 text-[#ffd166]" />
            <span>BAZAAR OF EMBERKEEP</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-pixel text-[#f5f1e8]">
            THE MERCHANT
          </h1>
          <p className="text-xs text-[#9a97ab] mt-1">
            Trade your quest gold for prestigious titles, frames, and themes
          </p>
        </div>

        {/* Vault balance pill */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1e1e2e] border-2 border-[#ffd166]/40 shadow-md self-start sm:self-auto">
          <Coins className="w-4 h-4 text-[#ffd166] animate-pulse" />
          <span className="text-xs text-[#9a97ab]">Your Vault:</span>
          <span className="font-pixel text-sm text-[#ffd166]">
            {(character?.gold || 0).toLocaleString()}g
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {filterTabs.map((t) => {
          const isActive = selectedType === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setSelectedType(t.key)}
              aria-pressed={isActive}
              className={`px-3.5 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-[#ffd166] text-[#13131f] font-bold shadow-md"
                  : "bg-[#1e1e2e] border border-[#2e2e45] text-[#9a97ab] hover:text-[#f5f1e8] hover:border-[#ffd166]/40"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {purchaseError && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-[#f87171]/10 border border-[#f87171]/40 flex items-center gap-2 text-xs text-[#f87171]"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{purchaseError}</span>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="notch-card p-5 rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] h-56 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCatalog.map((item) => {
            const canAfford = (character?.gold || 0) >= item.price_gold;
            const isEquipped = item.isEquipped;

            return (
              <div
                key={item.id}
                className="notch-card-interactive p-5 rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] flex flex-col justify-between gap-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-pixel text-[#9a97ab] uppercase">
                      {item.type.replace("_", " ")}
                    </span>
                    <div className="flex items-center gap-1 font-pixel text-xs text-[#ffd166]">
                      <Coins className="w-3.5 h-3.5" />
                      <span>{item.price_gold}g</span>
                    </div>
                  </div>

                  {/* Cosmetic Visual Preview */}
                  {renderCosmeticPreview(item)}

                  <div className="space-y-1">
                    <h3 className="font-pixel text-xs sm:text-sm text-[#f5f1e8] group-hover:text-[#ffd166] transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-[#9a97ab] line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div>
                  {item.isOwned ? (
                    isEquipped ? (
                      <div className="py-2.5 px-3 rounded bg-[#ffd166]/15 border border-[#ffd166]/50 text-xs font-pixel text-[#ffd166] flex items-center justify-center gap-1.5 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#ffd166]" />
                        <span>EQUIPPED</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 py-2 text-center rounded bg-[#13131f] border border-[#2e2e45] text-[11px] font-pixel text-[#4ade80] flex items-center justify-center gap-1">
                          <Check className="w-3 h-3 text-[#4ade80]" />
                          <span>OWNED</span>
                        </div>
                        {item.inventoryId && (
                          <button
                            onClick={() =>
                              equipMutation.mutate({ inventoryId: item.inventoryId! })
                            }
                            disabled={equipMutation.isPending}
                            className="py-2 px-3 rounded bg-[#ff8c42] hover:bg-[#ff8c42]/90 text-[#13131f] font-pixel text-[10px] font-bold transition-all cursor-pointer"
                          >
                            Equip Now
                          </button>
                        )}
                      </div>
                    )
                  ) : (
                    <button
                      onClick={() => purchaseMutation.mutate(item.id)}
                      disabled={!canAfford || purchaseMutation.isPending}
                      className="w-full py-2.5 px-3 rounded bg-gradient-to-r from-[#ffd166] to-[#ff8c42] text-[#13131f] font-pixel text-xs font-bold hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md"
                    >
                      {!canAfford
                        ? `Need ${item.price_gold - (character?.gold || 0)}g more`
                        : "Acquire Artifact"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
