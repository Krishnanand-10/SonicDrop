/**
 * SonicDrop - Dedicated Live Engine Workstation Page
 * Complete transceiver environment with Transmitter, Receiver, and Waterfall Spectrogram.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

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
import {
  Radio,
  ShieldCheck,
  Activity,
  WifiOff,
  Volume2,
} from 'lucide-react';
import { CloudShader } from '@/components/ui/cloud-shader';
import { WaterfallSpectrogram } from '@/components/waterfall-spectrogram';
import { TransmitterPanel } from '@/components/transmitter-panel';
import { ReceiverPanel } from '@/components/receiver-panel';
import {
  PROFILES,
  type ModulationProfile,
  type DecodedPayload,
  type ReceiverTelemetry,
} from '@/acoustic/types';
import { transceiver } from '@/acoustic/ggwave-engine';

interface LiveEnginePageProps {
  onNavigateHome?: () => void;
}

export function LiveEnginePage({ onNavigateHome }: LiveEnginePageProps = {}) {
  const [profile, setProfile] = useState<ModulationProfile>(PROFILES.ultrasonic);
  const [viewMode, setViewMode] = useState<'tx' | 'rx' | 'spectrogram'>('tx');

  // Receiver state
  const [isListening, setIsListening] = useState(false);
  const [telemetry, setTelemetry] = useState<ReceiverTelemetry | null>(null);
  const [lastPayload, setLastPayload] = useState<DecodedPayload | null>(null);
  const [isOffline, setIsOffline] = useState(() => typeof navigator !== 'undefined' && !navigator.onLine);

  // Monitor network online/offline state for air-gap confirmation
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Hook transceiver callbacks
  useEffect(() => {
    transceiver.onTelemetry = (t) => {
      setTelemetry(t);
    };

    transceiver.onPacketReceived = (p) => {
      setLastPayload(p);
    };

    transceiver.onError = (msg) => {
      setTelemetry((prev) =>
        prev ? { ...prev, statusMessage: `Error: ${msg}`, state: 'error' } : null
      );
    };

    return () => {
      transceiver.stopListening();
    };
  }, []);

  const toggleListening = async () => {
    if (isListening) {
      transceiver.stopListening();
      setIsListening(false);
      setTelemetry(null);
    } else {
      try {
        await transceiver.startListening();
        setIsListening(true);
      } catch (err) {
        console.error('Microphone access denied:', err);
        alert('Please allow microphone access to receive ultrasonic sound waves.');
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-slate-950 font-sans selection:bg-sky-500/30 selection:text-sky-200">
      {/* Full-screen continuous CloudShader background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <CloudShader className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 pointer-events-none" />
      </div>

      {/* Top Navigation Bar with Framer Motion Stagger */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col min-h-screen"
      >
        <motion.nav
          variants={itemVariants}
          className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-3 py-3 sm:px-6 md:px-8 select-none"
        >
        {/* Clickable Brand Logo returning to Overview */}
        <a
          href="/"
          onClick={(e) => {
            if (onNavigateHome) {
              e.preventDefault();
              onNavigateHome();
            }
          }}
          className="flex items-center gap-2 group cursor-pointer transition-opacity hover:opacity-90"
          title="Return to SonicDrop Overview"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/95 text-sky-700 shadow-sm group-hover:scale-105 transition-transform">
            <Radio className="h-4 w-4 text-sky-600 stroke-[2.5]" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-white drop-shadow-sm font-mono">
            SonicDrop<span className="text-sky-200">.Air</span>
          </span>
        </a>

        <div className="flex items-center gap-3 sm:gap-4">
          <a
            href="/"
            onClick={(e) => {
              if (onNavigateHome) {
                e.preventDefault();
                onNavigateHome();
              }
            }}
            className="text-xs font-medium text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            Overview
          </a>

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
        </div>
      </motion.nav>

      {/* Main Workstation Container */}
      <motion.main
        variants={itemVariants}
        className="relative z-10 mx-auto w-full max-w-6xl px-3 sm:px-6 md:px-8 py-6 pb-16"
      >
        <div className="rounded-3xl border border-white/15 bg-slate-900/50 backdrop-blur-2xl p-4 sm:p-6 shadow-2xl min-h-[640px]">
          {/* Control Mode Switcher Bar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex items-center gap-1.5 sm:gap-2 font-sans text-xs sm:text-sm">
              <button
                onClick={() => setViewMode('tx')}
                className={`rounded-xl px-4 py-2 font-semibold transition-all duration-200 cursor-pointer select-none flex items-center gap-2 whitespace-nowrap border ${
                  viewMode === 'tx'
                    ? 'bg-sky-500/20 text-sky-200 border-sky-400/50 shadow-md'
                    : 'border-white/10 text-white/70 hover:text-sky-200 hover:bg-slate-900/80 hover:border-sky-400/50 hover:shadow-lg'
                }`}
              >
                <Radio className="h-4 w-4 text-sky-400" />
                <span>Transmitter</span>
              </button>

              <button
                onClick={() => setViewMode('rx')}
                className={`rounded-xl px-4 py-2 font-semibold transition-all duration-200 cursor-pointer select-none flex items-center gap-2 whitespace-nowrap border ${
                  viewMode === 'rx'
                    ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/50 shadow-md'
                    : 'border-white/10 text-white/70 hover:text-emerald-200 hover:bg-slate-900/80 hover:border-emerald-400/50 hover:shadow-lg'
                }`}
              >
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Receiver</span>
              </button>

              <button
                onClick={() => setViewMode('spectrogram')}
                className={`rounded-xl px-4 py-2 font-semibold transition-all duration-200 cursor-pointer select-none flex items-center gap-2 whitespace-nowrap border ${
                  viewMode === 'spectrogram'
                    ? 'bg-amber-500/20 text-amber-200 border-amber-400/50 shadow-md'
                    : 'border-white/10 text-white/70 hover:text-amber-200 hover:bg-slate-900/80 hover:border-amber-400/50 hover:shadow-lg'
                }`}
              >
                <Activity className="h-4 w-4 text-amber-400" />
                <span>Waterfall Spectrogram</span>
              </button>
            </div>

            <div className="font-mono text-xs text-white/70 flex items-center gap-2">
              <Volume2 className="h-3.5 w-3.5 text-sky-400" />
              <span>CHANNEL: <span className="text-sky-300 font-semibold">{profile.name}</span></span>
            </div>
          </div>

          {/* View Mode Contents with Framer Motion Animated Transitions */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {/* Dedicated Transmitter Mode */}
              {viewMode === 'tx' && (
                <motion.div
                  key="tx"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="max-w-3xl mx-auto rounded-2xl border border-white/10 bg-slate-950/40 p-6 shadow-lg"
                >
                  <div className="flex items-center gap-2 mb-4 text-xs font-mono text-sky-300 uppercase tracking-wider font-semibold border-b border-white/10 pb-2">
                    <Radio className="h-4 w-4" />
                    <span>Transmitter — Acoustic Carrier Generator</span>
                  </div>
                  <TransmitterPanel
                    profile={profile}
                    onProfileChange={setProfile}
                  />
                </motion.div>
              )}

              {/* Dedicated Receiver Mode */}
              {viewMode === 'rx' && (
                <motion.div
                  key="rx"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="space-y-6"
                >
                  <WaterfallSpectrogram
                    analyser={transceiver.getAnalyserNode()}
                    profile={profile}
                    isListening={isListening}
                  />

                  <div className="max-w-3xl mx-auto rounded-2xl border border-white/10 bg-slate-950/40 p-6 shadow-lg">
                    <div className="flex items-center gap-2 mb-4 text-xs font-mono text-emerald-300 uppercase tracking-wider font-semibold border-b border-white/10 pb-2">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Receiver — Goertzel Demodulator</span>
                    </div>
                    <ReceiverPanel
                      isListening={isListening}
                      telemetry={telemetry}
                      lastPayload={lastPayload}
                      onToggleListening={toggleListening}
                    />
                  </div>
                </motion.div>
              )}

              {/* Dedicated Spectrogram Mode */}
              {viewMode === 'spectrogram' && (
                <motion.div
                  key="spectrogram"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="space-y-6"
                >
                  <WaterfallSpectrogram
                    analyser={transceiver.getAnalyserNode()}
                    profile={profile}
                    isListening={isListening}
                  />

                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6 text-sm text-white/80 font-mono space-y-2">
                    <p className="font-semibold text-white">How the Live Waterfall Spectrogram Works:</p>
                    <p className="text-xs text-white/60">
                      The canvas continuously renders a 60 FPS scrolling frequency heatmap of the raw 48 kHz PCM stream.
                      When transmitting or receiving sound at 18.5 kHz – 20.0 kHz, distinct glowing lines cascade down the screen
                      at the exact 16-FSK frequency bins, demonstrating acoustic transmission visually even in silent rooms.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Minimal Workstation Footer */}
        <div className="mt-8 text-center text-xs text-white/50 font-mono">
          SonicDrop Air-Gap Engine · 18.5 – 20.0 kHz Ultrasonic Band · MIT License © 2026 Krishnanand Tiwari
        </div>
      </motion.main>
      </motion.div>
    </div>
  );
}
