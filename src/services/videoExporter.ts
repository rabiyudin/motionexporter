import { ExportSettings, RenderProgress } from '../types';
import { CompiledDrawFunction } from './codeValidator';

export interface ExportController {
  cancel: () => void;
}

export interface SupportedCodecInfo {
  mimeType: string;
  isMp4: boolean;
  codecLabel: string;
  extension: 'webm' | 'mp4';
}

/**
 * Checks for the best available video container and codec supported by the current browser.
 * Never claims MP4 unless natively supported by MediaRecorder.
 */
export function getSupportedVideoMimeType(): SupportedCodecInfo {
  if (typeof MediaRecorder === 'undefined') {
    return { mimeType: '', isMp4: false, codecLabel: 'MediaRecorder Unsupported', extension: 'webm' };
  }

  const candidates: Array<{ type: string; label: string; isMp4: boolean; ext: 'webm' | 'mp4' }> = [
    { type: 'video/webm;codecs=vp9', label: 'WebM (VP9 - High Quality & Alpha)', isMp4: false, ext: 'webm' },
    { type: 'video/webm;codecs=vp8', label: 'WebM (VP8)', isMp4: false, ext: 'webm' },
    { type: 'video/webm', label: 'WebM (Default)', isMp4: false, ext: 'webm' },
    { type: 'video/mp4;codecs=avc1', label: 'MP4 (H.264)', isMp4: true, ext: 'mp4' },
    { type: 'video/mp4', label: 'MP4 (Native)', isMp4: true, ext: 'mp4' },
  ];

  for (const candidate of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(candidate.type)) {
        return {
          mimeType: candidate.type,
          isMp4: candidate.isMp4,
          codecLabel: candidate.label,
          extension: candidate.ext,
        };
      }
    } catch {
      // Continue checking next
    }
  }

  return { mimeType: 'video/webm', isMp4: false, codecLabel: 'WebM (Fallback)', extension: 'webm' };
}

/**
 * Sanitizes a filename string to be safe for all operating systems.
 */
export function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim();
}

/**
 * Generates standard microstock filename pattern:
 * [subject]-[style]-[motion]-[resolution]-[fps].webm
 */
export function generateStockFilename(
  subject: string,
  style: string,
  motion: string,
  width: number,
  height: number,
  fps: number,
  extension: 'webm' | 'mp4' = 'webm'
): string {
  const s = sanitizeFilename(subject || 'motion-asset');
  const st = sanitizeFilename(style || 'abstract');
  const m = sanitizeFilename(motion || 'loop');
  return `${s}-${st}-${m}-${width}x${height}-${fps}fps.${extension}`;
}

/**
 * Deterministically renders the animation frame-by-frame into a video asset.
 */
