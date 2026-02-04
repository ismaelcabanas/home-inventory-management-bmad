/**
 * OCR Configuration
 * Central place to configure which OCR provider to use
 *
 * Provider Selection:
 * - Set VITE_LLM_PROVIDER environment variable to choose the LLM provider
 * - Options: 'openai' (default), 'gemini', 'mock'
 * - For E2E testing, VITE_USE_MOCK_OCR takes precedence
 */

import type { IOCRProvider } from './providers/types';
import { llmProvider } from './providers/LLMProvider';
import { geminiProvider } from './providers/GeminiProvider';
import { mockOCRProvider } from './providers/MockOCRProvider';

// TesseractProvider is deprecated after Story 5.4.
// import { tesseractProvider } from './providers/TesseractProvider';

/**
 * Get the active LLM provider based on environment variable
 *
 * Environment variables:
 * - VITE_USE_MOCK_OCR=true → Uses mock provider (for E2E testing)
 * - VITE_LLM_PROVIDER=openai → Uses OpenAI GPT-4o mini (default, paid)
 * - VITE_LLM_PROVIDER=gemini → Uses Google Gemini 2.0 Flash (free tier)
 */
function getActiveLLMProvider(): IOCRProvider {
  const provider = import.meta.env.VITE_LLM_PROVIDER || 'openai';

  switch (provider.toLowerCase()) {
    case 'gemini':
      return geminiProvider;
    case 'openai':
      return llmProvider;
    case 'mock':
      return mockOCRProvider;
    default:
      console.warn(`Unknown VITE_LLM_PROVIDER: "${provider}". Defaulting to OpenAI.`);
      return llmProvider;
  }
}

/**
 * Active OCR Provider
 *
 * Priority order:
 * 1. Mock provider (if VITE_USE_MOCK_OCR=true) - for E2E testing
 * 2. Selected LLM provider (based on VITE_LLM_PROVIDER)
 *
 * Available providers:
 * - openai: OpenAI GPT-4o mini (paid, high accuracy)
 * - gemini: Google Gemini 2.0 Flash (free tier)
 * - mock: Mock provider for testing (no API calls)
 */
export const activeOCRProvider: IOCRProvider =
  import.meta.env.VITE_USE_MOCK_OCR === 'true' ? mockOCRProvider : getActiveLLMProvider();
