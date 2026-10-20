# SonicDrop 🔊⚡

> **Air-Gapped Data Transfer Over Ultrasonic Audio**  
> Transfer files, text, and cryptographic keys between devices through near-inaudible sound waves using commodity laptop/phone speakers and microphones. **No Wi-Fi. No Bluetooth. No Internet. No Cables.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-sonic--drop.vercel.app-0284c7?style=for-the-badge&logo=vercel)](https://sonic-drop.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=for-the-badge)](LICENSE)
[![Engine: WebAssembly](https://img.shields.io/badge/Engine-C++_WASM_(ggwave)-purple?style=for-the-badge&logo=webassembly)](https://github.com/ggerganov/ggwave)
[![PWA Ready](https://img.shields.io/badge/PWA-100%25_Offline-teal?style=for-the-badge)](https://sonic-drop.vercel.app)

---

## 🌐 Live Application

* **Main Landing Page & Simulation:** [https://sonic-drop.vercel.app](https://sonic-drop.vercel.app)
* **Live Engine Workstation:** [https://sonic-drop.vercel.app/app](https://sonic-drop.vercel.app/app)

---

## ⚡ The Premise

Place two devices on a desk. Sever both from Wi-Fi, cellular, and Bluetooth (Airplane Mode active).  
Enter text or select a cryptographic payload (SSH Key, BIP-39 Seed Phrase, or TOTP token) on the **Transmitter** and click **Emit Ultrasonic Payload**.  

Within seconds, the **Receiver** device's microphone captures the ultrasonic sound pulses through ambient air at 343 m/s, demodulates the signal in real time using WebAssembly, validates the IEEE CRC-32 checksum, corrects symbol errors via Reed-Solomon FEC, renders the verified payload on screen, and **automatically shuts off the microphone** to conserve power and protect privacy.

---

## 🛰️ Architecture & Engineering Pipeline

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SONICDROP PIPELINE                              │
├────────────────────────────────────────────────────────────────────────┤
│  Transmitter                                                           │
│  Payload ──► IEEE CRC-32 ──► Reed-Solomon RS(32, 24) FEC               │
│  ──► 16-FSK WASM Modulation ──► Soft Taper Envelope (15ms Ramp)        │
│  ──► Web Audio API ──► Speaker Transducer (18.5 kHz – 20.0 kHz)        │
│                                │                                       │
│                         Acoustic Air-Gap (~343 m/s, 0 dBm RF)          │
│                                │                                       │
│  Receiver                      ▼                                       │
│  Microphone (Raw 48 kHz PCM) ──► Goertzel / FFT Bandpass Filter        │
│  ──► Sample-Clock Recovery ──► Galois Field Error Correction           │
│  ──► CRC-32 Validation ──► Payload Delivered ──► Auto-Stop Mic         │
└────────────────────────────────────────────────────────────────────────┘
```

### 1. Acoustic Physical Layer (PHY)
* **Carrier Band:** 18,500 Hz – 20,000 Hz near-inaudible ultrasonic band (well above speech/music frequencies, safely within standard 48 kHz Nyquist sampling limits).
* **Modulation:** 16-FSK (Multi-Frequency Shift Keying) across 16 orthogonal ultrasonic bins.
* **Dual-Tone Sync Preamble:** Linear Frequency Modulated (LFM) chirp pattern for sub-millisecond clock synchronization.
* **Soft Taper Envelope:** 15ms linear gain ramp-up and ramp-down to eliminate mechanical speaker cone clicks and abrupt transients.

### 2. Error Correction & Data Integrity
* **Reed-Solomon RS(32, 24) FEC:** Adds 8 Galois Field $GF(256)$ parity bytes per 24 data bytes, automatically correcting multi-symbol acoustic dropouts and ambient room echo.
* **IEEE 802.3 CRC-32 Checksum:** Hardware-grade cyclic redundancy checksum appended to every packet to guarantee bit-identical verification.

### 3. Smart Privacy & Power Management
* **Receiver Auto-Stop:** Immediately releases the hardware microphone stream (`MediaStreamTrack.stop()`) as soon as a packet is verified, removing the browser recording indicator and saving CPU and battery.
* **Single-Click Re-Arm:** Tap *"Listen for Next Message"* to re-open the receiver when ready.

### 4. Zero-Trust PWA & SCIF Compliance
* **Service Worker Caching:** Installs as an offline standalone Progressive Web App (PWA). Functions with Wi-Fi, Bluetooth, cellular, and USB connections completely severed.
* **Zero RF Signature:** 0 dBm electromagnetic radiation. Cannot be intercepted by radio frequency sniffers or Wi-Fi deauth attacks.

---

## 📊 Protocol Comparison

| Security Capability | SonicDrop (Ultrasonic) | Bluetooth 5.x | Wi-Fi Direct | Apple AirDrop |
| :--- | :---: | :---: | :---: | :---: |
| **RF Signature / Radiation** | **0 dBm (Zero RF)** | 10 – 20 dBm | 20 – 30 dBm | 10 – 25 dBm |
| **Pre-Pairing / PIN Handshake** | **None (Instant)** | Required | Required | Required |
| **RF Sniffer / Deauth Immunity** | **100% Immune** | Vulnerable | Vulnerable | Vulnerable |
| **True Air-Gap (SCIF / Defense)** | **Compliant** | Banned | Banned | Banned |
| **External Drivers Required** | **None (Browser)** | Hardware Stack | 802.11 NIC | Proprietary HW |
| **100% Offline (Airplane Mode)** | **Yes** | No | No | No |

---

## 🚀 Quickstart & Local Development

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or later)
* npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/Krishnanand-10/SonicDrop.git
cd SonicDrop

# Install dependencies
npm install

# Start local development server (HTTPS enabled for cross-device microphone testing)
npm run dev

# Run unit test suite (Acoustic packet parsing, Reed-Solomon FEC, ggwave WASM)
npx vitest run

# Run linter
npm run lint

# Build for production
npm run build
```

---

## 📱 Mobile Device Testing

1. Open **[https://sonic-drop.vercel.app/app](https://sonic-drop.vercel.app/app)** on two devices (e.g. laptop & smartphone).
2. Set **Device 1** to **Receiver** and tap **"Listen on Mic"** (allow microphone permissions).
3. Set **Device 2** to **Transmitter**, choose a sample payload or type text, set media volume to ~70%, and click **"Emit Ultrasonic Payload"**.
4. The data travels through the air via ultrasonic sound waves and decodes automatically on Device 1.

> [!TIP]
> On iPhone/iOS, make sure the physical **Ring/Silent switch** is set to Ring or media volume is enabled in Control Center to allow Web Audio playback.

---

## 🛡️ License

MIT License &copy; 2026 [Krishnanand Tiwari](https://github.com/Krishnanand-10)
