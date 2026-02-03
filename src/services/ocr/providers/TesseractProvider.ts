/**
 * Tesseract.js OCR Provider (DEPRECATED after Story 5.4)
 *
 * This provider has been replaced by LLMProvider for improved OCR accuracy.
 * Tesseract.js dependency was removed in Story 5.4.
 *
 * To restore Tesseract support:
 * 1. Run: npm install tesseract.js
 * 2. Uncomment the provider export in config.ts
 * 3. Update activeOCRProvider to use tesseractProvider
 */

import { logger } from '@/utils/logger';
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Reserved for future use if provider is reactivated
import { handleError } from '@/utils/errorHandler';
import type { IOCRProvider, OCRProviderOptions, OCRProviderResult } from './types';

/**
 * Default options for Tesseract provider (reserved for future use)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _DEFAULT_OPTIONS: Required<Pick<OCRProviderOptions, 'language' | 'timeout'>> = {
  language: 'eng',
  timeout: 5000,
};

/**
 * Tesseract.js OCR Provider (DEPRECATED - replaced by LLMProvider in Story 5.4)
 *
 * This provider is kept for potential fallback use but requires tesseract.js
 * to be reinstalled: npm install tesseract.js
 */
export class TesseractProvider implements IOCRProvider {
  readonly name = 'tesseract.js (deprecated)';

  /**
   * Process receipt image with Tesseract.js
   * NOTE: This will fail unless tesseract.js is reinstalled
   */
  async process(
    _imageDataUrl: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: OCRProviderOptions = {}
  ): Promise<OCRProviderResult> {
    throw new Error(
      'TesseractProvider is deprecated after Story 5.4. The activeOCRProvider has been changed to llmProvider. To restore Tesseract support: 1) Run `npm install tesseract.js`, 2) Update config.ts to use tesseractProvider.'
    );
  }

  /**
   * Check if Tesseract is available (always false after Story 5.4)
   */
  async isAvailable(): Promise<boolean> {
    logger.warn('TesseractProvider: Deprecated after Story 5.4 - returning false');
    return false;
  }
}

/** Export singleton instance (deprecated) */
export const tesseractProvider = new TesseractProvider();
