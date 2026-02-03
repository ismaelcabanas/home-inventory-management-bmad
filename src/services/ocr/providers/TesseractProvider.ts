/**
 * Tesseract.js OCR Provider
 * Browser-based OCR processing using Tesseract.js library
 */

import Tesseract from 'tesseract.js';
import { logger } from '@/utils/logger';
import { handleError } from '@/utils/errorHandler';
import type { IOCRProvider, OCRProviderOptions, OCRProviderResult } from './types';

/**
 * Default options for Tesseract provider
 */
const DEFAULT_OPTIONS: Required<Pick<OCRProviderOptions, 'language' | 'timeout'>> = {
  language: 'eng',
  timeout: 5000,
};

/**
 * Tesseract.js OCR Provider
 * Processes images locally in the browser using Tesseract.js
 */
export class TesseractProvider implements IOCRProvider {
  readonly name = 'tesseract.js';

  /**
   * Process receipt image with Tesseract.js
   */
  async process(imageDataUrl: string, options: OCRProviderOptions = {}): Promise<OCRProviderResult> {
    const startTime = performance.now();
    const opts = { ...DEFAULT_OPTIONS, ...options };

    logger.debug('TesseractProvider: Starting OCR', { language: opts.language });

    try {
      const result = await Tesseract.recognize(
        imageDataUrl,
        opts.language,
        {
          logger: (m: { status: string; progress: number }) => {
            logger.debug('Tesseract progress', { status: m.status, progress: m.progress });
          },
        }
      );

      const processingTimeMs = performance.now() - startTime;

      logger.info('TesseractProvider: OCR complete', {
        textLength: result.data.text.length,
        processingTimeMs: Math.round(processingTimeMs),
      });

      return {
        rawText: result.data.text,
        provider: this.name,
        processingTimeMs: Math.round(processingTimeMs),
        confidence: result.data.confidence,
      };
    } catch (error) {
      const appError = handleError(error);
      logger.error('TesseractProvider: OCR failed', appError.details);
      throw appError;
    }
  }

  /**
   * Check if Tesseract is available (always true for browser-based)
   */
  async isAvailable(): Promise<boolean> {
    try {
      // Tesseract.js is loaded via import, so it's always available in browser
      return typeof window !== 'undefined' && typeof Tesseract !== 'undefined';
    } catch {
      return false;
    }
  }
}

/** Export singleton instance */
export const tesseractProvider = new TesseractProvider();
