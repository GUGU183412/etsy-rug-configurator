/**
 * Shared type definitions for the Rug Configurator
 */

export type {
  ProductionSpec,
  SizeSpec,
  CalculatedSize,
  Pattern,
  ColorScheme,
  ColorOption,
  FontOption,
  TextElement,
  PatternConfig,
  RugConfig,
  RuntimeConfig,
  SerializedConfigPayload,
  ValidationResult,
  RenderOptions,
  SerializeOptions,
} from './config';

// 常量导出
export const CONFIG_VERSION = '1.0.0';

// 默认生产规格（MS456 材质）
export const DEFAULT_PRODUCTION_SPEC = {
  materialType: 'MS456',
  shrinkage: {
    width: 1.04,  // +4%
    length: 1.04, // +4%
  },
  weaveDPI: 25,
  exportDPI: 300,
} as const;

// 安全边界（厘米）
export const SAFETY_MARGIN_CM = 2;

// DPI 常量
export const WEAVE_DPI = 25;
export const EXPORT_DPI = 300;

// 厘米到英寸转换
export const CM_TO_INCH = 0.393701;
