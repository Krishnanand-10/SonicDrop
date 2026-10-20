/**
 * SonicDrop - Features Bento Grid
 * Inspired by p2pcopy's "Everything cloud drives do, minus the cloud".
 * Focuses on physical acoustic air-gap, Reed-Solomon FEC, and zero RF emission.
 */

import {
  Waves,
  ShieldCheck,
  WifiOff,
  Cpu,
  Activity,
  Layers,
} from 'lucide-react';

export function FeaturesGrid() {
  return (
    <section id="features" className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16 sm:py-24 select-none">
      {/* Section Header identical to Hero section */}
      <div className="relative text-center max-w-4xl mx-auto mb-12 sm:mb-16 select-none">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(10,30,60,0.45)_0%,transparent_75%)] blur-2xl pointer-events-none" />

        <h2 className="text-4xl font-bold tracking-tight text-white drop-shadow-md md:text-5xl lg:text-6xl font-sans">
          Everything Cables & Radio Do, <br className="hidden md:block" /> Over Silent Sound
        </h2>

        <p className="mt-5 max-w-2xl mx-auto text-base text-white [text-shadow:0_1px_12px_rgba(10,30,60,0.35)] md:text-lg font-sans leading-relaxed">
          Traditional data transfer relies on radio frequencies vulnerable to remote sniffing, Wi-Fi deauth,
          and pairing exploits. SonicDrop confines data to sound waves that cannot leave the room.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Ultrasonic 16-FSK & WASM */}
        <div className="group rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl transition-all duration-300 hover:border-sky-400/50 hover:bg-slate-900/80 hover:shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/15 border border-sky-400/30 text-sky-300 mb-5 group-hover:scale-105 transition-transform">
              <Waves className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-sans group-hover:text-white transition-colors">
              Ultrasonic 16-FSK & WASM
            </h3>
            <p className="text-sm text-white/90 leading-relaxed font-sans">
              Transmits over an inaudible 18.5 kHz – 20.0 kHz band using multi-frequency shift keying.
              Powered by Georgi Gerganov's C++ WebAssembly engine with sample-accurate clock sync.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-sky-300/80">
            <span>16 Orthogonal Carriers</span>
            <span className="rounded-md bg-white/5 px-2 py-0.5 border border-white/10">Δf = 93.75 Hz</span>
          </div>
        </div>

        {/* Card 2: Reed-Solomon FEC */}
        <div className="group rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl transition-all duration-300 hover:border-emerald-400/50 hover:bg-slate-900/80 hover:shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 mb-5 group-hover:scale-105 transition-transform">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-sans group-hover:text-white transition-colors">
              Reed-Solomon RS(32, 24) FEC
            </h3>
            <p className="text-sm text-white/90 leading-relaxed font-sans">
              Forward Error Correction appends algebraic parity symbols to mathematically reconstruct
              corrupted or dropped audio samples caused by echo, room reverberation, or movement.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-emerald-300/80">
            <span>Erasure Recovery</span>
            <span className="rounded-md bg-white/5 px-2 py-0.5 border border-white/10">8 Parity Bytes</span>
          </div>
        </div>

        {/* Card 3: 100% Air-Gapped & PWA */}
        <div className="group rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl transition-all duration-300 hover:border-purple-400/50 hover:bg-slate-900/80 hover:shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/15 border border-purple-400/30 text-purple-300 mb-5 group-hover:scale-105 transition-transform">
              <WifiOff className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-sans group-hover:text-white transition-colors">
              100% Air-Gap & PWA Offline
            </h3>
            <p className="text-sm text-white/90 leading-relaxed font-sans">
              Installable as a standalone offline PWA via service worker caching. Operates with Wi-Fi,
              Bluetooth, cellular, and USB data completely severed. Zero RF emissions.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-purple-300/80">
            <span>Air-Gap Compliance</span>
            <span className="rounded-md bg-white/5 px-2 py-0.5 border border-white/10">0 dBm RF</span>
          </div>
        </div>

        {/* Card 4: IEEE CRC-32 Integrity */}
        <div className="group rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl transition-all duration-300 hover:border-amber-400/50 hover:bg-slate-900/80 hover:shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-300 mb-5 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-sans group-hover:text-white transition-colors">
              IEEE 802.3 CRC-32 Checksum
            </h3>
            <p className="text-sm text-white/90 leading-relaxed font-sans">
              Hardware-grade cyclic redundancy checksum calculated across raw bytes. Guarantees cryptographic
              keys, seed phrases, and files arrive bit-for-bit identical with zero corruption.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-amber-300/80">
            <span>Bit-for-Bit Verification</span>
            <span className="rounded-md bg-white/5 px-2 py-0.5 border border-white/10">CRC-32 Validated</span>
          </div>
        </div>

        {/* Card 5: Zero Hardware Drivers */}
        <div className="group rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl transition-all duration-300 hover:border-teal-400/50 hover:bg-slate-900/80 hover:shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/15 border border-teal-400/30 text-teal-300 mb-5 group-hover:scale-105 transition-transform">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-sans group-hover:text-white transition-colors">
              Zero Hardware Drivers
            </h3>
            <p className="text-sm text-white/90 leading-relaxed font-sans">
              Runs directly in Chrome, Safari, Edge, and Firefox via standard Web Audio API.
              Uses your existing laptop, iPhone, or Android built-in speakers and microphones.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-teal-300/80">
            <span>Cross-Platform</span>
            <span className="rounded-md bg-white/5 px-2 py-0.5 border border-white/10">AudioContext 48 kHz</span>
          </div>
        </div>

        {/* Card 6: 60 FPS Waterfall Spectrogram */}
        <div className="group rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/50 hover:bg-slate-900/80 hover:shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 mb-5 group-hover:scale-105 transition-transform">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-sans group-hover:text-white transition-colors">
              Live Waterfall Spectrogram
            </h3>
            <p className="text-sm text-white/90 leading-relaxed font-sans">
              HTML5 Canvas visualizer rendering a 60 FPS scrolling frequency heatmap of the raw PCM
              audio. Makes inaudible ultrasonic pulses clearly visible to the human eye.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-cyan-300/80">
            <span>Spectral Telemetry</span>
            <span className="rounded-md bg-white/5 px-2 py-0.5 border border-white/10">60 FPS Canvas</span>
          </div>
        </div>
      </div>
    </section>
  );
}
