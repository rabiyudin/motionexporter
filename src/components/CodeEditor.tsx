import React, { useRef, useState, useEffect } from 'react';
import { 
  Play, 
  Square, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  AlignLeft, 
  Code2, 
  Copy, 
  Check 
} from 'lucide-react';
import { ValidationResult } from '../types';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  onRun: () => void;
  onStop: () => void;
  onReset: () => void;
  onValidate: () => ValidationResult;
  isPlaying: boolean;
  validationError?: string | null;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  onRun,
  onStop,
  onReset,
  onValidate,
  isPlaying,
  validationError,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [validationToast, setValidationToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const lines = code.split('\n');
  const lineCount = Math.max(lines.length, 1);

  // Sync scrolling between line numbers and textarea
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Cursor position tracking
  const updateCursorPosition = () => {
    if (!textareaRef.current) return;
    const text = textareaRef.current.value;
    const selStart = textareaRef.current.selectionStart;
    const linesBefore = text.substring(0, selStart).split('\n');
    setCursorPos({
      line: linesBefore.length,
      col: linesBefore[linesBefore.length - 1].length + 1,
    });
  };

  // Handle Tab key insertion of 2 spaces
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;

      // Insert 2 spaces
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);

      // Set cursor position after re-render
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
        updateCursorPosition();
      }, 0);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleValidateClick = () => {
    const result = onValidate();
    if (result.isValid) {
      setValidationToast({
        message: 'Valid Canvas Code: draw(ctx, time, width, height) is ready.',
        type: 'success',
      });
    } else {
      setValidationToast({
        message: result.error || 'Validation error',
        type: 'error',
      });
    }
    setTimeout(() => setValidationToast(null), 4000);
  };

  const handleFormatCode = () => {
    try {
      // Basic aesthetic JS indentation formatting
      const lines = code.split('\n');
      let indentLevel = 0;
      const formatted = lines
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed) return '';

          // Decrease indent for closing braces
          if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
            indentLevel = Math.max(0, indentLevel - 1);
          }

          const indented = '  '.repeat(indentLevel) + trimmed;

          // Increase indent if opens brace
          const opens = (trimmed.match(/[{[(]/g) || []).length;
          const closes = (trimmed.match(/[}\])]/g) || []).length;
          indentLevel = Math.max(0, indentLevel + (opens - closes));

          return indented;
        })
        .join('\n');

      onChange(formatted);
      setValidationToast({ message: 'Code formatted successfully.', type: 'success' });
      setTimeout(() => setValidationToast(null), 2500);
    } catch {
      setValidationToast({ message: 'Failed to format code automatically.', type: 'error' });
      setTimeout(() => setValidationToast(null), 2500);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0e111a] border-r border-zinc-800/80 overflow-hidden">
      {/* Editor Toolbar */}
      <div className="h-11 border-b border-zinc-800/80 bg-[#121622] px-3 flex items-center justify-between gap-2 shrink-0 select-none">
        <div className="flex items-center gap-1.5">
          <Code2 className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Canvas 2D Editor
          </span>
        </div>

        <div className="flex items-center gap-1">
          {isPlaying ? (
            <button
              onClick={onStop}
              title="Stop Preview (Esc)"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              onClick={onRun}
              title="Run Animation (Ctrl+Enter)"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Run</span>
            </button>
          )}

          <button
            onClick={onReset}
            title="Reset Renderer"
            className="p-1.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleFormatCode}
            title="Format Code"
            className="p-1.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleValidateClick}
            title="Validate Code"
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-colors"
          >
            <CheckCircle2 className="w-3 h-3" />
            <span className="hidden sm:inline">Validate</span>
          </button>

          <button
            onClick={handleCopyCode}
            title="Copy Code"
            className="p-1.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Validation Toast / Notification */}
      {validationToast && (
        <div
          className={`px-3 py-1.5 text-xs border-b flex items-center justify-between shrink-0 ${
            validationToast.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            {validationToast.type === 'success' ? (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
            )}
            <span className="truncate">{validationToast.message}</span>
          </div>
          <button
            onClick={() => setValidationToast(null)}
            className="text-zinc-400 hover:text-zinc-200 ml-2 text-xs"
          >
            ×
          </button>
        </div>
      )}

      {/* Validation or Runtime Error Banner */}
      {validationError && (
        <div className="px-3 py-2 text-xs bg-rose-950/60 border-b border-rose-800/80 text-rose-200 flex items-start gap-2 shrink-0">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 break-words">
            <span className="font-semibold text-rose-300">Syntax / Structure Issue: </span>
            {validationError}
          </div>
        </div>
      )}

      {/* Code Textarea with Line Numbers */}
      <div className="flex-1 relative flex overflow-hidden font-mono text-[13px] leading-5">
        {/* Line Numbers Gutter */}
        <div
          ref={lineNumbersRef}
          aria-hidden="true"
          className="w-11 py-3 px-1.5 text-right select-none bg-[#090b11] text-zinc-600 border-r border-zinc-800/70 overflow-hidden shrink-0"
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div
              key={i + 1}
              className={`leading-5 text-[11px] ${
                cursorPos.line === i + 1 ? 'text-indigo-400 font-semibold' : ''
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          onKeyUp={updateCursorPosition}
          onClick={updateCursorPosition}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          placeholder="function draw(ctx, time, width, height) { ... }"
          className="flex-1 h-full py-3 px-3 bg-transparent text-zinc-200 placeholder-zinc-700 resize-none outline-none overflow-auto whitespace-pre font-mono selection:bg-indigo-600/30 selection:text-indigo-100"
        />
      </div>

      {/* Editor Footer Status Bar */}
      <div className="h-6 border-t border-zinc-800/80 bg-[#090b11] px-3 flex items-center justify-between text-[11px] text-zinc-500 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <span>JavaScript (ES6+)</span>
          <span>•</span>
          <span>Tab: 2 spaces</span>
        </div>
        <div className="flex items-center gap-3 font-mono">
          <span>
            Ln {cursorPos.line}, Col {cursorPos.col}
          </span>
          <span>{lines.length} lines</span>
        </div>
      </div>
    </div>
  );
};
