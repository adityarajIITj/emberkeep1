"use client";

import React from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { MobileNav } from "@/components/layout/MobileNav";
import { EmberParticles } from "@/components/animations/EmberParticles";
import { PageTransition } from "@/components/animations/PageTransition";
import { useQuery } from "@tanstack/react-query";

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

  return (
    <div
      className={`min-h-screen flex flex-col bg-[#13131f] text-[#f5f1e8] relative selection:bg-[#ff8c42]/30 selection:text-[#ffd166] ${themeClass}`}
    >
      {/* Ambient Floating Ember Particles */}
      <EmberParticles count={30} />

      {/* Persistent Guildhall Top HUD */}
      <AppHeader />

      {/* Main Content Area with Fluid Page Transition */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-12 relative z-10">
        <PageTransition>{children}</PageTransition>
      </main>

      {/* Mobile Sticky Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
