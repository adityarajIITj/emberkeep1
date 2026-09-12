"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { signupSchema } from "@/lib/validation/auth";
import { Loader2, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setServerError(null);
    setErrors({});

    // Client-side Zod validation
    const result = signupSchema.safeParse({ email, password, confirmPassword });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string; confirmPassword?: string } = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as "email" | "password" | "confirmPassword";
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);

      // Focus first invalid field for accessibility
      const firstField = result.error.issues[0]?.path[0];
      if (firstField) {
        document.getElementById(String(firstField))?.focus();
      }
      return;
    }

    setIsLoading(true);

    try {
      // Auto-detect timezone per §8 & §12
      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

      const { data, error } = await supabase.auth.signUp({
        email: result.data.email,
        password: result.data.password,
        options: {
          data: {
            timezone: detectedTimezone,
            display_name: result.data.email.split("@")[0],
          },
        },
      });

      if (error) {
        if (error.message?.includes("fetch") || error.message?.includes("Failed to fetch")) {
          setServerError(
            "Network error connecting to authentication server. If you have an ad-blocker (uBlock, Brave Shields, AdGuard) enabled, please pause it for this site and retry."
          );
        } else {
          setServerError(error.message);
        }
        setIsLoading(false);
        return;
      }

      if (data.session) {
        // Immediate session active -> go to keep or onboarding
        router.push("/onboarding");
        router.refresh();
      } else {
        // Confirmation email sent or awaiting verification
        router.push("/login?notice=account-created");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setServerError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="notch-card p-6 sm:p-8 rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] shadow-2xl">
      <div className="mb-6 text-center">
        <h1 className="font-pixel text-lg text-[#f5f1e8] tracking-wide">
          BEGIN YOUR JOURNEY
        </h1>
        <p className="text-xs text-[#9a97ab] mt-2">
          Create an adventurer profile to kindle your Ember
        </p>
      </div>

      {serverError && (
        <div
          role="alert"
          className="mb-6 p-3.5 rounded bg-[#f87171]/10 border border-[#f87171]/40 flex items-start gap-3 text-xs text-[#f87171]"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-[#f5f1e8] mb-1.5"
          >
            Adventurer Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            autoComplete="email"
            aria-describedby={errors.email ? "email-error" : undefined}
            placeholder="hero@emberkeep.realm"
            className={`w-full px-3.5 py-2.5 rounded bg-[#13131f] border text-sm text-[#f5f1e8] placeholder-[#9a97ab]/50 focus:outline-none transition-colors ${
              errors.email
                ? "border-[#f87171] focus:border-[#f87171]"
                : "border-[#2e2e45] focus:border-[#ff8c42]"
            }`}
          />
          {errors.email && (
            <p id="email-error" className="mt-1.5 text-xs text-[#f87171]">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-semibold text-[#f5f1e8] mb-1.5"
          >
            Secret Passphrase
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            autoComplete="new-password"
            aria-describedby={errors.password ? "password-error" : undefined}
            placeholder="At least 6 characters"
            className={`w-full px-3.5 py-2.5 rounded bg-[#13131f] border text-sm text-[#f5f1e8] placeholder-[#9a97ab]/50 focus:outline-none transition-colors ${
              errors.password
                ? "border-[#f87171] focus:border-[#f87171]"
                : "border-[#2e2e45] focus:border-[#ff8c42]"
            }`}
          />
          {errors.password && (
            <p id="password-error" className="mt-1.5 text-xs text-[#f87171]">
              {errors.password}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-semibold text-[#f5f1e8] mb-1.5"
          >
            Confirm Passphrase
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            autoComplete="new-password"
            aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
            placeholder="Re-enter your passphrase"
            className={`w-full px-3.5 py-2.5 rounded bg-[#13131f] border text-sm text-[#f5f1e8] placeholder-[#9a97ab]/50 focus:outline-none transition-colors ${
              errors.confirmPassword
                ? "border-[#f87171] focus:border-[#f87171]"
                : "border-[#2e2e45] focus:border-[#ff8c42]"
            }`}
          />
          {errors.confirmPassword && (
            <p id="confirmPassword-error" className="mt-1.5 text-xs text-[#f87171]">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 px-4 rounded bg-gradient-to-r from-[#ff8c42] to-[#ff5f2e] text-[#13131f] font-pixel text-xs font-bold tracking-wide shadow-[0_4px_15px_rgba(255,140,66,0.35)] hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#13131f]" />
              <span>Kindling Profile...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4 text-[#13131f]" />
            </>
          )}
        </button>
      </form>

      {/* Security note & login link */}
      <div className="mt-6 pt-5 border-t border-[#2e2e45] text-center space-y-3">
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#4ade80]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#4ade80]" />
          <span>Server-verified session protection</span>
        </div>
        <p className="text-xs text-[#9a97ab]">
          Already an Adventurer?{" "}
          <Link
            href="/login"
            className="text-[#ff8c42] hover:text-[#ff8c42]/80 font-medium underline underline-offset-4 focus:outline-none"
          >
            Log in instead
          </Link>
        </p>
      </div>
    </div>
  );
}
