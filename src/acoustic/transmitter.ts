/**
 * SonicDrop - Acoustic 16-FSK Audio Synthesizer & Transmitter
 * 
 * Synthesizes continuous-phase audio with smooth Hann window envelopes
 * to completely eliminate audible clicks and spectral splatter.
 */

import { type ModulationProfile, type TransmitterTelemetry } from './types';

export class AcousticTransmitter {
  private audioCtx: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private isTransmitting = false;

  constructor() {}

  private getAudioContext(sampleRate: number): AudioContext {
    if (!this.audioCtx || this.audioCtx.sampleRate !== sampleRate) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass({ sampleRate });
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Synthesizes the raw audio PCM float buffer for a given packet.
   */
  public synthesize(
    packetBytes: Uint8Array,
    profile: ModulationProfile
  ): Float32Array {
    const sampleRate = profile.sampleRate;
    const symbolSamples = Math.floor(profile.symbolDuration * sampleRate);
    const guardSamples = Math.floor(profile.guardDuration * sampleRate);
    const fadeSamples = Math.floor(profile.envelopeDuration * sampleRate);

    // 1. Convert packet bytes into a stream of 4-bit nibbles (2 symbols per byte)
    const symbols: number[] = [];
    for (let i = 0; i < packetBytes.length; i++) {
      const byte = packetBytes[i];
      symbols.push((byte >> 4) & 0x0F); // High nibble
      symbols.push(byte & 0x0F);        // Low nibble
    }

    // 2. Build Preamble:
    // - Up-Chirp: 120ms linear sweep from syncFreq1 to baseFrequency + (16 * stepFrequency)
    // - Sync Tone A: 40ms
    // - Sync Tone B: 40ms
    // - Sync Tone A: 40ms
    // - Guard silence: 20ms
    const chirpDuration = 0.120;
    const chirpSamples = Math.floor(chirpDuration * sampleRate);
    const syncDuration = 0.040;
    const syncSamples = Math.floor(syncDuration * sampleRate);
    const leadSilenceSamples = Math.floor(0.030 * sampleRate);
    const trailSilenceSamples = Math.floor(0.040 * sampleRate);

    const totalDataSamples = symbols.length * (symbolSamples + guardSamples);
    const totalSamples =
      leadSilenceSamples +
      chirpSamples +
      syncSamples * 3 +
      leadSilenceSamples +
      totalDataSamples +
      trailSilenceSamples;

    const buffer = new Float32Array(totalSamples);
    let sampleIdx = leadSilenceSamples;

    // Helper: Generate continuous phase tone with Hann envelope
    let phase = 0;
    const writeTone = (freq: number, numSamples: number, amplitude = 0.85) => {
      const phaseIncr = (2 * Math.PI * freq) / sampleRate;
      for (let n = 0; n < numSamples; n++) {
        let env = 1.0;
        // Fade in
        if (n < fadeSamples) {
          env = 0.5 * (1 - Math.cos((Math.PI * n) / fadeSamples));
        }
        // Fade out
        else if (n > numSamples - fadeSamples) {
          const m = numSamples - n;
          env = 0.5 * (1 - Math.cos((Math.PI * m) / fadeSamples));
        }

        buffer[sampleIdx++] = Math.sin(phase) * env * amplitude;
        phase += phaseIncr;
        if (phase > 2 * Math.PI) phase -= 2 * Math.PI;
      }
    };

    // Helper: Generate Linear Frequency Modulated (LFM) Chirp
    const writeChirp = (fStart: number, fEnd: number, numSamples: number, amplitude = 0.85) => {
      const k = (fEnd - fStart) / (numSamples / sampleRate);
      for (let n = 0; n < numSamples; n++) {
        const t = n / sampleRate;
        const currentFreq = fStart + 0.5 * k * t;
        const currentPhase = 2 * Math.PI * currentFreq * t;

        let env = 1.0;
        if (n < fadeSamples) {
          env = 0.5 * (1 - Math.cos((Math.PI * n) / fadeSamples));
        } else if (n > numSamples - fadeSamples) {
          const m = numSamples - n;
          env = 0.5 * (1 - Math.cos((Math.PI * m) / fadeSamples));
        }

        buffer[sampleIdx++] = Math.sin(currentPhase) * env * amplitude;
      }
      phase = 0;
    };

    // --- Generate Preamble ---
    const maxFreq = profile.baseFrequency + (profile.numTones - 1) * profile.stepFrequency;
    writeChirp(profile.syncFreq1, maxFreq, chirpSamples);

    // Sync sequence: Tone1 -> Tone2 -> Tone1
    writeTone(profile.syncFreq1, syncSamples);
    writeTone(profile.syncFreq2, syncSamples);
    writeTone(profile.syncFreq1, syncSamples);

    // Guard silence between preamble and data
    sampleIdx += leadSilenceSamples;

    // --- Generate Data Symbols (16-FSK) ---
    for (let i = 0; i < symbols.length; i++) {
      const nibble = symbols[i];
      const toneFreq = profile.baseFrequency + nibble * profile.stepFrequency;

      writeTone(toneFreq, symbolSamples);
      // Guard interval (zero amplitude) to allow room multipath echoes to decay
      sampleIdx += guardSamples;
    }

    return buffer;
  }

  /**
   * Plays the synthesized audio packet via Web Audio API.
   */
  public async transmit(
    packetBytes: Uint8Array,
    profile: ModulationProfile,
    onProgress?: (telemetry: TransmitterTelemetry) => void
  ): Promise<void> {
    if (this.isTransmitting) {
      this.stop();
    }

    const audioCtx = this.getAudioContext(profile.sampleRate);
    const pcmData = this.synthesize(packetBytes, profile);

    const audioBuffer = audioCtx.createBuffer(1, pcmData.length, profile.sampleRate);
    audioBuffer.copyToChannel(pcmData as unknown as Float32Array<ArrayBuffer>, 0);

    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.9, audioCtx.currentTime);

    source.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    this.currentSource = source;
    this.isTransmitting = true;

    const totalSymbols = packetBytes.length * 2;
    const durationMs = (pcmData.length / profile.sampleRate) * 1000;
    const startTime = performance.now();

    // Progress timer
    const progressInterval = setInterval(() => {
      if (!this.isTransmitting) {
        clearInterval(progressInterval);
        return;
      }
      const elapsed = performance.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / durationMs) * 100));
      const currentSym = Math.min(totalSymbols, Math.floor((elapsed / durationMs) * totalSymbols));

      onProgress?.({
        isTransmitting: true,
        currentSymbol: currentSym,
        totalSymbols,
        currentFreqHz: profile.baseFrequency,
        progressPercent: progress,
      });
    }, 50);

    return new Promise<void>((resolve) => {
      source.onended = () => {
        clearInterval(progressInterval);
        this.isTransmitting = false;
        this.currentSource = null;

        onProgress?.({
          isTransmitting: false,
          currentSymbol: totalSymbols,
          totalSymbols,
          currentFreqHz: profile.baseFrequency,
          progressPercent: 100,
        });

        resolve();
      };

      source.start();
    });
  }

  /**
   * Stops any currently playing audio transmission.
   */
  public stop(): void {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch {
        // Ignore if already stopped
      }
      this.currentSource = null;
    }
    this.isTransmitting = false;
  }

  public get transmitting(): boolean {
    return this.isTransmitting;
  }
}

export const transmitter = new AcousticTransmitter();
