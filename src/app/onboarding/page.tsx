"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { fireLevelUpConfetti } from "@/components/effects/Confetti";
import { BorderBeam } from "@/components/effects/BorderBeam";
import {
  Flame,
  Globe,
  User,
  Shield,
  Sparkles,
  ArrowRight,
  Check,
  Loader2,
  Dumbbell,
  BookOpen,
  Heart,
  Hammer,
  Target,
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [displayName, setDisplayName] = useState<string>("");
  const [timezone, setTimezone] = useState<string>("UTC");
  const [primaryDiscipline, setPrimaryDiscipline] = useState<string>("BODY");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-detect client timezone on mount (§9 & §15)
  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) setTimezone(detected);
    } catch {
      setTimezone("UTC");
    }

    if (user?.email && !displayName) {
      const defaultName = user.email.split("@")[0];
      setDisplayName(defaultName.charAt(0).toUpperCase() + defaultName.slice(1));
    }
  }, [user]);

  const disciplines = [
    {
      key: "BODY",
      label: "Body",
      icon: Dumbbell,
      color: "#f87171",
      desc: "Physical endurance, strength, workouts, and vitality",
    },
    {
      key: "MIND",
      label: "Mind",
      icon: BookOpen,
      color: "#3b82f6",
      desc: "Intellect, study, reading, coding, and continuous learning",
    },
    {
      key: "SPIRIT",
      label: "Spirit",
      icon: Heart,
      color: "#ec4899",
      desc: "Mindfulness, mental health, meditation, and peace",
    },
    {
      key: "CRAFT",
      label: "Craft",
      icon: Hammer,
      color: "#f59e0b",
      desc: "Work, building projects, creative skills, and artistry",
    },
    {
      key: "FOCUS",
      label: "Focus",
      icon: Target,
      color: "#10b981",
      desc: "Deep work sessions, discipline, time mastery, and habits",
    },
  ];

  const handleFinishOnboarding = async () => {
    if (!displayName.trim()) {
      setError("Please choose an adventurer alias");
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          timezone,
          primaryDiscipline,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "Onboarding failed");
      }

      // Celebratory Confetti shower!
      fireLevelUpConfetti();

      // Smooth transition into The Keep
      setTimeout(() => {
        router.push("/keep");
      }, 1000);
    } catch (err: unknown) {
      setError((err as Error).message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#13131f] text-[#f5f1e8] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#ff8c42]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl notch-card p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#1e1e2e] to-[#171725] border-2 border-[#ff8c42]/40 shadow-2xl relative">
        <BorderBeam size={250} duration={8} colorFrom="#ff8c42" colorTo="#ffd166" />

        {/* Step Indicator */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2e2e45] mb-6">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#ff8c42] animate-pulse" />
            <span className="font-pixel text-xs sm:text-sm text-[#f5f1e8]">
              IGNITE YOUR EMBER
            </span>
          </div>
          <div className="text-xs font-pixel text-[#ffd166]">
            STEP {step} / 3
          </div>
        </div>

        {error && (
          <div className="p-3.5 mb-5 rounded-lg bg-[#f87171]/10 border border-[#f87171]/40 text-xs text-[#f87171]">
            {error}
          </div>
        )}

        {/* STEP 1: Adventurer Alias */}
        {step === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="space-y-1">
              <h2 className="font-pixel text-base text-[#f5f1e8]">
                CHOOSE YOUR ALIAS
              </h2>
              <p className="text-xs text-[#9a97ab]">
                Every legend begins with a name. How shall the realm address you?
              </p>
            </div>

            <div className="flex items-center gap-4 py-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ff8c42] to-[#8b5cf6] p-0.5 shadow-lg flex items-center justify-center font-pixel text-2xl text-[#13131f] shrink-0">
                {displayName ? displayName[0]?.toUpperCase() : "A"}
              </div>

              <div className="flex-1">
                <label
                  htmlFor="alias-input"
                  className="block text-xs font-semibold text-[#f5f1e8] mb-1.5"
                >
                  Hero Name / Handle
                </label>
                <input
                  id="alias-input"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Roland Emberheart"
                  maxLength={30}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#13131f] border border-[#2e2e45] text-sm text-[#f5f1e8] focus:outline-none focus:border-[#ff8c42] transition-colors"
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (displayName.trim()) setStep(2);
                else setError("Alias cannot be blank");
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#ff8c42] to-[#ff5f2e] text-[#13131f] font-pixel text-xs font-bold hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>Confirm Identity</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Timezone Confirmation */}
        {step === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="space-y-1">
              <h2 className="font-pixel text-base text-[#f5f1e8]">
                TEMPORAL ALIGNMENT
              </h2>
              <p className="text-xs text-[#9a97ab]">
                We auto-detected your local timezone. This ensures daily resets match your midnight.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#13131f] border border-[#2e2e45] space-y-2">
              <div className="flex items-center gap-2 text-xs text-[#ffd166]">
                <Globe className="w-4 h-4" />
                <span className="font-semibold">Local Realm Timezone</span>
              </div>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#1e1e2e] border border-[#2e2e45] text-xs text-[#f5f1e8] focus:outline-none focus:border-[#ff8c42]"
              />
              <p className="text-[11px] text-[#9a97ab]">
                Auto-detected via browser: <code className="text-[#ffd166]">{timezone}</code>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-xl bg-[#13131f] border border-[#2e2e45] text-xs text-[#9a97ab] hover:text-[#f5f1e8] transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#ff8c42] to-[#ff5f2e] text-[#13131f] font-pixel text-xs font-bold hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Confirm Timezone</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Primary Discipline Selection */}
        {step === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="space-y-1">
              <h2 className="font-pixel text-base text-[#f5f1e8]">
                PRIMARY DISCIPLINE
              </h2>
              <p className="text-xs text-[#9a97ab]">
                Choose your primary focus to seed your initial bounties. You can level all five!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {disciplines.map((d) => {
                const Icon = d.icon;
                const isSelected = primaryDiscipline === d.key;
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setPrimaryDiscipline(d.key)}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#ff8c42]/15 border-[#ff8c42] shadow-[0_0_12px_rgba(255,140,66,0.3)] scale-[1.02]"
                        : "bg-[#13131f] border-[#2e2e45] text-[#9a97ab] hover:border-[#ff8c42]/40"
                    }`}
                  >
                    <div
                      className="p-2 rounded-lg bg-[#1e1e2e] border border-[#2e2e45] shrink-0"
                      style={{ color: d.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-pixel text-xs text-[#f5f1e8] flex items-center justify-between">
                        <span>{d.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#ff8c42]" />}
                      </div>
                      <div className="text-[10px] text-[#9a97ab] mt-0.5 line-clamp-2">
                        {d.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setStep(2)}
                disabled={isSubmitting}
                className="py-3 px-4 rounded-xl bg-[#13131f] border border-[#2e2e45] text-xs text-[#9a97ab] hover:text-[#f5f1e8] transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleFinishOnboarding}
                disabled={isSubmitting}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#ffd166] via-[#ff8c42] to-[#ff5f2e] text-[#13131f] font-pixel text-xs font-bold hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_25px_rgba(255,140,66,0.4)]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Igniting Hearth...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>IGNITE YOUR EMBER</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
