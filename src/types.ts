export type ResolutionPresetKey = 
  | 'square'
  | 'landscape_hd'
  | 'landscape_4k'
  | 'portrait'
  | 'vertical_hd'
  | 'custom';

export type BackgroundMode = 'transparent' | 'black' | 'white' | 'custom';

export type PreviewQuality = 'performance' | 'balanced' | 'high';

export type MicrostockPlatform = 'generic' | 'shutterstock' | 'adobestock';

export interface ResolutionPreset {
  id: ResolutionPresetKey;
  label: string;
  width: number;
  height: number;
  aspectRatio: string;
  description?: string;
}

export interface ExportSettings {
  presetKey: ResolutionPresetKey;
  width: number;
  height: number;
  fps: number;
  duration: number; // in seconds
  loop: boolean;
  backgroundMode: BackgroundMode;
  backgroundColor: string;
  previewQuality: PreviewQuality;
  platformPreset: MicrostockPlatform;
}

export interface AnimationExample {
  id: string;
  title: string;
  category: string;
  description: string;
  code: string;
  suggestedDuration: number;
  suggestedFps: number;
  suggestedBackground: BackgroundMode;
  suggestedBgColor?: string;
}

export interface MicrostockMetadata {
  title: string;
  subject: string;
  style: string;
  color: string;
  motion: string;
  theme: string;
  description: string;
  keywords: string[];
}

export interface ProjectData {
  name: string;
  code: string;
  width: number;
  height: number;
  fps: number;
  duration: number;
  background: BackgroundMode;
  backgroundColor?: string;
  metadata?: MicrostockMetadata;
  createdAt?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  line?: number;
  column?: number;
}

export interface RenderProgress {
  status: 'idle' | 'preparing' | 'rendering' | 'encoding' | 'completed' | 'error';
  currentFrame: number;
  totalFrames: number;
  percent: number;
  elapsedSeconds: number;
  estimatedRemainingSeconds: number;
  blobUrl?: string;
  blobSize?: number;
  mimeType?: string;
  fileName?: string;
  errorMessage?: string;
}
