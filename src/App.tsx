import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  CodeEditor 
} from './components/CodeEditor';
import { 
  CanvasPreview 
} from './components/CanvasPreview';
import { 
  ExportPanel 
} from './components/ExportPanel';
import { 
  RenderModal 
} from './components/RenderModal';
import { 
  ExampleModal 
} from './components/ExampleModal';
import { 
  ShortcutsModal 
} from './components/ShortcutsModal';
import { 
  RecoveryBanner 
} from './components/RecoveryBanner';
import { 
  ExportSettings, 
  MicrostockMetadata, 
  ProjectData, 
  RenderProgress, 
  AnimationExample 
} from './types';
import { 
  ANIMATION_EXAMPLES 
} from './constants/examples';
import { 
  compileSandboxedCode, 
  validateCode, 
  CompiledDrawFunction 
} from './services/codeValidator';
import { 
  renderVideoDeterministic, 
  generateStockFilename, 
  getSupportedVideoMimeType,
  ExportController 
} from './services/videoExporter';
import { 
  generateMicrostockMetadata, 
  downloadFile 
} from './services/metadataGenerator';
import { 
  Code2, 
  Play, 
  Sliders, 
  UploadCloud 
} from 'lucide-react';

const STORAGE_KEY = 'microstock_motion_exporter_session';

const DEFAULT_SETTINGS: ExportSettings = {
  presetKey: 'landscape_hd',
  width: 1920,
  height: 1080,
  fps: 30,
  duration: 3,
  loop: true,
  backgroundMode: 'transparent',
  backgroundColor: '#111422',
  previewQuality: 'balanced',
  platformPreset: 'shutterstock',
};

const DEFAULT_METADATA: MicrostockMetadata = generateMicrostockMetadata(
  'Magic Wand and Floating Papers',
  'Abstract',
  'Violet',
  'Seamless Loop',
  'Fantasy & Magic'
);

