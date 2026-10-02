import { MicrostockMetadata } from '../types';

// Curated stock category keyword dictionaries
const BASE_STOCK_KEYWORDS = [
  'animation',
  'motion graphics',
  'loop',
  'seamless loop',
  'video asset',
  'background',
  'cgi',
  'visual effects',
  'stock footage',
  '4k',
  'hd'
];

const STYLE_KEYWORDS: Record<string, string[]> = {
  Minimalist: ['minimal', 'minimalist', 'clean', 'simple', 'flat design', 'modern', 'elegant', 'geometric'],
  '3D Flat': ['3d', 'flat 3d', 'isometric', 'depth', 'spatial', 'rendered', 'perspective'],
  Cyberpunk: ['cyberpunk', 'futuristic', 'neon', 'high tech', 'cyber', 'scifi', 'glow', 'dark tech'],
  'Glowing Neon': ['neon', 'glowing', 'luminescent', 'vibrant', 'light trails', 'radiant', 'electric'],
  Corporate: ['corporate', 'business', 'presentation', 'professional', 'commercial', 'infographic', 'enterprise'],
  Futuristic: ['future', 'futuristic', 'hud', 'advanced', 'digital', 'tech', 'ui', 'interface'],
  Geometric: ['geometry', 'geometric', 'hexagons', 'polygons', 'shapes', 'symmetric', 'kaleidoscopic'],
  Abstract: ['abstract', 'concept', 'artistic', 'fluid', 'generative', 'creative', 'dynamic', 'contemporary'],
  Holographic: ['hologram', 'holographic', 'virtual', 'prism', 'iridescent', 'spectral', 'translucent'],
};

const THEME_KEYWORDS: Record<string, string[]> = {
  Technology: ['technology', 'tech', 'digital', 'data', 'computing', 'artificial intelligence', 'network', 'connection', 'internet'],
  Creative: ['creative', 'design', 'art', 'inspiration', 'creativity', 'studio', 'imagination', 'craft'],
  'Finance & Business': ['finance', 'fintech', 'business', 'economy', 'money', 'banking', 'investment', 'wealth', 'trading'],
  'Education & Science': ['education', 'science', 'learning', 'school', 'physics', 'mathematics', 'knowledge', 'study', 'research'],
  'Fantasy & Magic': ['magic', 'fantasy', 'magical', 'wand', 'spell', 'mystic', 'sparkle', 'enchanted', 'fairytale', 'wonder'],
  Celebration: ['celebration', 'party', 'confetti', 'holiday', 'festival', 'anniversary', 'birthday', 'festive', 'cheer'],
  Medical: ['medical', 'healthcare', 'biology', 'health', 'wellness', 'cellular', 'dna', 'science'],
};

const MOTION_KEYWORDS: Record<string, string[]> = {
  'Seamless Loop': ['seamless loop', 'looping', 'endless', 'continuous', 'cycle', 'repeating'],
  Floating: ['floating', 'hovering', 'levitating', 'weightless', 'gentle motion', 'drifting'],
  Pulsing: ['pulsing', 'rhythmic', 'pulsating', 'heartbeat', 'vibrating', 'throbbing'],
  Exploding: ['burst', 'explosion', 'particle blast', 'shatter', 'dispersion', 'energy release'],
  Cascade: ['cascade', 'falling', 'raining', 'dropping', 'flowing down', 'waterfall'],
  Morphing: ['morphing', 'fluid', 'transforming', 'metamorphosis', 'liquid', 'organic transition'],
  Orbiting: ['orbiting', 'revolving', 'spinning', 'rotating', 'planetary', 'circular path'],
};

const COLOR_KEYWORDS: Record<string, string[]> = {
  Cyan: ['cyan', 'teal', 'aqua', 'turquoise', 'blue glow'],
  Violet: ['violet', 'purple', 'magenta', 'indigo', 'lavender'],
  Gold: ['gold', 'golden', 'yellow', 'warm light', 'luxury'],
  Emerald: ['emerald', 'green', 'mint', 'nature', 'cyber green'],
  'Neon Pastel': ['pastel', 'neon pink', 'soft pastel', 'multi-colored'],
  'Dark Gradient': ['dark', 'deep background', 'black background', 'night', 'moody'],
  'Vibrant Multi-Color': ['colorful', 'vibrant', 'multicolor', 'rainbow', 'spectrum'],
};

export const STYLE_OPTIONS = [
  'Abstract',
  'Minimalist',
  '3D Flat',
  'Glowing Neon',
  'Cyberpunk',
  'Corporate',
  'Futuristic',
  'Geometric',
  'Holographic'
];

export const THEME_OPTIONS = [
  'Creative',
  'Technology',
  'Finance & Business',
  'Education & Science',
  'Fantasy & Magic',
  'Celebration',
  'Medical'
];

export const MOTION_OPTIONS = [
  'Seamless Loop',
  'Floating',
  'Pulsing',
  'Exploding',
  'Cascade',
  'Morphing',
  'Orbiting'
];

export const COLOR_OPTIONS = [
  'Violet',
  'Cyan',
  'Gold',
  'Emerald',
  'Neon Pastel',
  'Dark Gradient',
  'Vibrant Multi-Color'
];

/**
 * Generates SEO-ready microstock metadata matching Shutterstock and Adobe Stock conventions.
 */
export function generateMicrostockMetadata(
  subject: string,
  style: string,
  color: string,
  motion: string,
  theme: string
): MicrostockMetadata {
  const subj = subject.trim() || 'Abstract Shape';
  
  // Title pattern: [Style] [Subject] with [Motion] in [Color] Tones - [Theme] Motion Background Loop
  const title = `${style} ${subj} with ${motion} in ${color} Tones - ${theme} Motion Background Loop`;

  // Contextual SEO Description
  const description = `High quality ${style.toLowerCase()} animation featuring ${subj.toLowerCase()} with smooth ${motion.toLowerCase()} motion dynamics. Rendered in vivid ${color.toLowerCase()} palette, ideal for ${theme.toLowerCase()} video productions, commercial broadcast, UI overlays, presentations, and social media creative background loops.`;

  // Aggregate keywords
  const keywordSet = new Set<string>();

  // Add individual words from subject
  const subjectWords = subj.toLowerCase().split(/\s+/).map(w => w.replace(/[^a-z0-9]/gi, '')).filter(w => w.length > 2);
  subjectWords.forEach(w => keywordSet.add(w));
  keywordSet.add(subj.toLowerCase());

  // Add base keywords
  BASE_STOCK_KEYWORDS.forEach(k => keywordSet.add(k));

  // Add style keywords
  if (STYLE_KEYWORDS[style]) {
    STYLE_KEYWORDS[style].forEach(k => keywordSet.add(k));
  }

  // Add theme keywords
  if (THEME_KEYWORDS[theme]) {
    THEME_KEYWORDS[theme].forEach(k => keywordSet.add(k));
  }

  // Add motion keywords
  if (MOTION_KEYWORDS[motion]) {
    MOTION_KEYWORDS[motion].forEach(k => keywordSet.add(k));
  }

  // Add color keywords
  if (COLOR_KEYWORDS[color]) {
    COLOR_KEYWORDS[color].forEach(k => keywordSet.add(k));
  }

  // Limit strictly to 50 keywords max
  const keywords = Array.from(keywordSet).slice(0, 50);

  return {
    title,
    subject: subj,
    style,
    color,
    motion,
    theme,
    description,
    keywords,
  };
}

/**
 * Helper to download text or json data client-side.
 */
export function downloadFile(content: string, filename: string, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
