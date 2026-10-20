/**
 * SonicDrop - Architecture Pipeline
 * Visualizes the 5-stage Acoustic Physical Layer pipeline.
 */

import { FileCode, Layers, Radio, Waves, Mic, ShieldCheck } from 'lucide-react';

const steps = [
  {
    step: '01',
    title: 'Payload & CRC-32',
    desc: 'Input payload (text, AES key, or binary file) is serialized, assigned type headers, and salted with an IEEE 802.3 CRC-32 checksum.',
    icon: FileCode,
    color: 'text-sky-400',
    borderColor: 'border-sky-500/30',
    hoverBorder: 'hover:border-sky-400/50 hover:bg-slate-900/80',
    bg: 'bg-sky-500/10',
  },
  {
    step: '02',
    title: 'Reed-Solomon FEC',
    desc: 'Block-level error correction adds 8 Galois field parity bytes for every 24 data bytes, ensuring resilience against acoustic echo.',
    icon: Layers,
    color: 'text-teal-400',
    borderColor: 'border-teal-500/30',
    hoverBorder: 'hover:border-teal-400/50 hover:bg-slate-900/80',
    bg: 'bg-teal-500/10',
  },
  {
    step: '03',
    title: '16-FSK Modulation',
    desc: 'Web Audio synthesizes Hann-windowed sinusoidal pulses across 16 orthogonal ultrasonic bins (18.5 kHz – 20.0 kHz).',
    icon: Radio,
    color: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    hoverBorder: 'hover:border-purple-400/50 hover:bg-slate-900/80',
    bg: 'bg-purple-500/10',
  },
  {
    step: '04',
    title: 'Acoustic Air-Gap',
    desc: 'Physical compression waves propagate through the room air at ~343 m/s. Zero RF emission, zero electromagnetic signature.',
    icon: Waves,
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    hoverBorder: 'hover:border-emerald-400/50 hover:bg-slate-900/80',
    bg: 'bg-emerald-500/10',
  },
  {
    step: '05',
    title: 'WASM Demodulation',
    desc: 'Receiver microphone captures 48 kHz PCM stream; Goertzel filter bank identifies tone peak bins with sub-millisecond clock sync.',
    icon: Mic,
    color: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    hoverBorder: 'hover:border-amber-400/50 hover:bg-slate-900/80',
    bg: 'bg-amber-500/10',
  },
  {
    step: '06',
    title: 'Integrity Delivery',
    desc: 'Payload is verified bit-for-bit against CRC-32 checksum, error-corrected if damaged, and rendered instantaneously.',
    icon: ShieldCheck,
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    hoverBorder: 'hover:border-cyan-400/50 hover:bg-slate-900/80',
    bg: 'bg-cyan-500/10',
  },
];

export function ArchitecturePipeline() {
  return (
    <section id="architecture" className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16 sm:py-24 select-none">
      {/* Section Header identical to Hero section */}
      <div className="relative text-center max-w-4xl mx-auto mb-12 sm:mb-16 select-none">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(10,30,60,0.45)_0%,transparent_75%)] blur-2xl pointer-events-none" />

        <h2 className="text-4xl font-bold tracking-tight text-white drop-shadow-md md:text-5xl lg:text-6xl font-sans">
          How SonicDrop Works
        </h2>

        <p className="mt-5 max-w-2xl mx-auto text-base text-white [text-shadow:0_1px_12px_rgba(10,30,60,0.35)] md:text-lg font-sans leading-relaxed">
          From binary bytes to physical ultrasonic sound waves and back. A zero-trust acoustic transport pipeline.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`group relative rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl shadow-lg transition-all duration-300 hover:shadow-2xl ${item.hoverBorder}`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs font-bold text-white/80 group-hover:text-white transition-colors">
                  STAGE {item.step}
                </span>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border ${item.borderColor} ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-sans group-hover:text-white transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-white/90 leading-relaxed font-sans">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
