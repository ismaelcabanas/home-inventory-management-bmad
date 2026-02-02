/**
 * OCR Service
 * Handles receipt OCR processing using Tesseract.js
 * Extracts product names and matches to existing inventory
 */

import Tesseract from 'tesseract.js';
import type { Product } from '@/types/product';
import { handleError } from '@/utils/errorHandler';
import { logger } from '@/utils/logger';
import type { RecognizedProduct, OCRResult } from '@/features/receipt/types/receipt.types';

/**
 * Service for OCR processing of receipt images
 * Uses Tesseract.js for browser-based text recognition
 */
export class OCRService {
  private inventoryService?: {
    getProducts: () => Promise<Product[]>;
  };

  /**
   * Set the inventory service dependency
   * Required for product matching functionality
   */
  setInventoryService(service: { getProducts: () => Promise<Product[]> }): void {
    this.inventoryService = service;
  }

  /**
   * Process receipt image with OCR
   * @param imageDataUrl - Base64 data URL of receipt image
   * @returns OCRResult with recognized products and raw text
   */
  async processReceipt(imageDataUrl: string): Promise<OCRResult> {
    try {
      logger.debug('Starting OCR processing', { imageDataUrl: imageDataUrl.substring(0, 50) + '...' });

      // Process with Tesseract.js
      const result = await Tesseract.recognize(imageDataUrl, 'eng', {
        logger: (m: { status: string; progress: number }) => {
          logger.debug('OCR progress', { status: m.status, progress: m.progress });
        },
      });

      const rawText = result.data.text;
      logger.info('OCR text extraction complete', { textLength: rawText.length });

      // Extract product names from raw OCR text
      const productNames = this.extractProductNames(rawText);
      logger.info('Products extracted from OCR', { count: productNames.length, products: productNames });

      // Match to existing inventory if service is available
      const recognizedProducts = await this.matchExistingProducts(productNames);

      return {
        products: recognizedProducts,
        rawText,
      };
    } catch (error) {
      const appError = handleError(error);
      logger.error('OCR processing failed', appError.details);
      throw appError;
    }
  }

  /**
   * Extract product names from raw OCR text
   * Filters out non-product lines (dates, prices, totals, etc.)
   * @param ocrText - Raw text from Tesseract
   * @returns Array of candidate product names
   */
  extractProductNames(ocrText: string): string[] {
    const lines = ocrText.split('\n');

    // Filter to only product lines
    const productLines = lines.filter((line) => this.isProductLine(line));

    // Clean up product names
    const cleanedNames = productLines.map((line) => this.cleanProductName(line)).filter((name) => name.length > 0);

    logger.debug('Product names extracted', { count: cleanedNames.length, names: cleanedNames });
    return cleanedNames;
  }

  /**
   * Check if a line from OCR text represents a product
   * @param line - Single line from receipt OCR
   * @returns true if line appears to be a product
   */
  isProductLine(line: string): boolean {
    const trimmed = line.trim();

    // Empty lines
    if (trimmed.length === 0) return false;

    // Date patterns: MM/DD/YYYY, DD-MM-YYYY, YYYY-MM-DD
    if (/^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}$/.test(trimmed)) return false;

    // Price patterns: $12.99, 12.99, $12.99
    if (/^\$?\d+\.\d{2}$/.test(trimmed)) return false;

    // Total lines
    if (/^(TOTAL|SUBTOTAL|SUM|TAX)/i.test(trimmed)) return false;

    // Payment info
    if (/^(CASH|CARD|CHANGE|DEBIT|CREDIT)/i.test(trimmed)) return false;

    // Time patterns: HH:MM
    if (/^\d{1,2}:\d{2}$/.test(trimmed)) return false;

    // Must be at least 3 characters (after trimming)
    if (trimmed.length < 3) return false;

    // Must contain at least one letter
    if (!/[a-zA-Z]/.test(trimmed)) return false;

    return true;
  }

  /**
   * Clean up OCR product name
   * Removes quantities, weights, and capitalizes properly
   * @param name - Raw product name from OCR
   * @returns Cleaned product name
   */
  cleanProductName(name: string): string {
    let cleaned = name.trim();

    // Remove quantity prefixes (2x, 3 KG, etc.)
    cleaned = cleaned.replace(/^\d+[xX]\s+/, '');
    cleaned = cleaned.replace(/^\d+\s*(KG|LB|L|ML|G|OZ)\s+/, '');

    // Remove weight suffixes (1L, 500ML, etc.)
    cleaned = cleaned.replace(/\s+\d+\.?\d*\s*(L|ML|KG|G|OZ)\s*$/i, '');

    // Remove price suffixes
    cleaned = cleaned.replace(/\s+\$?\d+\.\d{2}$/, '');

    // Trim again
    cleaned = cleaned.trim();

    // Capitalize first letter if lowercase
    const firstChar = cleaned.charAt(0);
    if (cleaned.length > 0 && firstChar === firstChar.toLowerCase()) {
      cleaned = firstChar.toUpperCase() + cleaned.slice(1);
    }

    return cleaned;
  }

  /**
   * Match recognized products to existing inventory
   * @param names - Array of product names from OCR
   * @returns Array of RecognizedProduct with match info
   */
  async matchExistingProducts(names: string[]): Promise<RecognizedProduct[]> {
    if (!this.inventoryService) {
      logger.warn('No inventory service set, returning products without matches');
      return names.map((name) => ({
        id: crypto.randomUUID(),
        name,
        confidence: 0.5,
        isCorrect: false,
      }));
    }

    const products = await this.inventoryService.getProducts();
    const recognizedProducts: RecognizedProduct[] = [];

    for (const ocrName of names) {
      const lowerOcrName = ocrName.toLowerCase();

      // Try exact match first
      const match = products.find((p) => p.name.toLowerCase() === lowerOcrName);

      if (match) {
        recognizedProducts.push({
          id: crypto.randomUUID(),
          name: ocrName,
          matchedProduct: match,
          confidence: 1.0,
          isCorrect: false,
        });
        continue;
      }

      // Try contains match
      const matches = products.filter((p) => p.name.toLowerCase().includes(lowerOcrName));

      if (matches.length > 0) {
        // Pick most recently updated
        matches.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        recognizedProducts.push({
          id: crypto.randomUUID(),
          name: ocrName,
          matchedProduct: matches[0],
          confidence: 0.8,
          isCorrect: false,
        });
        continue;
      }

      // No match found
      recognizedProducts.push({
        id: crypto.randomUUID(),
        name: ocrName,
        confidence: 0.5,
        isCorrect: false,
      });
    }

    logger.info('Product matching complete', {
      total: names.length,
      matched: recognizedProducts.filter((p) => p.matchedProduct).length,
      unmatched: recognizedProducts.filter((p) => !p.matchedProduct).length,
    });

    return recognizedProducts;
  }
}

// Export singleton instance
export const ocrService = new OCRService();
