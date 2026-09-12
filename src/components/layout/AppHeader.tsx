"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { EmberFlame } from "@/components/animations/EmberFlame";
import { xpProgressInLevel, getRankTitle } from "@/lib/server/rpg-engine";
import { AnimatedNumber } from "@/components/effects/AnimatedNumber";
import { sounds } from "@/lib/audio/retro-sound";
import {
  Flame,
  Coins,
  Scroll,
  Shield,
  ShoppingBag,
  History,
  User,
  LogOut,
  LayoutDashboard,
  Crown,
  Volume2,
  VolumeX,
} from "lucide-react";

export function AppHeader() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [isMuted, setIsMuted] = React.useState(false);

  React.useEffect(() => {
    setIsMuted(sounds.getMuted());
  }, []);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sounds.setMuted(next);
    if (!next) {
      sounds.playClick();
    }
  };

  // Fetch live character state
  const { data: character } = useQuery({
    queryKey: ["character"],
    queryFn: async () => {
      const res = await fetch("/api/character");
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 1000 * 30, // 30s
  });

  const xpProgress = xpProgressInLevel(character?.total_xp || 0);
  const rankTitle = character ? getRankTitle(character.level) : "Novice";
  const streak = character?.current_streak || 0;
  const gold = character?.gold || 0;

  const navLinks = [
    { label: "The Keep", href: "/keep", icon: LayoutDashboard },
    { label: "Quest Board", href: "/quests", icon: Scroll },
    { label: "Character", href: "/character", icon: User },
    { label: "The Armory", href: "/armory", icon: Shield },
    { label: "Merchant", href: "/merchant", icon: ShoppingBag },
    { label: "Chronicle", href: "/chronicle", icon: History },
  ];

  // Dynamic Avatar Frame border based on equipped cosmetic
  let frameBorder = "border-[#2e2e45]";
  if (character?.equipped?.frame?.key === "frame_verdant") {
    frameBorder = "border-[#4ade80] shadow-[0_0_12px_rgba(74,222,128,0.4)]";
  } else if (character?.equipped?.frame?.key === "frame_ember") {
    frameBorder = "border-[#ff8c42] shadow-[0_0_15px_rgba(255,140,66,0.5)]";
  } else if (character?.equipped?.frame?.key === "frame_celestial") {
    frameBorder = "border-[#ffd166] shadow-[0_0_20px_rgba(255,209,102,0.6)]";
  }

  return (
    <header className="sticky top-0 z-40 bg-[#1e1e2e]/95 backdrop-blur-md border-b-2 border-[#2e2e45] shadow-lg">
      {/* Top Guildhall Navigation & Live Stats HUD */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-6">
          <Link href="/keep" className="flex items-center gap-2.5 group">
            <div className="p-1.5 rounded-lg bg-[#13131f] border border-[#ff8c42]/50 group-hover:border-[#ff8c42] transition-colors shadow-[0_0_10px_rgba(255,140,66,0.2)]">
              <Flame className="w-5 h-5 text-[#ff8c42] animate-pulse" />
            </div>
            <span className="font-pixel text-sm sm:text-base text-[#f5f1e8] tracking-wider group-hover:text-[#ff8c42] transition-colors">
              EMBERKEEP
            </span>
          </Link>

          {/* Desktop Navigation Links with Responsive Tooltips */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs transition-all relative group ${
                    isActive
                      ? "bg-[#ff8c42]/15 text-[#ff8c42] font-semibold border border-[#ff8c42]/40 shadow-sm"
                      : "text-[#9a97ab] hover:text-[#f5f1e8] hover:bg-[#13131f]"
                  }`}
                  title={link.label}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden xl:inline">{link.label}</span>
                  {/* Floating tooltip for compact viewports */}
                  <span className="xl:hidden absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded bg-[#13131f] border border-[#ff8c42]/50 text-[10px] font-pixel text-[#ffd166] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-50">
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Live Adventurer HUD (§4 & §9 Screen 4) */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Level & XP Micro-Bar */}
          <div className="hidden sm:flex flex-col items-end min-w-[130px]">
            <div className="flex items-center gap-1.5 text-[11px] mb-1">
              <span className="font-pixel text-[#ff8c42] text-[10px]">
                LVL {xpProgress.currentLevel}
              </span>
              <span className="text-[#9a97ab] text-[10px]">
                ({xpProgress.progressPercentage}%)
              </span>
            </div>
            {/* Shimmering XP Bar */}
            <div
              className="w-full h-1.5 bg-[#13131f] rounded-full overflow-hidden border border-[#2e2e45] relative"
              title={`XP: ${xpProgress.xpIntoLevel} / ${xpProgress.xpNeededForNext} (Total: ${xpProgress.totalXp})`}
            >
              <div
                className="h-full bg-gradient-to-r from-[#ff8c42] to-[#ff5f2e] transition-all duration-500 rounded-full"
                style={{ width: `${xpProgress.progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Ember Streak Flame Counter */}
          <div className="flex items-center">
            <EmberFlame streak={streak} size="sm" showLabel={false} />
            <span
              className="font-pixel text-xs text-[#ffd166] ml-1.5"
              title={`Active Streak: ${streak} days`}
            >
              {streak}d
            </span>
          </div>

          {/* Gold Vault with Animated Rolling Counter */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#13131f] border border-[#ffd166]/30 text-xs shadow-inner"
            title="Gold Coins"
          >
            <Coins className="w-3.5 h-3.5 text-[#ffd166] animate-pulse" />
            <span className="font-pixel text-[11px] text-[#ffd166]">
              <AnimatedNumber value={gold} />g
            </span>
          </div>

          {/* Sound FX Toggle Button */}
          <button
            onClick={toggleSound}
            title={isMuted ? "Unmute Retro Sound FX" : "Mute Sound FX"}
            className="p-1.5 rounded bg-[#13131f] border border-[#2e2e45] text-[#ffd166] hover:border-[#ffd166]/50 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 opacity-50" /> : <Volume2 className="w-4 h-4 animate-bounce" />}
          </button>

          {/* Player Profile & Equipped Cosmetic Frame */}
          <div
            className={`flex items-center gap-2 p-1 rounded-lg bg-[#13131f] border ${frameBorder} transition-all`}
          >
            <div className="w-6 h-6 rounded bg-gradient-to-br from-[#ff8c42]/30 to-[#8b5cf6]/30 flex items-center justify-center text-[10px] font-pixel text-[#ffd166]">
              {character?.user?.display_name?.slice(0, 1).toUpperCase() || "A"}
            </div>
            <div className="hidden xl:flex flex-col text-left pr-1">
              <span className="text-[11px] font-semibold text-[#f5f1e8] leading-none">
                {character?.user?.display_name || user?.email?.split("@")[0]}
              </span>
              <span className="text-[9px] text-[#ffd166] flex items-center gap-0.5 mt-0.5">
                <Crown className="w-2.5 h-2.5" />
                {character?.equipped?.title?.name || rankTitle}
              </span>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={async (e) => {
              e.preventDefault();
              try {
                await signOut();
              } catch {
                window.location.href = "/login";
              }
            }}
            title="Sign Out"
            className="p-1.5 rounded bg-[#13131f] border border-[#2e2e45] text-[#9a97ab] hover:text-[#f87171] hover:border-[#f87171]/50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
