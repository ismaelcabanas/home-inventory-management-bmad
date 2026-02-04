/**
 * Mock OCR Provider for E2E Testing
 *
 * Implements IOCRProvider interface to simulate OCR processing
 * without making actual API calls. Returns predictable test data.
 *
 * Usage in E2E tests:
 * - Set VITE_USE_MOCK_OCR=true environment variable
 * - The config.ts will export this mock provider instead of LLMProvider
 * - Tests get predictable product names for validation
 */

import type { IOCRProvider, OCRProviderOptions, OCRProviderResult } from './types';

/**
 * Test products that the mock OCR provider will "recognize"
 */
const MOCK_RECOGNIZED_PRODUCTS = [
  'Milk',
  'Eggs',
  'Bread',
  'Cheese',
  'Apples',
];

/**
 * Mock OCR Provider for E2E Testing
 *
 * Simulates OCR processing by returning predefined products.
 * No API calls, no actual image processing - fast and reliable for testing.
 */
export class MockOCRProvider implements IOCRProvider {
  readonly name = 'mock-ocr-provider (e2e-testing)';

  private customProducts: string[] | null = null;

  /**
   * Process receipt image with mocked OCR
   *
   * Ignores the actual image data and returns predefined products.
   * Simulates a realistic processing delay.
   */
  async process(_imageDataUrl: string, options: OCRProviderOptions = {}): Promise<OCRProviderResult> {
    const startTime = performance.now();

    // Simulate processing delay (default 100ms for fast tests, configurable)
    const delay = (options.mockDelay as number) || 100;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Return mock products as raw text (one per line)
    const products = this.customProducts || MOCK_RECOGNIZED_PRODUCTS;
    const rawText = products.join('\n');

    const processingTimeMs = performance.now() - startTime;

    return {
      rawText,
      provider: this.name,
      processingTimeMs: Math.round(processingTimeMs),
      confidence: 1.0, // Mock always returns 100% confidence
    };
  }

  /**
   * Mock provider is always available
   */
  async isAvailable(): Promise<boolean> {
    return true;
  }

  /**
   * Set custom products for this specific test instance
   * Useful for testing different scenarios
   */
  setMockProducts(products: string[]): void {
    this.customProducts = products;
  }

  /**
   * Reset to default products
   */
  resetProducts(): void {
    this.customProducts = null;
  }
}

/** Export singleton instance */
export const mockOCRProvider = new MockOCRProvider();
