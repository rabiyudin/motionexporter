import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + Enter / ⌘ + Enter', action: 'Run animation preview from code editor' },
    { key: 'Ctrl + Shift + Enter / ⌘ + ⇧ + Enter', action: 'Open video render & export dialog' },
    { key: 'Ctrl + S / ⌘ + S', action: 'Save current project as JSON' },
    { key: 'Space', action: 'Toggle Play / Pause (when outside text editor)' },
    { key: 'Tab', action: 'Indent code with 2 spaces in editor' },
    { key: 'Escape', action: 'Stop playback or close open modal' },
    { key: 'Drag & Drop .json file', action: 'Load saved project file anywhere on workspace' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#121622] border border-zinc-700/80 rounded-xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Keyboard Shortcuts</h3>
              <p className="text-xs text-zinc-400">Boost your motion production workflow speed</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {shortcuts.map((sc, i) => (
            <div key={i} className="flex items-center justify-between gap-4 text-xs">
              <span className="text-zinc-300">{sc.action}</span>
              <kbd className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-indigo-300 font-mono text-[11px] whitespace-nowrap shadow-sm">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="p-4 bg-[#0e111a] border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
