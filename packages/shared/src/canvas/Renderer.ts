/**
 * Canvas Renderer for Rug Configurator
 */

import type {
  RugConfig,
  RenderOptions,
  ValidationResult,
  TextElement,
} from '../types';
import { SAFETY_BOUNDARY_STYLE } from './constants';

type DpiMode = RenderOptions['dpiMode'];

/**
 * Canvas 渲染引擎
 */
export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }
    this.ctx = ctx;
  }

  /**
   * 渲染地毯配置到 Canvas
   */
  render(config: RugConfig, options: RenderOptions): void {
    const { dpiMode = 'weave', showSafetyBoundary = false } = options;
    void options.canvas;

    const canvasSize =
      dpiMode === 'weave' ? config.size.pixels25dpi : config.size.pixels300dpi;

    this.canvas.width = canvasSize.width;
    this.canvas.height = canvasSize.height;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.renderBackground(config);
    this.renderPattern(config, dpiMode);
    this.renderTexts(config);

    if (showSafetyBoundary) {
      this.renderSafetyBoundary(config, dpiMode);
    }
  }

  /**
   * 渲染背景
   */
  private renderBackground(config: RugConfig): void {
    this.ctx.fillStyle = config.colors.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * 渲染图案（程序化图案，支持位移与缩放）
   */
  private renderPattern(config: RugConfig, dpiMode: DpiMode): void {
    if (!config.pattern.id) {
      return;
    }

    const margin = this.getSafetyMargin(config, dpiMode);
    const printableX = margin;
    const printableY = margin;
    const printableWidth = this.canvas.width - margin * 2;
    const printableHeight = this.canvas.height - margin * 2;
    if (printableWidth <= 0 || printableHeight <= 0) {
      return;
    }

    const tileSize = Math.max(
      28,
      Math.round(120 * Math.max(0.5, Math.min(config.pattern.scale, 3)))
    );
    const tile = this.buildPatternTile(config, tileSize);
    const pattern = this.ctx.createPattern(tile, 'repeat');
    if (!pattern) {
      return;
    }

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(printableX, printableY, printableWidth, printableHeight);
    this.ctx.clip();

    const offsetX = printableX + config.pattern.position.x;
    const offsetY = printableY + config.pattern.position.y;
    this.ctx.translate(offsetX, offsetY);
    this.ctx.fillStyle = pattern;
    this.ctx.fillRect(-offsetX, -offsetY, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }

  private buildPatternTile(config: RugConfig, tileSize: number): HTMLCanvasElement {
    const tile = document.createElement('canvas');
    tile.width = tileSize;
    tile.height = tileSize;
    const tileCtx = tile.getContext('2d');
    if (!tileCtx) {
      return tile;
    }

    const primary = config.colors.primary;
    const secondary = config.colors.secondary || config.colors.primary;
    const id = config.pattern.id.toLowerCase();

    tileCtx.clearRect(0, 0, tile.width, tile.height);
    tileCtx.fillStyle = 'rgba(0,0,0,0)';
    tileCtx.fillRect(0, 0, tile.width, tile.height);

    if (id.includes('stripe')) {
      this.drawStripeTile(tileCtx, tileSize, primary, secondary);
    } else if (id.includes('dot')) {
      this.drawDotTile(tileCtx, tileSize, primary, secondary);
    } else if (id.includes('floral')) {
      this.drawFloralTile(tileCtx, tileSize, primary, secondary);
    } else if (id.includes('abstract')) {
      this.drawAbstractTile(tileCtx, tileSize, primary, secondary);
    } else if (id.includes('geometric-02')) {
      this.drawChevronTile(tileCtx, tileSize, primary, secondary);
    } else {
      this.drawGeometricTile(tileCtx, tileSize, primary, secondary);
    }

    return tile;
  }

  private drawGeometricTile(
    tileCtx: CanvasRenderingContext2D,
    size: number,
    primary: string,
    secondary: string
  ): void {
    tileCtx.strokeStyle = primary;
    tileCtx.lineWidth = Math.max(2, Math.round(size * 0.04));
    tileCtx.beginPath();
    tileCtx.moveTo(0, 0);
    tileCtx.lineTo(size, size);
    tileCtx.moveTo(size, 0);
    tileCtx.lineTo(0, size);
    tileCtx.stroke();

    tileCtx.fillStyle = secondary;
    tileCtx.beginPath();
    tileCtx.arc(size * 0.5, size * 0.5, size * 0.12, 0, Math.PI * 2);
    tileCtx.fill();
  }

  private drawChevronTile(
    tileCtx: CanvasRenderingContext2D,
    size: number,
    primary: string,
    secondary: string
  ): void {
    tileCtx.strokeStyle = primary;
    tileCtx.lineWidth = Math.max(2, Math.round(size * 0.06));
    const step = size / 3;
    for (let y = -step; y <= size + step; y += step) {
      tileCtx.beginPath();
      tileCtx.moveTo(0, y + step);
      tileCtx.lineTo(size * 0.5, y);
      tileCtx.lineTo(size, y + step);
      tileCtx.stroke();
    }

    tileCtx.strokeStyle = secondary;
    tileCtx.lineWidth = Math.max(1, Math.round(size * 0.03));
    for (let y = -step; y <= size + step; y += step) {
      tileCtx.beginPath();
      tileCtx.moveTo(0, y + step * 0.7);
      tileCtx.lineTo(size * 0.5, y + step * 0.15);
      tileCtx.lineTo(size, y + step * 0.7);
      tileCtx.stroke();
    }
  }

  private drawStripeTile(
    tileCtx: CanvasRenderingContext2D,
    size: number,
    primary: string,
    secondary: string
  ): void {
    const stripe = Math.max(6, Math.round(size * 0.16));
    for (let x = 0; x < size; x += stripe) {
      tileCtx.fillStyle = x / stripe % 2 === 0 ? primary : secondary;
      tileCtx.fillRect(x, 0, stripe, size);
    }
  }

  private drawDotTile(
    tileCtx: CanvasRenderingContext2D,
    size: number,
    primary: string,
    secondary: string
  ): void {
    tileCtx.fillStyle = secondary;
    tileCtx.fillRect(0, 0, size, size);
    tileCtx.fillStyle = primary;
    const dotSize = Math.max(4, Math.round(size * 0.11));
    const step = Math.max(16, Math.round(size * 0.35));
    for (let y = step / 2; y < size; y += step) {
      for (let x = step / 2; x < size; x += step) {
        tileCtx.beginPath();
        tileCtx.arc(x, y, dotSize, 0, Math.PI * 2);
        tileCtx.fill();
      }
    }
  }

  private drawFloralTile(
    tileCtx: CanvasRenderingContext2D,
    size: number,
    primary: string,
    secondary: string
  ): void {
    tileCtx.fillStyle = secondary;
    tileCtx.fillRect(0, 0, size, size);

    const centerX = size * 0.5;
    const centerY = size * 0.5;
    const petalRadius = size * 0.2;
    const innerRadius = size * 0.11;

    tileCtx.fillStyle = primary;
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6;
      const px = centerX + Math.cos(angle) * petalRadius;
      const py = centerY + Math.sin(angle) * petalRadius;
      tileCtx.beginPath();
      tileCtx.arc(px, py, size * 0.11, 0, Math.PI * 2);
      tileCtx.fill();
    }

    tileCtx.fillStyle = '#ffffff';
    tileCtx.beginPath();
    tileCtx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    tileCtx.fill();
  }

  private drawAbstractTile(
    tileCtx: CanvasRenderingContext2D,
    size: number,
    primary: string,
    secondary: string
  ): void {
    tileCtx.fillStyle = secondary;
    tileCtx.fillRect(0, 0, size, size);

    tileCtx.strokeStyle = primary;
    tileCtx.lineWidth = Math.max(2, Math.round(size * 0.04));
    tileCtx.beginPath();
    tileCtx.moveTo(0, size * 0.3);
    tileCtx.bezierCurveTo(
      size * 0.2,
      size * 0.05,
      size * 0.8,
      size * 0.55,
      size,
      size * 0.25
    );
    tileCtx.moveTo(0, size * 0.72);
    tileCtx.bezierCurveTo(
      size * 0.25,
      size * 0.4,
      size * 0.65,
      size * 0.96,
      size,
      size * 0.68
    );
    tileCtx.stroke();
  }

  /**
   * 渲染文字元素
   */
  private renderTexts(config: RugConfig): void {
    for (const text of config.texts) {
      this.renderText(text);
    }
  }

  /**
   * 渲染单个文字元素
   */
  private renderText(text: TextElement): void {
    this.ctx.save();
    this.ctx.translate(text.position.x, text.position.y);
    if (text.rotation) {
      this.ctx.rotate((text.rotation * Math.PI) / 180);
    }

    this.ctx.font = `${text.size}px ${text.font}`;
    this.ctx.fillStyle = text.color;
    this.ctx.textBaseline = 'top';
    this.drawTextWithLetterSpacing(text.content, text.letterSpacing || 0);
    this.ctx.restore();
  }

  /**
   * 渲染安全边界虚线框
   */
  private renderSafetyBoundary(config: RugConfig, dpiMode: DpiMode): void {
    const margin = this.getSafetyMargin(config, dpiMode);
    const x = margin;
    const y = margin;
    const width = this.canvas.width - margin * 2;
    const height = this.canvas.height - margin * 2;

    this.ctx.save();
    this.ctx.strokeStyle = SAFETY_BOUNDARY_STYLE.strokeColor;
    this.ctx.lineWidth = SAFETY_BOUNDARY_STYLE.strokeWidth;
    this.ctx.setLineDash([...SAFETY_BOUNDARY_STYLE.lineDash]);
    this.ctx.strokeRect(x, y, width, height);
    this.ctx.restore();
  }

  private getSafetyMargin(config: RugConfig, dpiMode: DpiMode): number {
    if (dpiMode === 'export') {
      return config.size.safetyMarginPx;
    }
    const ratio = config.production.exportDPI / config.production.weaveDPI;
    return Math.max(1, Math.round(config.size.safetyMarginPx / ratio));
  }

  /**
   * 验证配置中的元素是否在安全边界内
   */
  validate(config: RugConfig): ValidationResult {
    const violations: Array<{
      elementId: string;
      elementType: 'text' | 'pattern';
      message: string;
    }> = [];

    const margin = config.size.safetyMarginPx;
    const canvasSize = config.size.pixels300dpi;

    for (const text of config.texts) {
      const textMetrics = this.measureText(text);
      const inBounds = this.checkInBounds(
        text.position,
        { width: textMetrics.width, height: textMetrics.height },
        canvasSize,
        margin
      );

      if (!inBounds) {
        violations.push({
          elementId: text.id,
          elementType: 'text',
          message: `文字 "${text.content}" 超出可打印区域`,
        });
      }
    }

    return {
      valid: violations.length === 0,
      message:
        violations.length > 0
          ? `发现 ${violations.length} 个元素超出安全边界`
          : undefined,
      violations,
    };
  }

  /**
   * 测量文字尺寸
   */
  private measureText(text: TextElement): { width: number; height: number } {
    this.ctx.save();
    this.ctx.font = `${text.size}px ${text.font}`;
    const metrics = this.measureTextWithLetterSpacing(
      text.content,
      text.letterSpacing || 0
    );
    this.ctx.restore();
    return {
      width: metrics.width,
      height: text.size,
    };
  }

  private drawTextWithLetterSpacing(content: string, letterSpacing: number): void {
    if (!content) {
      return;
    }

    if (!letterSpacing) {
      this.ctx.fillText(content, 0, 0);
      return;
    }

    let cursorX = 0;
    for (const char of content) {
      this.ctx.fillText(char, cursorX, 0);
      cursorX += this.ctx.measureText(char).width + letterSpacing;
    }
  }

  private measureTextWithLetterSpacing(
    content: string,
    letterSpacing: number
  ): { width: number } {
    if (!content) {
      return { width: 0 };
    }

    const baseWidth = this.ctx.measureText(content).width;
    if (!letterSpacing || content.length <= 1) {
      return { width: baseWidth };
    }

    return {
      width: baseWidth + letterSpacing * (content.length - 1),
    };
  }

  /**
   * 检查元素是否在边界内
   */
  private checkInBounds(
    position: { x: number; y: number },
    elementSize: { width: number; height: number },
    canvasSize: { width: number; height: number },
    margin: number
  ): boolean {
    const minX = margin;
    const minY = margin;
    const maxX = canvasSize.width - margin;
    const maxY = canvasSize.height - margin;

    return (
      position.x >= minX &&
      position.y >= minY &&
      position.x + elementSize.width <= maxX &&
      position.y + elementSize.height <= maxY
    );
  }

  /**
   * 导出为 PNG Blob
   */
  async exportToPNG(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this.canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to export canvas as PNG'));
          }
        },
        'image/png',
        1.0
      );
    });
  }

  /**
   * 获取 Canvas ImageData
   */
  getImageData(): ImageData {
    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }
}

/**
 * 创建渲染器实例
 */
export function createRenderer(canvas: HTMLCanvasElement): CanvasRenderer {
  return new CanvasRenderer(canvas);
}
