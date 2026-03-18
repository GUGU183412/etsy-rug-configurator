/**
 * PCX (PC Paintbrush) File Format Encoder
 * 工厂模式：默认 25 DPI，颜色不超过 12 色，包含边缘实化处理
 */

import type {
  PCXEncodeOptions,
  PCXEncodeReport,
  PCXExportResult,
} from './types';

type RGB = [number, number, number];

interface QuantizedImage {
  indices: Uint8Array;
  palette: RGB[];
  sourceColorCount: number;
  outputColorCount: number;
}

interface HistogramBucket {
  count: number;
  sumR: number;
  sumG: number;
  sumB: number;
}

/**
 * PCX 格式常量
 */
const PCX_SIGNATURE = 0x0a;
const PCX_VERSION = 5;
const PCX_ENCODING_RLE = 1;
const PCX_BITS_PER_PIXEL = 8;
const PCX_PLANES = 1;
const PCX_PALETTE_TYPE = 1;
const HEADER_SIZE = 128;
const PALETTE_SIZE_256 = 768;
const PALETTE_SIGNATURE = 0x0c;

/**
 * PCX 编码器类
 */
export class PCXEncoder {
  private width: number;
  private height: number;
  private imageData: Uint8ClampedArray;
  private options: Required<PCXEncodeOptions>;
  private lastReport: PCXEncodeReport | null = null;

  constructor(
    width: number,
    height: number,
    imageData: Uint8ClampedArray,
    options: PCXEncodeOptions = {}
  ) {
    this.width = width;
    this.height = height;
    this.imageData = imageData;
    this.options = {
      hDpi: options.hDpi ?? 25,
      vDpi: options.vDpi ?? 25,
      useRLE: options.useRLE ?? true,
      maxColors: Math.max(1, Math.min(options.maxColors ?? 12, 256)),
      alphaThreshold: Math.max(0, Math.min(options.alphaThreshold ?? 112, 255)),
      solidifyEdges: options.solidifyEdges ?? true,
      matteColor: options.matteColor ?? [255, 255, 255],
    };
  }

  /**
   * 获取最近一次编码报告
   */
  getLastReport(): PCXEncodeReport | null {
    return this.lastReport;
  }

  /**
   * 编码为 PCX 文件 Blob
   */
  encode(): Blob {
    const quantized = this.quantizeImage();
    const header = this.createHeader();
    const encodedData = this.encodeIndexedData(quantized.indices);
    const palette = this.createPalette(quantized.palette);

    const totalSize = HEADER_SIZE + encodedData.length + 1 + PALETTE_SIZE_256;
    const buffer = new Uint8Array(totalSize);

    let offset = 0;
    buffer.set(header, offset);
    offset += HEADER_SIZE;

    buffer.set(encodedData, offset);
    offset += encodedData.length;

    buffer[offset++] = PALETTE_SIGNATURE;
    buffer.set(palette, offset);

    this.lastReport = {
      sourceColorCount: quantized.sourceColorCount,
      outputColorCount: quantized.outputColorCount,
      maxColors: this.options.maxColors,
      width: this.width,
      height: this.height,
      dpi: {
        h: this.options.hDpi,
        v: this.options.vDpi,
      },
    };

    return new Blob([buffer], { type: 'image/x-pcx' });
  }

  /**
   * 创建 PCX 文件头
   */
  private createHeader(): Uint8Array {
    const header = new Uint8Array(HEADER_SIZE);
    const bytesPerLine = Math.ceil(this.width / 2) * 2;
    let offset = 0;

    const write16LE = (value: number) => {
      header[offset++] = value & 0xff;
      header[offset++] = (value >> 8) & 0xff;
    };

    header[offset++] = PCX_SIGNATURE;
    header[offset++] = PCX_VERSION;
    header[offset++] = this.options.useRLE ? PCX_ENCODING_RLE : 0;
    header[offset++] = PCX_BITS_PER_PIXEL;

    write16LE(0);
    write16LE(0);
    write16LE(this.width - 1);
    write16LE(this.height - 1);

    write16LE(this.options.hDpi);
    write16LE(this.options.vDpi);

    for (let i = 0; i < 48; i++) {
      header[offset++] = 0;
    }

    header[offset++] = 0;
    header[offset++] = PCX_PLANES;

    write16LE(bytesPerLine);
    write16LE(PCX_PALETTE_TYPE);

    return header;
  }

