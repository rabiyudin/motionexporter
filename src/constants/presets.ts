import { ResolutionPreset, MicrostockPlatform } from '../types';

export const RESOLUTION_PRESETS: ResolutionPreset[] = [
  {
    id: 'square',
    label: 'Square',
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    description: 'Social posts & square previews',
  },
  {
    id: 'landscape_hd',
    label: 'Landscape HD',
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    description: 'Standard 1080p microstock footage',
  },
  {
    id: 'landscape_4k',
    label: 'Landscape 4K (UHD)',
    width: 3840,
    height: 2160,
    aspectRatio: '16:9',
    description: 'Premium Ultra HD 4K (requires more memory)',
  },
  {
    id: 'portrait',
    label: 'Portrait',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    description: 'Vertical stories & reels',
  },
  {
    id: 'vertical_hd',
    label: 'Vertical HD',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    description: 'TikTok / YouTube Shorts / Vertical Ads',
  },
  {
    id: 'custom',
    label: 'Custom Size',
    width: 1920,
    height: 1080,
    aspectRatio: 'Custom',
    description: 'User specified dimensions',
  },
];

export const FPS_OPTIONS = [24, 25, 30, 50, 60];

export const DURATION_OPTIONS = [1, 2, 3, 4, 5, 6, 8, 10, 15, 30];

export interface MicrostockGuide {
  id: MicrostockPlatform;
  name: string;
  recommendedResolutions: string[];
  recommendedFps: number[];
  recommendedDuration: string;
  codecsAccepted: string[];
  tips: string[];
  disclaimer: string;
}

export const MICROSTOCK_GUIDES: Record<MicrostockPlatform, MicrostockGuide> = {
  shutterstock: {
    id: 'shutterstock',
    name: 'Shutterstock Guidelines',
    recommendedResolutions: ['1920 × 1080 (HD)', '3840 × 2160 (4K)'],
    recommendedFps: [23.98, 24, 25, 29.97, 30],
    recommendedDuration: '5 to 30 seconds (min 5s recommended)',
    codecsAccepted: ['MP4', 'MOV', 'ProRes', 'WebM (internal)'],
    tips: [
      'Seamless loops have higher commercial acceptance rates.',
      'Ensure clear contrast and smooth anti-aliased geometry.',
      'Avoid logos, copyrighted shapes, or branded graphics.',
      'Provide concise, accurate keywords without spam.'
    ],
    disclaimer: 'Preset provides technical guidelines only. Always verify latest marketplace specifications before submitting.'
  },
  adobestock: {
    id: 'adobestock',
    name: 'Adobe Stock Guidelines',
    recommendedResolutions: ['1920 × 1080 (Full HD)', '3840 × 2160 (4K UHD)'],
    recommendedFps: [24, 25, 30, 60],
    recommendedDuration: '5 to 60 seconds (loopable 5s - 10s popular)',
    codecsAccepted: ['MP4 (H.264 / ProRes)', 'WebM convertable'],
    tips: [
      'Minimalist, tech, abstract, and business motion loops sell consistently.',
      'Transparent assets are highly valued for overlays.',
      'Keep frame rates standard (24, 25, 30, or 60 fps).',
      'Test your video loop to ensure no sudden jump on the 0-second seam.'
    ],
    disclaimer: 'Preset provides technical guidelines only. Always verify latest marketplace specifications before submitting.'
  },
  generic: {
    id: 'generic',
    name: 'Generic Microstock',
    recommendedResolutions: ['1920 × 1080', '1080 × 1080', '3840 × 2160'],
    recommendedFps: [24, 30, 60],
    recommendedDuration: '3 to 10 seconds',
    codecsAccepted: ['WebM', 'MP4', 'MOV'],
    tips: [
      'Export high bitrate with smooth interpolation.',
      'Use deterministic canvas math: time = frame / fps.',
      'Export metadata with title, description, and up to 50 tags.'
    ],
    disclaimer: 'Preset provides technical guidelines only. Always verify latest marketplace specifications before submitting.'
  }
};
