/**
 * PCX file format types
 */

/**
 * PCX 文件头结构（128 字节）
 */
export interface PCXHeader {
  /** PCX 签名 (0x0A) */
  signature: number;
  /** 版本号 (5 = PCX 3.0) */
  version: number;
  /** 编码方式 (1 = RLE) */
  encoding: number;
  /** 每像素位数 (8 = 256 色) */
  bitsPerPixel: number;
  /** 图像区域 (左, 上, 右, 下) */
  window: [number, number, number, number];
  /** 水平 DPI */
  hDpi: number;
  /** 垂直 DPI */
  vDpi: number;
  /** 调色板 (16 色 RGB，48 字节) */
  palette: Uint8Array;
  /** 保留字段 */
  reserved: number;
  /** 位平面数 (1 = 单平面) */
  planes: number;
  /** 每行字节数 */
  bytesPerLine: number;
  /** 调色板类型 (1 = 彩色/灰度) */
  paletteType: number;
  /** 填充 (58 字节) */
  filler: Uint8Array;
}

/**
 * PCX 编码选项
 */
export interface PCXEncodeOptions {
  /** 水平 DPI (默认 25) */
  hDpi?: number;
  /** 垂直 DPI (默认 25) */
  vDpi?: number;
  /** 是否使用 RLE 压缩 (默认 true) */
  useRLE?: boolean;
  /** 最大颜色数量（工厂约束默认 12） */
  maxColors?: number;
  /** 透明阈值（0-255，小于该值视作底色） */
  alphaThreshold?: number;
  /** 边缘实化处理，减少发虚（默认 true） */
  solidifyEdges?: boolean;
  /** 透明像素铺底颜色（默认白色） */
  matteColor?: [number, number, number];
}

/**
 * PCX 导出报告
 */
export interface PCXEncodeReport {
  /** 原始颜色桶数量（量化前） */
  sourceColorCount: number;
  /** 导出实际使用颜色数 */
  outputColorCount: number;
  /** 颜色上限 */
  maxColors: number;
  /** 导出像素宽度 */
  width: number;
  /** 导出像素高度 */
  height: number;
  /** 导出头 DPI */
  dpi: {
    h: number;
    v: number;
  };
}

/**
 * PCX 导出结果
 */
export interface PCXExportResult {
  blob: Blob;
  report: PCXEncodeReport;
}
