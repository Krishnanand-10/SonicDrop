/**
 * SonicDrop - Live Ultrasonic Waterfall Spectrogram (60 FPS Canvas)
 * Visualizes the 17.0 kHz – 21.0 kHz acoustic spectrum in real-time.
 */

import { useEffect, useRef } from 'react';
import type { ModulationProfile } from '@/acoustic/types';

interface WaterfallSpectrogramProps {
  analyser: AnalyserNode | null;
  profile: ModulationProfile;
  isListening: boolean;
  className?: string;
}

export function WaterfallSpectrogram({
  analyser,
  profile,
  isListening,
  className = '',
}: WaterfallSpectrogramProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const fftSize = analyser ? analyser.frequencyBinCount : 1024;
    const freqData = new Float32Array(new ArrayBuffer(fftSize * 4));

    // Off-screen canvas for smooth scrolling waterfall
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;
    const offCtx = offscreenCanvas.getContext('2d');

    const sampleRate = analyser ? analyser.context.sampleRate : 48000;
    const binHz = sampleRate / (fftSize * 2);

    // Focus region: either ultrasonic (17 kHz - 21 kHz) or audible (1 kHz - 3.5 kHz)
    const minFreq = profile.type === 'ultrasonic' ? 17000 : 1200;
    const maxFreq = profile.type === 'ultrasonic' ? 20500 : 3400;

    const minBin = Math.max(0, Math.floor(minFreq / binHz));
    const maxBin = Math.min(fftSize - 1, Math.ceil(maxFreq / binHz));
    const numBinsToRender = Math.max(1, maxBin - minBin);

    const render = () => {
      animId = requestAnimationFrame(render);

      const width = canvas.width;
      const height = canvas.height;

      if (!analyser || !isListening) {
        // Idle scanner effect
        ctx.fillStyle = 'rgba(3, 7, 18, 0.2)';
        ctx.fillRect(0, 0, width, height);

        // Faint grid lines
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 60) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        return;
      }

      analyser.getFloatFrequencyData(freqData as unknown as Float32Array<ArrayBuffer>);

      // 1. Shift offscreen canvas down by 2 pixels (scrolling waterfall)
      if (offCtx) {
        offCtx.drawImage(canvas, 0, 0);
        ctx.drawImage(offscreenCanvas, 0, 2);
      }

      // 2. Draw new top row (1 row of spectral heatmap)
      const rowImg = ctx.createImageData(width, 2);
      const data = rowImg.data;

      for (let x = 0; x < width; x++) {
        const binFraction = x / width;
        const binIndex = Math.floor(minBin + binFraction * numBinsToRender);
        const db = freqData[binIndex] || -120;

        // Normalize dB from [-110, -30] to [0, 1]
        const norm = Math.max(0, Math.min(1, (db + 110) / 75));

        // Color mapping: Black -> Navy -> Cyan -> Neon Emerald -> Pure White
        let r = 0, g = 0, b = 0;
        if (norm < 0.25) {
          // Black to Navy
          const t = norm / 0.25;
          r = Math.floor(10 * t);
          g = Math.floor(30 * t);
          b = Math.floor(90 * t);
        } else if (norm < 0.6) {
          // Navy to Cyan
          const t = (norm - 0.25) / 0.35;
          r = Math.floor(10 + 24 * t);
          g = Math.floor(30 + 180 * t);
          b = Math.floor(90 + 165 * t);
        } else if (norm < 0.85) {
          // Cyan to Emerald
          const t = (norm - 0.6) / 0.25;
          r = Math.floor(34 + 16 * t);
          g = Math.floor(210 + 45 * t);
          b = Math.floor(255 - 100 * t);
        } else {
          // Emerald to White
          const t = (norm - 0.85) / 0.15;
          r = Math.floor(50 + 205 * t);
          g = 255;
          b = Math.floor(155 + 100 * t);
        }

        // Write row 0 and 1
        for (let row = 0; row < 2; row++) {
          const idx = (row * width + x) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        }
      }

      ctx.putImageData(rowImg, 0, 0);

      // 3. Overlay Frequency Markers
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';

      const markers =
        profile.type === 'ultrasonic'
          ? [17500, 18000, 18500, 19000, 19500, 20000]
          : [1500, 2000, 2500, 3000];

      for (const f of markers) {
        if (f >= minFreq && f <= maxFreq) {
          const x = ((f - minFreq) / (maxFreq - minFreq)) * width;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.setLineDash([2, 4]);
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillText(`${(f / 1000).toFixed(1)}k`, x + 3, height - 6);
        }
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [analyser, profile, isListening]);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/15 bg-slate-950/80 shadow-2xl backdrop-blur-xl ${className}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 font-mono text-xs text-white/80">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${isListening ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
          <span className="font-semibold text-sky-200">LIVE WATERFALL SPECTROGRAM</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-white/60">
          <span>WINDOW: {profile.type === 'ultrasonic' ? '17.0 kHz – 20.5 kHz' : '1.2 kHz – 3.4 kHz'}</span>
          <span>FFT: 2048</span>
          <span className="text-emerald-400 font-semibold">60 FPS</span>
        </div>
      </div>

      {/* Waterfall Canvas */}
      <canvas
        ref={canvasRef}
        width={700}
        height={220}
        className="w-full h-[220px] block cursor-crosshair"
      />
    </div>
  );
}
