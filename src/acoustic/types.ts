/**
 * SonicDrop - Acoustic & Modulation Type Definitions
 */

export type ModulationProfileType = 'ultrasonic' | 'audible';

export interface ModulationProfile {
  name: string;
  type: ModulationProfileType;
  description: string;
  sampleRate: number;
  /** Primary sync tone 1 in Hz */
  syncFreq1: number;
  /** Primary sync tone 2 in Hz */
  syncFreq2: number;
  /** Base carrier frequency for Tone 0 in Hz */
  baseFrequency: number;
  /** Frequency step between tones in Hz */
  stepFrequency: number;
  /** Number of discrete FSK tones (16 for 4 bits/symbol) */
  numTones: number;
  /** Duration of each symbol in seconds (e.g. 0.035 = 35ms) */
  symbolDuration: number;
  /** Guard interval duration between symbols in seconds */
  guardDuration: number;
  /** Fade-in / fade-out duration for Hann envelope in seconds */
  envelopeDuration: number;
}

export const PROFILES: Record<ModulationProfileType, ModulationProfile> = {
  ultrasonic: {
    name: 'Ultrasonic Stealth',
    type: 'ultrasonic',
    description: '18.2 kHz - 19.7 kHz (Near-inaudible to human adults, full air-gap)',
    sampleRate: 48000,
    syncFreq1: 17800,
    syncFreq2: 18000,
    baseFrequency: 18200,
    stepFrequency: 100, // 16 tones: 18200, 18300, ... 19700 Hz
    numTones: 16,
    symbolDuration: 0.035, // 35ms per symbol
    guardDuration: 0.005,  // 5ms guard
    envelopeDuration: 0.005 // 5ms Hann taper
  },
  audible: {
    name: 'Audible Acoustic Modem',
    type: 'audible',
    description: '1.6 kHz - 3.1 kHz (Acoustic audio modem sounds, ideal for debugging)',
    sampleRate: 48000,
    syncFreq1: 1300,
    syncFreq2: 1450,
    baseFrequency: 1600,
    stepFrequency: 100, // 16 tones: 1600, 1700, ... 3100 Hz
    numTones: 16,
    symbolDuration: 0.040, // 40ms per symbol
    guardDuration: 0.006,
    envelopeDuration: 0.006
  }
};

export type PayloadKind = 'text' | 'crypto_key' | 'file';

export const PAYLOAD_KIND_MAP: Record<PayloadKind, number> = {
  text: 0x01,
  crypto_key: 0x02,
  file: 0x03
};

export const REVERSE_PAYLOAD_KIND_MAP: Record<number, PayloadKind> = {
  0x01: 'text',
  0x02: 'crypto_key',
  0x03: 'file'
};

export interface DecodedPayload {
  kind: PayloadKind;
  filename?: string;
  mimeType?: string;
  data: Uint8Array;
  text?: string;
  crc32: number;
  crcValid: boolean;
  errorsCorrected: number;
  receivedAt: Date;
  transmissionDurationMs: number;
}

export type ReceiverState =
  | 'idle'
  | 'listening'
  | 'sync_detected'
  | 'receiving'
  | 'validating'
  | 'success'
  | 'error';

export interface ReceiverTelemetry {
  state: ReceiverState;
  snrDb: number;
  dominantFreqHz: number;
  detectedSymbol: number | null;
  symbolsReceived: number;
  totalExpectedSymbols: number;
  progressPercent: number;
  statusMessage: string;
}

export interface TransmitterTelemetry {
  isTransmitting: boolean;
  currentSymbol: number;
  totalSymbols: number;
  currentFreqHz: number;
  progressPercent: number;
}
