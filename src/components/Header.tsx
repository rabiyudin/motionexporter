import React, { useRef } from 'react';
import { 
  Play, 
  Film, 
  Plus, 
  FolderOpen, 
  Download, 
  Upload, 
  Keyboard, 
  Sparkles 
} from 'lucide-react';
import { ProjectData } from '../types';

interface HeaderProps {
  status: 'ready' | 'playing' | 'paused' | 'rendering' | 'error';
  onNew: () => void;
  onOpenExamples: () => void;
  onSaveProject: () => void;
  onLoadProject: (project: ProjectData) => void;
  onOpenShortcuts: () => void;
  onStartExport: () => void;
  isExporting: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  onNew,
  onOpenExamples,
  onSaveProject,
  onLoadProject,
  onOpenShortcuts,
  onStartExport,
  isExporting,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json && typeof json.code === 'string') {
          onLoadProject(json);
        } else {
          alert('Invalid project file: Missing code definition.');
        }
      } catch {
        alert('Failed to parse project JSON file.');
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'playing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Playing
          </span>
        );
      case 'rendering':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
            Rendering Frame
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Paused
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Code Error
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            Ready
          </span>
        );
    }
  };

  return (
    <header className="h-14 border-b border-zinc-800/80 bg-[#0d1017]/90 backdrop-blur-md px-4 flex items-center justify-between select-none z-20">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-600/20 ring-1 ring-white/10">
          <Film className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold tracking-wide text-zinc-100 uppercase">
              Microstock Motion Exporter
            </h1>
            {getStatusBadge()}
          </div>
          <p className="text-[11px] text-zinc-400 font-normal hidden sm:block">
            Turn Canvas Motion Code into Microstock-Ready Video Assets
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={onNew}
          title="New Canvas Project"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden md:inline">New</span>
        </button>

        <button
          onClick={onOpenExamples}
          title="Load Animation Example"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Examples</span>
        </button>

        <button
          onClick={onSaveProject}
          title="Save Project (Ctrl+S)"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden md:inline">Save</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          title="Load Project (.json)"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 transition-colors"
        >
          <Upload className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden md:inline">Load</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          onClick={onOpenShortcuts}
          title="Keyboard Shortcuts"
          className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 transition-colors"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-zinc-800 mx-1" />

        <button
          onClick={onStartExport}
          disabled={isExporting}
          title="Render & Export Video Asset (Ctrl+Shift+Enter)"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.98] shadow-md shadow-indigo-600/25 border border-indigo-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Film className="w-3.5 h-3.5 text-cyan-300" />
          <span>Export Video</span>
        </button>
      </div>
    </header>
  );
};
