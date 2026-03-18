import type { ProductionSpec, CalculatedSize, SizeSpec } from '../types';
import {
  DEFAULT_PRODUCTION_SPEC,
  SAFETY_MARGIN_CM,
  CM_TO_INCH,
  WEAVE_DPI,
  EXPORT_DPI,
} from '../types';

/**
 * 将厘米转换为指定 DPI 的像素
 */
export function cmToPixels(cm: number, dpi: number): number {
  const inches = cm * CM_TO_INCH;
  return Math.round(inches * dpi);
}

/**
 * 计算地毯尺寸（考虑收缩率）
 *
 * @param widthCm - 成品宽度（厘米）
 * @param heightCm - 成品高度（厘米）
 * @param shrinkage - 收缩率 { width, length }
 * @returns 计算结果
 */
export function calculateSize(
  widthCm: number,
  heightCm: number,
  shrinkage: { width: number; length: number } = DEFAULT_PRODUCTION_SPEC.shrinkage
) {
  // 工厂约束：宽=较短边，长=较长边
  const shortEdgeCm = Math.min(widthCm, heightCm);
  const longEdgeCm = Math.max(widthCm, heightCm);

  // 25 DPI 用于织机
  // 计算公式：cm × 10 × 收缩率
  const pixels25dpi = {
    width: Math.round(shortEdgeCm * 10 * shrinkage.width),
    height: Math.round(longEdgeCm * 10 * shrinkage.length),
  };

  // 300 DPI 用于 PCX 导出
  // 比例：300 / 25 = 12
  const dpiRatio = EXPORT_DPI / WEAVE_DPI;
  const pixels300dpi = {
    width: pixels25dpi.width * dpiRatio,
    height: pixels25dpi.height * dpiRatio,
  };

  // 2cm 安全边界对应的像素（300 DPI）
  const safetyMarginPx = cmToPixels(SAFETY_MARGIN_CM, EXPORT_DPI);

  return {
    pixels25dpi,
    pixels300dpi,
    safetyMarginPx,
  };
}

/**
 * 根据尺寸规格创建完整的尺寸配置
 */
export function createCalculatedSize(
  sizeSpec: SizeSpec,
  productionSpec?: ProductionSpec
): CalculatedSize {
  const spec = productionSpec || DEFAULT_PRODUCTION_SPEC;
  const shortEdgeCm = Math.min(sizeSpec.width, sizeSpec.height);
  const longEdgeCm = Math.max(sizeSpec.width, sizeSpec.height);
  const calculated = calculateSize(shortEdgeCm, longEdgeCm, spec.shrinkage);

  return {
    id: sizeSpec.id,
    widthCm: shortEdgeCm,
    heightCm: longEdgeCm,
    ...calculated,
  };
}

/**
 * 预设尺寸规格
 */
export const PRESET_SIZES: SizeSpec[] = [
  { id: '49x56', name: '49 x 56 cm', width: 49, height: 56 },
  { id: '60x90', name: '60 x 90 cm', width: 60, height: 90 },
  { id: '80x120', name: '80 x 120 cm', width: 80, height: 120 },
  { id: '100x150', name: '100 x 150 cm', width: 100, height: 150 },
];

/**
 * 获取默认尺寸（49x56cm）
 */
export function getDefaultSize(): CalculatedSize {
  return createCalculatedSize(PRESET_SIZES[0]);
}

/**
 * 验证元素是否在安全边界内
 */
export function validateInBounds(
  position: { x: number; y: number },
  elementSize: { width: number; height: number },
  canvasSize: { width: number; height: number },
  safetyMargin: number
): boolean {
  const minX = safetyMargin;
  const minY = safetyMargin;
  const maxX = canvasSize.width - safetyMargin - elementSize.width;
  const maxY = canvasSize.height - safetyMargin - elementSize.height;

  return (
    position.x >= minX &&
    position.x <= maxX &&
    position.y >= minY &&
    position.y <= maxY
  );
}

/**
 * 限制位置在安全边界内
 */
export function clampToBounds(
  position: { x: number; y: number },
  elementSize: { width: number; height: number },
  canvasSize: { width: number; height: number },
  safetyMargin: number
): { x: number; y: number } {
  const minX = safetyMargin;
  const minY = safetyMargin;
  const maxX = canvasSize.width - safetyMargin - elementSize.width;
  const maxY = canvasSize.height - safetyMargin - elementSize.height;

  return {
    x: Math.max(minX, Math.min(position.x, maxX)),
    y: Math.max(minY, Math.min(position.y, maxY)),
  };
}
