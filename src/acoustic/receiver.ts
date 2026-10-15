/**
 * SonicDrop - Acoustic Receiver & Demodulation State Machine
 * Listens on raw microphone PCM, synchronizes on ultrasonic preambles, and reconstructs files with FEC.
 */

import {
  PROFILES,
  type ModulationProfile,
  type DecodedPayload,
  type ReceiverState,
  type ReceiverTelemetry
} from './types';
import { formatCRC32 } from './crc32';
import { parsePacket } from './packet';
import { FSKToneBank } from './demodulator';

export class AcousticReceiver {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private profile: ModulationProfile = PROFILES.ultrasonic;

  private state: ReceiverState = 'idle';
  private toneBank: FSKToneBank | null = null;
  private isListening = false;

  private animFrameId: number | null = null;
  private sampleBuffer: Float32Array = new Float32Array(new ArrayBuffer(2048 * 4));

  // Sync detection state
  private syncStep = 0; // 0 = waiting for sync1, 1 = saw sync1, waiting for sync2, 2 = saw sync2, waiting for sync1
  private lastSyncTime = 0;
  private noiseFloor = 1e-6;

  // Reception state
  private receivedNibbles: number[] = [];
  private totalExpectedSymbols = 0;
  private symbolTimer: number | null = null;
  private receptionStartTime = 0;

  // Callbacks
  public onStateChange?: (state: ReceiverState, telemetry: ReceiverTelemetry) => void;
  public onTelemetry?: (telemetry: ReceiverTelemetry) => void;
  public onPacketReceived?: (payload: DecodedPayload) => void;
  public onError?: (msg: string) => void;

  constructor(profile: ModulationProfile = PROFILES.ultrasonic) {
    this.profile = profile;
  }

  public setProfile(profile: ModulationProfile) {
    this.profile = profile;
    if (this.audioCtx) {
      this.toneBank = new FSKToneBank(profile, this.audioCtx.sampleRate, 1024);
    }
  }

  public getAnalyserNode(): AnalyserNode | null {
    return this.analyser;
  }

  public getState(): ReceiverState {
    return this.state;
  }

