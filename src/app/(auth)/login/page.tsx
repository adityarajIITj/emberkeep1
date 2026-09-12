"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validation/auth";
import { Loader2, AlertCircle, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/keep";
  const notice = searchParams.get("notice");
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        // Blueprint §9 Screen 3: Generic error prevents leaking email existence
        setServerError("Invalid email or password. Please check your credentials.");
        setIsLoading(false);
        return;
      }

      // Smooth redirect to destination
      router.push(next);
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      setServerError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="notch-card p-6 sm:p-8 rounded-xl bg-[#1e1e2e] border-2 border-[#2e2e45] shadow-2xl">
      <div className="mb-6 text-center">
        <h1 className="font-pixel text-lg text-[#f5f1e8] tracking-wide">
          RETURN TO THE KEEP
        </h1>
        <p className="text-xs text-[#9a97ab] mt-2">
          Resume your quests and tend to your Ember
        </p>
      </div>

      {notice === "account-created" && (
        <div
          role="status"
          className="mb-6 p-3.5 rounded bg-[#4ade80]/10 border border-[#4ade80]/40 flex items-start gap-3 text-xs text-[#4ade80]"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Account created successfully! Please sign in with your passphrase.</span>
        </div>
      )}

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
            autoComplete="current-password"
            aria-describedby={errors.password ? "password-error" : undefined}
            placeholder="Enter your passphrase"
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 px-4 rounded bg-gradient-to-r from-[#ff8c42] to-[#ff5f2e] text-[#13131f] font-pixel text-xs font-bold tracking-wide shadow-[0_4px_15px_rgba(255,140,66,0.35)] hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#13131f]" />
              <span>Verifying Credentials...</span>
            </>
          ) : (
            <>
              <span>Enter The Keep</span>
              <ArrowRight className="w-4 h-4 text-[#13131f]" />
            </>
          )}
        </button>
      </form>

      {/* Signup Link */}
      <div className="mt-6 pt-5 border-t border-[#2e2e45] text-center space-y-3">
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#ffd166]">
          <Sparkles className="w-3.5 h-3.5 text-[#ffd166]" />
          <span>Cross-device sync enabled</span>
        </div>
        <p className="text-xs text-[#9a97ab]">
          New Adventurer?{" "}
          <Link
            href="/signup"
            className="text-[#ff8c42] hover:text-[#ff8c42]/80 font-medium underline underline-offset-4 focus:outline-none"
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
