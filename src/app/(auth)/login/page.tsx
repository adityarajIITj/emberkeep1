"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validation/auth";
import { BorderBeam } from "@/components/effects/BorderBeam";
import {
  Loader2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Flame,
  Zap,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/keep";
  const notice = searchParams.get("notice");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setServerError(null);
    setErrors({});

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as "email" | "password";
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);

      const firstField = result.error.issues[0]?.path[0];
      if (firstField) {
        document.getElementById(String(firstField))?.focus();
      }
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: result.data.email,
        password: result.data.password,
      });

      if (error) {
        setServerError("Invalid email or passphrase. Check credentials or Kindle an Ember.");
        setIsLoading(false);
        return;
      }

      router.push(next);
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      setServerError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden notch-card p-6 sm:p-8 rounded-2xl bg-[#1e1e2e]/85 backdrop-blur-2xl border-2 border-[#ff8c42]/40 shadow-[0_15px_50px_rgba(0,0,0,0.6)]">
      {/* 21st.dev Border Beam Animation */}
      <BorderBeam size={240} duration={8} colorFrom="#ff8c42" colorTo="#ffd166" />

      {/* Header Tabs */}
      <div className="flex items-center justify-between p-1 rounded-xl bg-[#13131f]/90 border border-[#2e2e45] mb-6">
        <button
          type="button"
          className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[#ff8c42]/20 to-[#ffd166]/10 border border-[#ff8c42]/50 text-xs font-pixel text-[#ffd166] shadow-sm transition-all"
        >
          SIGN IN
        </button>
        <Link
          href="/signup"
          className="flex-1 py-2 text-center text-xs font-pixel text-[#9a97ab] hover:text-[#f5f1e8] transition-colors"
        >
          SIGN UP
        </Link>
      </div>

      <div className="mb-6 text-center space-y-1">
        <h1 className="font-pixel text-base sm:text-lg text-[#f5f1e8] tracking-wide flex items-center justify-center gap-2">
          <span>RETURN TO THE KEEP</span>
        </h1>
        <p className="text-xs text-[#9a97ab]">
          Resume your quests and tend to your Ember
        </p>
      </div>

      {notice === "account-created" && (
        <div
          role="status"
          className="mb-5 p-3.5 rounded-xl bg-[#4ade80]/15 border border-[#4ade80]/40 flex items-start gap-2.5 text-xs text-[#4ade80]"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Account created! Sign in with your adventurer passphrase.</span>
        </div>
      )}

      {serverError && (
        <div
          role="alert"
          className="mb-5 p-3.5 rounded-xl bg-[#f87171]/15 border border-[#f87171]/40 flex items-start gap-2.5 text-xs text-[#f87171]"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email Field with Icon */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-[#f5f1e8]"
          >
            Adventurer Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#9a97ab] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              autoComplete="email"
              aria-describedby={errors.email ? "email-error" : undefined}
              placeholder="hero@emberkeep.realm"
              className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#13131f]/90 border text-sm text-[#f5f1e8] placeholder-[#9a97ab]/40 focus:outline-none transition-all ${
                errors.email
                  ? "border-[#f87171] focus:border-[#f87171] focus:shadow-[0_0_12px_rgba(248,113,113,0.3)]"
                  : "border-[#2e2e45] focus:border-[#ff8c42] focus:shadow-[0_0_15px_rgba(255,140,66,0.25)]"
              }`}
            />
          </div>
          {errors.email && (
            <p id="email-error" className="text-xs text-[#f87171]">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password Field with Show/Hide Toggle */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-[#f5f1e8]"
            >
              Secret Passphrase
            </label>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#9a97ab] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
              aria-describedby={errors.password ? "password-error" : undefined}
              placeholder="Enter your passphrase"
              className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#13131f]/90 border text-sm text-[#f5f1e8] placeholder-[#9a97ab]/40 focus:outline-none transition-all ${
                errors.password
                  ? "border-[#f87171] focus:border-[#f87171] focus:shadow-[0_0_12px_rgba(248,113,113,0.3)]"
                  : "border-[#2e2e45] focus:border-[#ff8c42] focus:shadow-[0_0_15px_rgba(255,140,66,0.25)]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a97ab] hover:text-[#f5f1e8] transition-colors p-1"
              title={showPassword ? "Hide passphrase" : "Show passphrase"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className="text-xs text-[#f87171]">
              {errors.password}
            </p>
          )}
        </div>

        {/* Radiant Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-3 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#ffd166] via-[#ff8c42] to-[#ff5f2e] text-[#13131f] font-pixel text-xs font-bold tracking-wider shadow-[0_4px_25px_rgba(255,140,66,0.35)] hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#13131f]" />
              <span>Verifying Credentials...</span>
            </>
          ) : (
            <>
              <span>IGNITE SESSION</span>
              <ArrowRight className="w-4 h-4 text-[#13131f]" />
            </>
          )}
        </button>
      </form>

      {/* Footer Details */}
      <div className="mt-6 pt-5 border-t border-[#2e2e45] text-center space-y-3">
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#ffd166]">
          <Sparkles className="w-3.5 h-3.5 text-[#ffd166] animate-pulse" />
          <span>Cross-Device Persistence & Real Ledger Sync</span>
        </div>
        <p className="text-xs text-[#9a97ab]">
          New Adventurer?{" "}
          <Link
            href="/signup"
            className="text-[#ff8c42] hover:text-[#ffd166] font-semibold underline underline-offset-4 transition-colors"
          >
            Kindle your Ember
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center p-8 text-[#9a97ab]">Loading Keep Gates...</div>}>
      <LoginForm />
    </Suspense>
  );
}
