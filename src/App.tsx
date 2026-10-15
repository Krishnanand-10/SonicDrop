import { useState } from 'react'
import { motion } from 'framer-motion'
import { Radio, WifiOff, ShieldCheck, Sparkles } from 'lucide-react'
import { CloudShader } from '@/components/ui/cloud-shader'

export function App() {
  const [activeTab, setActiveTab] = useState<'tx' | 'rx'>('tx')

  return (
    <div className="relative min-h-screen w-full overflow-hidden text-slate-100 flex flex-col font-sans">
      {/* Background Volumetric Cloud Shader */}
      <CloudShader
        className="absolute inset-0 -z-10"
        speed={0.7}
        count={5}
        skyTopColor="#030712"
        skyBottomColor="#0f172a"
        cloudColor="#1e293b"
      />

      {/* Top Navigation */}
      <header className="relative z-20 w-full border-b border-white/10 bg-slate-950/40 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 text-slate-950 shadow-lg shadow-cyan-500/20">
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
                SonicDrop
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                v1.0.0
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Air-Gapped Ultrasonic Acoustic Data Link</p>
          </div>
        </div>

        {/* Air-Gap Verification Badge */}
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/30 px-3.5 py-1.5 backdrop-blur-sm">
          <WifiOff className="h-4 w-4 text-emerald-400 animate-pulse" />
          <span className="font-mono text-xs font-medium text-emerald-300">
            AIR-GAP PROTOCOL READY
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 max-w-5xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Near-Inaudible 18.5 kHz – 20.0 kHz Acoustic Modem</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
            Transmit Data Through <br />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Near-Silent Ultrasonic Sound
            </span>
          </h1>
          <p className="mt-3 text-slate-300 max-w-xl mx-auto text-sm md:text-base">
            No Wi-Fi. No Bluetooth. No Cables. Transfer cryptographic keys, files, and text across air-gapped devices using physical speakers and microphones.
          </p>
        </motion.div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl mb-6">
          <button
            onClick={() => setActiveTab('tx')}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'tx'
                ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950 shadow-md shadow-cyan-500/30 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Radio className="h-4 w-4" />
            Transmitter Mode (Device A)
          </button>
          <button
            onClick={() => setActiveTab('rx')}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'rx'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/30 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            Receiver Mode (Device B)
          </button>
        </div>

        {/* Transceiver Card Preview */}
        <motion.div
          layout
          className="w-full max-w-2xl rounded-3xl border border-white/15 bg-slate-900/50 p-8 shadow-2xl backdrop-blur-2xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-mono text-sm text-cyan-300 font-medium">
                {activeTab === 'tx' ? 'TX CARRIER: 18,500 Hz – 20,000 Hz' : 'RX LISTENER: 48,000 Hz PCM'}
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">16-FSK MODEM</span>
          </div>

          <div className="text-center py-8">
            <p className="text-slate-300 text-sm">
              Scaffolding complete. Ready to connect Web Audio DSP engine and Live Waterfall Spectrogram.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default App
