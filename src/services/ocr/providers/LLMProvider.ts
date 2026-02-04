/**
 * LLM-based OCR Provider
 * Uses OpenAI GPT-4o mini for high-accuracy receipt OCR
 *
 * This provider uses the OpenAI API to extract product names from receipt images.
 * It requires an API key set via VITE_LLM_API_KEY environment variable.
 */

import { logger } from '@/utils/logger';
import { handleError } from '@/utils/errorHandler';
import type { IOCRProvider, OCRProviderOptions, OCRProviderResult } from './types';

/**
 * OpenAI API response format
 */
interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * LLM provider specific options
 */
export interface LLMProviderOptions extends OCRProviderOptions {
  /** API key for OpenAI service */
  apiKey?: string;
  /** Model to use (default: gpt-4o-mini) */
  model?: string;
  /** Maximum retries for API calls */
  maxRetries?: number;
}

/**
 * Optimized OCR prompt for grocery receipt product extraction
 */
const OCR_PROMPT = `You are a grocery receipt product extraction expert. Extract ONLY product names from this receipt image.

CRITICAL RULES:
1. Extract ONLY product names (food items, household products)
2. EXCLUDE: prices, dates, totals, store names, payment info, discounts, weights
3. EXCLUDE: non-product items like "subtotal", "tax", "cashier", "thank you"
4. Return ONLY valid product names that a user would actually buy
5. Clean up OCR artifacts (fix obvious misrecognitions)
6. Remove quantities (e.g., "2x Milk" → "Milk")
7. Remove weights/sizes (e.g., "Milk 1L" → "Milk")

OUTPUT FORMAT (JSON only):
{
  "products": ["Product 1", "Product 2", "Product 3"]
}

Return valid JSON only. No explanations, no additional text.`;

/**
 * LLM OCR Provider using OpenAI GPT-4o mini
 *
 * Uses OpenAI's vision model for high-accuracy receipt text extraction.
 * Processes images by sending them to the OpenAI API with an optimized prompt.
 */
export class LLMProvider implements IOCRProvider {
  readonly name = 'llm-api (gpt-4o-mini)';

  /**
   * Process receipt image with LLM-based OCR
   */
  async process(imageDataUrl: string, options: LLMProviderOptions = {}): Promise<OCRProviderResult> {
    const startTime = performance.now();

    // Get API key from options or environment variable
    const apiKey = options.apiKey || import.meta.env.VITE_LLM_API_KEY;
    if (!apiKey || apiKey === 'your-api-key-here') {
      const errorMsg = 'LLM API key not configured. ' +
        'For local development: Set VITE_LLM_API_KEY in your .env file. ' +
        'For Vercel deployment: Add VITE_LLM_API_KEY in Project Settings > Environment Variables. ' +
        'Get your API key from: https://platform.openai.com/api-keys';
      logger.error('LLMProvider: API key not configured', { hasApiKey: Boolean(apiKey), isPlaceholder: apiKey === 'your-api-key-here' });
      throw new Error(errorMsg);
    }

    const model = options.model || 'gpt-4o-mini';
    const timeout = options.timeout || 5000;

    logger.debug('LLMProvider: Starting OCR', { model, timeout });

    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`OCR processing timeout after ${timeout}ms`)), timeout);
      });

      // Create the API call promise
      const apiPromise = this.callOpenAIAPI(imageDataUrl, apiKey, model);

      // Race between API call and timeout
      const response = await Promise.race([apiPromise, timeoutPromise]);

      // Extract products from JSON response
      const products = this.parseLLMResponse(response);

      // Convert products array to raw text format (for compatibility with existing OCRService)
      const rawText = products.length > 0 ? products.join('\n') : '';

      const processingTimeMs = performance.now() - startTime;

      logger.info('LLMProvider: OCR complete', {
        productsFound: products.length,
        processingTimeMs: Math.round(processingTimeMs),
        model,
      });

      return {
        rawText,
        provider: this.name,
        processingTimeMs: Math.round(processingTimeMs),
        // Note: OpenAI's GPT-4o mini API does not return confidence scores.
        // This value is an estimate based on typical LLM OCR accuracy (~98%).
        // Actual confidence should be validated through user corrections in production.
        confidence: 0.98,
      };
    } catch (error) {
      const appError = handleError(error);

      // Check for specific error types
      if (error instanceof Error) {
        // Rate limit / quota exceeded
        if (error.message.includes('429') || error.message.includes('quota')) {
          const quotaError = new Error('QUOTA_EXCEEDED');
          logger.error('LLMProvider: API quota exceeded', appError.details);
          throw quotaError;
        }

        // Invalid API key
        if (error.message.includes('401') || error.message.includes('invalid')) {
          const authError = new Error('Invalid API key. Please check your VITE_LLM_API_KEY configuration.');
          logger.error('LLMProvider: Invalid API key', appError.details);
          throw authError;
        }

        // Server errors
        if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
          const serverError = new Error('LLM service temporarily unavailable. Please try again.');
          logger.error('LLMProvider: Server error', appError.details);
          throw serverError;
        }

        // Timeout
        if (error.message.includes('timeout')) {
          const timeoutError = new Error('OCR processing timed out. Please try again.');
          logger.error('LLMProvider: Timeout', appError.details);
          throw timeoutError;
        }
      }

      logger.error('LLMProvider: OCR failed', appError.details);
      throw appError;
    }
  }

  /**
   * Call OpenAI API for vision-based OCR
   */
  private async callOpenAIAPI(
    imageDataUrl: string,
    apiKey: string,
    model: string
  ): Promise<OpenAIResponse> {
    // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
    const base64Data = imageDataUrl.includes(',') ? imageDataUrl.split(',')[1] : imageDataUrl;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: OCR_PROMPT },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Data}` } },
            ],
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Parse LLM JSON response and extract products array
   */
  private parseLLMResponse(response: OpenAIResponse): string[] {
    try {
      const content = response.choices[0]?.message?.content || '';
      logger.debug('LLM raw response', { contentPreview: content.substring(0, 200) });

      // Handle markdown code blocks (LLMs sometimes wrap JSON in ```json...```)
      let jsonStr = content;
      if (content.includes('```')) {
        jsonStr = content.replace(/```(?:json)?\n?([\s\S]*?)\n?```/g, '$1');
      }

      const parsed = JSON.parse(jsonStr);

      if (!parsed.products || !Array.isArray(parsed.products)) {
        logger.warn('LLM response missing products array', { parsed });
        return [];
      }

      return parsed.products;
    } catch (error) {
      logger.error('LLMProvider: Failed to parse JSON response', handleError(error).details);
      throw new Error('Failed to parse LLM response. Please try again.');
    }
  }

  /**
   * Check if LLM provider is available (has API key)
   */
  async isAvailable(): Promise<boolean> {
    try {
      const apiKey = import.meta.env.VITE_LLM_API_KEY;
      return Boolean(apiKey && apiKey !== 'your-api-key-here');
    } catch {
      return false;
    }
  }
}

/** Export singleton instance */
export const llmProvider = new LLMProvider();
