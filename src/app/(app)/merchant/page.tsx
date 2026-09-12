"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShoppingBag, Coins, Check, AlertCircle } from "lucide-react";

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
}

export default function MerchantPage() {
  const queryClient = useQueryClient();
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const { data: character } = useQuery({
    queryKey: ["character"],
    queryFn: async () => {
      const res = await fetch("/api/character");
      if (!res.ok) return null;
      return res.json();
    },
  });

  const { data: catalog = [], isLoading } = useQuery<ShopItemData[]>({
    queryKey: ["shop"],
    queryFn: async () => {
      const res = await fetch("/api/shop");
      if (!res.ok) throw new Error("Failed to load catalog");
      return res.json();
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ["shop"] });
      queryClient.invalidateQueries({ queryKey: ["character"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (err: Error) => {
      setPurchaseError(err.message);
    },
  });

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

        {/* Player gold treasury pill */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1e1e2e] border-2 border-[#ffd166]/40 shadow-md self-start sm:self-auto">
          <Coins className="w-4 h-4 text-[#ffd166] animate-pulse" />
          <span className="text-xs text-[#9a97ab]">Your Vault:</span>
          <span className="font-pixel text-sm text-[#ffd166]">
            {(character?.gold || 0).toLocaleString()}g
          </span>
        </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="notch-card p-5 rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] h-36 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {catalog.map((item) => {
            const canAfford = (character?.gold || 0) >= item.price_gold;
            return (
              <div
                key={item.id}
                className="notch-card p-5 rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] flex flex-col justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-pixel text-[#9a97ab]">
                      {item.type.replace("_", " ")}
                    </span>
                    <div className="flex items-center gap-1 font-pixel text-xs text-[#ffd166]">
                      <Coins className="w-3.5 h-3.5" />
                      <span>{item.price_gold}g</span>
                    </div>
                  </div>

                  <h3 className="font-pixel text-sm text-[#f5f1e8]">{item.name}</h3>
                  <p className="text-xs text-[#9a97ab]">{item.description}</p>
                </div>

                {item.isOwned ? (
                  <div className="py-2 text-center rounded bg-[#13131f] border border-[#2e2e45] text-xs font-pixel text-[#4ade80] flex items-center justify-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#4ade80]" />
                    <span>OWNED</span>
                  </div>
                ) : (
                  <button
                    onClick={() => purchaseMutation.mutate(item.id)}
                    disabled={!canAfford || purchaseMutation.isPending}
                    className="w-full py-2.5 px-3 rounded bg-gradient-to-r from-[#ffd166] to-[#ff8c42] text-[#13131f] font-pixel text-xs font-bold hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    {!canAfford ? "Insufficient Gold" : "Purchase"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
