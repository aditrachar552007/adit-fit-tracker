import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-16 md:bottom-5 left-4 right-4 md:right-auto md:left-6 z-50 flex items-center justify-between md:justify-start gap-2.5 px-3.5 py-2 rounded-2xl glass-panel border border-[#FFB020]/30 text-[#FFB020] text-xs font-semibold shadow-xl shadow-black/40 backdrop-blur-xl animate-fade-slide-up">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 text-[#FFB020] shrink-0" />
        <span>Offline Mode · Local health data safe</span>
      </div>
      <span className="w-2 h-2 rounded-full bg-[#FFB020] animate-pulse shrink-0" />
    </div>
  );
};
