/**
 * Gemini-based OCR Provider
 * Uses Google Gemini 2.0 Flash with vision capabilities for receipt OCR
 *
 * This provider uses direct REST API calls to Google's Generative AI API
 * (no SDK dependency) for better reliability and compatibility.
 *
 * Free tier: https://aistudio.google.com/app/apikey
 * Model: gemini-2.0-flash (stable, fast vision model)
 */

import { logger } from '@/utils/logger';
import { handleError } from '@/utils/errorHandler';
import type { IOCRProvider, OCRProviderOptions, OCRProviderResult } from './types';

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
 * Gemini API response structure
 */
interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

/**
 * Gemini OCR Provider using direct REST API
 *
 * Uses Google's vision model for high-accuracy receipt text extraction.
 * Processes images by sending them to the Gemini REST API with an optimized prompt.
 */
export class GeminiProvider implements IOCRProvider {
  readonly name = 'gemini-api (gemini-2.0-flash)';

  /**
   * Process receipt image with Gemini-based OCR
   */
  async process(imageDataUrl: string, options: OCRProviderOptions = {}): Promise<OCRProviderResult> {
    const startTime = performance.now();

    // Get API key from environment variable
    const apiKey = options.apiKey || import.meta.env.VITE_LLM_API_KEY;
    if (!apiKey || apiKey === 'your-api-key-here') {
      throw new Error(
        'Gemini API key not configured. Please set VITE_LLM_API_KEY in your .env file with a Gemini API key from https://aistudio.google.com/app/apikey'
      );
    }

    const modelName = options.model || 'gemini-2.0-flash';
    const timeout = options.timeout || 5000;

    logger.debug('GeminiProvider: Starting OCR', { model: modelName, timeout });

    try {
      // Create API URL
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

      // Prepare image for Gemini API
      const base64Data = imageDataUrl.includes(',')
        ? (imageDataUrl.split(',')[1] ?? imageDataUrl)
        : imageDataUrl;

      // Build request body
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: OCR_PROMPT
              },
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: base64Data
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048
        }
      };

      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`OCR processing timeout after ${timeout}ms`)), timeout);
      });

      // Create API call promise
      const apiPromise = fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }).then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `Gemini API error: ${response.status} - ${errorData.error?.message || response.statusText}`
          );
        }
        return response.json();
      });

      // Race between API call and timeout
      const result = await Promise.race([apiPromise, timeoutPromise]);

      // Extract products from JSON response
      const products = this.parseGeminiResponse(result);

      // Convert products array to raw text format (for compatibility with existing OCRService)
      const rawText = products.length > 0 ? products.join('\n') : '';

      const processingTimeMs = performance.now() - startTime;

      logger.info('GeminiProvider: OCR complete', {
        productsFound: products.length,
        processingTimeMs: Math.round(processingTimeMs),
        model: modelName,
      });

      return {
        rawText,
        provider: this.name,
        processingTimeMs: Math.round(processingTimeMs),
        confidence: 0.98,
      };
    } catch (error) {
      const appError = handleError(error);

      // Check for specific error types
      if (error instanceof Error) {
        // Rate limit / quota exceeded
        if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('QUOTA_EXCEEDED')) {
          const quotaError = new Error('QUOTA_EXCEEDED');
          logger.error('GeminiProvider: API quota exceeded', appError.details);
          throw quotaError;
        }

        // Invalid API key
        if (error.message.includes('401') || error.message.includes('403') || error.message.includes('API key') || error.message.includes('invalid')) {
          const authError = new Error('Invalid API key. Please check your VITE_LLM_API_KEY configuration.');
          logger.error('GeminiProvider: Invalid API key', appError.details);
          throw authError;
        }

        // Server errors
        if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
          const serverError = new Error('Gemini service temporarily unavailable. Please try again.');
          logger.error('GeminiProvider: Server error', appError.details);
          throw serverError;
        }

        // Timeout
        if (error.message.includes('timeout')) {
          const timeoutError = new Error('OCR processing timed out. Please try again.');
          logger.error('GeminiProvider: Timeout', appError.details);
          throw timeoutError;
        }
      }

      logger.error('GeminiProvider: OCR failed', appError.details);
      throw appError;
    }
  }

  /**
   * Parse Gemini JSON response and extract products array
   */
  private parseGeminiResponse(response: GeminiResponse): string[] {
    try {
      // Extract text from Gemini response structure
      const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!responseText) {
        logger.error('GeminiProvider: No text in response', { response });
        return [];
      }

      logger.debug('Gemini raw response', { contentPreview: responseText.substring(0, 200) });

      // Handle markdown code blocks (LLMs sometimes wrap JSON in ```json...```)
      let jsonStr = responseText;
      if (responseText.includes('```')) {
        jsonStr = responseText.replace(/```(?:json)?\n?([\s\S]*?)\n?```/g, '$1');
      }

      const parsed = JSON.parse(jsonStr);

      if (!parsed.products || !Array.isArray(parsed.products)) {
        logger.warn('Gemini response missing products array', { parsed });
        return [];
      }

      return parsed.products;
    } catch (error) {
      logger.error('GeminiProvider: Failed to parse JSON response', handleError(error).details);
      throw new Error('Failed to parse Gemini response. Please try again.');
    }
  }

  /**
   * Check if Gemini provider is available (has API key)
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
export const geminiProvider = new GeminiProvider();
