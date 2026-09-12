"use client";

import React, { useRef, useState } from "react";
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
  Flame,
  Gem,
  Zap,
} from "lucide-react";
import { MagicCard } from "@/components/ui/magic-card";
import { Particles } from "@/components/ui/particles";
import { MorphingText } from "@/components/ui/morphing-text";
import { Highlighter } from "@/components/ui/highlighter";
import { OrbitingCircles } from "@/components/ui/orbiting-circles";
import { AnimatedNumber } from "@/components/effects/AnimatedNumber";
import BoxCarousel, { CarouselItem } from "@/components/ui/box-carousel";
import AnimatedPathText from "@/components/ui/text-along-path";
import VariableFontCursorProximity from "@/components/fancy/text/variable-font-cursor-proximity";
import { sounds } from "@/lib/audio/retro-sound";

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
  const merchantBannerRef = useRef<HTMLDivElement>(null);
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const featuredRelics: CarouselItem[] = [
    {
      id: "shop-relic-1",
      title: "Crown of Embers",
      subtitle: "500g",
      badge: "LEGENDARY CROWN",
      description: "Infused with eternal guild flame. Equips the ultimate radiant glow across your guildhall profile.",
      color: "#ffd166",
      icon: <Crown className="w-4 h-4 text-[#ffd166]" />,
    },
    {
      id: "shop-relic-2",
      title: "Citadel Crest",
      subtitle: "350g",
      badge: "MYTHIC FRAME",
      description: "Forged in the legendary Citadel of High Valor. Shields your adventurer avatar with emerald light.",
      color: "#10b981",
      icon: <Shield className="w-4 h-4 text-[#10b981]" />,
    },
    {
      id: "shop-relic-3",
      title: "Twilight Horizon",
      subtitle: "450g",
      badge: "REALM THEME",
      description: "Bathes the entire guildhall in celestial amethyst and violet dawn hues.",
      color: "#a855f7",
      icon: <Palette className="w-4 h-4 text-[#a855f7]" />,
    },
    {
      id: "shop-relic-4",
      title: "Abyss Monarch",
      subtitle: "600g",
      badge: "EXCLUSIVE TITLE",
      description: "Granted only to champions who conquered deep procrastination in the darkest hours.",
      color: "#ef4444",
      icon: <Flame className="w-4 h-4 text-[#ef4444]" />,
    },
  ];

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
      sounds.playGoldChime();
      fireQuestConfetti(0.5, 0.4);
      queryClient.invalidateQueries({ queryKey: ["shop"] });
      queryClient.invalidateQueries({ queryKey: ["character"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (err: Error) => {
      setPurchaseError(err.message);
    },
  });

  // Equip Mutation
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
      sounds.playClick();
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
        <div className="w-full h-16 rounded-xl bg-[#13131f] border border-[#2e2e45] p-2 flex items-center justify-center shadow-inner">
          <div className={`w-full h-full rounded-lg bg-gradient-to-r ${gradient} opacity-85 flex items-center justify-center shadow-md`}>
            <Palette className="w-5 h-5 text-[#13131f]" />
          </div>
        </div>
      );
    }

    if (item.type === "TITLE") {
      return (
        <div className="w-full h-16 rounded-xl bg-[#13131f] border border-[#2e2e45] flex items-center justify-center px-3 shadow-inner">
          <div className="px-3 py-1.5 rounded-lg bg-[#ffd166]/15 border border-[#ffd166]/50 text-[#ffd166] font-pixel text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,209,102,0.2)]">
            <Crown className="w-3.5 h-3.5" />
            <span>{item.name}</span>
          </div>
        </div>
      );
    }

    if (item.type === "AVATAR_FRAME") {
      let borderColor = "border-[#4ade80]";
      if (item.key === "frame_ember") borderColor = "border-[#ff8c42] shadow-[0_0_15px_#ff8c42]";
      if (item.key === "frame_celestial") borderColor = "border-[#ffd166] shadow-[0_0_18px_#ffd166]";

      return (
        <div className="w-full h-16 rounded-xl bg-[#13131f] border border-[#2e2e45] flex items-center justify-center shadow-inner">
          <div className={`w-11 h-11 rounded-xl bg-[#1e1e2e] border-2 ${borderColor} flex items-center justify-center`}>
            <Shield className="w-5 h-5 text-[#ffd166]" />
          </div>
        </div>
      );
    }

    return null;
  };

  const getSpotlightColor = (type: string) => {
    switch (type) {
      case "TITLE":
        return "rgba(255, 209, 102, 0.22)";
      case "AVATAR_FRAME":
        return "rgba(139, 92, 246, 0.22)";
      case "THEME":
        return "rgba(255, 140, 66, 0.22)";
      default:
        return "rgba(255, 209, 102, 0.18)";
    }
  };

  return (
    <div className="space-y-6 relative animate-fadeIn">
      {/* Golden Treasure Particles */}
      <Particles className="opacity-30" quantity={35} color="#ffd166" />

      {/* Header with Morphing Merchant Quotes */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#2e2e45] relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-[#ffd166] font-pixel mb-1">
            <ShoppingBag className="w-3.5 h-3.5 text-[#ffd166]" />
            <span>BAZAAR OF EMBERKEEP</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-pixel text-[#f5f1e8] flex items-center gap-2">
            <span>THE MERCHANT</span>
          </h1>
          <p className="text-xs text-[#9a97ab] mt-1 flex items-center gap-1.5 flex-wrap">
            <span>Exchange hard-won quest gold for prestigious</span>
            <Highlighter action="underline" color="#ffd166">
              Cosmetic Relics & Titles
            </Highlighter>
          </p>
        </div>

        {/* Vault balance pill */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#1e1e2e]/90 border-2 border-[#ffd166]/40 shadow-xl backdrop-blur-md self-start md:self-auto">
          <div className="p-2 rounded-xl bg-[#ffd166]/15 border border-[#ffd166]/40 text-[#ffd166]">
            <Coins className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] text-[#9a97ab] font-pixel uppercase">Your Treasury</div>
            <div className="font-pixel text-base text-[#ffd166]">
              <AnimatedNumber value={character?.gold || 0} />g
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Bazaar Showcase Deck (7 cols + 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative z-10">
        {/* Left Hero (7 cols): Enchanted Wares Banner & Orbiting Pedestal */}
        <div
          ref={merchantBannerRef}
          className="lg:col-span-7 relative overflow-hidden p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-[#1e1e2e]/95 via-[#1a1a2b]/95 to-[#13131f]/95 border-2 border-[#ffd166]/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 group"
        >
          <div className="space-y-3 text-center sm:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#ffd166]/15 border border-[#ffd166]/40 text-[#ffd166] text-[10px] font-pixel">
              <Sparkles className="w-3 h-3 text-[#ffd166]" />
              <span>ENCHANTED WARES OF THE GUILD</span>
            </div>
            <div>
              <div className="text-[10px] font-pixel text-[#9a97ab] uppercase mb-1">
                Bazaar Creed
              </div>
              <VariableFontCursorProximity
                className="text-xs sm:text-sm font-pixel text-[#ffd166] tracking-wide"
                fromFontVariationSettings="'wght' 400, 'slnt' 0"
                toFontVariationSettings="'wght' 900, 'slnt' -8"
                radius={150}
                containerRef={merchantBannerRef}
              >
                EXCHANGE SACRED GOLD FOR PRESTIGE & MAJESTY
              </VariableFontCursorProximity>
            </div>
            <p className="text-xs text-[#9a97ab] leading-relaxed">
              Every cosmetic acquired here is permanent to your adventurer account. Equip titles and frames to reflect your guild stature across the realm.
            </p>
          </div>

          {/* Orbiting Treasure Pedestal with Animated Path Text */}
          <div className="relative flex items-center justify-center size-36 shrink-0">
            <div className="absolute inset-0 size-full pointer-events-none flex items-center justify-center -z-0">
              <AnimatedPathText
                path="M 72, 72 m -54, 0 a 54,54 0 1,0 108,0 a 54,54 0 1,0 -108,0"
                viewBox="0 0 144 144"
                text="✦ BAZAAR VAULT ✦ SACRED TREASURES ✦"
                duration={16}
                textClassName="text-[7.5px] tracking-[0.2em] fill-[#ffd166]/70 font-pixel"
                svgClassName="w-36 h-36"
              />
            </div>

            <OrbitingCircles radius={38} duration={12} reverse speed={1.2} iconSize={20} path={true}>
              <Crown className="w-3 h-3 text-[#ffd166]" />
            </OrbitingCircles>
            <OrbitingCircles radius={38} duration={12} delay={6} reverse speed={1.2} iconSize={20} path={false}>
              <Shield className="w-3 h-3 text-[#8b5cf6]" />
            </OrbitingCircles>

            <div className="w-12 h-12 rounded-2xl bg-[#13131f] border-2 border-[#ffd166]/50 shadow-[0_0_20px_rgba(255,209,102,0.3)] flex items-center justify-center z-10">
              <Gem className="w-6 h-6 text-[#ffd166] animate-pulse" />
            </div>
          </div>
        </div>

        {/* Right Hero (5 cols): 3D Vault Showcase (BoxCarousel) */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-[#1e1e2e]/90 backdrop-blur-xl border-2 border-[#2e2e45] hover:border-[#ffd166]/40 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="w-full flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#ffd166]" />
              <span className="font-pixel text-xs text-[#f5f1e8]">
                VAULT SHOWCASE
              </span>
            </div>
            <span className="text-[10px] text-[#ffd166] font-pixel">
              3D CUBE
            </span>
          </div>
          <p className="text-xs text-[#9a97ab] mb-2 leading-relaxed">
            Preview legendary equipment and cosmetic wonders crafted by the ancient guild artisans.
          </p>

          <div className="flex-1 flex items-center justify-center py-1">
            <BoxCarousel
              items={featuredRelics}
              width={260}
              height={165}
              perspective={850}
              autoRotateInterval={4000}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none relative z-10">
        {filterTabs.map((t) => {
          const isActive = selectedType === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setSelectedType(t.key)}
              aria-pressed={isActive}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-[#ffd166] to-[#ff8c42] text-[#13131f] font-bold shadow-md shadow-[#ffd166]/20"
                  : "bg-[#1e1e2e]/90 backdrop-blur-md border border-[#2e2e45] text-[#9a97ab] hover:text-[#f5f1e8] hover:border-[#ffd166]/40"
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
          className="p-4 rounded-xl bg-[#f87171]/10 border border-[#f87171]/40 flex items-center gap-2 text-xs text-[#f87171] relative z-10"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{purchaseError}</span>
        </div>
      )}

      {/* Catalog Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 relative z-10">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="notch-card p-5 rounded-2xl bg-[#1e1e2e] border-2 border-[#2e2e45] h-56 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 relative z-10">
          {filteredCatalog.map((item) => {
            const canAfford = (character?.gold || 0) >= item.price_gold;
            const isEquipped = item.isEquipped;

            return (
              <MagicCard
                key={item.id}
                gradientColor={getSpotlightColor(item.type)}
                className="p-5 rounded-2xl bg-[#1e1e2e]/90 backdrop-blur-xl border-2 border-[#2e2e45] hover:border-[#ffd166]/60 flex flex-col justify-between gap-4 group shadow-xl transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Highlighter action="box" color={item.type === "TITLE" ? "#ffd166" : item.type === "THEME" ? "#ff8c42" : "#8b5cf6"}>
                      {item.type.replace("_", " ")}
                    </Highlighter>
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
                    <p className="text-xs text-[#9a97ab] line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div>
                  {item.isOwned ? (
                    isEquipped ? (
                      <div className="py-2.5 px-3 rounded-xl bg-[#ffd166]/15 border border-[#ffd166]/50 text-xs font-pixel text-[#ffd166] flex items-center justify-center gap-1.5 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#ffd166]" />
                        <span>EQUIPPED</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 py-2 text-center rounded-xl bg-[#13131f] border border-[#2e2e45] text-[11px] font-pixel text-[#4ade80] flex items-center justify-center gap-1">
                          <Check className="w-3 h-3 text-[#4ade80]" />
                          <span>OWNED</span>
                        </div>
                        {item.inventoryId && (
                          <button
                            onClick={() =>
                              equipMutation.mutate({ inventoryId: item.inventoryId! })
                            }
                            disabled={equipMutation.isPending}
                            className="py-2 px-3 rounded-xl bg-[#ff8c42] hover:bg-[#ff8c42]/90 text-[#13131f] font-pixel text-[10px] font-bold transition-all cursor-pointer shadow-md"
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
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#ffd166] to-[#ff8c42] text-[#13131f] font-pixel text-xs font-bold hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md"
                    >
                      {!canAfford
                        ? `Need ${item.price_gold - (character?.gold || 0)}g more`
                        : "Acquire Artifact"}
                    </button>
                  )}
                </div>
              </MagicCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
