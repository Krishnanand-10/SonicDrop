"use client";

import { useState, useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  Radio,
  WifiOff,
  ArrowRight,
} from 'lucide-react';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

function GithubIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

import { CloudShader } from '@/components/ui/cloud-shader';
import { AcousticTransferDemo } from '@/components/acoustic-transfer-demo';
import { FeaturesGrid } from '@/components/features-grid';
import { ArchitecturePipeline } from '@/components/architecture-pipeline';
import { ComparisonMatrix } from '@/components/comparison-matrix';
import { QuickInstallBanner } from '@/components/quick-install-banner';
import { SiteFooter } from '@/components/site-footer';
import { LiveEnginePage } from '@/components/live-engine-page';

export function App() {
  const [route, setRoute] = useState<'home' | 'app'>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname.startsWith('/app') ? 'app' : 'home';
    }
    return 'home';
  });

  const [isOffline, setIsOffline] = useState(() => typeof navigator !== 'undefined' && !navigator.onLine);

  const navigateToApp = () => {
    window.history.pushState({}, '', '/app');
    setRoute('app');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const navigateHome = () => {
    window.history.pushState({}, '', '/');
    setRoute('home');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    const handlePopState = () => {
      setRoute(window.location.pathname.startsWith('/app') ? 'app' : 'home');
      window.scrollTo({ top: 0, behavior: 'instant' });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // When route is /app, render the dedicated Live Engine workstation page
  if (route === 'app') {
    return <LiveEnginePage onNavigateHome={navigateHome} />;
  }

  // Otherwise, render the Landing Page
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-slate-950 font-sans selection:bg-sky-500/30 selection:text-sky-200">
      {/* ============================================================== */}
      {/* FULL CLOUD SHADER FRAME: SPANS THE ENTIRE PAGE                 */}
      {/* ============================================================== */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <CloudShader className="h-full w-full" />
        {/* Subtle atmospheric overlay identical to original Isobar style */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 pointer-events-none" />
      </div>

      {/* ============================================================== */}
      {/* NAVBAR & HERO ORCHESTRATION WITH FRAMER MOTION                 */}
      {/* ============================================================== */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col min-h-screen"
      >
        <motion.nav
          variants={itemVariants}
          className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-3 py-4 sm:px-6 sm:py-5 md:px-8 select-none"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/95 text-sky-700 shadow-sm">
              <Radio className="h-4 w-4 text-sky-600 stroke-[2.5]" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-white drop-shadow-sm font-mono">
              SonicDrop<span className="text-sky-200">.Air</span>
            </span>
          </div>

          <div className="hidden items-center gap-8 text-sm font-medium text-white/90 md:flex">
            <a
              href="#features"
              className="text-white/70 transition-colors hover:text-white font-medium"
            >
              Features
            </a>
            <a
              href="#architecture"
              className="text-white/70 transition-colors hover:text-white font-medium"
            >
              Acoustic PHY
            </a>
            <a
              href="#comparison"
              className="text-white/70 transition-colors hover:text-white font-medium"
            >
              Security
            </a>
            <a
              href="https://github.com/Krishnanand-10/SonicDrop.git"
              target="_blank"
              rel="noreferrer"
              className="text-white/70 transition-colors hover:text-white font-medium"
            >
              Docs
            </a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Air-gap verification badge */}
            <div
              className={`whitespace-nowrap inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] sm:text-xs shadow-sm font-sans backdrop-blur-md transition-all ${
                isOffline
                  ? 'border-emerald-400/50 bg-emerald-950/50 text-emerald-300 font-bold shadow-emerald-500/20'
                  : 'border-white/20 bg-black/30 text-white/90'
              }`}
            >
              <WifiOff className={`h-3 w-3 ${isOffline ? 'text-emerald-400 animate-pulse' : 'text-sky-300'}`} />
              <span className="whitespace-nowrap font-medium">
                {isOffline ? 'Airplane Mode Locked (Air-Gap Active)' : 'Air-Gap Ready (PWA Offline)'}
              </span>
            </div>

            <a
              href="https://github.com/Krishnanand-10/SonicDrop.git"
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-white/90 transition-colors hover:text-white flex items-center gap-1.5"
            >
              <GithubIcon className="h-4 w-4" />
              <span>GitHub</span>
            </a>
          </div>
        </motion.nav>

        {/* ============================================================== */}
        {/* HERO & STAT STRIP: SPACED & CENTRIC HERO SECTION               */}
        {/* ============================================================== */}
        <div className="relative z-10 flex flex-col items-center px-4 pt-16 pb-12 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20 lg:pt-32 lg:pb-24">
          {/* HERO SECTION */}
          <motion.div
            variants={itemVariants}
            className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center select-none"
          >
            {/* Faint radial gradient scrim behind the text block */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(10,30,60,0.45)_0%,transparent_75%)] blur-2xl pointer-events-none" />

            <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-md sm:text-5xl md:text-6xl lg:text-7xl font-sans leading-[1.12]">
              Air-Gapped Data <br className="hidden md:block" /> Over Silent Sound
            </h1>

            {/* Subtitle with soft text-shadow */}
            <p className="mt-6 sm:mt-7 max-w-2xl text-base text-white [text-shadow:0_1px_12px_rgba(10,30,60,0.35)] md:text-lg font-sans leading-relaxed">
              Transfer cryptographic keys, files, and text between devices through physical sound waves.
              No Wi-Fi. No Bluetooth. No Internet. No Cables.
            </p>

            {/* Action Button: Try SonicDrop */}
            <div className="mt-8 sm:mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="/app"
                onClick={(e) => {
                  e.preventDefault();
                  navigateToApp();
                }}
                className="rounded-full bg-white px-8 py-3.5 text-base font-semibold text-sky-700 shadow-xl transition-all hover:bg-white/95 hover:scale-[1.03] active:scale-[0.98] cursor-pointer inline-flex items-center gap-2.5 select-none border border-transparent"
              >
                <Radio className="h-5 w-5 text-sky-600" />
                <span>Try SonicDrop</span>
                <ArrowRight className="h-4 w-4 text-sky-600/70" />
              </a>
            </div>

            {/* Small feature line */}
            <p className="mt-6 sm:mt-7 text-xs text-white [text-shadow:0_1px_12px_rgba(10,30,60,0.35)] flex items-center justify-center flex-wrap gap-2 font-sans">
              <span>18.5 kHz – 20.0 kHz Ultrasonic Band</span>
              <span className="opacity-60">&middot;</span>
              <span>Reed-Solomon FEC + IEEE CRC-32</span>
              <span className="opacity-60">&middot;</span>
              <span className="font-mono">Zero Network Footprint</span>
            </p>
          </motion.div>

          {/* ============================================================== */}
          {/* STAT STRIP (3 Glass Cards)                                     */}
          {/* ============================================================== */}
          <motion.div
            variants={itemVariants}
            className="relative z-10 mx-auto mt-10 sm:mt-12 md:mt-14 w-full max-w-4xl px-3 sm:px-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 select-none">
              <div className="group rounded-2xl border border-white/15 bg-slate-900/50 p-4 sm:p-5 backdrop-blur-xl shadow-lg transition-all duration-300 hover:border-cyan-400/50 hover:bg-slate-900/80 hover:shadow-2xl hover:-translate-y-0.5 text-center flex flex-col items-center justify-center cursor-pointer">
                <span className="font-mono text-xl sm:text-2xl lg:text-[1.75rem] font-bold text-white tabular-nums tracking-tight whitespace-nowrap group-hover:text-cyan-200 transition-colors">
                  18.5 – 20.0 kHz
                </span>
                <span className="text-xs text-white/70 uppercase tracking-wider mt-1.5 font-sans font-medium whitespace-nowrap group-hover:text-white/95 transition-colors">
                  Ultrasonic carrier
                </span>
              </div>

              <div className="group rounded-2xl border border-white/15 bg-slate-900/50 p-4 sm:p-5 backdrop-blur-xl shadow-lg transition-all duration-300 hover:border-sky-400/50 hover:bg-slate-900/80 hover:shadow-2xl hover:-translate-y-0.5 text-center flex flex-col items-center justify-center cursor-pointer">
                <span className="font-mono text-xl sm:text-2xl lg:text-[1.75rem] font-bold text-sky-300 tabular-nums tracking-tight whitespace-nowrap group-hover:text-sky-200 transition-colors">
                  Near-Inaudible
                </span>
                <span className="text-xs text-white/70 uppercase tracking-wider mt-1.5 font-sans font-medium whitespace-nowrap group-hover:text-white/95 transition-colors">
                  Presbycusis threshold
                </span>
              </div>

              <div className="group rounded-2xl border border-white/15 bg-slate-900/50 p-4 sm:p-5 backdrop-blur-xl shadow-lg transition-all duration-300 hover:border-emerald-400/50 hover:bg-slate-900/80 hover:shadow-2xl hover:-translate-y-0.5 text-center flex flex-col items-center justify-center cursor-pointer">
                <span className="font-mono text-xl sm:text-2xl lg:text-[1.75rem] font-bold text-emerald-300 tabular-nums tracking-tight whitespace-nowrap group-hover:text-emerald-200 transition-colors">
                  RS(32, 24)
                </span>
                <span className="text-xs text-white/70 uppercase tracking-wider mt-1.5 font-sans font-medium whitespace-nowrap group-hover:text-white/95 transition-colors">
                  Reed-Solomon parity
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ============================================================== */}
        {/* INTERACTIVE ACOUSTIC AIR-GAP TRANSMISSION DEMO                 */}
        {/* ============================================================== */}
        <motion.div variants={itemVariants}>
          <AcousticTransferDemo />
        </motion.div>

        {/* ============================================================== */}
        {/* FEATURES BENTO GRID                                            */}
        {/* ============================================================== */}
        <motion.div variants={itemVariants}>
          <FeaturesGrid />
        </motion.div>

        {/* ============================================================== */}
        {/* ACOUSTIC PHY ARCHITECTURE PIPELINE                             */}
        {/* ============================================================== */}
        <motion.div variants={itemVariants}>
          <ArchitecturePipeline />
        </motion.div>

        {/* ============================================================== */}
        {/* SECURITY & PROTOCOL COMPARISON MATRIX                          */}
        {/* ============================================================== */}
        <motion.div variants={itemVariants}>
          <ComparisonMatrix />
        </motion.div>

        {/* ============================================================== */}
        {/* QUICK INSTALL / CTA BANNER                                     */}
        {/* ============================================================== */}
        <motion.div variants={itemVariants}>
          <QuickInstallBanner onOpenApp={navigateToApp} />
        </motion.div>

        {/* ============================================================== */}
        {/* SITE FOOTER                                                    */}
        {/* ============================================================== */}
        <motion.div variants={itemVariants}>
          <SiteFooter />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default App;
