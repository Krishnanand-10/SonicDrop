/**
 * SonicDrop - Security & Protocol Comparison Matrix
 * Comparing Ultrasonic Air-Gap vs Bluetooth, Wi-Fi Direct, and AirDrop.
 */

import { Check, X } from 'lucide-react';

const comparisonRows = [
  {
    feature: 'RF Signature / Electromagnetic Emission',
    sonicdrop: '0 dBm (Zero RF / Silent Sound)',
    bluetooth: '10 – 20 dBm (RF Traceable)',
    wifi: '20 – 30 dBm (High RF)',
    airdrop: '10 – 25 dBm (Bluetooth + Wi-Fi)',
  },
  {
    feature: 'Pre-Pairing / PIN Handshake Required',
    sonicdrop: 'None (Instant Acoustic Drop)',
    bluetooth: 'Required (PIN / Passkey)',
    wifi: 'Required (SSID / WPA Handshake)',
    airdrop: 'Required (Contacts / Apple ID)',
  },
  {
    feature: 'Immunity to RF Sniffers & Deauth Attacks',
    sonicdrop: true,
    bluetooth: false,
    wifi: false,
    airdrop: false,
  },
  {
    feature: 'True Air-Gap Compliance (SCIF / Defense)',
    sonicdrop: true,
    bluetooth: false,
    wifi: false,
    airdrop: false,
  },
  {
    feature: 'Hardware Drivers & Dongles Required',
    sonicdrop: 'None (Runs in Web Browser)',
    bluetooth: 'Requires BT Hardware Stack',
    wifi: 'Requires 802.11 NIC',
    airdrop: 'Apple Proprietary Hardware Only',
  },
  {
    feature: 'Works 100% Offline (Airplane Mode Active)',
    sonicdrop: true,
    bluetooth: false,
    wifi: false,
    airdrop: false,
  },
];

export function ComparisonMatrix() {
  return (
    <section id="comparison" className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16 sm:py-24 select-none">
      {/* Section Header identical to Hero section */}
      <div className="relative text-center max-w-4xl mx-auto mb-12 sm:mb-16 select-none">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(10,30,60,0.45)_0%,transparent_75%)] blur-2xl pointer-events-none" />

        <h2 className="text-4xl font-bold tracking-tight text-white drop-shadow-md md:text-5xl lg:text-6xl font-sans">
          Why Acoustic Air-Gap Over Radio?
        </h2>

        <p className="mt-5 max-w-2xl mx-auto text-base text-white [text-shadow:0_1px_12px_rgba(10,30,60,0.35)] md:text-lg font-sans leading-relaxed">
          Radio protocols broadcast electromagnetic signals through walls and floors.
          Physical sound waves are confined to the room and emit zero radio frequencies.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-slate-950/60 font-mono text-xs">
                <th className="py-4 px-6 text-white font-medium tracking-wider">PROTOCOL CAPABILITY</th>
                <th className="py-4 px-6 text-sky-300 font-bold bg-sky-500/10 border-x border-sky-400/20">
                  SONICDROP (ULTRASONIC)
                </th>
                <th className="py-4 px-6 text-white/90 font-medium tracking-wider">BLUETOOTH 5.x</th>
                <th className="py-4 px-6 text-white/90 font-medium tracking-wider">WI-FI DIRECT</th>
                <th className="py-4 px-6 text-white/90 font-medium tracking-wider">APPLE AIRDROP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {comparisonRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.07] hover:shadow-sm transition-all duration-150">
                  <td className="py-4 px-6 font-medium text-white/90">{row.feature}</td>

                  {/* SonicDrop Column */}
                  <td className="py-4 px-6 font-semibold bg-sky-500/5 border-x border-sky-400/20 text-sky-200">
                    {typeof row.sonicdrop === 'boolean' ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 font-mono text-xs font-semibold">
                        <Check className="h-4 w-4" /> YES (100%)
                      </span>
                    ) : (
                      <span className="font-mono text-xs">{row.sonicdrop}</span>
                    )}
                  </td>

                  {/* Bluetooth Column */}
                  <td className="py-4 px-6 text-white/90">
                    {typeof row.bluetooth === 'boolean' ? (
                      <span className="inline-flex items-center gap-1.5 text-red-400 font-mono text-xs font-semibold">
                        <X className="h-4 w-4" /> NO
                      </span>
                    ) : (
                      <span className="font-mono text-xs">{row.bluetooth}</span>
                    )}
                  </td>

                  {/* Wi-Fi Column */}
                  <td className="py-4 px-6 text-white/90">
                    {typeof row.wifi === 'boolean' ? (
                      <span className="inline-flex items-center gap-1.5 text-red-400 font-mono text-xs font-semibold">
                        <X className="h-4 w-4" /> NO
                      </span>
                    ) : (
                      <span className="font-mono text-xs">{row.wifi}</span>
                    )}
                  </td>

                  {/* AirDrop Column */}
                  <td className="py-4 px-6 text-white/90">
                    {typeof row.airdrop === 'boolean' ? (
                      <span className="inline-flex items-center gap-1.5 text-red-400 font-mono text-xs font-semibold">
                        <X className="h-4 w-4" /> NO
                      </span>
                    ) : (
                      <span className="font-mono text-xs">{row.airdrop}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
