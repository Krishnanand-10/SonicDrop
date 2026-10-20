/**
 * SonicDrop - Quick Install / CTA Banner
 * Inspired by p2pcopy's "One command away" banner.
 */

import { useState } from 'react';
import { Copy, Check, Radio } from 'lucide-react';

export function QuickInstallBanner({ onOpenApp }: { onOpenApp?: () => void } = {}) {
  const [copied, setCopied] = useState(false);
  const command = 'git clone https://github.com/Krishnanand-10/SonicDrop.git';

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative z-10 mx-auto w-full max-w-5xl px-4 py-16 sm:py-20 select-none">
      <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-slate-900/60 px-6 py-14 sm:px-12 text-center backdrop-blur-2xl shadow-2xl">
        {/* Top radial gradient accent */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-44"
          style={{
            background: 'radial-gradient(460px 180px at 50% 0, rgba(34, 211, 238, 0.15), transparent 70%)',
          }}
        />

        <h2 className="text-4xl font-bold tracking-tight text-white drop-shadow-md md:text-5xl lg:text-6xl font-sans">
          Air-Gap Your Transfers Today
        </h2>
        <p className="mt-5 max-w-xl mx-auto text-base text-white [text-shadow:0_1px_12px_rgba(10,30,60,0.35)] md:text-lg font-sans leading-relaxed">
          Open-source, decentralized, and 100% offline. Zero RF tracking, zero cloud relays, and zero accounts.
        </p>

        {/* Command Pill */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-slate-950/80 px-4 py-2.5 font-mono text-xs sm:text-sm shadow-inner transition-all hover:border-sky-400/50 hover:bg-slate-950/95 hover:shadow-xl">
            <span className="text-emerald-400 select-none font-bold">$</span>
            <span className="select-all font-mono text-white/90">{command}</span>
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy clone command"
              className="rounded-xl border border-white/10 p-1.5 text-white/60 hover:border-white/30 hover:text-white transition-colors"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>

          <a
            href="/app"
            onClick={(e) => {
              if (onOpenApp) {
                e.preventDefault();
                onOpenApp();
              }
            }}
            className="rounded-2xl bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-sky-800 shadow-md hover:bg-white hover:scale-[1.03] active:scale-[0.98] hover:shadow-xl transition-all cursor-pointer flex items-center gap-2"
          >
            <Radio className="h-4 w-4" />
            <span>Try SonicDrop Live</span>
          </a>
        </div>

        <p className="mt-5 text-xs text-white/80 font-mono">
          Works in any modern browser on macOS, Linux, Windows, Android, and iOS. Zero hardware drivers.
        </p>
      </div>
    </section>
  );
}
