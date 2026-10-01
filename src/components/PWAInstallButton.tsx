import React, { useState } from 'react';
import { Download, Share2, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl glass-capsule hover:bg-white/[0.10] text-[#00D9B5] text-xs font-semibold border border-[#00D9B5]/30 active:scale-95 transition-all shadow-sm"
        title="Install Adit Fit Tracker on this device"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSModal(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl glass-capsule hover:bg-white/[0.10] text-[#9AA8BC] hover:text-[#F5F7FA] text-xs font-semibold active:scale-95 transition-all shadow-sm"
          title="Install on iOS"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#00D9B5]" />
          <span className="hidden sm:inline">Install</span>
        </button>

        {showIOSModal && (
          <div className="fixed inset-0 bg-[#050B18]/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <div className="glass-panel border border-white/[0.12] rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#00D9B5]" />
                  <h3 className="font-bold text-[#F5F7FA] text-base">Install on iPhone / iPad</h3>
                </div>
                <button onClick={() => setShowIOSModal(false)} className="text-[#9AA8BC] hover:text-[#F5F7FA] p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-[#9AA8BC] leading-relaxed">
                <p className="flex items-start gap-2">
                  <span className="font-bold text-[#F5F7FA]">1.</span>
                  <span>Tap the <Share2 className="w-3.5 h-3.5 inline text-[#00D9B5]" /> <strong>Share</strong> button in Safari's bottom toolbar.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-bold text-[#F5F7FA]">2.</span>
                  <span>Scroll down and select <strong>Add to Home Screen</strong>.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-bold text-[#F5F7FA]">3.</span>
                  <span>Tap <strong>Add</strong> in the top right to launch Adit Fit as a standalone app!</span>
                </p>
              </div>

              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00D9B5] to-[#00C8FF] text-[#050B18] font-bold text-xs shadow-md active:scale-95 transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
