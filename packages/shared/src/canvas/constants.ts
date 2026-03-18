/**
 * Canvas rendering constants
 */

import { SAFETY_MARGIN_CM, EXPORT_DPI, CM_TO_INCH } from '../types';

// 2cm 安全边界（300 DPI）
export const SAFETY_MARGIN_PX = Math.round(SAFETY_MARGIN_CM * CM_TO_INCH * EXPORT_DPI);

// 安全边界样式
export const SAFETY_BOUNDARY_STYLE = {
  strokeColor: 'rgba(255, 0, 0, 0.7)',
  strokeWidth: 2,
  lineDash: [10, 5], // 虚线模式
} as const;

// 默认字体列表
export const DEFAULT_FONTS = [
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Times New Roman', value: 'Times New Roman, serif' },
  { name: 'Courier New', value: 'Courier New, monospace' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
] as const;

// 默认颜色列表
export const DEFAULT_COLORS = [
  { name: 'White', value: '#FFFFFF' },
  { name: 'Black', value: '#000000' },
  { name: 'Red', value: '#FF0000' },
  { name: 'Blue', value: '#0000FF' },
  { name: 'Green', value: '#008000' },
  { name: 'Yellow', value: '#FFFF00' },
  { name: 'Pink', value: '#FFC0CB' },
  { name: 'Gray', value: '#808080' },
  { name: 'Brown', value: '#964B00' },
  { name: 'Beige', value: '#F5F5DC' },
] as const;
