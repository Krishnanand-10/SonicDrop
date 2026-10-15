# SonicDrop 🔊⚡

> **Air-Gapped Data Transfer Over Ultrasonic Audio**  
> Transfer files, text, and cryptographic keys between devices through near-inaudible sound waves using commodity laptop/phone speakers and microphones. **No Wi-Fi. No Bluetooth. No Internet. No Cables.**

---

## ⚡ The Premise

Place two laptops on a desk. Disconnect both from Wi-Fi. Turn off Bluetooth.  
Drop an encrypted key or text message on Laptop A and click **Transmit**.  
Within seconds, Laptop B's microphone captures the ultrasonic sound pulses, demodulates the signal in real-time, validates the CRC-32 checksum, and renders the message or file on screen.

---

## 🛰️ Architecture & Engineering

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SONICDROP PIPELINE                              │
├────────────────────────────────────────────────────────────────────────┤
│  Transmitter (Device A)                                                │
│  Payload ──► CRC-32 / FEC ──► 16-FSK Modulation ──► Hann Pulse Envelope │
│  ──► Web Audio Oscillator ──► Speaker (18.5 kHz – 20.0 kHz)            │
│                                │                                       │
│                         Acoustic Air-Gap                               │
│                                │                                       │
│  Receiver (Device B)           ▼                                       │
│  Microphone (Raw 48 kHz PCM) ──► Goertzel Tone Bank ──► Symbol Slicer  │
│  ──► Frame Parser ──► CRC-32 Verification ──► Payload Delivered!       │
└────────────────────────────────────────────────────────────────────────┘
```

### 1. Acoustic Physical Layer (PHY)
* **Frequency Range:** 18,500 Hz – 20,000 Hz (inaudible to human adults; well within 48 kHz Nyquist limit).
* **Modulation:** 16-FSK (Multi-Frequency Shift Keying) with 16 orthogonal carriers ($\Delta f = 93.75\text{ Hz}$).
* **Preamble:** Linear Frequency Modulated (LFM) chirp / dual-tone sync pattern for sub-millisecond clock synchronization.
* **Spectral Smoothing:** Hann window envelope on each audio symbol to eliminate audible clicks and spectral splatter.

### 2. Audio Processing & Demodulation
* **Web Audio API (`AudioContext` @ 48,000 Hz):** Zero hardware drivers required; runs in any modern browser.
* **Goertzel Filter Bank:** Monitors specific carrier frequencies with minimal CPU usage.
* **Raw PCM Input:** WebRTC audio pre-processing (`echoCancellation: false`, `noiseSuppression: false`) disabled to preserve high-frequency signals.

### 3. Interface & Visual Telemetry
* **WebGL Procedural Cloud Shader:** Dynamic volumetric clouds drifting in the background.
* **Framer Motion Animations:** Smooth spring physics, radar sweeps, and packet reception feedback.
* **Live Ultrasonic Waterfall Spectrogram:** 60 FPS HTML5 Canvas visualizer rendering the high-frequency spectrum.

---

## 🚀 Quickstart

```bash
# Clone the repository
git clone https://github.com/Krishnanand-10/SonicDrop.git
cd SonicDrop

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 🛡️ License

MIT License &copy; 2026 Krishnanand Tiwari