export function renderVideoDeterministic(
  drawFn: CompiledDrawFunction,
  settings: ExportSettings,
  filename: string,
  onProgress: (progress: RenderProgress) => void
): ExportController {
  let isCancelled = false;
  let activeMediaRecorder: MediaRecorder | null = null;
  let activeStream: MediaStream | null = null;
  let activeBlobUrl: string | null = null;

  const cleanup = () => {
    if (activeMediaRecorder && activeMediaRecorder.state !== 'inactive') {
      try {
        activeMediaRecorder.stop();
      } catch {
        // Ignore stop error on cleanup
      }
    }
    if (activeStream) {
      activeStream.getTracks().forEach((t) => t.stop());
    }
  };

  const controller: ExportController = {
    cancel: () => {
      isCancelled = true;
      cleanup();
      if (activeBlobUrl) {
        URL.revokeObjectURL(activeBlobUrl);
        activeBlobUrl = null;
      }
      onProgress({
        status: 'idle',
        currentFrame: 0,
        totalFrames: 0,
        percent: 0,
        elapsedSeconds: 0,
        estimatedRemainingSeconds: 0,
      });
    },
  };

  (async () => {
    const { width, height, fps, duration, backgroundMode, backgroundColor } = settings;
    const totalFrames = Math.max(1, Math.round(fps * duration));
    const codecInfo = getSupportedVideoMimeType();

    if (!codecInfo.mimeType) {
      onProgress({
        status: 'error',
        currentFrame: 0,
        totalFrames,
        percent: 0,
        elapsedSeconds: 0,
        estimatedRemainingSeconds: 0,
        errorMessage: 'Your browser does not support MediaRecorder video export.',
      });
      return;
    }

    onProgress({
      status: 'preparing',
      currentFrame: 0,
      totalFrames,
      percent: 0,
      elapsedSeconds: 0,
      estimatedRemainingSeconds: 0,
      fileName: filename,
      mimeType: codecInfo.codecLabel,
    });

    // Create export canvas at target resolution
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: backgroundMode === 'transparent' });

    if (!ctx) {
      onProgress({
        status: 'error',
        currentFrame: 0,
        totalFrames,
        percent: 0,
        elapsedSeconds: 0,
        estimatedRemainingSeconds: 0,
        errorMessage: 'Unable to initialize 2D canvas context for export.',
      });
      return;
    }

    // Capture stream using captureStream(fps)
    let stream: MediaStream;
    let track: any = null;
    const anyCanvas = canvas as any;

    try {
      if (typeof anyCanvas.captureStream === 'function') {
        stream = anyCanvas.captureStream(fps);
      } else if (typeof anyCanvas.mozCaptureStream === 'function') {
        stream = anyCanvas.mozCaptureStream(fps);
      } else {
        throw new Error('Canvas captureStream is not supported by your browser.');
      }
      activeStream = stream;

      const tracks = stream.getVideoTracks();
      if (tracks && tracks.length > 0) {
        track = tracks[0];
      }
    } catch (streamErr: unknown) {
      const err = streamErr as Error;
      onProgress({
        status: 'error',
        currentFrame: 0,
        totalFrames,
        percent: 0,
        elapsedSeconds: 0,
        estimatedRemainingSeconds: 0,
        errorMessage: `Unable to capture Canvas stream: ${err.message}`,
      });
      return;
    }

    // Determine appropriate bitrate based on resolution
    const pixelCount = width * height;
    let videoBitsPerSecond = 12_000_000;
    if (pixelCount >= 3840 * 2160) {
      videoBitsPerSecond = 32_000_000;
    } else if (pixelCount <= 1080 * 1080) {
      videoBitsPerSecond = 8_000_000;
    }

    const recordedChunks: Blob[] = [];
    let mediaRecorder: MediaRecorder;

    try {
      mediaRecorder = new MediaRecorder(stream, {
        mimeType: codecInfo.mimeType,
        videoBitsPerSecond,
      });
    } catch {
      // Fallback without bitrate or explicit mimeType
      try {
        mediaRecorder = new MediaRecorder(stream);
      } catch (recErr: unknown) {
        const err = recErr as Error;
        cleanup();
        onProgress({
          status: 'error',
          currentFrame: 0,
          totalFrames,
          percent: 0,
          elapsedSeconds: 0,
          estimatedRemainingSeconds: 0,
          errorMessage: `MediaRecorder initialization error: ${err.message}`,
        });
        return;
      }
    }
    activeMediaRecorder = mediaRecorder;

    // Attach all MediaRecorder event handlers BEFORE mediaRecorder.start()
    let recorderError: Error | null = null;
    const stopPromise = new Promise<void>((resolve, reject) => {
      mediaRecorder.onstop = () => {
        resolve();
      };
      mediaRecorder.onerror = (event: any) => {
        recorderError = event?.error || new Error('MediaRecorder recording error');
        reject(recorderError);
      };
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    const renderStartTime = performance.now();
    try {
      mediaRecorder.start(250); // Record in 250ms chunks
    } catch (startErr: unknown) {
      const err = startErr as Error;
      cleanup();
      onProgress({
        status: 'error',
        currentFrame: 0,
        totalFrames,
        percent: 0,
        elapsedSeconds: 0,
        estimatedRemainingSeconds: 0,
        errorMessage: `Failed to start MediaRecorder: ${err.message}`,
      });
      return;
    }

    // Frame delay: gives the encoder exact pacing
    const frameIntervalMs = Math.max(16, Math.round(1000 / fps));

    try {
      for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
        if (isCancelled) {
          cleanup();
          return;
        }

        // Strict deterministic time in seconds
        const frameTime = frameIndex / fps;

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        if (backgroundMode === 'transparent') {
          ctx.clearRect(0, 0, width, height);
        } else if (backgroundMode === 'black') {
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, width, height);
        } else if (backgroundMode === 'white') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        } else {
          ctx.fillStyle = backgroundColor || '#111422';
          ctx.fillRect(0, 0, width, height);
        }

        try {
          drawFn(ctx, frameTime, width, height);
        } catch (drawErr: unknown) {
          const err = drawErr as Error;
          cleanup();
          onProgress({
            status: 'error',
            currentFrame: frameIndex,
            totalFrames,
            percent: Math.round((frameIndex / totalFrames) * 100),
            elapsedSeconds: (performance.now() - renderStartTime) / 1000,
            estimatedRemainingSeconds: 0,
            errorMessage: `Animation runtime error during export at frame ${frameIndex} (${frameTime.toFixed(2)}s): ${err.message}`,
          });
          return;
        }

        ctx.restore();

        // If manual requestFrame is available on the track, invoke it
        if (track && typeof track.requestFrame === 'function') {
          try {
            track.requestFrame();
          } catch {
            // Ignore if requestFrame fails
          }
        }

        // Calculate progress metrics
        const framesDone = frameIndex + 1;
        const now = performance.now();
        const elapsedSeconds = (now - renderStartTime) / 1000;
        const avgSecPerFrame = elapsedSeconds / framesDone;
        const remainingFrames = totalFrames - framesDone;
        const estimatedRemainingSeconds = Math.max(0, remainingFrames * avgSecPerFrame);
        const percent = Math.min(100, Math.round((framesDone / totalFrames) * 100));

        onProgress({
          status: 'rendering',
          currentFrame: framesDone,
          totalFrames,
          percent,
          elapsedSeconds,
          estimatedRemainingSeconds,
          fileName: filename,
          mimeType: codecInfo.codecLabel,
        });

        // Frame interval delay for video encoder
        await new Promise((resolve) => setTimeout(resolve, frameIntervalMs));
      }

      if (isCancelled) {
        cleanup();
        return;
      }

      onProgress({
        status: 'encoding',
        currentFrame: totalFrames,
        totalFrames,
        percent: 100,
        elapsedSeconds: (performance.now() - renderStartTime) / 1000,
        estimatedRemainingSeconds: 0,
        fileName: filename,
        mimeType: codecInfo.codecLabel,
      });

      // Request any pending data and stop MediaRecorder
      if (mediaRecorder.state !== 'inactive') {
        try {
          if (typeof mediaRecorder.requestData === 'function') {
            mediaRecorder.requestData();
          }
          mediaRecorder.stop();
        } catch {
          // Continue to await stopPromise
        }
      }

      // Await onstop event safely
      await stopPromise;

      // Stop tracks
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }

      if (recordedChunks.length === 0) {
        throw new Error('Render produced empty video chunks. Please try again.');
      }

      const finalBlob = new Blob(recordedChunks, { type: mediaRecorder.mimeType || codecInfo.mimeType });
      if (finalBlob.size === 0) {
        throw new Error('Generated video file size is 0 bytes.');
      }

      const blobUrl = URL.createObjectURL(finalBlob);
      activeBlobUrl = blobUrl;

      onProgress({
        status: 'completed',
        currentFrame: totalFrames,
        totalFrames,
        percent: 100,
        elapsedSeconds: (performance.now() - renderStartTime) / 1000,
        estimatedRemainingSeconds: 0,
        blobUrl,
        blobSize: finalBlob.size,
        fileName: filename,
        mimeType: codecInfo.codecLabel,
      });
    } catch (renderError: unknown) {
      cleanup();
      const err = renderError as Error;
      onProgress({
        status: 'error',
        currentFrame: 0,
        totalFrames,
        percent: 0,
        elapsedSeconds: 0,
        estimatedRemainingSeconds: 0,
        errorMessage: `Render failed: ${err.message}`,
      });
    }
  })();

  return controller;
}
