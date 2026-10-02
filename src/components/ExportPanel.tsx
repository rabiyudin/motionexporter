import React, { useState } from 'react';
import { 
  Settings, 
  Layers, 
  Tag, 
  AlertTriangle, 
  Check, 
  Copy, 
  Download, 
  Plus, 
  X, 
  HelpCircle,
  FileText,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  ExportSettings, 
  ResolutionPresetKey, 
  BackgroundMode, 
  PreviewQuality,
  MicrostockPlatform,
  MicrostockMetadata 
} from '../types';
import { 
  RESOLUTION_PRESETS, 
  FPS_OPTIONS, 
  DURATION_OPTIONS, 
  MICROSTOCK_GUIDES 
} from '../constants/presets';
import { 
  generateMicrostockMetadata, 
  downloadFile,
  STYLE_OPTIONS,
  THEME_OPTIONS,
  MOTION_OPTIONS,
  COLOR_OPTIONS 
} from '../services/metadataGenerator';
import { getSupportedVideoMimeType, generateStockFilename } from '../services/videoExporter';

interface ExportPanelProps {
  settings: ExportSettings;
  onUpdateSettings: (newSettings: Partial<ExportSettings>) => void;
  metadata: MicrostockMetadata;
  onUpdateMetadata: (metadata: MicrostockMetadata) => void;
  onStartExport: () => void;
  isExporting: boolean;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  settings,
  onUpdateSettings,
  metadata,
  onUpdateMetadata,
  onStartExport,
  isExporting,
}) => {
  const [activeTab, setActiveTab] = useState<'video' | 'microstock' | 'metadata'>('video');
  const [newTagInput, setNewTagInput] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { codecLabel, isMp4, extension } = getSupportedVideoMimeType();
  const pixelCount = settings.width * settings.height;
  const is4K = pixelCount >= 3840 * 2160;

  const currentPreset = RESOLUTION_PRESETS.find((p) => p.id === settings.presetKey);
  const currentGuide = MICROSTOCK_GUIDES[settings.platformPreset];

  const handlePresetChange = (presetKey: ResolutionPresetKey) => {
    const found = RESOLUTION_PRESETS.find((p) => p.id === presetKey);
    if (found && presetKey !== 'custom') {
      onUpdateSettings({
        presetKey,
        width: found.width,
        height: found.height,
      });
    } else {
      onUpdateSettings({ presetKey });
    }
  };

  const handleApplyMicrostockPreset = (platform: MicrostockPlatform) => {
    onUpdateSettings({
      platformPreset: platform,
      presetKey: 'landscape_hd',
      width: 1920,
      height: 1080,
      fps: 30,
      duration: platform === 'shutterstock' ? 5 : 6,
      loop: true,
      backgroundMode: 'transparent',
    });
  };

  const handleGenerateMetadata = () => {
    const generated = generateMicrostockMetadata(
      metadata.subject,
      metadata.style,
      metadata.color,
      metadata.motion,
      metadata.theme
    );
    onUpdateMetadata(generated);
  };

  const handleAddKeyword = () => {
    const trimmed = newTagInput.trim().toLowerCase();
    if (!trimmed) return;
    if (metadata.keywords.length >= 50) {
      alert('Maximum of 50 keywords reached for stock agency submission.');
      return;
    }
    if (!metadata.keywords.includes(trimmed)) {
      onUpdateMetadata({
        ...metadata,
        keywords: [...metadata.keywords, trimmed],
      });
    }
    setNewTagInput('');
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    onUpdateMetadata({
      ...metadata,
      keywords: metadata.keywords.filter((k) => k !== keywordToRemove),
    });
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadMetadataTxt = () => {
    const content = `TITLE:
${metadata.title}

DESCRIPTION:
${metadata.description}

KEYWORDS (${metadata.keywords.length} tags):
${metadata.keywords.join(', ')}

TECHNICAL SPECS:
Resolution: ${settings.width}x${settings.height}
FPS: ${settings.fps}
Duration: ${settings.duration}s
Loop: ${settings.loop ? 'Yes (Seamless)' : 'No'}
Background: ${settings.backgroundMode}
`;
    const filename = `${metadata.subject || 'motion-asset'}-metadata.txt`;
    downloadFile(content, filename, 'text/plain');
  };

  const handleDownloadMetadataJson = () => {
    const payload = {
      assetTitle: metadata.title,
      description: metadata.description,
      keywords: metadata.keywords,
      keywordCount: metadata.keywords.length,
      specs: {
        width: settings.width,
        height: settings.height,
        fps: settings.fps,
        duration: settings.duration,
        loop: settings.loop,
        background: settings.backgroundMode,
      },
    };
    const filename = `${metadata.subject || 'motion-asset'}-metadata.json`;
    downloadFile(JSON.stringify(payload, null, 2), filename, 'application/json');
  };

  const currentFilename = generateStockFilename(
    metadata.subject,
    metadata.style,
    metadata.motion,
    settings.width,
    settings.height,
    settings.fps,
    extension
  );

  return (
    <div className="h-full flex flex-col bg-[#0e111a] border-l border-zinc-800/80 overflow-hidden select-none">
      {/* Right Panel Tabs */}
      <div className="h-11 border-b border-zinc-800/80 bg-[#121622] px-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1 w-full">
          <button
            onClick={() => setActiveTab('video')}
            className={`flex-1 py-1.5 px-2 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'video'
                ? 'bg-zinc-800 text-indigo-300 font-semibold border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Video</span>
          </button>

          <button
            onClick={() => setActiveTab('microstock')}
            className={`flex-1 py-1.5 px-2 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'microstock'
                ? 'bg-zinc-800 text-indigo-300 font-semibold border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Presets</span>
          </button>

          <button
            onClick={() => setActiveTab('metadata')}
            className={`flex-1 py-1.5 px-2 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'metadata'
                ? 'bg-zinc-800 text-indigo-300 font-semibold border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Metadata</span>
            <span className="text-[10px] px-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
              {metadata.keywords.length}
            </span>
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-zinc-300">
        {/* TAB 1: VIDEO SETTINGS */}
        {activeTab === 'video' && (
          <div className="space-y-4">
            {/* 4K Memory Warning */}
            {is4K && (
              <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-md text-amber-200 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-amber-300">4K Resolution Selected</div>
                  <div className="text-[11px] text-amber-200/80 mt-0.5 leading-relaxed">
                    4K rendering requires more memory and may be slower on this device. Balanced or Performance preview quality is recommended.
                  </div>
                </div>
              </div>
            )}

            {/* Resolution Preset */}
            <div>
              <label className="block text-zinc-400 font-medium mb-1.5">Resolution Preset</label>
              <select
                value={settings.presetKey}
                onChange={(e) => handlePresetChange(e.target.value as ResolutionPresetKey)}
                className="w-full bg-[#121622] border border-zinc-700/80 rounded px-2.5 py-1.5 text-zinc-100 outline-none focus:border-indigo-500"
              >
                {RESOLUTION_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label} ({preset.width} × {preset.height}) - {preset.aspectRatio}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Dimensions */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-zinc-400 text-[11px] mb-1">Width (px)</label>
                <input
                  type="number"
                  min="200"
                  max="4096"
                  step="2"
                  value={settings.width}
                  onChange={(e) => {
                    onUpdateSettings({
                      width: parseInt(e.target.value, 10) || 1920,
                      presetKey: 'custom',
                    });
                  }}
                  className="w-full bg-[#121622] border border-zinc-700/80 rounded px-2.5 py-1.5 text-zinc-100 font-mono outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-[11px] mb-1">Height (px)</label>
                <input
                  type="number"
                  min="200"
                  max="4096"
                  step="2"
                  value={settings.height}
                  onChange={(e) => {
                    onUpdateSettings({
                      height: parseInt(e.target.value, 10) || 1080,
                      presetKey: 'custom',
                    });
                  }}
                  className="w-full bg-[#121622] border border-zinc-700/80 rounded px-2.5 py-1.5 text-zinc-100 font-mono outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* FPS and Duration */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-zinc-400 font-medium mb-1.5">FPS (Frame Rate)</label>
                <select
                  value={settings.fps}
                  onChange={(e) => onUpdateSettings({ fps: parseInt(e.target.value, 10) })}
                  className="w-full bg-[#121622] border border-zinc-700/80 rounded px-2.5 py-1.5 text-zinc-100 font-mono outline-none focus:border-indigo-500"
                >
                  {FPS_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f} FPS
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1.5">Duration</label>
                <select
                  value={settings.duration}
                  onChange={(e) => onUpdateSettings({ duration: parseFloat(e.target.value) })}
                  className="w-full bg-[#121622] border border-zinc-700/80 rounded px-2.5 py-1.5 text-zinc-100 font-mono outline-none focus:border-indigo-500"
                >
                  {DURATION_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d} sec ({d * settings.fps} frames)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Loop Toggle */}
            <div className="flex items-center justify-between p-2.5 bg-[#121622] rounded border border-zinc-800">
              <div>
                <div className="font-medium text-zinc-200">Seamless Loop</div>
                <div className="text-[11px] text-zinc-500">Restart animation at 0s when end is reached</div>
              </div>
              <button
                onClick={() => onUpdateSettings({ loop: !settings.loop })}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                  settings.loop ? 'bg-indigo-600' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    settings.loop ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Background Mode */}
            <div>
              <label className="block text-zinc-400 font-medium mb-1.5">Canvas Background</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['transparent', 'black', 'white', 'custom'] as BackgroundMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => onUpdateSettings({ backgroundMode: mode })}
                    className={`p-2 rounded text-left border flex items-center justify-between transition-colors ${
                      settings.backgroundMode === mode
                        ? 'bg-indigo-950/40 border-indigo-500 text-indigo-200'
                        : 'bg-[#121622] border-zinc-800 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <span className="capitalize">{mode}</span>
                    {settings.backgroundMode === mode && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                ))}
              </div>

              {settings.backgroundMode === 'custom' && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.backgroundColor}
                    onChange={(e) => onUpdateSettings({ backgroundColor: e.target.value })}
                    className="w-8 h-8 rounded bg-transparent cursor-pointer border border-zinc-700"
                  />
                  <input
                    type="text"
                    value={settings.backgroundColor}
                    onChange={(e) => onUpdateSettings({ backgroundColor: e.target.value })}
                    placeholder="#111422"
                    className="flex-1 bg-[#121622] border border-zinc-700 rounded px-2.5 py-1 text-zinc-100 font-mono"
                  />
                </div>
              )}
            </div>

            {/* Preview Quality */}
            <div>
              <label className="block text-zinc-400 font-medium mb-1.5">Preview Quality</label>
              <div className="grid grid-cols-3 gap-1 bg-[#121622] p-1 rounded border border-zinc-800">
                {(['performance', 'balanced', 'high'] as PreviewQuality[]).map((q) => (
                  <button
                    key={q}
                    onClick={() => onUpdateSettings({ previewQuality: q })}
                    className={`py-1 rounded text-[11px] capitalize font-medium transition-colors ${
                      settings.previewQuality === q
                        ? 'bg-zinc-800 text-zinc-100 shadow'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Output Filename Preview */}
            <div className="p-2.5 bg-[#121622] rounded border border-zinc-800">
              <div className="text-[11px] text-zinc-400 font-medium mb-1">Target Filename:</div>
              <div className="font-mono text-zinc-200 text-[11px] break-all select-all">
                {currentFilename}
              </div>
            </div>

            {/* Codec Note */}
            <div className="p-2.5 bg-zinc-900/60 rounded border border-zinc-800 text-[11px] text-zinc-400">
              <div className="font-semibold text-zinc-300 mb-0.5">Detected Codec:</div>
              <p className="text-emerald-400 font-mono">{codecLabel}</p>
              {!isMp4 && (
                <p className="mt-1 text-zinc-500">
                  MP4 export is not natively available in this browser. WebM export is enabled.
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MICROSTOCK PRESETS */}
        {activeTab === 'microstock' && (
          <div className="space-y-4">
            <div>
              <label className="block text-zinc-400 font-medium mb-1.5">Microstock Preset</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['generic', 'shutterstock', 'adobestock'] as MicrostockPlatform[]).map((platform) => (
                  <button
                    key={platform}
                    onClick={() => handleApplyMicrostockPreset(platform)}
                    className={`p-2 rounded text-center border capitalize transition-colors ${
                      settings.platformPreset === platform
                        ? 'bg-indigo-950/40 border-indigo-500 text-indigo-200 font-semibold'
                        : 'bg-[#121622] border-zinc-800 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    {platform === 'adobestock' ? 'Adobe Stock' : platform === 'shutterstock' ? 'Shutterstock' : 'Generic'}
                  </button>
                ))}
              </div>
            </div>

            {/* Guidelines Card */}
            <div className="p-3 bg-[#121622] rounded border border-zinc-800 space-y-2.5">
              <div className="font-semibold text-zinc-200 flex items-center justify-between">
                <span>{currentGuide.name}</span>
                <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Suggested Specs
                </span>
              </div>

              <div>
                <div className="text-[11px] text-zinc-500">Recommended Resolutions:</div>
                <div className="text-zinc-300 font-mono text-[11px]">
                  {currentGuide.recommendedResolutions.join(', ')}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-zinc-500">Recommended FPS:</div>
                <div className="text-zinc-300 font-mono text-[11px]">
                  {currentGuide.recommendedFps.join(', ')} fps
                </div>
              </div>

              <div>
                <div className="text-[11px] text-zinc-500">Duration Range:</div>
                <div className="text-zinc-300 text-[11px]">{currentGuide.recommendedDuration}</div>
              </div>

              <div>
                <div className="text-[11px] text-zinc-500 mb-1">Quality Tips:</div>
                <ul className="space-y-1 list-disc list-inside text-[11px] text-zinc-300">
                  {currentGuide.tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Marketplace Disclaimer */}
            <div className="p-3 bg-zinc-900/60 rounded border border-zinc-800 text-[11px] text-zinc-400 flex items-start gap-2">
              <Info className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{currentGuide.disclaimer}</p>
            </div>
          </div>
        )}

        {/* TAB 3: METADATA GENERATOR */}
        {activeTab === 'metadata' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 font-medium">Asset Attributes</span>
              <button
                onClick={handleGenerateMetadata}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>Generate Metadata</span>
              </button>
            </div>

            {/* Input Attributes */}
            <div className="space-y-2">
              <div>
                <label className="block text-zinc-400 text-[11px] mb-1">Subject / Object Name</label>
                <input
                  type="text"
                  value={metadata.subject}
                  onChange={(e) => onUpdateMetadata({ ...metadata, subject: e.target.value })}
                  placeholder="e.g. Magic Wand, Neon Circle, Tech Grid"
                  className="w-full bg-[#121622] border border-zinc-700/80 rounded px-2.5 py-1.5 text-zinc-100 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">Visual Style</label>
                  <select
                    value={metadata.style}
                    onChange={(e) => onUpdateMetadata({ ...metadata, style: e.target.value })}
                    className="w-full bg-[#121622] border border-zinc-700/80 rounded px-2.5 py-1.5 text-zinc-100 outline-none focus:border-indigo-500"
                  >
                    {STYLE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">Dominant Color</label>
                  <select
                    value={metadata.color}
                    onChange={(e) => onUpdateMetadata({ ...metadata, color: e.target.value })}
                    className="w-full bg-[#121622] border border-zinc-700/80 rounded px-2.5 py-1.5 text-zinc-100 outline-none focus:border-indigo-500"
                  >
                    {COLOR_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">Motion Dynamic</label>
                  <select
                    value={metadata.motion}
                    onChange={(e) => onUpdateMetadata({ ...metadata, motion: e.target.value })}
                    className="w-full bg-[#121622] border border-zinc-700/80 rounded px-2.5 py-1.5 text-zinc-100 outline-none focus:border-indigo-500"
                  >
                    {MOTION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 text-[11px] mb-1">Marketplace Theme</label>
                  <select
                    value={metadata.theme}
                    onChange={(e) => onUpdateMetadata({ ...metadata, theme: e.target.value })}
                    className="w-full bg-[#121622] border border-zinc-700/80 rounded px-2.5 py-1.5 text-zinc-100 outline-none focus:border-indigo-500"
                  >
                    {THEME_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Generated Title */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-zinc-400 text-[11px]">Commercial Asset Title</label>
                <button
                  onClick={() => handleCopyText(metadata.title, 'title')}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  {copiedKey === 'title' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              </div>
              <textarea
                rows={2}
                value={metadata.title}
                onChange={(e) => onUpdateMetadata({ ...metadata, title: e.target.value })}
                className="w-full bg-[#121622] border border-zinc-700/80 rounded p-2 text-zinc-200 outline-none focus:border-indigo-500 resize-none text-xs"
              />
            </div>

            {/* Generated Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-zinc-400 text-[11px]">Search Description</label>
                <button
                  onClick={() => handleCopyText(metadata.description, 'description')}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  {copiedKey === 'description' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={metadata.description}
                onChange={(e) => onUpdateMetadata({ ...metadata, description: e.target.value })}
                className="w-full bg-[#121622] border border-zinc-700/80 rounded p-2 text-zinc-200 outline-none focus:border-indigo-500 resize-none text-xs leading-relaxed"
              />
            </div>

            {/* Keywords Section */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-400 text-[11px] font-medium">Keywords</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      metadata.keywords.length <= 50 ? 'text-indigo-300 bg-indigo-500/20' : 'text-rose-400 bg-rose-500/20'
                    }`}
                  >
                    {metadata.keywords.length} / 50
                  </span>
                </div>
                <button
                  onClick={() => handleCopyText(metadata.keywords.join(', '), 'tags')}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  {copiedKey === 'tags' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy Tags</span>
                </button>
              </div>

              {/* Add Custom Tag */}
              <div className="flex items-center gap-1 mb-2">
                <input
                  type="text"
                  placeholder="Add custom keyword..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddKeyword();
                    }
                  }}
                  className="flex-1 bg-[#121622] border border-zinc-700/80 rounded px-2.5 py-1 text-zinc-100 outline-none focus:border-indigo-500 text-xs"
                />
                <button
                  onClick={handleAddKeyword}
                  className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tag Chips */}
              <div className="flex flex-wrap gap-1 max-h-48 overflow-y-auto p-2 bg-[#121622] rounded border border-zinc-800">
                {metadata.keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60"
                  >
                    <span>{kw}</span>
                    <button
                      onClick={() => handleRemoveKeyword(kw)}
                      className="text-zinc-500 hover:text-rose-400 ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Export Metadata Actions */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={handleDownloadMetadataTxt}
                className="py-1.5 px-2 rounded text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center gap-1.5 transition-colors border border-zinc-700"
              >
                <Download className="w-3.5 h-3.5 text-zinc-400" />
                <span>Download TXT</span>
              </button>
              <button
                onClick={handleDownloadMetadataJson}
                className="py-1.5 px-2 rounded text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center gap-1.5 transition-colors border border-zinc-700"
              >
                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                <span>Download JSON</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Primary Export Action Footer */}
      <div className="p-3 border-t border-zinc-800/80 bg-[#121622] shrink-0">
        <button
          onClick={onStartExport}
          disabled={isExporting}
          className="w-full py-2.5 rounded-md font-semibold text-xs text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.99] shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-4 h-4 text-cyan-300" />
          <span>Render & Export Video Asset</span>
        </button>
      </div>
    </div>
  );
};