  /**
   * 量化图像到限制调色板
   */
  private quantizeImage(): QuantizedImage {
    const pixelCount = this.width * this.height;
    const rgb = new Uint8Array(pixelCount * 3);
    const alpha = new Uint8Array(pixelCount);

    const matteR = this.options.matteColor[0];
    const matteG = this.options.matteColor[1];
    const matteB = this.options.matteColor[2];

    for (let i = 0; i < pixelCount; i++) {
      const src = i * 4;
      const dst = i * 3;

      const sourceR = this.imageData[src];
      const sourceG = this.imageData[src + 1];
      const sourceB = this.imageData[src + 2];
      const sourceA = this.imageData[src + 3];

      alpha[i] = sourceA;

      if (sourceA < this.options.alphaThreshold) {
        rgb[dst] = matteR;
        rgb[dst + 1] = matteG;
        rgb[dst + 2] = matteB;
        continue;
      }

      if (sourceA < 255) {
        const opacity = sourceA / 255;
        rgb[dst] = Math.round(sourceR * opacity + matteR * (1 - opacity));
        rgb[dst + 1] = Math.round(sourceG * opacity + matteG * (1 - opacity));
        rgb[dst + 2] = Math.round(sourceB * opacity + matteB * (1 - opacity));
        continue;
      }

      rgb[dst] = sourceR;
      rgb[dst + 1] = sourceG;
      rgb[dst + 2] = sourceB;
    }

    if (this.options.solidifyEdges) {
      this.solidifyEdges(rgb, alpha);
    }

    const histogram = new Map<number, HistogramBucket>();
    for (let i = 0; i < pixelCount; i++) {
      const idx = i * 3;
      const red = rgb[idx];
      const green = rgb[idx + 1];
      const blue = rgb[idx + 2];

      const key = ((red >> 3) << 10) | ((green >> 3) << 5) | (blue >> 3);
      const bucket = histogram.get(key);
      if (bucket) {
        bucket.count += 1;
        bucket.sumR += red;
        bucket.sumG += green;
        bucket.sumB += blue;
      } else {
        histogram.set(key, {
          count: 1,
          sumR: red,
          sumG: green,
          sumB: blue,
        });
      }
    }

    const sourceColorCount = histogram.size;
    const buckets = Array.from(histogram.values())
      .map((bucket): { color: RGB; count: number } => ({
        color: [
          Math.round(bucket.sumR / bucket.count),
          Math.round(bucket.sumG / bucket.count),
          Math.round(bucket.sumB / bucket.count),
        ],
        count: bucket.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, this.options.maxColors);

    const palette: RGB[] = buckets.map((item) => item.color);
    if (palette.length === 0) {
      palette.push([matteR, matteG, matteB]);
    }

    const indices = new Uint8Array(pixelCount);
    const paletteUsage = new Set<number>();

    for (let i = 0; i < pixelCount; i++) {
      const idx = i * 3;
      const bestIndex = this.findNearestPaletteIndex(
        rgb[idx],
        rgb[idx + 1],
        rgb[idx + 2],
        palette
      );
      indices[i] = bestIndex;
      paletteUsage.add(bestIndex);
    }

    return {
      indices,
      palette,
      sourceColorCount,
      outputColorCount: paletteUsage.size,
    };
  }

  /**
   * 实化半透明边缘，减少 LOGO 导出后的发虚感
   */
  private solidifyEdges(rgb: Uint8Array, alpha: Uint8Array): void {
    const pixelCount = this.width * this.height;
    const opaque = new Uint8Array(pixelCount);
    for (let i = 0; i < pixelCount; i++) {
      opaque[i] = alpha[i] >= this.options.alphaThreshold ? 1 : 0;
    }

    const output = rgb.slice();
    const directions = [
      [-1, -1],
      [0, -1],
      [1, -1],
      [-1, 0],
      [1, 0],
      [-1, 1],
      [0, 1],
      [1, 1],
    ];

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const index = y * this.width + x;
        if (opaque[index] === 1) {
          continue;
        }

        let neighborCount = 0;
        let sumR = 0;
        let sumG = 0;
        let sumB = 0;

        for (const [dx, dy] of directions) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= this.width || ny >= this.height) {
            continue;
          }

          const neighbor = ny * this.width + nx;
          if (opaque[neighbor] === 1) {
            const rgbIndex = neighbor * 3;
            sumR += rgb[rgbIndex];
            sumG += rgb[rgbIndex + 1];
            sumB += rgb[rgbIndex + 2];
            neighborCount += 1;
          }
        }

        if (neighborCount >= 5) {
          const rgbIndex = index * 3;
          output[rgbIndex] = Math.round(sumR / neighborCount);
          output[rgbIndex + 1] = Math.round(sumG / neighborCount);
          output[rgbIndex + 2] = Math.round(sumB / neighborCount);
        }
      }
    }

    rgb.set(output);
  }

  private findNearestPaletteIndex(
    red: number,
    green: number,
    blue: number,
    palette: RGB[]
  ): number {
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let i = 0; i < palette.length; i++) {
      const [paletteR, paletteG, paletteB] = palette[i];
      const dr = red - paletteR;
      const dg = green - paletteG;
      const db = blue - paletteB;
      const distance = dr * dr + dg * dg + db * db;
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i;
      }
    }

    return bestIndex;
  }

  /**
   * 编码图像索引数据（使用 RLE 压缩）
   */
  private encodeIndexedData(indexedPixels: Uint8Array): Uint8Array {
    const bytesPerLine = Math.ceil(this.width / 2) * 2;
    const output: number[] = [];

    for (let y = 0; y < this.height; y++) {
      const rowStart = y * this.width;
      const rowData: number[] = [];

      for (let x = 0; x < this.width; x++) {
        rowData.push(indexedPixels[rowStart + x]);
      }

      while (rowData.length < bytesPerLine) {
        rowData.push(0);
      }

      if (this.options.useRLE) {
        this.rleEncodeRow(rowData, output);
      } else {
        output.push(...rowData);
      }
    }

    return new Uint8Array(output);
  }

  /**
   * RLE 编码一行数据
   */
  private rleEncodeRow(rowData: number[], output: number[]): void {
    let i = 0;
    while (i < rowData.length) {
      const value = rowData[i];
      let count = 1;

      while (i + count < rowData.length && rowData[i + count] === value && count < 63) {
        count += 1;
      }

      if (count > 1 || value >= 0xc0) {
        output.push(0xc0 | count);
        output.push(value);
      } else {
        output.push(value);
      }

      i += count;
    }
  }

  /**
   * 创建 256 色调色板（前 N 色为实际色，剩余填充为首色）
   */
  private createPalette(colors: RGB[]): Uint8Array {
    const palette = new Uint8Array(PALETTE_SIZE_256);
    const fallback = colors[0] || [0, 0, 0];

    for (let i = 0; i < 256; i++) {
      const color = i < colors.length ? colors[i] : fallback;
      palette[i * 3] = color[0];
      palette[i * 3 + 1] = color[1];
      palette[i * 3 + 2] = color[2];
    }

    return palette;
  }
}

/**
 * 从 Canvas 创建 PCX 编码器
 */
export function createPCXEncoder(
  canvas: HTMLCanvasElement,
  options?: PCXEncodeOptions
): PCXEncoder {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Failed to get 2D context from canvas');
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return new PCXEncoder(canvas.width, canvas.height, imageData.data, options);
}

/**
 * 将 Canvas 导出为 PCX Blob（兼容旧接口）
 */
export async function exportCanvasToPCX(
  canvas: HTMLCanvasElement,
  options?: PCXEncodeOptions
): Promise<Blob> {
  const result = await exportCanvasToPCXWithReport(canvas, options);
  return result.blob;
}

/**
 * 将 Canvas 导出为 PCX（带导出报告）
 */
export async function exportCanvasToPCXWithReport(
  canvas: HTMLCanvasElement,
  options?: PCXEncodeOptions
): Promise<PCXExportResult> {
  const encoder = createPCXEncoder(canvas, options);
  const blob = encoder.encode();
  const report = encoder.getLastReport();
  if (!report) {
    throw new Error('Failed to generate PCX encode report');
  }

  return { blob, report };
}

/**
 * 触发 PCX 文件下载
 */
export function downloadPCX(blob: Blob, filename: string = 'rug-design.pcx'): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
