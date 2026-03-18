/**
 * 生产规格配置
 */
export interface ProductionSpec {
  /** 材质类型 */
  materialType: string;
  /** 收缩率配置 */
  shrinkage: {
    /** 宽度收缩率 (1.04 = +4%) */
    width: number;
    /** 长度收缩率 (1.04 = +4%) */
    length: number;
  };
  /** 织机 DPI (25) */
  weaveDPI: number;
  /** 导出 DPI (300) */
  exportDPI: number;
}

/**
 * 尺寸规格（厘米，去胶边后）
 */
export interface SizeSpec {
  /** 尺寸 ID */
  id: string;
  /** 显示名称，如 "49x56cm" */
  name: string;
  /** 成品宽度（cm） */
  width: number;
  /** 成品高度（cm） */
  height: number;
}

/**
 * 计算后的尺寸信息
 */
export interface CalculatedSize {
  /** 成品宽度（cm） */
  widthCm: number;
  /** 成品高度（cm） */
  heightCm: number;
  /** 尺寸规格 ID */
  id: string;
  /** 25 DPI 下的像素尺寸 */
  pixels25dpi: {
    width: number;
    height: number;
  };
  /** 300 DPI 下的像素尺寸 */
  pixels300dpi: {
    width: number;
    height: number;
  };
  /** 2cm 安全边界对应的像素（300 DPI） */
  safetyMarginPx: number;
}

/**
 * 图案配置
 */
export interface Pattern {
  /** 图案 ID */
  id: string;
  /** 图案名称 */
  name: string;
  /** 渲染样式 ID（用于程序化图案） */
  style?: string;
  /** 缩略图路径 */
  thumbnail: string;
  /** 完整图片路径 */
  src: string;
  /** 是否支持平铺 */
  tileable?: boolean;
}

/**
 * 配色方案
 */
export interface ColorScheme {
  /** 配色 ID */
  id: string;
  /** 配色名称 */
  name: string;
  /** 背景色（hex） */
  background: string;
  /** 主色（hex） */
  primary: string;
  /** 辅色（hex，可选） */
  secondary?: string;
}

/**
 * 颜色选项
 */
export interface ColorOption {
  /** 颜色 ID */
  id: string;
  /** 显示名称 */
  name: string;
  /** HEX 颜色值 */
  value: string;
}

/**
 * 字体选项
 */
export interface FontOption {
  /** 字体 ID */
  id: string;
  /** 显示名称 */
  name: string;
  /** Canvas 可用字体值 */
  value: string;
}

/**
 * 文字元素
 */
export interface TextElement {
  /** 元素 ID */
  id: string;
  /** 文字内容 */
  content: string;
  /** 字体名称 */
  font: string;
  /** 字号（像素） */
  size: number;
  /** 颜色（hex） */
  color: string;
  /** 字间距（像素） */
  letterSpacing?: number;
  /** 位置 */
  position: {
    x: number;
    y: number;
  };
  /** 旋转角度（度数，可选） */
  rotation?: number;
}

/**
 * 图案配置状态
 */
export interface PatternConfig {
  /** 图案 ID */
  id: string;
  /** 缩放比例 (1 = 100%) */
  scale: number;
  /** 位置偏移 */
  position: {
    x: number;
    y: number;
  };
}

/**
 * 地毯配置 - 核心数据模型
 */
export interface RugConfig {
  /** 配置格式版本，用于兼容性 */
  version: string;
  /** 尺寸配置 */
  size: CalculatedSize;
  /** 生产规格 */
  production: ProductionSpec;
  /** 图案配置 */
  pattern: PatternConfig;
  /** 配色 */
  colors: {
    /** 背景色（hex） */
    background: string;
    /** 主色（hex） */
    primary: string;
    /** 辅色（hex，可选） */
    secondary?: string;
  };
  /** 文字元素数组 */
  texts: TextElement[];
  /** 创建时间戳 */
  createdAt: number;
}

/**
 * 运行时配置（由 config.json 提供）
 */
export interface RuntimeConfig {
  /** 配置版本 */
  version: string;
  /** 可选图案 */
  patterns: Pattern[];
  /** 可选颜色列表 */
  colorOptions: ColorOption[];
  /** 推荐配色方案 */
  colorSchemes: ColorScheme[];
  /** 可选字体 */
  fonts: FontOption[];
  /** 可选尺寸 */
  sizes: SizeSpec[];
}

/**
 * Base64 载荷结构（序列化后）
 */
export interface SerializedConfigPayload {
  /** schema 版本 */
  v: string;
  /** 尺寸 */
  s: {
    id: string;
    w: number;
    h: number;
  };
  /** 生产参数 */
  pr: {
    m: string;
    sw: number;
    sl: number;
    wd: number;
    ed: number;
  };
  /** 图案 */
  p: {
    id: string;
    sc: number;
    px: number;
    py: number;
  };
  /** 配色 */
  c: {
    bg: string;
    p: string;
    s?: string;
  };
  /** 文字列表 */
  t: Array<{
    id: string;
    c: string;
    f: string;
    sz: number;
    col: string;
    ls?: number;
    x: number;
    y: number;
    r?: number;
  }>;
  /** 时间戳 */
  ts?: number;
}

/**
 * 边界验证结果
 */
export interface ValidationResult {
  /** 是否通过验证 */
  valid: boolean;
  /** 错误信息 */
  message?: string;
  /** 越界的元素列表 */
  violations?: Array<{
    elementId: string;
    elementType: 'text' | 'pattern';
    message: string;
  }>;
}

/**
 * 渲染选项
 */
export interface RenderOptions {
  /** DPI 模式 */
  dpiMode: 'weave' | 'export';
  /** 是否显示安全边界（仅编辑器模式） */
  showSafetyBoundary?: boolean;
  /** 背景 canvas 元素 */
  canvas: HTMLCanvasElement;
}

/**
 * 配置序列化选项
 */
export interface SerializeOptions {
  /** 是否压缩输出 */
  compressed?: boolean;
  /** 是否包含时间戳 */
  includeTimestamp?: boolean;
}
