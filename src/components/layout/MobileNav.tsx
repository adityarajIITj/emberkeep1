"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Scroll,
  User,
  Shield,
  ShoppingBag,
  History,
} from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();

  const navLinks = [
    { label: "Keep", href: "/keep", icon: LayoutDashboard },
    { label: "Quests", href: "/quests", icon: Scroll },
    { label: "Character", href: "/character", icon: User },
    { label: "Armory", href: "/armory", icon: Shield },
    { label: "Merchant", href: "/merchant", icon: ShoppingBag },
    { label: "Chronicle", href: "/chronicle", icon: History },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#1e1e2e]/95 backdrop-blur-md border-t-2 border-[#2e2e45] px-2 py-1.5 shadow-2xl"
    >
      <div className="flex items-center justify-around gap-1 max-w-lg mx-auto">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center min-w-[48px] py-1.5 px-2 rounded-lg text-center transition-all ${
                isActive
                  ? "text-[#ff8c42] font-bold scale-105 bg-[#13131f] border border-[#ff8c42]/30 shadow-[0_0_10px_rgba(255,140,66,0.15)]"
                  : "text-[#9a97ab] hover:text-[#f5f1e8]"
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="text-[10px] tracking-tight">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
