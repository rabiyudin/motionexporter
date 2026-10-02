import React, { useState } from 'react';
import { Sparkles, X, Play, Clock, Eye, Layers } from 'lucide-react';
import { ANIMATION_EXAMPLES } from '../constants/examples';
import { AnimationExample } from '../types';

interface ExampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExample: (example: AnimationExample, runImmediately: boolean) => void;
}

export const ExampleModal: React.FC<ExampleModalProps> = ({
  isOpen,
  onClose,
  onSelectExample,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', ...Array.from(new Set(ANIMATION_EXAMPLES.map((e) => e.category)))];

  const filteredExamples = selectedCategory === 'All'
    ? ANIMATION_EXAMPLES
    : ANIMATION_EXAMPLES.filter((e) => e.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#121622] border border-zinc-700/80 rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Animation Example Library
              </h3>
              <p className="text-xs text-zinc-400">
                Choose a pre-built Canvas 2D motion pattern optimized for microstock loops
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filter */}
        <div className="px-5 py-2.5 bg-[#0e111a] border-b border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded text-xs transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Example Grid */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredExamples.map((example) => (
            <div
              key={example.id}
              className="p-4 rounded-lg bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 hover:border-indigo-500/50 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-indigo-300 transition-colors">
                    {example.title}
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-medium">
                    {example.category}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                  {example.description}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{example.suggestedDuration}s</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    <span>{example.suggestedFps} fps</span>
                  </div>
                  <div className="flex items-center gap-1 capitalize">
                    <span>Bg: {example.suggestedBackground}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/80">
                <button
                  onClick={() => onSelectExample(example, false)}
                  className="px-3 py-1.5 rounded text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Load Code</span>
                </button>

                <button
                  onClick={() => onSelectExample(example, true)}
                  className="px-3 py-1.5 rounded text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center gap-1.5 shadow"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Load & Run</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
