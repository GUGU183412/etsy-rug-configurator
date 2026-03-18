/**
 * Production specification calculator
 * Handles size calculations with shrinkage rates and DPI conversions
 */

export {
  cmToPixels,
  calculateSize,
  createCalculatedSize,
  validateInBounds,
  clampToBounds,
  getDefaultSize,
  PRESET_SIZES,
} from './calculator';

export { DEFAULT_PRODUCTION_SPEC } from '../types';
