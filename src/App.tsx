"use client";

import { useState, useEffect } from 'react';
import {
  Radio,
  ShieldCheck,
  Activity,
  WifiOff,
  Columns,
} from 'lucide-react';

function GithubIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}
import { CloudShader } from '@/components/ui/cloud-shader';
import { WaterfallSpectrogram } from '@/components/waterfall-spectrogram';
import { TransmitterPanel } from '@/components/transmitter-panel';
import { ReceiverPanel } from '@/components/receiver-panel';
import {
  PROFILES,
  type ModulationProfile,
  type DecodedPayload,
  type ReceiverTelemetry
} from '@/acoustic/types';
import { transceiver } from '@/acoustic/ggwave-engine';

export function App() {
  const [profile, setProfile] = useState<ModulationProfile>(PROFILES.ultrasonic);
  const [viewMode, setViewMode] = useState<'transceiver' | 'tx' | 'rx' | 'spectrogram'>('transceiver');

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

  const scrollToDashboard = () => {
    const el = document.getElementById('dashboard-container');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 font-sans selection:bg-sky-500/30 selection:text-sky-200">
      {/* ============================================================== */}
      {/* CLOUD MOTION FRAME: IDENTICAL TO ISOBAR PROJECT                */}
      {/* ============================================================== */}
      <CloudShader className="absolute inset-0 pointer-events-none" />

      {/* Subtle atmospheric gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-slate-950/80 pointer-events-none" />

      {/* ============================================================== */}
      {/* NAVBAR                                                         */}
      {/* ============================================================== */}
      <nav className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-3 py-3 sm:px-6 md:px-8 select-none">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-sm font-bold text-sky-700 shadow-sm font-mono">
            S
          </div>
          <span className="text-lg font-semibold tracking-tight text-white drop-shadow-sm font-mono">
            SonicDrop<span className="text-sky-200">.Air</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 px-2.5 py-0.5 rounded-full shadow-sm ml-2 font-bold tracking-wide">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            v2.1 WASM
          </span>
        </div>

        <div className="hidden items-center gap-8 text-sm font-medium text-white/90 md:flex">
          <button
            onClick={() => { setViewMode('transceiver'); scrollToDashboard(); }}
            className={`transition-colors hover:text-white cursor-pointer font-medium ${viewMode === 'transceiver' ? 'text-white underline underline-offset-4' : 'text-white/70'}`}
          >
            Split Transceiver
          </button>
          <button
            onClick={() => { setViewMode('tx'); scrollToDashboard(); }}
            className={`transition-colors hover:text-white cursor-pointer font-medium ${viewMode === 'tx' ? 'text-white underline underline-offset-4' : 'text-white/70'}`}
          >
            Transmitter
          </button>
          <button
            onClick={() => { setViewMode('rx'); scrollToDashboard(); }}
            className={`transition-colors hover:text-white cursor-pointer font-medium ${viewMode === 'rx' ? 'text-white underline underline-offset-4' : 'text-white/70'}`}
          >
            Receiver
          </button>
          <button
            onClick={() => { setViewMode('spectrogram'); scrollToDashboard(); }}
            className={`transition-colors hover:text-white cursor-pointer font-medium ${viewMode === 'spectrogram' ? 'text-white underline underline-offset-4' : 'text-white/70'}`}
          >
            Spectrogram
          </button>
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
            className="hidden text-sm font-medium text-white/90 transition-colors hover:text-white sm:flex items-center gap-1.5"
          >
            <GithubIcon className="h-4 w-4" />
            <span>GitHub</span>
          </a>

          <button
            onClick={scrollToDashboard}
            className="rounded-full bg-white px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-sky-700 shadow-md transition-colors hover:bg-white/90 cursor-pointer whitespace-nowrap"
          >
            Live Engine
          </button>
        </div>
      </nav>

      {/* ============================================================== */}
      {/* HERO SECTION                                                   */}
      {/* ============================================================== */}
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 pt-10 text-center md:pt-16 select-none">
        {/* Faint radial gradient scrim behind the text block */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(10,30,60,0.45)_0%,transparent_75%)] blur-2xl pointer-events-none" />

        <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-md md:text-6xl lg:text-7xl font-sans">
          Air-Gapped Data <br className="hidden md:block" /> Over Silent Sound
        </h1>

        {/* Subtitle with soft text-shadow */}
        <p className="mt-5 max-w-2xl text-base text-white [text-shadow:0_1px_12px_rgba(10,30,60,0.35)] md:text-lg font-sans leading-relaxed">
          Transfer cryptographic keys, files, and text between devices through physical sound waves.
          No Wi-Fi. No Bluetooth. No Internet. No Cables.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <button
            onClick={() => { setViewMode('tx'); scrollToDashboard(); }}
            className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-sky-700 shadow-lg transition-colors hover:bg-white/90 cursor-pointer flex items-center gap-2 select-none border border-transparent"
          >
            <Radio className="h-4 w-4" />
            <span>Transmit Over Air</span>
          </button>

          <button
            onClick={() => { setViewMode('rx'); toggleListening(); scrollToDashboard(); }}
            className="rounded-full bg-slate-900/30 text-white border border-white/30 px-6 py-2.5 text-sm font-semibold shadow-md backdrop-blur-sm transition-colors hover:bg-slate-900/50 hover:border-white/50 cursor-pointer flex items-center gap-2 select-none"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            <span>Listen on Receiver</span>
          </button>
        </div>

        {/* Small feature line */}
        <p className="mt-4 text-xs text-white [text-shadow:0_1px_12px_rgba(10,30,60,0.35)] flex items-center justify-center flex-wrap gap-2 font-sans">
          <span>18.5 kHz – 20.0 kHz Ultrasonic Band</span>
          <span className="opacity-60">&middot;</span>
          <span>Reed-Solomon FEC + IEEE CRC-32</span>
          <span className="opacity-60">&middot;</span>
          <span className="font-mono">Zero Network Footprint</span>
        </p>
      </div>

      {/* ============================================================== */}
      {/* STAT STRIP (3 Glass Cards)                                     */}
      {/* ============================================================== */}
      <div className="relative z-10 mx-auto my-6 sm:my-8 w-full max-w-4xl px-3 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 select-none">
          {/* Card 1: Carrier Band */}
          <div className="rounded-2xl border border-white/15 bg-slate-900/40 p-4 sm:p-5 backdrop-blur-xl shadow-lg text-center flex flex-col items-center justify-center">
            <span className="font-mono text-2xl sm:text-3xl font-bold text-white tabular-nums tracking-tight">
              18.5 – 20.0 kHz
            </span>
            <span className="text-xs text-white/70 uppercase tracking-wider mt-1 font-sans font-medium">
              Ultrasonic carrier
            </span>
          </div>

          {/* Card 2: Network Isolation */}
          <div className="rounded-2xl border border-white/15 bg-slate-900/40 p-4 sm:p-5 backdrop-blur-xl shadow-lg text-center flex flex-col items-center justify-center">
            <span className="font-mono text-2xl sm:text-3xl font-bold text-sky-300 tabular-nums tracking-tight">
              100% Inaudible
            </span>
            <span className="text-xs text-white/70 uppercase tracking-wider mt-1 font-sans font-medium">
              Presbycusis threshold
            </span>
          </div>

          {/* Card 3: Error Correction */}
          <div className="rounded-2xl border border-white/15 bg-slate-900/40 p-4 sm:p-5 backdrop-blur-xl shadow-lg text-center flex flex-col items-center justify-center">
            <span className="font-mono text-2xl sm:text-3xl font-bold text-emerald-300 tabular-nums tracking-tight">
              RS(32, 24)
            </span>
            <span className="text-xs text-white/70 uppercase tracking-wider mt-1 font-sans font-medium">
              Reed-Solomon parity
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* APP PANEL (Static Glass Card, Fixed In Place)                   */}
      {/* ============================================================== */}
      <div
        id="dashboard-container"
        className="relative z-10 mx-auto w-full max-w-6xl px-3 sm:px-6 md:px-8 pb-16"
      >
        <div className="rounded-3xl border border-white/15 bg-slate-900/50 backdrop-blur-2xl p-4 sm:p-6 shadow-2xl min-h-[640px]">
          {/* Top Frame Control Bar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex items-center gap-1.5 sm:gap-2 font-sans text-xs sm:text-sm">
              <button
                onClick={() => setViewMode('transceiver')}
                className={`rounded-lg px-3.5 py-1.5 font-medium transition-colors cursor-pointer select-none flex items-center gap-1.5 whitespace-nowrap border ${
                  viewMode === 'transceiver'
                    ? 'bg-sky-500/20 text-sky-200 border-sky-400/40 shadow-sm'
                    : 'border-transparent text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Columns className="h-3.5 w-3.5" />
                <span>Split Transceiver</span>
              </button>

              <button
                onClick={() => setViewMode('tx')}
                className={`rounded-lg px-3.5 py-1.5 font-medium transition-colors cursor-pointer select-none flex items-center gap-1.5 whitespace-nowrap border ${
                  viewMode === 'tx'
                    ? 'bg-purple-500/20 text-purple-200 border-purple-400/40 shadow-sm'
                    : 'border-transparent text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Radio className="h-3.5 w-3.5" />
                <span>Transmitter (Device A)</span>
              </button>

              <button
                onClick={() => setViewMode('rx')}
                className={`rounded-lg px-3.5 py-1.5 font-medium transition-colors cursor-pointer select-none flex items-center gap-1.5 whitespace-nowrap border ${
                  viewMode === 'rx'
                    ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40 shadow-sm'
                    : 'border-transparent text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Receiver (Device B)</span>
              </button>

              <button
                onClick={() => setViewMode('spectrogram')}
                className={`rounded-lg px-3.5 py-1.5 font-medium transition-colors cursor-pointer select-none flex items-center gap-1.5 whitespace-nowrap border ${
                  viewMode === 'spectrogram'
                    ? 'bg-amber-500/20 text-amber-200 border-amber-400/40 shadow-sm'
                    : 'border-transparent text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Activity className="h-3.5 w-3.5" />
                <span>Waterfall Spectrogram</span>
              </button>
            </div>

            {/* Profile indication pill */}
            <div className="font-mono text-xs text-white/60">
              CHANNEL: <span className="text-sky-300 font-semibold">{profile.name}</span>
            </div>
          </div>

          {/* View Mode Contents */}
          <div className="space-y-6">
            {/* Live Waterfall Spectrogram Banner */}
            <WaterfallSpectrogram
              analyser={transceiver.getAnalyserNode()}
              profile={profile}
              isListening={isListening}
            />

            {/* Split Transceiver Mode (Transmitter on Left, Receiver on Right) */}
            {viewMode === 'transceiver' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5 shadow-lg">
                  <div className="flex items-center gap-2 mb-4 text-xs font-mono text-sky-300 uppercase tracking-wider font-semibold border-b border-white/10 pb-2">
                    <Radio className="h-4 w-4" />
                    <span>Transmitter (Device A)</span>
                  </div>
                  <TransmitterPanel
                    profile={profile}
                    onProfileChange={setProfile}
                  />
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5 shadow-lg">
                  <div className="flex items-center gap-2 mb-4 text-xs font-mono text-emerald-300 uppercase tracking-wider font-semibold border-b border-white/10 pb-2">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Receiver (Device B)</span>
                  </div>
                  <ReceiverPanel
                    isListening={isListening}
                    telemetry={telemetry}
                    lastPayload={lastPayload}
                    onToggleListening={toggleListening}
                  />
                </div>
              </div>
            )}

            {/* Dedicated Transmitter Mode */}
            {viewMode === 'tx' && (
              <div className="max-w-2xl mx-auto rounded-2xl border border-white/10 bg-slate-950/40 p-6 shadow-lg">
                <TransmitterPanel
                  profile={profile}
                  onProfileChange={setProfile}
                />
              </div>
            )}

            {/* Dedicated Receiver Mode */}
            {viewMode === 'rx' && (
              <div className="max-w-2xl mx-auto rounded-2xl border border-white/10 bg-slate-950/40 p-6 shadow-lg">
                <ReceiverPanel
                  isListening={isListening}
                  telemetry={telemetry}
                  lastPayload={lastPayload}
                  onToggleListening={toggleListening}
                />
              </div>
            )}

            {/* Dedicated Spectrogram Mode */}
            {viewMode === 'spectrogram' && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6 text-sm text-white/80 font-mono space-y-2">
                  <p className="font-semibold text-white">How the Live Waterfall Spectrogram Works:</p>
                  <p className="text-xs text-white/60">
                    The canvas continuously renders a 60 FPS scrolling frequency heatmap of the raw 48 kHz PCM stream.
                    When transmitting near-inaudible sound at 18.5 kHz – 20.0 kHz, distinct glowing lines cascade down the screen
                    at the exact 16-FSK frequency bins, demonstrating acoustic transmission visually even in silent rooms.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