  /**
   * Starts listening on the microphone with noise cancellation and echo suppression DISABLED.
   */
  public async start(): Promise<void> {
    if (this.isListening) return;

    // Request raw microphone audio without browser DSP
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        channelCount: 1,
        sampleRate: 48000
      }
    });

    this.micStream = stream;
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.audioCtx = new AudioCtxClass({ sampleRate: 48000 });

    const source = this.audioCtx.createMediaStreamSource(stream);
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.1;
    source.connect(this.analyser);

    this.toneBank = new FSKToneBank(this.profile, this.audioCtx.sampleRate, 1024);
    this.sampleBuffer = new Float32Array(new ArrayBuffer(this.analyser.fftSize * 4));

    this.isListening = true;
    this.setState('listening', 'Listening for ultrasonic preamble...');

    this.listenLoop();
  }

  private setState(state: ReceiverState, statusMessage: string) {
    this.state = state;
    const telemetry: ReceiverTelemetry = {
      state,
      snrDb: 0,
      dominantFreqHz: 0,
      detectedSymbol: null,
      symbolsReceived: this.receivedNibbles.length,
      totalExpectedSymbols: this.totalExpectedSymbols,
      progressPercent:
        this.totalExpectedSymbols > 0
          ? Math.min(100, Math.round((this.receivedNibbles.length / this.totalExpectedSymbols) * 100))
          : 0,
      statusMessage
    };

    if (this.onStateChange) this.onStateChange(state, telemetry);
    if (this.onTelemetry) this.onTelemetry(telemetry);
  }

  private listenLoop = () => {
    if (!this.isListening || !this.analyser || !this.toneBank) return;

    this.analyser.getFloatTimeDomainData(this.sampleBuffer as unknown as Float32Array<ArrayBuffer>);

    if (this.state === 'listening' || this.state === 'sync_detected') {
      this.processSyncDetection();
    }

    this.animFrameId = requestAnimationFrame(this.listenLoop);
  };

  /**
   * Detects the preamble cadence [SYNC1 -> SYNC2 -> SYNC1]
   */
  private processSyncDetection() {
    if (!this.toneBank) return;

    const { sync1Power, sync2Power } = this.toneBank.detectSyncTones(this.sampleBuffer);
    const now = performance.now();

    // Dynamically update noise floor
    this.noiseFloor = this.noiseFloor * 0.95 + Math.min(sync1Power, sync2Power) * 0.05 + 1e-9;
    const threshold = Math.max(1e-5, this.noiseFloor * 5.0);

    const isSync1 = sync1Power > threshold && sync1Power > sync2Power * 2.0;
    const isSync2 = sync2Power > threshold && sync2Power > sync1Power * 2.0;

    if (this.syncStep === 0) {
      if (isSync1) {
        this.syncStep = 1;
        this.lastSyncTime = now;
        this.setState('sync_detected', 'Preamble detected: Tone 1 locked');
      }
    } else if (this.syncStep === 1) {
      const dt = now - this.lastSyncTime;
      if (dt > 250) {
        // Timed out waiting for sync2
        this.syncStep = 0;
        this.setState('listening', 'Listening for ultrasonic preamble...');
      } else if (isSync2 && dt > 40) {
        this.syncStep = 2;
        this.lastSyncTime = now;
        this.setState('sync_detected', 'Preamble detected: Tone 2 locked');
      }
    } else if (this.syncStep === 2) {
      const dt = now - this.lastSyncTime;
      if (dt > 250) {
        this.syncStep = 0;
        this.setState('listening', 'Listening for ultrasonic preamble...');
      } else if (isSync1 && dt > 40) {
        // Fully locked onto sync cadence!
        this.syncStep = 0;
        this.startReceiving();
      }
    }
  }

  /**
   * Synchronized to the symbol boundary: samples each incoming 16-FSK symbol.
   */
  private startReceiving() {
    if (this.symbolTimer) clearInterval(this.symbolTimer);

    this.receptionStartTime = performance.now();
    this.receivedNibbles = [];
    this.totalExpectedSymbols = 0;

    this.setState('receiving', 'Sync Lock Acquired! Decoding symbols...');

    const symbolIntervalMs = (this.profile.symbolDuration + this.profile.guardDuration) * 1000;
    const initialDelayMs = 25;

    window.setTimeout(() => {
      this.sampleSymbol();
      this.symbolTimer = window.setInterval(() => {
        this.sampleSymbol();
      }, symbolIntervalMs);
    }, initialDelayMs);
  }

  private sampleSymbol() {
    if (!this.analyser || !this.toneBank || this.state !== 'receiving') return;

    this.analyser.getFloatTimeDomainData(this.sampleBuffer as unknown as Float32Array<ArrayBuffer>);
    const result = this.toneBank.sliceTone(this.sampleBuffer);

    this.receivedNibbles.push(result.bestToneIdx);

    // After receiving 28 nibbles (14 bytes = 2 header bytes + protected header), parse frame length
    if (this.receivedNibbles.length === 28 && this.totalExpectedSymbols === 0) {
      this.parseFrameLength();
    }

    // Telemetry update
    if (this.onTelemetry) {
      const percent =
        this.totalExpectedSymbols > 0
          ? Math.min(100, Math.round((this.receivedNibbles.length / this.totalExpectedSymbols) * 100))
          : Math.min(95, this.receivedNibbles.length * 2);

      this.onTelemetry({
        state: 'receiving',
        snrDb: Math.round(10 * Math.log10(Math.max(1, result.snrRatio))),
        dominantFreqHz: result.bestToneFreq,
        detectedSymbol: result.bestToneIdx,
        symbolsReceived: this.receivedNibbles.length,
        totalExpectedSymbols: this.totalExpectedSymbols,
        progressPercent: percent,
        statusMessage: `Receiving: ${this.receivedNibbles.length}/${this.totalExpectedSymbols || '?'} symbols`
      });
    }

    // Finished receiving all expected symbols
    if (this.totalExpectedSymbols > 0 && this.receivedNibbles.length >= this.totalExpectedSymbols) {
      this.finishReception();
    }
  }

  private parseFrameLength() {
    const b0 = (this.receivedNibbles[0] << 4) | this.receivedNibbles[1];
    const b1 = (this.receivedNibbles[2] << 4) | this.receivedNibbles[3];
    const protectedHeaderLen = (b0 << 8) | b1;

    // From protectedHeader, calculate expected payload symbols
    if (protectedHeaderLen > 0 && protectedHeaderLen < 512) {
      // Estimate minimum packet length based on header
      this.totalExpectedSymbols = (2 + protectedHeaderLen + 32) * 2;
    }
  }

  private finishReception() {
    if (this.symbolTimer) {
      clearInterval(this.symbolTimer);
      this.symbolTimer = null;
    }

    this.setState('validating', 'Applying Reed-Solomon FEC & CRC-32 Validation...');

    // Convert all nibbles to bytes
    const receivedBytes = new Uint8Array(Math.floor(this.receivedNibbles.length / 2));
    for (let i = 0; i < receivedBytes.length; i++) {
      receivedBytes[i] = (this.receivedNibbles[i * 2] << 4) | this.receivedNibbles[i * 2 + 1];
    }

    const duration = Math.round(performance.now() - this.receptionStartTime);

    try {
      const decoded = parsePacket(receivedBytes);
      decoded.transmissionDurationMs = duration;

      if (decoded.crcValid) {
        this.setState(
          'success',
          `Payload Verified! CRC: ${formatCRC32(decoded.crc32)} (RS: ${decoded.errorsCorrected} errors fixed)`
        );

        if (this.onPacketReceived) {
          this.onPacketReceived(decoded);
        }
      } else {
        this.setState('error', `CRC Checksum Mismatch: ${formatCRC32(decoded.crc32)}`);
        if (this.onError) {
          this.onError(`CRC Mismatch: ${formatCRC32(decoded.crc32)}`);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Packet decode failed';
      this.setState('error', msg);
      if (this.onError) this.onError(msg);
    }

    // After 4 seconds, reset to listening for the next transmission
    window.setTimeout(() => {
      this.resetToListening();
    }, 4000);
  }

  private resetToListening() {
    if (!this.isListening) return;
    this.syncStep = 0;
    this.receivedNibbles = [];
    this.totalExpectedSymbols = 0;
    this.setState('listening', 'Listening for ultrasonic preamble...');
  }

  /**
   * Stops the receiver, releases the microphone stream, and closes AudioContext.
   */
  public stop(): void {
    this.isListening = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.symbolTimer) {
      clearInterval(this.symbolTimer);
      this.symbolTimer = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
    this.setState('idle', 'Receiver idle');
  }
}

export const receiver = new AcousticReceiver();
