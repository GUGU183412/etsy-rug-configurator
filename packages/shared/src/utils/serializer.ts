/**
 * 配置序列化/反序列化工具
 */

import type {
  RugConfig,
  SerializeOptions,
  SerializedConfigPayload,
  SizeSpec,
} from '../types';
import {
  CONFIG_VERSION,
  DEFAULT_PRODUCTION_SPEC,
} from '../types';
import { createCalculatedSize } from '../production';

function encodeBase64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decodeBase64(value: string): string {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function toNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function rebuildSize(
  data: SerializedConfigPayload,
  production: RugConfig['production']
) {
  const sizeSpec: SizeSpec = {
    id: data.s.id,
    name: `${data.s.w} x ${data.s.h} cm`,
    width: data.s.w,
    height: data.s.h,
  };

  return createCalculatedSize(sizeSpec, production);
}

/**
 * 将配置对象序列化为 Base64 编码的字符串
 */
export function serializeConfig(
  config: RugConfig,
  options: SerializeOptions = {}
): string {
  const { compressed = false, includeTimestamp = true } = options;

  const serialized: SerializedConfigPayload = {
    v: config.version || CONFIG_VERSION,
    s: {
      id: config.size.id,
      w: config.size.widthCm,
      h: config.size.heightCm,
    },
    pr: {
      m: config.production.materialType,
      sw: config.production.shrinkage.width,
      sl: config.production.shrinkage.length,
      wd: config.production.weaveDPI,
      ed: config.production.exportDPI,
    },
    p: {
      id: config.pattern.id,
      sc: config.pattern.scale,
      px: config.pattern.position.x,
      py: config.pattern.position.y,
    },
    c: {
      bg: config.colors.background,
      p: config.colors.primary,
      s: config.colors.secondary,
    },
    t: config.texts.map((text) => ({
      id: text.id,
      c: text.content,
      f: text.font,
      sz: text.size,
      col: text.color,
      ls: text.letterSpacing,
      x: text.position.x,
      y: text.position.y,
      r: text.rotation,
    })),
    ts: includeTimestamp ? config.createdAt : undefined,
  };

  const jsonString = compressed
    ? JSON.stringify(serialized)
    : JSON.stringify(serialized, null, 0);

  return encodeBase64(jsonString);
}

/**
 * 将 Base64 编码的字符串反序列化为配置对象
 */
export function deserializeConfig(base64: string): RugConfig | null {
  try {
    const jsonString = decodeBase64(base64.trim());
    const data = JSON.parse(jsonString) as SerializedConfigPayload;

    // 基本验证
    if (
      !data.v ||
      !data.s ||
      !data.p ||
      !data.c ||
      !Array.isArray(data.t) ||
      typeof data.s.id !== 'string'
    ) {
      throw new Error('Invalid config format');
    }

    const production: RugConfig['production'] = {
      materialType: data.pr?.m || DEFAULT_PRODUCTION_SPEC.materialType,
      shrinkage: {
        width: toNumber(
          data.pr?.sw,
          DEFAULT_PRODUCTION_SPEC.shrinkage.width
        ),
        length: toNumber(
          data.pr?.sl,
          DEFAULT_PRODUCTION_SPEC.shrinkage.length
        ),
      },
      weaveDPI: toNumber(data.pr?.wd, DEFAULT_PRODUCTION_SPEC.weaveDPI),
      exportDPI: toNumber(data.pr?.ed, DEFAULT_PRODUCTION_SPEC.exportDPI),
    };

    const size = rebuildSize(data, production);

    return {
      version: data.v,
      size,
      production,
      pattern: {
        id: data.p.id,
        scale: toNumber(data.p.sc, 1),
        position: {
          x: toNumber(data.p.px, 0),
          y: toNumber(data.p.py, 0),
        },
      },
      colors: {
        background: data.c.bg,
        primary: data.c.p,
        secondary: data.c.s,
      },
      texts: data.t.map((text) => ({
        id: String(text.id),
        content: String(text.c ?? ''),
        font: String(text.f ?? 'serif'),
        size: toNumber(text.sz, 24),
        color: String(text.col ?? '#000000'),
        letterSpacing: toNumber(text.ls, 0),
        position: {
          x: toNumber(text.x, 0),
          y: toNumber(text.y, 0),
        },
        rotation: toNumber(text.r, 0),
      })),
      createdAt: data.ts || Date.now(),
    };
  } catch (error) {
    console.error('Failed to deserialize config:', error);
    return null;
  }
}

/**
 * 验证配置代码格式
 */
export function validateConfigCode(code: string): boolean {
  try {
    const decoded = deserializeConfig(code);
    return decoded !== null;
  } catch {
    return false;
  }
}

/**
 * 复制配置代码到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        textArea.remove();
        return true;
      } catch {
        textArea.remove();
        return false;
      }
    }
  } catch {
    return false;
  }
}

/**
 * 从剪贴板读取配置代码
 */
export async function pasteFromClipboard(): Promise<string | null> {
  try {
    if (navigator.clipboard && navigator.clipboard.readText) {
      return await navigator.clipboard.readText();
    }
  } catch {
    return null;
  }
  return null;
}
