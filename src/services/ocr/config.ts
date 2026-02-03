/**
 * OCR Configuration
 * Central place to configure which OCR provider to use
 *
 * To switch providers:
 * 1. Import the desired provider
 * 2. Replace the provider export below
 * 3. Remove unused provider imports
 */

import type { IOCRProvider } from './providers/types';
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Kept for reference if switching providers
import { tesseractProvider } from './providers/TesseractProvider';
import { llmProvider } from './providers/LLMProvider';

/**
 * Active OCR Provider
 *
 * Change this export to switch between OCR engines:
 * - tesseractProvider: Free, browser-based, offline
 * - llmProvider: Higher accuracy, requires API key, online only (Story 5.4)
 */
export const activeOCRProvider: IOCRProvider = llmProvider;

// Previous provider (commented out after Story 5.4)
// export const activeOCRProvider: IOCRProvider = tesseractProvider;
