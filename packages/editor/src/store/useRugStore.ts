/**
 * 地毯配置状态管理
 */

import { create } from 'zustand';
import type {
  RugConfig,
  TextElement,
  RuntimeConfig,
  SizeSpec,
} from '@shared/types';
import {
  DEFAULT_PRODUCTION_SPEC,
  createCalculatedSize,
  getDefaultSize,
  clampToBounds,
} from '@shared/production';
import { CONFIG_VERSION } from '@shared/types';

const MEASURE_CANVAS =
  typeof document !== 'undefined' ? document.createElement('canvas') : null;

function estimateTextSize(
  text: Pick<TextElement, 'content' | 'font' | 'size' | 'letterSpacing'>
) {
  if (MEASURE_CANVAS) {
    const ctx = MEASURE_CANVAS.getContext('2d');
    if (ctx) {
      ctx.font = `${text.size}px ${text.font}`;
      const letterSpacing = text.letterSpacing || 0;
      const baseWidth = ctx.measureText(text.content).width;
      const totalWidth =
        text.content.length > 1
          ? baseWidth + letterSpacing * (text.content.length - 1)
          : baseWidth;
      return {
        width: Math.max(1, totalWidth),
        height: Math.max(1, text.size),
      };
    }
  }

  const letterSpacing = text.letterSpacing || 0;
  return {
    width: Math.max(
      1,
      text.content.length * text.size * 0.55 +
        Math.max(0, text.content.length - 1) * letterSpacing
    ),
    height: Math.max(1, text.size),
  };
}

function getEditorSafetyMargin(config: RugConfig): number {
  const ratio = config.production.exportDPI / config.production.weaveDPI;
  return Math.max(1, Math.round(config.size.safetyMarginPx / ratio));
}

function clampTextPosition(config: RugConfig, text: TextElement) {
  const textSize = estimateTextSize(text);
  const margin = getEditorSafetyMargin(config);
  return clampToBounds(
    text.position,
    textSize,
    config.size.pixels25dpi,
    margin
  );
}

/**
 * 状态接口
 */
interface RugState {
  config: RugConfig;
  selectedTextId: string | null;
  showSafetyBoundary: boolean;
  boundaryWarning: string | null;

  initializeFromRuntime: (runtimeConfig: RuntimeConfig) => void;
  setSize: (size: SizeSpec) => void;
  setPattern: (patternId: string) => void;
  setPatternScale: (scale: number) => void;
  setPatternPosition: (position: { x: number; y: number }) => void;
  setBackgroundColor: (color: string) => void;
  setPrimaryColor: (color: string) => void;
  setSecondaryColor: (color?: string) => void;

  addText: (text: Omit<TextElement, 'id'>) => void;
  updateText: (id: string, updates: Partial<TextElement>) => void;
  deleteText: (id: string) => void;
  selectText: (id: string | null) => void;

  toggleSafetyBoundary: () => void;
  clearBoundaryWarning: () => void;

  reset: () => void;
  setConfig: (config: RugConfig) => void;
}

function createDefaultConfig(): RugConfig {
  const size = getDefaultSize();

  return {
    version: CONFIG_VERSION,
    size,
    production: DEFAULT_PRODUCTION_SPEC,
    pattern: {
      id: '',
      scale: 1,
      position: { x: 0, y: 0 },
    },
    colors: {
      background: '#F7F2E8',
      primary: '#1A1A1A',
      secondary: '#9EA4A3',
    },
    texts: [],
    createdAt: Date.now(),
  };
}

