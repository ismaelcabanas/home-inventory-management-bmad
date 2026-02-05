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
 * Debug logging for OCR configuration
 */
const logOCRConfig = () => {
  const provider = import.meta.env.VITE_LLM_PROVIDER || 'openai';
  const apiKey = import.meta.env.VITE_LLM_API_KEY;
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const useMock = import.meta.env.VITE_USE_MOCK_OCR;

  console.group('🔍 OCR Configuration Debug');
  console.log('Provider:', provider);
  console.log('Use Mock OCR:', useMock);
  console.log('Has OpenAI API Key:', Boolean(apiKey));
  console.log('OpenAI API Key Format:', apiKey ? `${apiKey.slice(0, 3)}...${apiKey.slice(-4)}` : 'none');
  console.log('Has Gemini API Key:', Boolean(geminiKey));
  console.log('Gemini API Key Format:', geminiKey ? `${geminiKey.slice(0, 3)}...${geminiKey.slice(-4)}` : 'none');
  console.log('Environment:', import.meta.env.MODE);
  console.groupEnd();

  return { provider, hasApiKey: Boolean(apiKey), hasGeminiKey: Boolean(geminiKey), useMock };
};

// Log on module load
logOCRConfig();

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

  console.log(`🔧 Selecting OCR provider: ${provider}`);

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
