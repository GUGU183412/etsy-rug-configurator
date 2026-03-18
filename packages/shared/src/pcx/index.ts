/**
 * PCX (PC Paintbrush) Format Encoder
 * 用于将 Canvas 导出为 PCX 格式，适用于地毯生产
 */

export {
  PCXEncoder,
  createPCXEncoder,
  exportCanvasToPCX,
  exportCanvasToPCXWithReport,
  downloadPCX,
} from './PCXEncoder';

export type {
  PCXHeader,
  PCXEncodeOptions,
  PCXEncodeReport,
  PCXExportResult,
} from './types';
