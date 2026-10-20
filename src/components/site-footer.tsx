/**
 * SonicDrop - Site Footer
 * Matches p2pcopy's clean developer footer with project links, author credit, and protocol specifications.
 */

import { Radio, ExternalLink } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:px-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-8 text-center sm:text-left">
          {/* Col 1: Author & Branding */}
          <div className="max-w-sm">
            <div className="flex items-center justify-center sm:justify-start gap-2.5 font-mono text-base font-bold text-white">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/20 border border-sky-400/30 text-sky-300">
                <Radio className="h-4 w-4" />
              </div>
              <span>
                SonicDrop<span className="text-sky-300">.Air</span>
              </span>
            </div>
            <p className="mt-3 text-sm text-white/70 leading-relaxed font-sans">
              Built by{' '}
              <a
                href="https://github.com/Krishnanand-10"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white underline underline-offset-4 decoration-white/30 hover:text-sky-300 hover:decoration-sky-300 transition-colors"
              >
                Krishnanand Tiwari
              </a>
              .
            </p>
          </div>

          {/* Col 2 & 3: Links and Protocol */}
          <div className="flex flex-wrap justify-center sm:justify-end gap-10 text-sm">
            <div>
              <p className="font-semibold text-white font-sans text-xs uppercase tracking-wider text-white/90">
                Navigation
              </p>
              <ul className="mt-3 space-y-2 text-white/60 font-sans">
                <li>
                  <a href="#dashboard-container" className="hover:text-white transition-colors">
                    Live Transceiver
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#architecture" className="hover:text-white transition-colors">
                    Acoustic PHY
                  </a>
                </li>
                <li>
                  <a href="#comparison" className="hover:text-white transition-colors">
                    Security Matrix
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/Krishnanand-10/SonicDrop.git"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    <span>GitHub Repo</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-white font-sans text-xs uppercase tracking-wider text-white/90">
                Protocol Specs
              </p>
              <ul className="mt-3 space-y-2 text-white/60 font-mono text-xs">
                <li>18.5 – 20.0 kHz Ultrasonic</li>
                <li>16-FSK Modulation</li>
                <li>Reed-Solomon RS(32, 24)</li>
                <li>IEEE 802.3 CRC-32</li>
                <li>WebAssembly (C++ ggwave)</li>
                <li>100% Offline PWA</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 text-xs text-white/40 flex flex-col sm:flex-row justify-between items-center gap-3 font-mono">
          <span>MIT License © 2026 Krishnanand Tiwari</span>
          <span>Zero RF Radiation · Physical Acoustic Air-Gap</span>
        </div>
      </div>
    </footer>
  );
}
