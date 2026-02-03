/**
 * OCR Provider Types
 * Abstraction layer for pluggable OCR engines (Tesseract, LLM, Cloud Vision, etc.)
 */

/**
 * OCR result returned by any provider
 */
export interface OCRProviderResult {
  /** Raw text extracted from image */
  rawText: string;
  /** Provider identifier for logging/metrics */
  provider: string;
  /** Processing time in milliseconds */
  processingTimeMs: number;
  /** Confidence score (0-1) if available */
  confidence?: number;
}

/**
 * OCR provider configuration options
 */
export interface OCRProviderOptions {
  /** Language code for OCR (default: 'eng' for English, 'spa' for Spanish) */
  language?: string;
  /** Timeout in milliseconds (default: 5000) */
  timeout?: number;
  /** Additional provider-specific options */
  [key: string]: unknown;
}

/**
 * Base interface for all OCR providers
 */
export interface IOCRProvider {
  /** Unique provider identifier */
  readonly name: string;

  /**
   * Process receipt image with OCR
   * @param imageDataUrl - Base64 data URL of receipt image
   * @param options - Provider-specific options
   * @returns Promise<OCRProviderResult>
   */
  process(imageDataUrl: string, options?: OCRProviderOptions): Promise<OCRProviderResult>;

  /**
   * Check if provider is available/ready
   * (e.g., API key configured, network available)
   */
  isAvailable(): boolean | Promise<boolean>;
}

/**
 * Provider priority for fallback chain
 */
export type ProviderPriority = 'primary' | 'fallback' | 'last-resort';

/**
 * Provider configuration with priority
 */
export interface ProviderConfig {
  /** Provider instance */
  provider: IOCRProvider;
  /** Priority in fallback chain */
  priority: ProviderPriority;
  /** Whether provider is enabled */
  enabled: boolean;
}
