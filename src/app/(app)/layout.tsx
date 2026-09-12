"use client";

import React from "react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { MobileNav } from "@/components/layout/MobileNav";
import { EmberParticles } from "@/components/animations/EmberParticles";
import { PageTransition } from "@/components/animations/PageTransition";
import { Dock, DockIcon } from "@/components/ui/dock";
import Novatrix from "@/components/ui/novatrix-background";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Scroll,
  User,
  Shield,
  ShoppingBag,
  History,
} from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: character } = useQuery({
    queryKey: ["character"],
    queryFn: async () => {
      const res = await fetch("/api/character");
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 1000 * 30,
  });

  // Dynamic banner theme class
  let themeClass = "";
  if (character?.equipped?.theme?.key === "theme_twilight") {
    themeClass = "theme-twilight";
  } else if (character?.equipped?.theme?.key === "theme_citadel") {
    themeClass = "theme-citadel";
  } else if (character?.equipped?.theme?.key === "theme_abyss") {
    themeClass = "theme-abyss";
  }

  const navItems = [
    { label: "The Keep", href: "/keep", icon: LayoutDashboard },
    { label: "Quests", href: "/quests", icon: Scroll },
    { label: "Character", href: "/character", icon: User },
    { label: "Armory", href: "/armory", icon: Shield },
    { label: "Merchant", href: "/merchant", icon: ShoppingBag },
    { label: "Chronicle", href: "/chronicle", icon: History },
  ];

  return (
    <div
      className={`min-h-screen flex flex-col bg-[#0d0d17] text-[#f5f1e8] relative selection:bg-[#ff8c42]/30 selection:text-[#ffd166] pb-24 ${themeClass}`}
    >
      {/* 1. Dynamic Novatrix Silk Shader Background */}
      <div className="fixed inset-0 pointer-events-none -z-30 overflow-hidden opacity-25">
        <Novatrix color={[1.0, 0.45, 0.18]} amplitude={0.25} speed={0.7} />
      </div>

      {/* 2. Cyber-Fantasy Flickering Grid Matrix */}
      <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden opacity-25">
        <FlickeringGrid
          className="size-full"
          squareSize={4}
          gridGap={8}
          color="#ff8c42"
          maxOpacity={0.35}
          flickerChance={0.12}
        />
      </div>

      {/* 3. Ambient Floating Ember Particles */}
      <EmberParticles count={25} />

      {/* Persistent Guildhall Top HUD */}
      <AppHeader />

      {/* Main Content Area with Fluid Page Transition */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
        <PageTransition>{children}</PageTransition>
      </main>

      {/* Floating Magnifying MacOS Dock (Desktop Viewport) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 hidden md:block">
        <Dock className="border-[#ff8c42]/40 bg-[#1e1e2e]/85 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.6)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <DockIcon key={item.label} label={item.label}>
                <Link
                  href={item.href}
                  className="flex flex-col items-center justify-center w-full h-full text-[#9a97ab] hover:text-[#ffd166] transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </Link>
              </DockIcon>
            );
          })}
        </Dock>
      </div>

      {/* Mobile Sticky Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
