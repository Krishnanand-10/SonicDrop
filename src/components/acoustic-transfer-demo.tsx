/**
 * SonicDrop - Interactive 2-Device Acoustic Transfer Simulation
 * Visualizes ultrasonic air-gap data transmission between two physical devices
 * using Hann-windowed 16-FSK sound waves at 343 m/s.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Laptop,
  Smartphone,
  Radio,
  Waves,
  ShieldCheck,
  CheckCircle2,
  Key,
  Lock,
  Zap,
  FileText,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  WifiOff,
  Cpu,
  ArrowRight,
} from 'lucide-react';

interface Preset {
  id: string;
  label: string;
  icon: typeof Key;
  preview: string;
  payload: string;
  bytes: number;
  crc: string;
  type: string;
  accent: 'sky' | 'emerald' | 'purple' | 'cyan';
}

const PRESETS: Preset[] = [
  {
    id: 'ssh',
    label: 'SSH Key',
    icon: Key,
    preview: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGf48mZ... user@secure-node',
    payload: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGf48mZa92P+1Q== user@scif',
    bytes: 68,
    crc: '0xA4F28C10',
    type: 'Cryptographic Identity',
    accent: 'sky',
  },
  {
    id: 'seed',
    label: 'Cold Wallet Seed',
    icon: Lock,
    preview: 'witch star wolf forest desert flame eagle mirror ocean...',
    payload: 'witch star wolf forest desert flame eagle mirror ocean crystal frost canyon',
    bytes: 72,
    crc: '0x9E73BA4D',
    type: 'BIP-39 Mnemonic',
    accent: 'emerald',
  },
  {
    id: 'totp',
    label: '2FA TOTP Secret',
    icon: Zap,
    preview: 'otpauth://totp/Vault:admin?secret=JBSWY3DPEHPK3PXP',
    payload: 'otpauth://totp/Vault:admin?secret=JBSWY3DPEHPK3PXP&issuer=Vault',
    bytes: 62,
    crc: '0x3D1184BC',
    type: 'Time-Based Token',
    accent: 'purple',
  },
  {
    id: 'memo',
    label: 'SCIF Confidential Memo',
    icon: FileText,
    preview: 'AIR-GAP CLEARANCE: Terminal 0x4B verified. Physical airlock sealed.',
    payload: 'AIR-GAP CLEARANCE: Terminal 0x4B verified. Physical airlock sealed.',
    bytes: 67,
    crc: '0xF1840C29',
    type: 'Zero-Trust Memo',
    accent: 'cyan',
  },
];

type Phase = 'idle' | 'transmitting' | 'completed';

export function AcousticTransferDemo() {
  const [selectedPreset, setSelectedPreset] = useState<Preset>(PRESETS[0]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState(0);
  const [audioMode, setAudioMode] = useState<'ultrasonic' | 'audible'>('ultrasonic');
  const [revealedChars, setRevealedChars] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);

  // Play subtle acoustic audio feedback safely
  const playAcousticFeedback = useCallback((mode: 'ultrasonic' | 'audible') => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new AudioCtx();
      }

      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      if (mode === 'audible') {
        // Musical 3-tone FSK chirps (1200Hz -> 1500Hz -> 1800Hz)
        [1200, 1500, 1850].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);

          gain.gain.setValueAtTime(0, now + idx * 0.12);
          gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.12 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.11);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.12);
        });
      } else {
        // True ultrasonic 19 kHz pulse (inaudible to adult human ears)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(19000, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.03, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.55);
      }
    } catch {
      // Audio autoplay policy fallback: continue visual simulation smoothly
    }
  }, []);

  const startSimulation = useCallback(() => {
    if (phase === 'transmitting') return;

    setPhase('transmitting');
    setProgress(0);
    setRevealedChars(0);

    playAcousticFeedback(audioMode);

    const totalDuration = 1200; // ms
    const startTime = performance.now();
    const payloadLen = selectedPreset.payload.length;

    const tick = () => {
      const elapsed = performance.now() - startTime;
      const currentProgress = Math.min(100, (elapsed / totalDuration) * 100);
      setProgress(currentProgress);

      if (currentProgress >= 40) {
        // Receiver decodes characters
        const ratio = (currentProgress - 40) / 60;
        const chars = Math.min(payloadLen, Math.floor(ratio * payloadLen));
        setRevealedChars(chars);
      }

      if (elapsed < totalDuration) {
        timerRef.current = requestAnimationFrame(tick);
      } else {
        setProgress(100);
        setRevealedChars(payloadLen);
        setPhase('completed');
      }
    };

    timerRef.current = requestAnimationFrame(tick);
  }, [phase, audioMode, selectedPreset.payload, playAcousticFeedback]);

  const resetSimulation = useCallback(() => {
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
    setPhase('idle');
    setProgress(0);
    setRevealedChars(0);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <section id="demo" className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-6 pb-16 sm:pt-10 sm:pb-24 select-none">
      {/* Section Header */}
      <div className="relative text-center max-w-3xl mx-auto mb-8 sm:mb-10 select-none">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(10,30,60,0.5)_0%,transparent_75%)] blur-2xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/50 bg-slate-900/90 px-4 py-1.5 text-xs font-semibold text-white shadow-xl backdrop-blur-xl mb-4">
          <Radio className="h-3.5 w-3.5 text-sky-400 stroke-[2.5] animate-pulse" />
          <span className="font-mono text-white tracking-wide">INTERACTIVE ACOUSTIC AIR-GAP PREVIEW</span>
        </div>

        <h2 className="text-3xl font-bold tracking-tight text-white drop-shadow-md sm:text-4xl lg:text-5xl font-sans">
          Experience Ultrasonic Transmission
        </h2>

        <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base text-white [text-shadow:0_1px_12px_rgba(10,30,60,0.4)] font-sans leading-relaxed">
          See how 16-FSK ultrasonic sound waves beam data between physically isolated devices at 343 m/s. No Wi-Fi, no Bluetooth, zero radio emissions.
        </p>
      </div>

      {/* Main Interactive Simulation Card */}
      <div className="relative rounded-3xl border border-white/15 bg-slate-900/60 p-5 sm:p-8 backdrop-blur-2xl shadow-2xl overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-28 bg-gradient-to-b from-sky-500/15 via-teal-500/5 to-transparent blur-2xl pointer-events-none" />

        {/* Top Controls: Preset Selection Pills & Audio Mode */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          {/* Payload Presets */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs uppercase tracking-wider text-white/80 font-mono font-medium mr-1">
              Sample Payload:
            </span>
            {PRESETS.map((preset) => {
              const Icon = preset.icon;
              const isSelected = selectedPreset.id === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setSelectedPreset(preset);
                    resetSimulation();
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-sky-500/25 text-white border border-sky-400/60 shadow-md shadow-sky-500/20 font-semibold'
                      : 'bg-slate-950/60 text-white/90 border border-white/15 hover:bg-slate-900/80 hover:text-white hover:border-white/30'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>

          {/* Audio Mode Toggle */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs uppercase tracking-wider text-white/60 font-mono">
              Acoustic Mode:
            </span>
            <div className="inline-flex rounded-xl bg-slate-950/60 p-0.5 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setAudioMode('ultrasonic')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
                  audioMode === 'ultrasonic'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
                    : 'text-white/60 hover:text-white'
                }`}
                title="19 kHz inaudible carrier (silent to human ears)"
              >
                <VolumeX className="h-3.5 w-3.5 text-sky-400" />
                <span>19 kHz Inaudible</span>
              </button>
              <button
                type="button"
                onClick={() => setAudioMode('audible')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
                  audioMode === 'audible'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                    : 'text-white/60 hover:text-white'
                }`}
                title="Audible FSK chirps for audible demonstration"
              >
                <Volume2 className="h-3.5 w-3.5 text-amber-400" />
                <span>Audible Demo</span>
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* Device A -> Acoustic Air-Gap -> Device B                       */}
        {/* ============================================================== */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 my-6 items-center">
          {/* DEVICE A: Transmitter (Workstation / Laptop) */}
          <div className="lg:col-span-5 rounded-2xl border border-white/15 bg-slate-950/60 p-4 sm:p-5 backdrop-blur-md shadow-xl flex flex-col justify-between min-h-[260px] transition-all">
            {/* Device Header */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs font-mono text-white/80 ml-1.5 flex items-center gap-1.5">
                    <Laptop className="h-3.5 w-3.5 text-sky-400" />
                    Transmitter
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-400/20">
                  <Cpu className="h-3 w-3" />
                  16-FSK
                </span>
              </div>

              {/* Device Payload Snippet */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] font-mono text-white/50 mb-1.5">
                  <span>PAYLOAD DATA</span>
                  <span>{selectedPreset.bytes} bytes</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10 font-mono text-xs text-white/90 break-all leading-relaxed shadow-inner">
                  {selectedPreset.preview}
                </div>
              </div>
            </div>

            {/* Modulation Indicator & Parity */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5 text-white/70">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
                <span>RS(32, 24) FEC</span>
              </div>
              <div className="text-sky-300 flex items-center gap-1">
                {phase === 'transmitting' ? (
                  <span className="inline-flex items-center gap-1 text-sky-400 animate-pulse">
                    <Radio className="h-3.5 w-3.5 animate-spin" />
                    Modulating...
                  </span>
                ) : (
                  <span className="text-white/60">Ready to transmit</span>
                )}
              </div>
            </div>
          </div>

          {/* CENTER: PHYSICAL AIR-GAP PROPAGATION CHANNEL */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center py-4 lg:py-0">
            {/* Air-gap distance & RF indicator */}
            <div className="text-center mb-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-400/20">
                <WifiOff className="h-3 w-3" />
                0 dBm RF (Air-Gap)
              </span>
            </div>

            {/* Sound Wave Animation Container */}
            <div className="relative w-full max-w-[200px] h-16 flex items-center justify-center">
              {/* Stationary track */}
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-sky-500/20 via-cyan-400/30 to-emerald-500/20 rounded-full" />

              {/* Animated Acoustic Waves */}
              {phase === 'transmitting' ? (
                <div className="relative w-full flex items-center justify-between px-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      animate={{
                        scale: [0.8, 1.3, 0.8],
                        opacity: [0.3, 1, 0.3],
                        x: [0, 8, 0],
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.1,
                        ease: 'easeInOut',
                      }}
                      className="text-cyan-400 flex flex-col items-center"
                    >
                      <Waves className="h-5 w-5 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-white/40">
                  <Waves className="h-5 w-5" />
                  <span className="text-[11px] font-mono">343 m/s</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </div>

            {/* Channel Specs */}
            <div className="text-center mt-1">
              <span className="text-[10px] font-mono text-white/60">
                ~1.5m Physical Room Air
              </span>
            </div>
          </div>

          {/* DEVICE B: Receiver (Air-Gapped Mobile / SCIF Device) */}
          <div className="lg:col-span-5 rounded-2xl border border-white/15 bg-slate-950/60 p-4 sm:p-5 backdrop-blur-md shadow-xl flex flex-col justify-between min-h-[260px] transition-all">
            {/* Device Header */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs font-mono text-white/80 ml-1.5 flex items-center gap-1.5">
                    <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
                    Receiver
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-400/20">
                  <Radio className="h-3 w-3" />
                  Mic FFT
                </span>
              </div>

              {/* Decoded Stream Display */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] font-mono text-white/50 mb-1.5">
                  <span>RECEIVED DECODE</span>
                  <span>
                    {phase === 'completed'
                      ? '100% Complete'
                      : phase === 'transmitting'
                      ? `${Math.floor(progress)}%`
                      : 'Standby'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10 font-mono text-xs break-all min-h-[64px] shadow-inner flex items-center">
                  {phase === 'idle' && (
                    <span className="text-white/40 italic text-xs">
                      Awaiting ultrasonic chirp from Transmitter...
                    </span>
                  )}

                  {phase === 'transmitting' && (
                    <span className="text-cyan-300">
                      {selectedPreset.payload.slice(0, revealedChars)}
                      <span className="inline-block w-2 h-3.5 bg-cyan-400 ml-0.5 animate-pulse" />
                    </span>
                  )}

                  {phase === 'completed' && (
                    <span className="text-emerald-300 font-medium">
                      {selectedPreset.payload}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Checksum & Status */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5">
                {phase === 'completed' ? (
                  <span className="text-emerald-400 inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    CRC: {selectedPreset.crc}
                  </span>
                ) : (
                  <span className="text-white/50">CRC-32 Checksum</span>
                )}
              </div>
              <div>
                {phase === 'completed' ? (
                  <span className="text-emerald-300 font-semibold bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-400/30">
                    Bit-Identical (0 Errors)
                  </span>
                ) : (
                  <span className="text-white/60">Acoustic Listening</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar during active transfer */}
        <AnimatePresence>
          {phase === 'transmitting' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="relative z-10 my-4"
            >
              <div className="h-1.5 w-full bg-slate-950/80 rounded-full overflow-hidden border border-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 shadow-[0_0_12px_rgba(56,189,248,0.8)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Action Bar */}
        <div className="relative z-10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
          <div className="flex items-center gap-3 text-xs text-white/70 font-sans">
            <span className="inline-flex items-center gap-1 font-mono text-cyan-300">
              <Waves className="h-3.5 w-3.5" /> 18.5 – 20.0 kHz
            </span>
            <span className="text-white/40">&bull;</span>
            <span>Speed: 343 m/s</span>
            <span className="text-white/40">&bull;</span>
            <span className="text-emerald-300 font-medium">100% Inaudible</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {phase === 'completed' ? (
              <button
                type="button"
                onClick={resetSimulation}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white font-semibold text-sm hover:bg-white/15 border border-white/20 transition-all cursor-pointer shadow-md"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset Simulation</span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={startSimulation}
              disabled={phase === 'transmitting'}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer shadow-lg ${
                phase === 'transmitting'
                  ? 'bg-sky-600/50 text-white/70 cursor-not-allowed border border-sky-400/30'
                  : 'bg-white text-sky-800 hover:bg-white/95 hover:scale-[1.02] active:scale-[0.98] border border-transparent shadow-sky-500/20'
              }`}
            >
              {phase === 'transmitting' ? (
                <>
                  <Waves className="h-4 w-4 animate-pulse text-sky-300" />
                  <span>Emitting Sound Wave... ({Math.floor(progress)}%)</span>
                </>
              ) : phase === 'completed' ? (
                <>
                  <Play className="h-4 w-4 text-sky-700" />
                  <span>Transmit Again</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 text-sky-700 fill-sky-700" />
                  <span>Simulate Ultrasonic Transfer</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
