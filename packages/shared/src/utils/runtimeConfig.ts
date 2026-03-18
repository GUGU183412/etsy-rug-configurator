import type { RuntimeConfig } from '../types';

export const FALLBACK_RUNTIME_CONFIG: RuntimeConfig = {
  version: '1.0.0',
  patterns: [
    {
      id: 'geometric-01',
      name: '几何交织',
      style: 'geometric',
      thumbnail: '/patterns/geometric-01-thumb.png',
      src: '/patterns/geometric-01.png',
      tileable: true,
    },
  ],
  colorOptions: [
    { id: 'ivory', name: '象牙白', value: '#F7F2E8' },
    { id: 'charcoal', name: '炭黑', value: '#1A1A1A' },
    { id: 'gold', name: '浅金', value: '#D8AA5A' },
  ],
  colorSchemes: [
    {
      id: 'classic',
      name: '经典黑白',
      background: '#F7F2E8',
      primary: '#1A1A1A',
      secondary: '#9EA4A3',
    },
  ],
  fonts: [
    {
      id: 'playfair',
      name: 'Playfair Display',
      value: "'Playfair Display', serif",
    },
    {
      id: 'montserrat',
      name: 'Montserrat',
      value: "'Montserrat', sans-serif",
    },
  ],
  sizes: [{ id: '49x56', name: '49 x 56 cm', width: 49, height: 56 }],
};

function normalizeRuntimeConfig(raw: unknown): RuntimeConfig | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const parsed = raw as Partial<RuntimeConfig>;
  if (
    !Array.isArray(parsed.patterns) ||
    !Array.isArray(parsed.colorOptions) ||
    !Array.isArray(parsed.colorSchemes) ||
    !Array.isArray(parsed.fonts) ||
    !Array.isArray(parsed.sizes)
  ) {
    return null;
  }

  return {
    version: typeof parsed.version === 'string' ? parsed.version : '1.0.0',
    patterns: parsed.patterns,
    colorOptions: parsed.colorOptions,
    colorSchemes: parsed.colorSchemes,
    fonts: parsed.fonts,
    sizes: parsed.sizes,
  };
}

export async function loadRuntimeConfig(
  configPath: string = 'config.json'
): Promise<RuntimeConfig> {
  try {
    const response = await fetch(configPath, { cache: 'no-store' });
    if (!response.ok) {
      return FALLBACK_RUNTIME_CONFIG;
    }

    const raw = await response.json();
    const normalized = normalizeRuntimeConfig(raw);
    return normalized || FALLBACK_RUNTIME_CONFIG;
  } catch {
    return FALLBACK_RUNTIME_CONFIG;
  }
}
