/**
 * OCR Module
 * Central OCR exports and configuration
 */

// Service
export { OCRService, ocrService } from './ocr.service';

// Providers (exported for testing and configuration)
export { tesseractProvider } from './providers/TesseractProvider';
export { llmProvider } from './providers/LLMProvider';
export * from './providers/types';

// Configuration (import this to get/set the active provider)
export { activeOCRProvider } from './config';
