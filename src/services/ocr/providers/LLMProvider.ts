/**
 * LLM-based OCR Provider (Future implementation)
 * Example implementation showing how to add LLM-based OCR as a provider
 *
 * This provider would use an LLM API (like Claude, GPT-4V, etc.) to extract
 * product information from receipt images with higher accuracy.
 */

import { logger } from '@/utils/logger';
import type { IOCRProvider, OCRProviderOptions, OCRProviderResult } from './types';

/**
 * LLM provider specific options
 */
export interface LLMProviderOptions extends OCRProviderOptions {
  /** API key for LLM service */
  apiKey?: string;
  /** Model to use (e.g., 'claude-3-opus', 'gpt-4-vision') */
  model?: string;
  /** API endpoint */
  endpoint?: string;
  /** Format for the response (json, text) */
  responseFormat?: 'json' | 'text';
}

/**
 * LLM OCR Provider (Placeholder for future implementation)
 *
 * This provider demonstrates how to add an LLM-based OCR:
 * 1. Implement the IOCRProvider interface
 * 2. Call the LLM API with the image
 * 3. Parse structured response into product list
 *
 * Example usage:
 * ```typescript
 * const llmProvider = new LLMProvider();
 * const result = await llmProvider.process(imageDataUrl, {
 *   apiKey: process.env.ANTHROPIC_API_KEY,
 *   model: 'claude-3-opus-20240229',
 *   language: 'spa'
 * });
 * ```
 */
export class LLMProvider implements IOCRProvider {
  readonly name = 'llm-api';

  /**
   * Process receipt image with LLM-based OCR
   *
   * Future implementation would:
   * 1. Send image + prompt to LLM API
   * 2. Parse structured JSON response
   * 3. Return raw text and confidence scores
   */
  async process(_imageDataUrl: string, options: LLMProviderOptions = {}): Promise<OCRProviderResult> {
    const startTime = performance.now();

    // TODO: Validate options (apiKey, model, endpoint)
    if (!options.apiKey) {
      throw new Error('LLMProvider requires apiKey in options');
    }

    // TODO: Implement LLM API call
    // Example prompt:
    // "Extract all product names from this receipt image.
    //  Return as JSON: { products: [{name, quantity, price}], rawText }"

    // Note: Parameter is prefixed with _ to indicate unused (until implemented)
    logger.warn('LLMProvider: Not yet implemented');

    const processingTimeMs = performance.now() - startTime;

    // Placeholder return
    return {
      rawText: '',
      provider: this.name,
      processingTimeMs: Math.round(processingTimeMs),
      confidence: 0,
    };
  }

  /**
   * Check if LLM provider is available (has API key, network, etc.)
   */
  async isAvailable(): Promise<boolean> {
    // TODO: Check if API key is configured
    return false;
  }
}

/** Export singleton instance */
export const llmProvider = new LLMProvider();