export const useRugStore = create<RugState>((set) => ({
  config: createDefaultConfig(),
  selectedTextId: null,
  showSafetyBoundary: true,
  boundaryWarning: null,

  initializeFromRuntime: (runtimeConfig: RuntimeConfig) => {
    set((state) => {
      const defaultSize = runtimeConfig.sizes[0] || {
        id: '49x56',
        name: '49 x 56 cm',
        width: 49,
        height: 56,
      };
      const calculatedSize = createCalculatedSize(defaultSize, state.config.production);
      const defaultPattern = runtimeConfig.patterns[0]?.id || '';
      const defaultScheme = runtimeConfig.colorSchemes[0];

      return {
        config: {
          ...state.config,
          size: calculatedSize,
          pattern: {
            ...state.config.pattern,
            id: defaultPattern,
          },
          colors: defaultScheme
            ? {
                background: defaultScheme.background,
                primary: defaultScheme.primary,
                secondary: defaultScheme.secondary,
              }
            : state.config.colors,
        },
      };
    });
  },

  setSize: (size: SizeSpec) => {
    set((state) => {
      const calculatedSize = createCalculatedSize(size, state.config.production);
      const configWithSize: RugConfig = {
        ...state.config,
        size: calculatedSize,
      };

      const clampedTexts = configWithSize.texts.map((text) => ({
        ...text,
        position: clampTextPosition(configWithSize, text),
      }));

      return {
        config: {
          ...configWithSize,
          texts: clampedTexts,
        },
      };
    });
  },

  setPattern: (patternId: string) => {
    set((state) => ({
      config: {
        ...state.config,
        pattern: {
          ...state.config.pattern,
          id: patternId,
        },
      },
    }));
  },

  setPatternScale: (scale: number) => {
    set((state) => ({
      config: {
        ...state.config,
        pattern: {
          ...state.config.pattern,
          scale: Math.max(0.5, Math.min(scale, 3)),
        },
      },
    }));
  },

  setPatternPosition: (position: { x: number; y: number }) => {
    set((state) => ({
      config: {
        ...state.config,
        pattern: {
          ...state.config.pattern,
          position,
        },
      },
    }));
  },

  setBackgroundColor: (color: string) => {
    set((state) => ({
      config: {
        ...state.config,
        colors: {
          ...state.config.colors,
          background: color,
        },
      },
    }));
  },

  setPrimaryColor: (color: string) => {
    set((state) => ({
      config: {
        ...state.config,
        colors: {
          ...state.config.colors,
          primary: color,
        },
      },
    }));
  },

  setSecondaryColor: (color?: string) => {
    set((state) => ({
      config: {
        ...state.config,
        colors: {
          ...state.config.colors,
          secondary: color,
        },
      },
    }));
  },

  addText: (text: Omit<TextElement, 'id'>) => {
    set((state) => {
      const nextText: TextElement = {
        ...text,
        id: `text-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      };
      const clampedPosition = clampTextPosition(state.config, nextText);

      return {
        config: {
          ...state.config,
          texts: [
            ...state.config.texts,
            {
              ...nextText,
              position: clampedPosition,
            },
          ],
        },
        selectedTextId: nextText.id,
      };
    });
  },

  updateText: (id: string, updates: Partial<TextElement>) => {
    set((state) => {
      let didClamp = false;

      const nextTexts = state.config.texts.map((text) => {
        if (text.id !== id) {
          return text;
        }

        const merged: TextElement = {
          ...text,
          ...updates,
          position: {
            ...text.position,
            ...updates.position,
          },
        };

        const clampedPosition = clampTextPosition(state.config, merged);
        if (
          clampedPosition.x !== merged.position.x ||
          clampedPosition.y !== merged.position.y
        ) {
          didClamp = true;
        }

        return {
          ...merged,
          position: clampedPosition,
        };
      });

      return {
        config: {
          ...state.config,
          texts: nextTexts,
        },
        boundaryWarning: didClamp
          ? '对象已限制在 2cm 安全边界内，越界位置被自动修正。'
          : state.boundaryWarning,
      };
    });
  },

  deleteText: (id: string) => {
    set((state) => ({
      config: {
        ...state.config,
        texts: state.config.texts.filter((text) => text.id !== id),
      },
      selectedTextId:
        state.selectedTextId === id ? null : state.selectedTextId,
    }));
  },

  selectText: (id: string | null) => {
    set({ selectedTextId: id });
  },

  toggleSafetyBoundary: () => {
    set((state) => ({
      showSafetyBoundary: !state.showSafetyBoundary,
    }));
  },

  clearBoundaryWarning: () => {
    set({ boundaryWarning: null });
  },

  reset: () => {
    set({
      config: createDefaultConfig(),
      selectedTextId: null,
      boundaryWarning: null,
    });
  },

  setConfig: (config: RugConfig) => {
    set({
      config,
      selectedTextId: null,
      boundaryWarning: null,
    });
  },
}));
