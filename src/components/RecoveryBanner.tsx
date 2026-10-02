import React from 'react';
import { History, X } from 'lucide-react';

interface RecoveryBannerProps {
  onRestore: () => void;
  onDiscard: () => void;
}

export const RecoveryBanner: React.FC<RecoveryBannerProps> = ({ onRestore, onDiscard }) => {
  return (
    <div className="bg-indigo-950/90 border-b border-indigo-700/60 px-4 py-2 text-xs text-indigo-200 flex items-center justify-between select-none z-30">
      <div className="flex items-center gap-2">
        <History className="w-4 h-4 text-indigo-400 shrink-0" />
        <span>Unsaved motion project found from your previous session. Would you like to restore it?</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onRestore}
          className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shadow"
        >
          Restore Session
        </button>
        <button
          onClick={onDiscard}
          className="px-2.5 py-1 rounded bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs transition-colors"
        >
          Discard
        </button>
      </div>
    </div>
  );
};
