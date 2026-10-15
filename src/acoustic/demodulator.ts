/**
 * SonicDrop - Goertzel Filter Bank & 16-FSK Tone Slicer
 * High-speed, targeted energy detection for discrete audio carrier frequencies.
 */

import type { ModulationProfile } from './types';

export interface GoertzelDetector {
  freq: number;
  coeff: number;
}

export function createGoertzelDetector(freq: number, sampleRate: number, blockSize: number): GoertzelDetector {
  const k = Math.round((blockSize * freq) / sampleRate);
  const omega = (2 * Math.PI * k) / blockSize;
  const coeff = 2 * Math.cos(omega);
  return { freq, coeff };
}

/**
 * Calculates the signal energy at a target frequency across a block of time-domain samples.
 */
export function runGoertzel(samples: Float32Array, detector: GoertzelDetector): number {
  let s0 = 0;
  let s1 = 0;
  let s2 = 0;
  const coeff = detector.coeff;
  const len = samples.length;

  for (let i = 0; i < len; i++) {
    s0 = samples[i] + coeff * s1 - s2;
    s2 = s1;
    s1 = s0;
  }

  const power = s1 * s1 + s2 * s2 - coeff * s1 * s2;
  return Math.max(0, power);
}

export interface ToneDetectionResult {
  bestToneIdx: number;
  bestToneFreq: number;
  bestTonePower: number;
  snrRatio: number;
  allPowers: number[];
}

export class FSKToneBank {
  private sync1Detector: GoertzelDetector;
  private sync2Detector: GoertzelDetector;
  private toneDetectors: GoertzelDetector[] = [];
  public readonly profile: ModulationProfile;
  public readonly sampleRate: number;
  public readonly blockSize: number;

  constructor(profile: ModulationProfile, sampleRate = 48000, blockSize = 1024) {
    this.profile = profile;
    this.sampleRate = sampleRate;
    this.blockSize = blockSize;

    this.sync1Detector = createGoertzelDetector(profile.syncFreq1, sampleRate, blockSize);
    this.sync2Detector = createGoertzelDetector(profile.syncFreq2, sampleRate, blockSize);

    for (let i = 0; i < profile.numTones; i++) {
      const freq = profile.baseFrequency + i * profile.stepFrequency;
      this.toneDetectors.push(createGoertzelDetector(freq, sampleRate, blockSize));
    }
  }

  public detectSyncTones(samples: Float32Array): { sync1Power: number; sync2Power: number } {
    return {
      sync1Power: runGoertzel(samples, this.sync1Detector),
      sync2Power: runGoertzel(samples, this.sync2Detector)
    };
  }

  public sliceTone(samples: Float32Array): ToneDetectionResult {
    let bestIdx = 0;
    let maxPower = -1;
    let sumPower = 0;
    const powers: number[] = new Array(this.toneDetectors.length);

    for (let i = 0; i < this.toneDetectors.length; i++) {
      const p = runGoertzel(samples, this.toneDetectors[i]);
      powers[i] = p;
      sumPower += p;
      if (p > maxPower) {
        maxPower = p;
        bestIdx = i;
      }
    }

    const otherAvg = (sumPower - maxPower) / Math.max(1, this.toneDetectors.length - 1);
    const snr = otherAvg > 1e-9 ? maxPower / otherAvg : maxPower > 1e-6 ? 100 : 1;

    return {
      bestToneIdx: bestIdx,
      bestToneFreq: this.toneDetectors[bestIdx].freq,
      bestTonePower: maxPower,
      snrRatio: snr,
      allPowers: powers
    };
  }
}
