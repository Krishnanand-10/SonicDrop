/**
 * SonicDrop - Receiver Panel Component
 * Real-time microphone listening, preamble synchronization, and decoded payload display.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  ShieldCheck,
  Copy,
  Check,
  Download,
  KeyRound,
  FileCode,
  Radio,
  Lock,
} from 'lucide-react';
import type { DecodedPayload, ReceiverTelemetry } from '@/acoustic/types';
import { formatCRC32 } from '@/acoustic/crc32';

interface ReceiverPanelProps {
  isListening: boolean;
  telemetry: ReceiverTelemetry | null;
  lastPayload: DecodedPayload | null;
  onToggleListening: () => void;
}

export function ReceiverPanel({
  isListening,
  telemetry,
  lastPayload,
  onToggleListening,
}: ReceiverPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (lastPayload?.text) {
      navigator.clipboard.writeText(lastPayload.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadFile = () => {
    if (!lastPayload) return;
    const blob = new Blob([lastPayload.data as unknown as BlobPart], { type: lastPayload.mimeType || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = lastPayload.filename || 'sonicdrop_received_file.bin';
    a.click();
    URL.revokeObjectURL(url);
  };

  const state = telemetry?.state || (isListening ? 'listening' : 'idle');

  return (
    <div className="space-y-6">
      {/* Listening Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all shadow-md ${
              isListening
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 shadow-emerald-500/10'
                : 'bg-slate-800 text-slate-400 border border-white/10'
            }`}
          >
            {isListening ? (
              <Radio className="h-5 w-5 animate-pulse" />
            ) : (
              <MicOff className="h-5 w-5" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white text-sm sm:text-base">
                {isListening ? 'Microphone Receiver Active' : 'Receiver Standing By'}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase ${
                  state === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                    : state === 'receiving'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30 animate-pulse'
                    : state === 'listening'
                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {state.replace('_', ' ')}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              <p className="text-xs text-white/60 font-mono">
                {telemetry?.statusMessage || (isListening ? 'Awaiting acoustic carrier...' : 'Click Start to listen for audio packets')}
              </p>
              {isListening && telemetry && telemetry.snrDb > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  Mic Active: {telemetry.snrDb} dB
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Start / Stop Listening Button */}
        <button
          onClick={onToggleListening}
          className={`rounded-full px-5 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-md ${
            isListening
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
              : 'bg-white hover:bg-white/90 text-sky-700 font-bold border border-transparent'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="h-4 w-4" />
              <span>Mute Receiver</span>
            </>
          ) : (
            <>
              <Mic className="h-4 w-4 text-sky-600" />
              <span>Listen on Mic</span>
            </>
          )}
        </button>
      </div>

      {/* Real-time Reception Progress Bar (if currently receiving) */}
      {state === 'receiving' && telemetry && (
        <div className="rounded-2xl border border-sky-400/30 bg-sky-950/30 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs font-mono text-white/80 mb-2">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping" />
              <span>DEMODULATING INCOMING SYMBOLS...</span>
            </span>
            <span className="text-sky-300 font-bold">{telemetry.progressPercent}%</span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-950 border border-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-sky-400 to-emerald-400"
              style={{ width: `${telemetry.progressPercent}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-white/60 pt-2">
            <span>Symbols: {telemetry.symbolsReceived} / {telemetry.totalExpectedSymbols || '?'}</span>
            <span>Estimated SNR: {telemetry.snrDb} dB</span>
          </div>
        </div>
      )}

      {/* Decoded Payload Results Card */}
      <AnimatePresence mode="wait">
        {lastPayload ? (
          <motion.div
            key={lastPayload.receivedAt.getTime()}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-emerald-400/30 bg-emerald-950/20 p-6 backdrop-blur-xl shadow-xl space-y-4"
          >
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                  {lastPayload.kind === 'crypto_key' ? (
                    <KeyRound className="h-4 w-4" />
                  ) : lastPayload.kind === 'file' ? (
                    <FileCode className="h-4 w-4" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                </div>
                <span className="font-mono text-sm font-semibold text-emerald-200">
                  {lastPayload.kind === 'crypto_key'
                    ? 'Cryptographic Key Reconstructed'
                    : lastPayload.kind === 'file'
                    ? `File Received: ${lastPayload.filename || 'download.bin'}`
                    : 'Acoustic Message Received'}
                </span>
              </div>

              {/* CRC Validated Pill */}
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3 py-1 font-mono text-xs text-emerald-300">
                <Check className="h-3.5 w-3.5" />
                <span>CRC-32: {formatCRC32(lastPayload.crc32)} (VALID)</span>
              </div>
            </div>

            {/* Content view */}
            {lastPayload.kind !== 'file' ? (
              <div className="relative rounded-xl border border-white/10 bg-slate-950/80 p-4 font-mono text-sm text-emerald-100 break-all select-all shadow-inner">
                {lastPayload.text}
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/80 p-4 font-mono text-xs text-white/80">
                <div>
                  <p className="font-semibold text-white">{lastPayload.filename || 'received_file.bin'}</p>
                  <p className="text-white/60">{(lastPayload.data.length / 1024).toFixed(2)} KB &bull; Type: {lastPayload.mimeType || 'binary'}</p>
                </div>
                <button
                  onClick={handleDownloadFile}
                  className="rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </button>
              </div>
            )}

            {/* Footer metrics strip */}
            <div className="flex flex-wrap items-center justify-between text-xs font-mono text-white/60 pt-1">
              <div className="flex items-center gap-4">
                <span>Errors fixed by RS: <strong className="text-emerald-300">{lastPayload.errorsCorrected} symbols</strong></span>
                <span>Transfer: <strong className="text-white">{lastPayload.transmissionDurationMs} ms</strong></span>
              </div>

              {lastPayload.text && (
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-xs text-sky-300 hover:text-white transition-colors cursor-pointer font-sans"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-8 text-center text-white/60 font-mono text-xs">
            <Lock className="h-8 w-8 text-white/30 mx-auto mb-2" />
            <p>No packet received yet.</p>
            <p className="text-[11px] text-white/40 mt-1">
              {isListening
                ? 'Keep microphone active. Transmit on Transmitter to see data appear automatically.'
                : 'Turn ON the receiver above to start listening for ultrasonic pulses.'}
            </p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
