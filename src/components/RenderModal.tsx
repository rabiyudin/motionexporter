import React from 'react';
import { 
  Film, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Download, 
  RotateCcw, 
  Clock, 
  Layers, 
  HardDrive, 
  Info 
} from 'lucide-react';
import { RenderProgress, ExportSettings } from '../types';

interface RenderModalProps {
  progress: RenderProgress;
  settings: ExportSettings;
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  onRenderAgain: () => void;
}

export const RenderModal: React.FC<RenderModalProps> = ({
  progress,
  settings,
  isOpen,
  onClose,
  onCancel,
  onRenderAgain,
}) => {
  if (!isOpen) return null;

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleDownload = () => {
    if (!progress.blobUrl) return;
    const a = document.createElement('a');
    a.href = progress.blobUrl;
    a.download = progress.fileName || 'motion-asset.webm';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const isCompleted = progress.status === 'completed';
  const isRendering = progress.status === 'rendering' || progress.status === 'preparing' || progress.status === 'encoding';
  const isError = progress.status === 'error';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#121622] border border-zinc-700/80 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isCompleted
                ? 'bg-emerald-500/20 text-emerald-400'
                : isError
                ? 'bg-rose-500/20 text-rose-400'
                : 'bg-indigo-500/20 text-indigo-400'
            }`}>
              {isCompleted ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : isError ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <Film className="w-4 h-4 animate-pulse" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                {isCompleted
                  ? 'Video Export Complete'
                  : isError
                  ? 'Export Error'
                  : progress.status === 'encoding'
                  ? 'Finalizing Video Encoding...'
                  : progress.status === 'preparing'
                  ? 'Preparing Deterministic Render...'
                  : 'Rendering Frame-by-Frame...'}
              </h3>
              <p className="text-xs text-zinc-400">
                {isCompleted ? 'Ready for download and microstock distribution' : `${settings.width} × ${settings.height} @ ${settings.fps} FPS`}
              </p>
            </div>
          </div>

          {!isRendering && (
            <button
              onClick={onClose}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4">
          {/* RENDERING PROGRESS STATE */}
          {isRendering && (
            <div className="space-y-4">
              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-zinc-300 mb-1.5">
                  <span>Frame {progress.currentFrame} / {progress.totalFrames}</span>
                  <span className="font-semibold text-indigo-400">{progress.percent}%</span>
                </div>
                <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-75"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
              </div>

              {/* Progress Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-zinc-900/60 rounded-lg border border-zinc-800 flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-zinc-500" />
                  <div>
                    <div className="text-[11px] text-zinc-500">Elapsed Time</div>
                    <div className="font-mono text-zinc-200">{formatSeconds(progress.elapsedSeconds)}</div>
                  </div>
                </div>

                <div className="p-3 bg-zinc-900/60 rounded-lg border border-zinc-800 flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-zinc-500" />
                  <div>
                    <div className="text-[11px] text-zinc-500">Estimated Remaining</div>
                    <div className="font-mono text-zinc-200">{formatSeconds(progress.estimatedRemainingSeconds)}</div>
                  </div>
                </div>
              </div>

              {/* Cancel Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={onCancel}
                  className="px-3.5 py-1.5 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800/80 hover:bg-zinc-800 transition-colors"
                >
                  Cancel Render
                </button>
              </div>
            </div>
          )}

          {/* COMPLETED STATE */}
          {isCompleted && (
            <div className="space-y-4">
              {/* Video Preview Player */}
              {progress.blobUrl && (
                <div className="relative rounded-lg overflow-hidden border border-zinc-800 bg-black aspect-video flex items-center justify-center">
                  <video
                    src={progress.blobUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* Asset Information Table */}
              <div className="p-3.5 bg-zinc-900/60 rounded-lg border border-zinc-800 space-y-2 text-xs">
                <div className="font-semibold text-zinc-200 border-b border-zinc-800 pb-1.5">
                  ASSET INFORMATION
                </div>

                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[11px]">
                  <div>
                    <span className="text-zinc-500">Asset File:</span>
                    <div className="font-mono text-zinc-200 truncate">{progress.fileName}</div>
                  </div>

                  <div>
                    <span className="text-zinc-500">Resolution:</span>
                    <div className="font-mono text-zinc-200">{settings.width} × {settings.height}</div>
                  </div>

                  <div>
                    <span className="text-zinc-500">Duration & FPS:</span>
                    <div className="font-mono text-zinc-200">{settings.duration}s @ {settings.fps} FPS ({progress.totalFrames} frames)</div>
                  </div>

                  <div>
                    <span className="text-zinc-500">File Size & Codec:</span>
                    <div className="font-mono text-emerald-400">
                      {formatFileSize(progress.blobSize)} • {progress.mimeType || 'WebM'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Codec & Microstock conversion note */}
              <div className="p-3 bg-zinc-900/40 rounded-lg border border-zinc-800/80 text-[11px] text-zinc-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-zinc-300 font-medium">Marketplace Delivery: </span>
                  Exported as standard WebM. If your target microstock portal explicitly requests MP4/ProRes, convert this file locally using HandBrake, FFmpeg, or Premiere Pro.
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  onClick={onRenderAgain}
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Render Again</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="px-4 py-1.5 rounded-md text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/25"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Video</span>
                </button>
              </div>
            </div>
          )}

          {/* ERROR STATE */}
          {isError && (
            <div className="space-y-4">
              <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-lg text-rose-200 text-xs">
                <div className="font-semibold text-rose-300 mb-1">Render Failed</div>
                <div className="font-mono text-[11px] bg-black/40 p-2.5 rounded border border-rose-900/50 break-words">
                  {progress.errorMessage || 'An unexpected error occurred during frame rendering.'}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={onRenderAgain}
                  className="px-3.5 py-1.5 rounded-md text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
