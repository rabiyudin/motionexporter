import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Repeat, 
  Maximize2, 
  Minimize2, 
  Grid3X3, 
  Crosshair, 
  AlertTriangle, 
  RefreshCw,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { ExportSettings, BackgroundMode } from '../types';
import { CompiledDrawFunction } from '../services/codeValidator';

interface CanvasPreviewProps {
  drawFn: CompiledDrawFunction | null;
  settings: ExportSettings;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onResetRenderer: () => void;
  onRuntimeError: (error: Error) => void;
  runtimeError: string | null;
}

export const CanvasPreview: React.FC<CanvasPreviewProps> = ({
  drawFn,
  settings,
  isPlaying,
  onTogglePlay,
  onResetRenderer,
  onRuntimeError,
  runtimeError,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Playback state
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [fpsReadout, setFpsReadout] = useState<number>(settings.fps);
  const [zoomLevel, setZoomLevel] = useState<'fit' | 0.5 | 0.75 | 1.0>('fit');
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [showSafeArea, setShowSafeArea] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // References to keep animation loop smooth
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const playbackTimeRef = useRef<number>(0);
  const fpsFramesRef = useRef<number>(0);
  const fpsLastSampleRef = useRef<number>(performance.now());

  const { width, height, fps, duration, loop, backgroundMode, backgroundColor, previewQuality } = settings;
  const totalFrames = Math.max(1, Math.round(fps * duration));
  const currentFrame = Math.min(totalFrames, Math.floor(currentTime * fps));

  // Calculate internal render resolution based on Preview Quality
  const qualityScale = previewQuality === 'performance' ? 0.5 : previewQuality === 'balanced' ? 0.75 : 1.0;
  const renderWidth = Math.round(width * qualityScale);
  const renderHeight = Math.round(height * qualityScale);

  // Execute a single frame draw
  const renderFrameAtTime = useCallback((timeSec: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: backgroundMode === 'transparent' });
    if (!ctx) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Canvas background
    if (backgroundMode === 'transparent') {
      ctx.clearRect(0, 0, renderWidth, renderHeight);
    } else if (backgroundMode === 'black') {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, renderWidth, renderHeight);
    } else if (backgroundMode === 'white') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, renderWidth, renderHeight);
    } else {
      ctx.fillStyle = backgroundColor || '#111422';
      ctx.fillRect(0, 0, renderWidth, renderHeight);
    }

    if (drawFn) {
      try {
        // Pass scaled canvas dimensions so drawing scales proportionally
        drawFn(ctx, timeSec, renderWidth, renderHeight);
      } catch (err: unknown) {
        const error = err as Error;
        onRuntimeError(error);
      }
    }

    ctx.restore();
  }, [drawFn, backgroundMode, backgroundColor, renderWidth, renderHeight, onRuntimeError]);

  // Animation Loop
  useEffect(() => {
    if (!isPlaying || runtimeError) {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      lastTimeRef.current = null;
      return;
    }

    const loopStep = (now: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
      }

      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      // Update FPS readout every ~500ms
      fpsFramesRef.current++;
      if (now - fpsLastSampleRef.current >= 500) {
        const sampledFps = Math.round((fpsFramesRef.current * 1000) / (now - fpsLastSampleRef.current));
        setFpsReadout(sampledFps);
        fpsFramesRef.current = 0;
        fpsLastSampleRef.current = now;
      }

      let nextTime = playbackTimeRef.current + delta;

      if (nextTime >= duration) {
        if (loop) {
          nextTime = nextTime % duration;
        } else {
          nextTime = duration;
          playbackTimeRef.current = duration;
          setCurrentTime(duration);
          renderFrameAtTime(duration);
          onTogglePlay(); // Stop when non-looping finishes
          return;
        }
      }

      playbackTimeRef.current = nextTime;
      setCurrentTime(nextTime);
      renderFrameAtTime(nextTime);

      animFrameIdRef.current = requestAnimationFrame(loopStep);
    };

    animFrameIdRef.current = requestAnimationFrame(loopStep);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [isPlaying, duration, loop, renderFrameAtTime, runtimeError, onTogglePlay]);

  // When paused or scrubbing, render the current time frame immediately
  useEffect(() => {
    if (!isPlaying) {
      renderFrameAtTime(currentTime);
    }
  }, [currentTime, isPlaying, renderFrameAtTime]);

  const handleRestart = () => {
    playbackTimeRef.current = 0;
    setCurrentTime(0);
    renderFrameAtTime(0);
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    playbackTimeRef.current = newTime;
    setCurrentTime(newTime);
    renderFrameAtTime(newTime);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`h-full flex flex-col bg-[#0b0d14] relative overflow-hidden ${
        isFullscreen ? 'p-4' : ''
      }`}
    >
      {/* Top Preview Bar */}
      <div className="h-11 border-b border-zinc-800/80 bg-[#121622] px-3 flex items-center justify-between shrink-0 select-none z-10">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Live Preview
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
            {width} × {height} ({qualityScale * 100}% view)
          </span>
        </div>

        {/* Viewport Helpers */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Rule-of-Thirds Grid"
            className={`p-1.5 rounded transition-colors ${
              showGrid ? 'bg-indigo-600/30 text-indigo-300' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowSafeArea(!showSafeArea)}
            title="Toggle Action & Title Safe Area Guides"
            className={`p-1.5 rounded transition-colors ${
              showSafeArea ? 'bg-indigo-600/30 text-indigo-300' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>

          <div className="h-3 w-px bg-zinc-800 mx-0.5" />

          {/* Zoom options */}
          <div className="flex items-center bg-zinc-900 rounded p-0.5 text-[11px]">
            <button
              onClick={() => setZoomLevel('fit')}
              className={`px-1.5 py-0.5 rounded ${
                zoomLevel === 'fit' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Fit
            </button>
            <button
              onClick={() => setZoomLevel(0.5)}
              className={`px-1.5 py-0.5 rounded ${
                zoomLevel === 0.5 ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              50%
            </button>
            <button
              onClick={() => setZoomLevel(1.0)}
              className={`px-1.5 py-0.5 rounded ${
                zoomLevel === 1.0 ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              100%
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Preview'}
            className="p-1.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport Area */}
      <div className="flex-1 relative flex items-center justify-center p-4 overflow-auto select-none">
        {/* Canvas Wrapper */}
        <div 
          className={`relative rounded-lg shadow-2xl transition-all ${
            backgroundMode === 'transparent' ? 'bg-checkerboard' : ''
          }`}
          style={{
            aspectRatio: `${width} / ${height}`,
            maxWidth: zoomLevel === 'fit' ? '100%' : zoomLevel === 0.5 ? '50%' : '100%',
            maxHeight: zoomLevel === 'fit' ? '100%' : undefined,
            width: zoomLevel === 1.0 ? `${width}px` : zoomLevel === 0.5 ? `${width * 0.5}px` : undefined,
          }}
        >
          <canvas
            ref={canvasRef}
            width={renderWidth}
            height={renderHeight}
            className="w-full h-full object-contain rounded-lg block"
          />

          {/* Safe Area Guides (Action 90%, Title 80%) */}
          {showSafeArea && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Action Safe (90%) */}
              <div className="w-[90%] h-[90%] border border-cyan-400/40 border-dashed absolute flex items-start justify-start p-1">
                <span className="text-[9px] text-cyan-400/70 font-mono">Action Safe 90%</span>
              </div>
              {/* Title Safe (80%) */}
              <div className="w-[80%] h-[80%] border border-amber-400/40 border-dashed absolute flex items-start justify-start p-1">
                <span className="text-[9px] text-amber-400/70 font-mono">Title Safe 80%</span>
              </div>
            </div>
          )}

          {/* Rule-of-Thirds Grid */}
          {showGrid && (
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
              <div className="border-r border-b border-indigo-400/20" />
              <div className="border-r border-b border-indigo-400/20" />
              <div className="border-b border-indigo-400/20" />
              <div className="border-r border-b border-indigo-400/20" />
              <div className="border-r border-b border-indigo-400/20" />
              <div className="border-b border-indigo-400/20" />
              <div className="border-r border-indigo-400/20" />
              <div className="border-r border-indigo-400/20" />
              <div />
            </div>
          )}

          {/* No Animation Loaded Overlay */}
          {!drawFn && !runtimeError && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center p-6 text-center z-10">
              <div className="w-12 h-12 rounded-full bg-zinc-800/80 border border-zinc-700 flex items-center justify-center mb-3">
                <Play className="w-5 h-5 text-zinc-400 fill-current ml-0.5" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-200 mb-1">No valid animation loaded.</h3>
              <p className="text-xs text-zinc-400 max-w-xs mb-4">
                Define a function draw(ctx, time, width, height) in the editor and click Run (Ctrl+Enter).
              </p>
              <button
                onClick={onResetRenderer}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Compile & Run</span>
              </button>
            </div>
          )}

          {/* Runtime Error Overlay */}
          {runtimeError && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center p-6 text-center z-20">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mb-3">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-base font-semibold text-rose-300 mb-1">ANIMATION ERROR</h3>
              <p className="text-xs text-zinc-300 max-w-md mb-4 bg-zinc-900/80 p-3 rounded border border-zinc-800 font-mono break-words text-left">
                {runtimeError}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    handleRestart();
                    onResetRenderer();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
                <button
                  onClick={onResetRenderer}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Renderer</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center Controls & Timeline Bar */}
      <div className="h-16 border-t border-zinc-800/80 bg-[#121622] px-4 flex flex-col justify-center gap-1.5 shrink-0 select-none">
        {/* Timeline Slider */}
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max={duration}
            step="0.01"
            value={currentTime}
            onChange={handleScrubberChange}
            className="flex-1 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
          />
        </div>

        {/* Playback Controls & Readouts */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={onTogglePlay}
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              className="p-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white shadow transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              onClick={handleRestart}
              title="Restart from 0:00"
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 font-mono text-zinc-300 ml-2">
              <span className="text-indigo-400 font-semibold">{currentTime.toFixed(2)}s</span>
              <span className="text-zinc-600">/</span>
              <span>{duration.toFixed(2)}s</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-zinc-400 font-mono text-[11px]">
            <div className="hidden sm:flex items-center gap-1">
              <span>Frame:</span>
              <span className="text-zinc-200">{currentFrame}</span>
              <span className="text-zinc-600">/</span>
              <span>{totalFrames}</span>
            </div>

            <div className="flex items-center gap-1">
              <span>FPS:</span>
              <span className={`font-semibold ${fpsReadout >= fps * 0.9 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {fpsReadout}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Repeat className={`w-3.5 h-3.5 ${loop ? 'text-indigo-400' : 'text-zinc-600'}`} />
              <span className={loop ? 'text-indigo-300' : 'text-zinc-500'}>
                {loop ? 'Loop ON' : 'Loop OFF'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
