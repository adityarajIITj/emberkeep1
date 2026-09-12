import Link from "next/link";
import { Flame } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative scanlines bg-[#13131f]">
      {/* Background ambient torch glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-[#ff8c42]/15 to-[#ff5f2e]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-8 text-center z-10">
        <Link href="/" className="inline-flex items-center gap-3 group focus:outline-none">
          <div className="p-2.5 rounded-xl bg-[#1e1e2e] border border-[#ff8c42]/40 shadow-[0_0_20px_rgba(255,140,66,0.25)] group-hover:border-[#ff8c42] transition-colors">
            <Flame className="w-8 h-8 text-[#ff8c42]" />
          </div>
          <span className="font-pixel text-2xl text-[#f5f1e8] tracking-wider group-hover:text-[#ff8c42] transition-colors">
            EMBERKEEP
          </span>
        </Link>
      </div>

      {/* Auth Card Container */}
      <div className="w-full max-w-md z-10">{children}</div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-[#9a97ab] z-10">
        <p>Keep your Ember lit. Turn tasks into legend.</p>
      </div>
    </div>
  );
}
