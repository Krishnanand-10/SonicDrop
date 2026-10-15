/**
 * SonicDrop - Transmitter Panel Component
 * Air-gapped payload input (text, crypto keys, files) and ultrasonic audio synthesis controls.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Radio,
  KeyRound,
  FileCode,
  Send,
  Square,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import {
  PROFILES,
  type ModulationProfile,
  type PayloadKind,
  type TransmitterTelemetry
} from '@/acoustic/types';
import { transceiver } from '@/acoustic/ggwave-engine';

interface TransmitterPanelProps {
  profile: ModulationProfile;
  onProfileChange: (p: ModulationProfile) => void;
  onTransmissionComplete?: (crc: number, durationMs: number) => void;
}

export function TransmitterPanel({
  profile,
  onProfileChange,
  onTransmissionComplete,
}: TransmitterPanelProps) {
  const [kind, setKind] = useState<PayloadKind>('text');
  const [textContent, setTextContent] = useState('Air-Gapped Ultrasonic Transfer: 0x9F4AE12D verified.');
  const [selectedFile, setSelectedFile] = useState<{ name: string; type: string; bytes: Uint8Array } | null>(null);

  const [telemetry, setTelemetry] = useState<TransmitterTelemetry | null>(null);
  const [isTransmitting, setIsTransmitting] = useState(false);

  // Preset generators for quick viva / demo
  const handleSetPreset = (preset: 'aes' | 'seed' | 'totp' | 'text') => {
    setKind(preset === 'aes' || preset === 'seed' || preset === 'totp' ? 'crypto_key' : 'text');
    if (preset === 'aes') {
      const randomHex = Array.from({ length: 32 }, () =>
        Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
      ).join('');
      setTextContent(`AES-256-GCM KEY: 0x${randomHex}`);
    } else if (preset === 'seed') {
      const words = [
        'orbit', 'acoustic', 'signal', 'cipher', 'ultrasonic',
        'quantum', 'airgap', 'vault', 'shuttle', 'matrix', 'beacon', 'echo'
      ];
      setTextContent(`MNEMONIC SEED: ${words.join(' ')}`);
    } else if (preset === 'totp') {
      const code = Math.floor(100000 + Math.random() * 900000);
      setTextContent(`AIRGAP-AUTH-OTP: ${code} (EXPIRES 30s)`);
    } else {
      setTextContent('SonicDrop Professor Viva Demo 2026: 100% Air-Gapped Audio Transfer!');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      setSelectedFile({
        name: file.name,
        type: file.type || 'application/octet-stream',
        bytes: new Uint8Array(arrayBuffer),
      });
      setKind('file');
    };
    reader.readAsArrayBuffer(file);
  };

  const handleTransmit = async () => {
    let textToSend = '';
    if (kind === 'file' && selectedFile) {
      if (selectedFile.bytes.length <= 384) {
        let binaryStr = '';
        for (let i = 0; i < selectedFile.bytes.length; i++) {
          binaryStr += String.fromCharCode(selectedFile.bytes[i]);
        }
        textToSend = JSON.stringify({
          k: 'file',
          name: selectedFile.name,
          mime: selectedFile.type,
          b64: btoa(binaryStr),
        });
      } else {
        textToSend = JSON.stringify({
          k: 'file',
          name: selectedFile.name,
          mime: selectedFile.type,
          d: `FILE: ${selectedFile.name} (${selectedFile.bytes.length} bytes)`,
        });
      }
    } else if (kind === 'crypto_key') {
      textToSend = JSON.stringify({
        k: 'crypto_key',
        d: textContent.trim(),
      });
    } else {
      textToSend = JSON.stringify({
        k: 'text',
        d: textContent.trim(),
      });
    }

    if (!textToSend) return;

    try {
      setIsTransmitting(true);
      const proto = profile.type === 'ultrasonic' ? 'ultrasound_normal' : 'audible_normal';

      await transceiver.transmit(textToSend, proto, 75, (p) => {
        setTelemetry({
          isTransmitting: p < 100,
          currentSymbol: Math.round((p / 100) * 40),
          totalSymbols: 40,
          currentFreqHz: profile.baseFrequency,
          progressPercent: p,
        });
      });

      onTransmissionComplete?.(1, 1500);
    } catch (err) {
      console.error('Transmit error:', err);
    } finally {
      setIsTransmitting(false);
      setTelemetry(null);
    }
  };

  const handleStop = () => {
    transceiver.stopTransmit();
    setIsTransmitting(false);
    setTelemetry(null);
  };

  return (
    <div className="space-y-6">
      {/* Payload Type Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setKind('text')}
            className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              kind === 'text'
                ? 'bg-sky-500/20 text-sky-200 border border-sky-400/40 shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <span>Secret Message</span>
          </button>

          <button
            onClick={() => setKind('crypto_key')}
            className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              kind === 'crypto_key'
                ? 'bg-purple-500/20 text-purple-200 border border-purple-400/40 shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>Cryptographic Key</span>
          </button>

          <button
            onClick={() => setKind('file')}
            className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              kind === 'file'
                ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <FileCode className="h-3.5 w-3.5" />
            <span>File Drop</span>
          </button>
        </div>

        {/* Profile Selector Toggle */}
        <div className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-slate-950/60 p-1">
          <button
            onClick={() => onProfileChange(PROFILES.ultrasonic)}
            className={`rounded-lg px-2.5 py-1 text-xs font-mono font-medium transition-colors cursor-pointer ${
              profile.type === 'ultrasonic'
                ? 'bg-sky-500/30 text-sky-200 border border-sky-400/30'
                : 'text-white/60 hover:text-white'
            }`}
          >
            19.5 kHz Ultrasonic
          </button>
          <button
            onClick={() => onProfileChange(PROFILES.audible)}
            className={`rounded-lg px-2.5 py-1 text-xs font-mono font-medium transition-colors cursor-pointer ${
              profile.type === 'audible'
                ? 'bg-amber-500/30 text-amber-200 border border-amber-400/30'
                : 'text-white/60 hover:text-white'
            }`}
          >
            2.0 kHz Modem
          </button>
        </div>
      </div>

      {/* Payload Content Area */}
      {kind !== 'file' ? (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-mono text-white/70 uppercase tracking-wider">
              {kind === 'crypto_key' ? 'Cryptographic Key / Seed' : 'Message Payload'}
            </label>

            {/* Viva Quick Presets */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-white/50 mr-1">Presets:</span>
              <button
                type="button"
                onClick={() => handleSetPreset('aes')}
                className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/10 hover:bg-white/20 text-sky-200 transition-colors cursor-pointer"
              >
                AES-256
              </button>
              <button
                type="button"
                onClick={() => handleSetPreset('seed')}
                className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/10 hover:bg-white/20 text-purple-200 transition-colors cursor-pointer"
              >
                Seed
              </button>
              <button
                type="button"
                onClick={() => handleSetPreset('totp')}
                className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/10 hover:bg-white/20 text-emerald-200 transition-colors cursor-pointer"
              >
                TOTP
              </button>
            </div>
          </div>

          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-white/15 bg-slate-950/70 p-4 font-mono text-sm text-white placeholder-white/40 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400/50 transition-all resize-none shadow-inner"
            placeholder="Type payload to transmit through physical sound waves..."
          />
        </div>
      ) : (
        /* File Upload Drop Zone */
        <div className="rounded-2xl border border-dashed border-white/25 bg-slate-950/40 p-8 text-center transition-colors hover:border-sky-400/60">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
          />
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center">
            <Upload className="h-10 w-10 text-sky-400 mb-3" />
            <span className="text-sm font-semibold text-white">
              {selectedFile ? selectedFile.name : 'Choose a file to drop over audio'}
            </span>
            <span className="text-xs text-white/60 mt-1 font-mono">
              {selectedFile
                ? `${(selectedFile.bytes.length / 1024).toFixed(2)} KB • Ready for transmission`
                : 'Max recommended size: 4 KB (text, mini QR, keys, certificates)'}
            </span>
          </label>
        </div>
      )}

      {/* Expanding Ripple Rings & Telemetry Display */}
      {isTransmitting && telemetry && (
        <div className="relative overflow-hidden rounded-2xl border border-sky-400/30 bg-sky-950/30 p-6 backdrop-blur-xl shadow-lg">
          {/* Framer motion pulse rings */}
          <div className="flex items-center justify-center mb-4 relative h-20">
            {[1, 2, 3].map((ring) => (
              <motion.div
                key={ring}
                className="absolute rounded-full border border-sky-400/40"
                initial={{ width: 30, height: 30, opacity: 0.9 }}
                animate={{ width: 180, height: 180, opacity: 0 }}
                transition={{
                  repeat: Infinity,
                  duration: 1.6,
                  delay: ring * 0.4,
                  ease: 'easeOut',
                }}
              />
            ))}
            <Radio className="h-8 w-8 text-sky-400 animate-pulse relative z-10" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-white/80">
              <span>TRANSMITTING CARRIER PULSES...</span>
              <span className="text-sky-300 font-bold">{telemetry.progressPercent}%</span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-950 border border-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400"
                style={{ width: `${telemetry.progressPercent}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-white/60 pt-1">
              <span>Symbol: {telemetry.currentSymbol} / {telemetry.totalSymbols}</span>
              <span>Band: {profile.baseFrequency} Hz – {profile.baseFrequency + 15 * profile.stepFrequency} Hz</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 text-xs font-mono text-white/60">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Volume: set speaker to ~70-80% for air-gap transfer</span>
        </div>

        <div className="flex items-center gap-3">
          {isTransmitting ? (
            <button
              onClick={handleStop}
              className="rounded-full bg-rose-600/80 hover:bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors cursor-pointer flex items-center gap-2"
            >
              <Square className="h-4 w-4 fill-current" />
              <span>Abort</span>
            </button>
          ) : (
            <button
              onClick={handleTransmit}
              className="rounded-full bg-white hover:bg-white/90 text-sky-700 px-7 py-2.5 text-sm font-bold shadow-lg transition-all cursor-pointer flex items-center gap-2 border border-transparent shadow-sky-400/20"
            >
              <Send className="h-4 w-4 text-sky-600" />
              <span>
                {profile.type === 'ultrasonic' ? 'Transmit Ultrasonic (Silent)' : 'Transmit Acoustic (Modem Chirp)'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
