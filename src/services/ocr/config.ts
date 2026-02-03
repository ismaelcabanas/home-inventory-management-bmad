/**
 * OCR Configuration
 * Central place to configure which OCR provider to use
 *
 * To switch providers (future stories):
 * 1. Import the desired provider
 * 2. Replace the provider export below
 * 3. Remove unused provider imports
 */

import type { IOCRProvider } from './providers/types';
import { tesseractProvider } from './providers/TesseractProvider';
// import { llmProvider } from './providers/LLMProvider'; // Future: Use LLM for higher accuracy
// import { googleVisionProvider } from './providers/GoogleVisionProvider'; // Future: Use Google Vision

/**
 * Active OCR Provider
 *
 * Change this export to switch between OCR engines:
 * - tesseractProvider: Free, browser-based, offline (default)
 * - llmProvider: Higher accuracy, requires API key, online only (future)
 */
export const activeOCRProvider: IOCRProvider = tesseractProvider;

// Future example: Switch to LLM provider
// export const activeOCRProvider: IOCRProvider = llmProvider;