export default function App() {
  // Primary application state
  const [code, setCode] = useState<string>(ANIMATION_EXAMPLES[0].code);
  const [settings, setSettings] = useState<ExportSettings>(DEFAULT_SETTINGS);
  const [metadata, setMetadata] = useState<MicrostockMetadata>(DEFAULT_METADATA);
  const [compiledDrawFn, setCompiledDrawFn] = useState<CompiledDrawFunction | null>(null);

  // Status & Error states
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [hasSavedSession, setHasSavedSession] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Modals
  const [isExampleModalOpen, setIsExampleModalOpen] = useState<boolean>(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false);
  const [isRenderModalOpen, setIsRenderModalOpen] = useState<boolean>(false);

  // Export render state
  const [renderProgress, setRenderProgress] = useState<RenderProgress>({
    status: 'idle',
    currentFrame: 0,
    totalFrames: 0,
    percent: 0,
    elapsedSeconds: 0,
    estimatedRemainingSeconds: 0,
  });
  const exportControllerRef = useRef<ExportController | null>(null);

  // Responsive mobile tab
  const [mobileTab, setMobileTab] = useState<'code' | 'preview' | 'export'>('preview');

  // Initial code compilation & session check
  useEffect(() => {
    // Check if previous session exists in localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.code && parsed.code !== ANIMATION_EXAMPLES[0].code) {
          setHasSavedSession(true);
        }
      }
    } catch {
      // Ignore storage errors
    }

    // Compile default sample code
    const result = compileSandboxedCode(ANIMATION_EXAMPLES[0].code);
    if (result.isValid && result.drawFn) {
      setCompiledDrawFn(() => result.drawFn);
      setValidationError(null);
    } else {
      setValidationError(result.error || 'Syntax error in code');
    }
  }, []);

  // Debounced auto-save to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const sessionPayload: ProjectData = {
          name: metadata.subject || 'Motion Project',
          code,
          width: settings.width,
          height: settings.height,
          fps: settings.fps,
          duration: settings.duration,
          background: settings.backgroundMode,
          backgroundColor: settings.backgroundColor,
          metadata,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionPayload));
      } catch {
        // Ignore quota errors
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [code, settings, metadata]);

  // Compile and run code
  const handleRunCode = useCallback(() => {
    setRuntimeError(null);
    const result = compileSandboxedCode(code);
    if (result.isValid && result.drawFn) {
      setCompiledDrawFn(() => result.drawFn);
      setValidationError(null);
      setIsPlaying(true);
    } else {
      setValidationError(result.error || 'Validation error');
      setIsPlaying(false);
    }
  }, [code]);

  // Code validation handler
  const handleValidateCode = useCallback(() => {
    const result = validateCode(code);
    if (!result.isValid) {
      setValidationError(result.error || 'Invalid code');
    } else {
      setValidationError(null);
    }
    return result;
  }, [code]);

  // Stop playback
  const handleStopPlayback = useCallback(() => {
    setIsPlaying(false);
  }, []);

  // Reset renderer & clear runtime exceptions
  const handleResetRenderer = useCallback(() => {
    setRuntimeError(null);
    handleRunCode();
  }, [handleRunCode]);

  // Runtime error callback from CanvasPreview
  const handleRuntimeError = useCallback((error: Error) => {
    setIsPlaying(false);
    setRuntimeError(error.message || 'Animation runtime error occurred.');
  }, []);

  // Load new template
  const handleNewProject = () => {
    const templateCode = `function draw(ctx, time, width, height) {
    const scale = Math.min(width, height) / 500;
    const cx = width / 2;
    const cy = height / 2;

    ctx.clearRect(0, 0, width, height);

    // time is in SECONDS
    const float = Math.sin(time * 2) * 20 * scale;

    ctx.fillStyle = '#7457FF';
    ctx.beginPath();
    ctx.arc(cx, cy + float, 80 * scale, 0, Math.PI * 2);
    ctx.fill();
}`;
    setCode(templateCode);
    const result = compileSandboxedCode(templateCode);
    if (result.isValid && result.drawFn) {
      setCompiledDrawFn(() => result.drawFn);
      setValidationError(null);
      setRuntimeError(null);
      setIsPlaying(true);
    }
  };

  // Load built-in example
  const handleSelectExample = (example: AnimationExample, runImmediately: boolean) => {
    setCode(example.code);
    setSettings((prev) => ({
      ...prev,
      duration: example.suggestedDuration,
      fps: example.suggestedFps,
      backgroundMode: example.suggestedBackground,
      backgroundColor: example.suggestedBgColor || prev.backgroundColor,
    }));

    const result = compileSandboxedCode(example.code);
    if (result.isValid && result.drawFn) {
      setCompiledDrawFn(() => result.drawFn);
      setValidationError(null);
      setRuntimeError(null);
      setIsPlaying(runImmediately);
    } else {
      setValidationError(result.error || 'Syntax error');
    }

    // Auto generate metadata based on example
    const meta = generateMicrostockMetadata(
      example.title,
      example.category.includes('Minimal') ? 'Minimalist' : 'Abstract',
      'Violet',
      'Seamless Loop',
      'Creative'
    );
    setMetadata(meta);

    setIsExampleModalOpen(false);
  };

  // Save project as JSON
  const handleSaveProject = () => {
    const project: ProjectData = {
      name: metadata.subject || 'motion-asset',
      code,
      width: settings.width,
      height: settings.height,
      fps: settings.fps,
      duration: settings.duration,
      background: settings.backgroundMode,
      backgroundColor: settings.backgroundColor,
      metadata,
      createdAt: new Date().toISOString(),
    };

    const filename = `${metadata.subject || 'motion-project'}.json`;
    downloadFile(JSON.stringify(project, null, 2), filename, 'application/json');
  };

  // Load project from parsed JSON
  const handleLoadProject = (project: ProjectData) => {
    if (project.code) {
      setCode(project.code);
      setSettings((prev) => ({
        ...prev,
        width: project.width || prev.width,
        height: project.height || prev.height,
        fps: project.fps || prev.fps,
        duration: project.duration || prev.duration,
        backgroundMode: project.background || prev.backgroundMode,
        backgroundColor: project.backgroundColor || prev.backgroundColor,
      }));

      if (project.metadata) {
        setMetadata(project.metadata);
      }

      const result = compileSandboxedCode(project.code);
      if (result.isValid && result.drawFn) {
        setCompiledDrawFn(() => result.drawFn);
        setValidationError(null);
        setRuntimeError(null);
        setIsPlaying(true);
      } else {
        setValidationError(result.error || 'Invalid code structure');
      }
    }
  };

  // Restore session from localStorage
  const handleRestoreSession = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        handleLoadProject(parsed);
      }
    } catch {
      // Ignore
    }
    setHasSavedSession(false);
  };

  const handleDiscardSession = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
    setHasSavedSession(false);
  };

  // Start Video Render & Export
  const handleStartExport = () => {
    // Validate first
    const compResult = compileSandboxedCode(code);
    if (!compResult.isValid || !compResult.drawFn) {
      setValidationError(compResult.error || 'Cannot export invalid code.');
      alert(`Export Aborted: ${compResult.error || 'Invalid animation code.'}`);
      return;
    }

    // Stop live preview to free up canvas and CPU
    setIsPlaying(false);

    const codecInfo = getSupportedVideoMimeType();
    const filename = generateStockFilename(
      metadata.subject,
      metadata.style,
      metadata.motion,
      settings.width,
      settings.height,
      settings.fps,
      codecInfo.extension
    );

    setIsRenderModalOpen(true);

    const controller = renderVideoDeterministic(
      compResult.drawFn,
      settings,
      filename,
      (progress) => {
        setRenderProgress(progress);
      }
    );

    exportControllerRef.current = controller;
  };

  const handleCancelExport = () => {
    if (exportControllerRef.current) {
      exportControllerRef.current.cancel();
      exportControllerRef.current = null;
    }
    setRenderProgress({
      status: 'idle',
      currentFrame: 0,
      totalFrames: 0,
      percent: 0,
      elapsedSeconds: 0,
      estimatedRemainingSeconds: 0,
    });
    setIsRenderModalOpen(false);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing inside an input or select
      const activeEl = document.activeElement;
      const isInput = activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'SELECT';
      const isTextarea = activeEl?.tagName === 'TEXTAREA';

      // Ctrl + Shift + Enter -> Export
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        handleStartExport();
        return;
      }

      // Ctrl + Enter -> Run
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
        return;
      }

      // Ctrl + S -> Save Project
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveProject();
        return;
      }

      // Escape -> Close modal or stop preview
      if (e.key === 'Escape') {
        if (isRenderModalOpen) {
          handleCancelExport();
        } else if (isExampleModalOpen) {
          setIsExampleModalOpen(false);
        } else if (isShortcutsModalOpen) {
          setIsShortcutsModalOpen(false);
        } else {
          setIsPlaying(false);
        }
        return;
      }

      // Space -> Toggle Play / Pause (only if not focused on textarea or input)
      if (e.key === ' ' && !isInput && !isTextarea) {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRunCode, handleStartExport, isRenderModalOpen, isExampleModalOpen, isShortcutsModalOpen]);

  // Window drag & drop for .json project files
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsDragOver(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      if (e.clientX <= 0 || e.clientY <= 0) {
        setIsDragOver(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer?.files?.[0];
      if (file && (file.type === 'application/json' || file.name.endsWith('.json'))) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const json = JSON.parse(event.target?.result as string);
            if (json && typeof json.code === 'string') {
              handleLoadProject(json);
            } else {
              alert('Dropped file does not contain a valid project schema.');
            }
          } catch {
            alert('Failed to parse dropped JSON project file.');
          }
        };
        reader.readAsText(file);
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  const overallStatus = isRenderModalOpen && renderProgress.status === 'rendering'
    ? 'rendering'
    : runtimeError || validationError
    ? 'error'
    : isPlaying
    ? 'playing'
    : 'paused';

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0b0d13] text-zinc-100 overflow-hidden font-sans">
      {/* Recovery Banner */}
      {hasSavedSession && (
        <RecoveryBanner
          onRestore={handleRestoreSession}
          onDiscard={handleDiscardSession}
        />
      )}

      {/* Main Studio Header */}
      <Header
        status={overallStatus}
        onNew={handleNewProject}
        onOpenExamples={() => setIsExampleModalOpen(true)}
        onSaveProject={handleSaveProject}
        onLoadProject={handleLoadProject}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        onStartExport={handleStartExport}
        isExporting={renderProgress.status === 'rendering'}
      />

      {/* Drag & Drop Visual Indicator */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 bg-indigo-950/80 backdrop-blur-md border-4 border-dashed border-indigo-400 flex flex-col items-center justify-center p-8 pointer-events-none select-none">
          <UploadCloud className="w-16 h-16 text-indigo-300 animate-bounce mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Drop Project JSON to Load</h2>
          <p className="text-sm text-indigo-200">Release file anywhere to import animation code and settings</p>
        </div>
      )}

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex items-center justify-around border-b border-zinc-800 bg-[#121622] text-xs font-medium py-1.5 shrink-0 select-none">
        <button
          onClick={() => setMobileTab('code')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
            mobileTab === 'code' ? 'bg-indigo-600 text-white' : 'text-zinc-400'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Editor</span>
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
            mobileTab === 'preview' ? 'bg-indigo-600 text-white' : 'text-zinc-400'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>Preview</span>
        </button>
        <button
          onClick={() => setMobileTab('export')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
            mobileTab === 'export' ? 'bg-indigo-600 text-white' : 'text-zinc-400'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Settings</span>
        </button>
      </div>

      {/* Main Workspace (3-Column Desktop Layout) */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Column: Code Editor */}
        <section
          className={`h-full flex-col shrink-0 ${
            mobileTab === 'code' ? 'flex w-full' : 'hidden lg:flex lg:w-[35%] xl:w-[32%] min-w-[340px] max-w-[500px]'
          }`}
        >
          <CodeEditor
            code={code}
            onChange={setCode}
            onRun={handleRunCode}
            onStop={handleStopPlayback}
            onReset={handleResetRenderer}
            onValidate={handleValidateCode}
            isPlaying={isPlaying}
            validationError={validationError}
          />
        </section>

        {/* Center Column: Live Preview */}
        <section
          className={`h-full flex-1 flex-col ${
            mobileTab === 'preview' ? 'flex w-full' : 'hidden lg:flex'
          }`}
        >
          <CanvasPreview
            drawFn={compiledDrawFn}
            settings={settings}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying((p) => !p)}
            onResetRenderer={handleResetRenderer}
            onRuntimeError={handleRuntimeError}
            runtimeError={runtimeError}
          />
        </section>

        {/* Right Column: Export & Metadata Settings */}
        <section
          className={`h-full flex-col shrink-0 ${
            mobileTab === 'export' ? 'flex w-full' : 'hidden lg:flex lg:w-[320px] xl:w-[360px]'
          }`}
        >
          <ExportPanel
            settings={settings}
            onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
            metadata={metadata}
            onUpdateMetadata={setMetadata}
            onStartExport={handleStartExport}
            isExporting={renderProgress.status === 'rendering'}
          />
        </section>
      </main>

      {/* Render Modal */}
      <RenderModal
        progress={renderProgress}
        settings={settings}
        isOpen={isRenderModalOpen}
        onClose={() => setIsRenderModalOpen(false)}
        onCancel={handleCancelExport}
        onRenderAgain={handleStartExport}
      />

      {/* Example Library Modal */}
      <ExampleModal
        isOpen={isExampleModalOpen}
        onClose={() => setIsExampleModalOpen(false)}
        onSelectExample={handleSelectExample}
      />

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />
    </div>
  );
}
