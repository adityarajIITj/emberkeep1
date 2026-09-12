"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Flame,
  Scroll,
  Shield,
  ShoppingBag,
  History,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const navLinks = [
    { label: "The Keep", href: "/keep", icon: LayoutDashboard },
    { label: "Quest Board", href: "/quests", icon: Scroll },
    { label: "Character", href: "/character", icon: User },
    { label: "The Armory", href: "/armory", icon: Shield },
    { label: "Merchant", href: "/merchant", icon: ShoppingBag },
    { label: "Chronicle", href: "/chronicle", icon: History },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#13131f] text-[#f5f1e8]">
      {/* Top Guildhall Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#1e1e2e]/90 backdrop-blur-md border-b-2 border-[#2e2e45] px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/keep" className="flex items-center gap-2.5 group">
            <div className="p-1.5 rounded-lg bg-[#13131f] border border-[#ff8c42]/50 group-hover:border-[#ff8c42] transition-colors">
              <Flame className="w-5 h-5 text-[#ff8c42] animate-pulse" />
            </div>
            <span className="font-pixel text-sm sm:text-base text-[#f5f1e8] tracking-wider group-hover:text-[#ff8c42] transition-colors">
              EMBERKEEP
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors ${
                    isActive
                      ? "bg-[#ff8c42]/15 text-[#ff8c42] font-semibold border border-[#ff8c42]/40"
                      : "text-[#9a97ab] hover:text-[#f5f1e8] hover:bg-[#13131f]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Sign Out */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-[#9a97ab] truncate max-w-[150px]">
              {user?.email?.split("@")[0] ?? "Adventurer"}
            </span>
            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="p-1.5 rounded bg-[#13131f] border border-[#2e2e45] text-[#9a97ab] hover:text-[#f87171] hover:border-[#f87171]/50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Strip */}
        <nav className="flex md:hidden items-center justify-around gap-1 pt-2.5 mt-2.5 border-t border-[#2e2e45] overflow-x-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center py-1 px-2 rounded text-[10px] ${
                  isActive ? "text-[#ff8c42] font-bold" : "text-[#9a97ab]"
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </header>

      {/* App Shell Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
