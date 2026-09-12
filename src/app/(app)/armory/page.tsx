"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Sparkles, Check, CheckCircle2 } from "lucide-react";

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

  const { data: inventory = [], isLoading } = useQuery<InventoryItemData[]>({
    queryKey: ["inventory"],
    queryFn: async () => {
      const res = await fetch("/api/inventory");
      if (!res.ok) throw new Error("Failed to load inventory");
      return res.json();
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["character"] });
    },
  });

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

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="notch-card p-5 rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] h-32 animate-pulse"
            />
          ))}
        </div>
      ) : inventory.length === 0 ? (
        <div className="notch-card p-12 text-center rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] space-y-3 max-w-md mx-auto my-8">
          <Sparkles className="w-8 h-8 text-[#ffd166] mx-auto opacity-70" />
          <h3 className="font-pixel text-sm text-[#f5f1e8]">YOUR ARMORY IS EMPTY</h3>
          <p className="text-xs text-[#9a97ab]">
            Visit The Merchant to acquire titles, custom avatar frames, and themes using your hard-earned gold.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventory.map((item) => (
            <div
              key={item.id}
              className={`notch-card p-5 rounded-xl bg-[#1e1e2e] border-2 flex flex-col justify-between gap-4 transition-all ${
                item.equipped
                  ? "border-[#ffd166] shadow-[0_0_15px_rgba(255,209,102,0.15)]"
                  : "border-[#2e2e45]"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-pixel text-[#9a97ab]">
                    {item.shop_item.type.replace("_", " ")}
                  </span>
                  {item.equipped && (
                    <span className="flex items-center gap-1 text-[10px] font-pixel text-[#ffd166]">
                      <CheckCircle2 className="w-3 h-3 text-[#ffd166]" />
                      EQUIPPED
                    </span>
                  )}
                </div>
                <h3 className="font-pixel text-sm text-[#f5f1e8]">{item.shop_item.name}</h3>
                <p className="text-xs text-[#9a97ab]">{item.shop_item.description}</p>
              </div>

              <button
                onClick={() =>
                  equipMutation.mutate({ id: item.id, equip: !item.equipped })
                }
                disabled={equipMutation.isPending}
                className={`w-full py-2 px-3 rounded text-xs font-pixel font-bold transition-all cursor-pointer ${
                  item.equipped
                    ? "bg-[#13131f] border border-[#2e2e45] text-[#9a97ab] hover:text-[#f87171] hover:border-[#f87171]/40"
                    : "bg-gradient-to-r from-[#ffd166] to-[#ff8c42] text-[#13131f] hover:brightness-110"
                }`}
              >
                {item.equipped ? "Unequip" : "Equip"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
