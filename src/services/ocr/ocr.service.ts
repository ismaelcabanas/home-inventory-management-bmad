/**
 * OCR Service
 * Handles receipt OCR processing using pluggable OCR providers
 * Extracts product names and matches to existing inventory
 *
 * Story 5.4: Offline queue support - receipts can be queued when offline
 * and processed automatically when connectivity is restored.
 *
 * NOTE: OCR providers must be explicitly set before using processReceipt()
 */

import type { Product } from '@/types/product';
import { logger } from '@/utils/logger';
import { handleError } from '@/utils/errorHandler';
import type { RecognizedProduct, OCRResult } from '@/features/receipt/types/receipt.types';
import type { IOCRProvider } from './providers/types';
import { db, type PendingReceipt } from '@/services/database';
import { isOnline } from '@/utils/network';

/**
 * Receipt format types for different supermarket layouts
 */
type ReceiptFormat = 'spanish-supermarket' | 'generic' | 'auto';

/**
 * Service for OCR processing of receipt images
 * Uses pluggable providers for text recognition (Tesseract.js, LLM, etc.)
 */
export class OCRService {
  private inventoryService?: {
    getProducts: () => Promise<Product[]>;
  };

  private provider: IOCRProvider | null = null;

  /**
   * Set the inventory service dependency
   * Required for product matching functionality
   */
  setInventoryService(service: { getProducts: () => Promise<Product[]> }): void {
    this.inventoryService = service;
  }

  /**
   * Set the OCR provider (REQUIRED before calling processReceipt)
   * @param provider - Any provider implementing IOCRProvider interface
   */
  setOCRProvider(provider: IOCRProvider): void {
    this.provider = provider;
    logger.info('OCR provider set', { provider: provider.name });
  }

  /**
   * Get the current OCR provider
   */
  getOCRProvider(): IOCRProvider | null {
    return this.provider;
  }

  /**
   * Detect receipt format from raw OCR text
   */
  private detectReceiptFormat(ocrText: string): ReceiptFormat {
    const text = ocrText.toUpperCase();

    // Spanish supermarket indicators
    const spanishIndicators = [
      'MERCADONA', 'AHORRAMAS', 'CARREFOUR', 'DIA', 'LIDL', 'ALDI',
      '€', 'IVA', 'TOTAL', 'TARJETA', 'EFECTIVO', 'UNIDADES',
      'PESO', 'IMPORTE', 'CATEGORIA'
    ];

    const spanishCount = spanishIndicators.filter(ind => text.includes(ind)).length;

    if (spanishCount >= 3) {
      return 'spanish-supermarket';
    }

    return 'generic';
  }

  /**
   * Process receipt image with OCR
   * @param imageDataUrl - Base64 data URL of receipt image
   * @returns OCRResult with recognized products and raw text
   */
  async processReceipt(imageDataUrl: string): Promise<OCRResult> {
    if (!this.provider) {
      throw new Error('OCR provider not set. Call ocrService.setOCRProvider() before processing.');
    }

    try {
      logger.debug('Starting OCR processing', {
        imageDataUrl: imageDataUrl.substring(0, 50) + '...',
        provider: this.provider.name
      });

      // Process with configured provider
      const providerResult = await this.provider.process(imageDataUrl);
      const rawText = providerResult.rawText;

      logger.info('OCR text extraction complete', {
        provider: this.provider.name,
        textLength: rawText.length,
        processingTimeMs: providerResult.processingTimeMs,
        confidence: providerResult.confidence,
      });

      // Detect receipt format
      const format = this.detectReceiptFormat(rawText);
      logger.info('Receipt format detected', { format });

      // Extract product names using format-specific parser
      const productNames = this.extractProductNames(rawText, format);
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
   * Extract product names from raw OCR text using format-specific parser
   * @param ocrText - Raw text from Tesseract
   * @param format - Receipt format type
   * @returns Array of candidate product names
   */
  extractProductNames(ocrText: string, format: ReceiptFormat = 'auto'): string[] {
    if (format === 'auto') {
      format = this.detectReceiptFormat(ocrText);
    }

    logger.debug('Extracting products', { format, textLength: ocrText.length });

    let products: string[] = [];

    switch (format) {
      case 'spanish-supermarket':
        products = this.extractSpanishSupermarketProducts(ocrText);
        break;
      default:
        products = this.extractGenericProducts(ocrText);
        break;
    }

    logger.info('Products extracted from OCR', {
      format,
      count: products.length,
      products: products
    });

    return products;
  }

  /**
   * Extract products from Spanish supermarket receipts
   * Handles Mercadona, Ahorramas, Carrefour, etc.
   */
  private extractSpanishSupermarketProducts(ocrText: string): string[] {
    const lines = ocrText.split('\n');

    // Log all lines for debugging
    logger.debug('OCR raw lines', {
      totalLines: lines.length,
      lines: lines.map((l, i) => `${i}: "${l}"`)
    });

    const products: string[] = [];
    const excludePatterns = [
      // Store headers
      /^MERCADONA|^AHORRAMAS|^CARREFOUR|^DIA|^LIDL/i,
      // Receipt metadata
      /^C\/|^CALLE|^TEL\./i,
      /^\d{2}\/\d{2}\/\d{4}/, // Dates
      /^\d{2}:\d{2}/, // Times
      /^OP:|^CAJA:|^TIQUE:/i,
      // Totals and summaries
      /^TOTAL|^SUBTOTAL|^SUMA|^IMPORTE|^IVA|^CAMBIO/i,
      /^EFECTIVO|^TARJETA|^PAGO|^ENTREGADO/i,
      // Tax categories (but not product lines with categories)
      /^\s*[ABC]\s*$/i, // Single letter category codes alone
      // Barcode/UPC numbers
      /^\d{8,14}$/,
      // Single prices
      /^\d+,\d{2}\s*€?$/,
    ];

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines
      if (!trimmed) continue;

      // Skip excluded patterns
      if (excludePatterns.some(pattern => pattern.test(trimmed))) {
        continue;
      }

      // Skip very short lines
      if (trimmed.length < 3) continue;

      // Must contain at least one letter
      if (!/[a-zA-ZáéíóúñÁÉÍÓÚÑ]/.test(trimmed)) continue;

      // Spanish product detection patterns
      // 1. Main product description (all caps, longer text)
      // 2. Often followed by quantity/price on same or next line
      const isProduct = this.isSpanishProductLine(trimmed);

      if (isProduct) {
        const cleaned = this.cleanSpanishProductName(trimmed);
        if (cleaned.length >= 3) {
          products.push(cleaned);
        }
      }
    }

    logger.debug('Spanish products extracted', {
      totalLines: lines.length,
      productsFound: products.length,
      filteredOut: lines.length - products.length
    });

    return products;
  }

  /**
   * Check if a line is a Spanish supermarket product line
   */
  private isSpanishProductLine(line: string): boolean {
    const trimmed = line.trim();

    // Must contain letters (including Spanish characters)
    if (!/[a-zA-ZáéíóúñÁÉÍÓÚÑ]/.test(trimmed)) return false;

    // Skip if it's just a price or quantity
    if (/^\d+,\d{2}\s*(€|€\/kg|€\/u)?$/.test(trimmed)) return false;
    if (/^\d+,\d{3}\s*kg/.test(trimmed)) return false;
    if (/^\d+\s*(Un|unidades|kg|g|ml|l)$/i.test(trimmed)) return false;

    // Skip single letter category codes (A, B, C from Ahorramas)
    if (/^[ABC]\s*$/.test(trimmed)) return false;

    // Skip lines that are mostly numbers/prices
    const numberRatio = (trimmed.match(/\d/g) || []).length / trimmed.length;
    if (numberRatio > 0.6) return false;

    // Product lines typically:
    // - Have more than 2 letters
    // - Are mostly text (not numbers)
    // - Contain product names (all caps in Spanish receipts)
    // - May contain brand names, weights, quantities

    // Spanish product patterns
    const hasProductIndicators = /[A-ZÁÉÍÓÚÑ]{2,}/.test(trimmed); // Multiple uppercase letters

    // Likely a product if it has uppercase letters and isn't just metadata
    if (hasProductIndicators && !this.isSpanishMetadataLine(trimmed)) {
      return true;
    }

    return false;
  }

  /**
   * Check if line is Spanish receipt metadata
   */
  private isSpanishMetadataLine(line: string): boolean {
    const metadataPatterns = [
      /^IVA|^IMPORTE|^TOTAL|^SUMA|^SUBTOTAL|^CAMBIO/i,
      /^EFECTIVO|^TARJETA|^BANCARIA|^PAGO|^ENTREGADO/i,
      /^OP\s[:\d]/i,
      /^CAJA\s[:\d]/i,
      /^TIQUE\s[:\d]/i,
      /^FACTURA|^RECIBO|^COMPROBANTE/i,
      /^C\/|^CALLE|^TEL\.|^NIF|^CIF/i,
      /SUPERMERCADO|^S\.A\.|^SL\./i,
    ];

    return metadataPatterns.some(pattern => pattern.test(line));
  }

  /**
   * Clean Spanish product name
   * Removes quantities, prices, and category codes from Spanish receipt lines
   */
  private cleanSpanishProductName(name: string): string {
    let cleaned = name.trim();

    // First, split by spaces and filter out quantity/price tokens
    const tokens = cleaned.split(/\s+/);
    const filteredTokens: string[] = [];

    for (const token of tokens) {
      // Skip category codes (A, B, C)
      if (/^[ABC]\s*$/.test(token)) continue;

      // Skip single digits (quantities like "1", "2")
      if (/^\d$/.test(token)) continue;

      // Skip price patterns (3,28, 6,22€, 3,28€, etc.)
      if (/^\d+[,.]\d{2}\s*€?$/.test(token)) continue;

      // Skip weight/quantity patterns with decimals (0,305kg, 1,874kg, etc.)
      if (/^\d+[,.]\d+\s*(kg|g|ml|l)$/i.test(token)) continue;

      // Skip quantity with unit patterns (6 Un, 2 U, etc.)
      if (/^\d+\s+(Un|U)$/i.test(token)) continue;

      // Skip standalone unit indicators (Un, U, kg, g, ml, l) - these are never part of product names
      if (/^(Un|U|kg|g|ml|l)$/i.test(token)) continue;

      // Skip price per unit patterns (20,39€/kg, 0,84€/Un, 2,00/kg, etc.)
      if (/^\d+[,.]\d+\s*(€)?\/(kg|u|un|l|ml)$/i.test(token)) continue;

      // Skip standalone price/unit patterns (€/Un, €/kg, /Un, /kg)
      if (/^(€)?\/(kg|u|un|l|ml)$/i.test(token)) continue;
      if (/^EUR\/(kg|u|un|l|ml)$/i.test(token)) continue;

      // Skip standalone € symbol
      if (/^€$/.test(token)) continue;

      // Skip standalone numbers with decimal
      if (/^\d+[,.]\d+$/.test(token)) continue;

      filteredTokens.push(token);
    }

    cleaned = filteredTokens.join(' ').trim();

    // Final cleanup: remove any remaining filler words at the end
    cleaned = cleaned.replace(/\s+(DE|LA|EL|LOS|LAS|CON|SIN)\s*$/i, '').trim();

    return cleaned;
  }

  /**
   * Extract products using generic/default parser
   */
  private extractGenericProducts(ocrText: string): string[] {
    const lines = ocrText.split('\n');

    // Log all lines for debugging
    logger.debug('OCR raw lines (generic)', {
      totalLines: lines.length,
      lines: lines.map((l, i) => `${i}: "${l}"`)
    });

    // Filter to only product lines
    const productLines = lines.filter((line) => this.isProductLine(line));

    logger.debug('Product lines after filtering', {
      originalLines: lines.length,
      productLines: productLines.length,
      filteredOut: lines.length - productLines.length
    });

    // Clean up product names
    const cleanedNames = productLines.map((line) => this.cleanProductName(line)).filter((name) => name.length > 0);

    logger.info('Products extracted from OCR (generic)', {
      count: cleanedNames.length,
      products: cleanedNames
    });

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

  /**
   * Queue a receipt for offline processing (Story 5.4)
   *
   * Use this when offline or API quota is exceeded.
   * The receipt will be stored and processed when connectivity is restored.
   *
   * @param imageDataUrl - Base64 data URL of receipt image
   * @returns The ID of the queued pending receipt
   */
  async queuePendingReceipt(imageDataUrl: string): Promise<number> {
    try {
      const pendingReceipt: PendingReceipt = {
        imageData: imageDataUrl,
        createdAt: new Date(),
        status: 'pending',
      };

      const id = await db.pendingReceipts.add(pendingReceipt);

      logger.info('Receipt queued for offline processing', { id });
      return id;
    } catch (error) {
      const appError = handleError(error);
      logger.error('Failed to queue pending receipt', appError.details);
      throw appError;
    }
  }

  /**
   * Process all pending receipts in the queue (Story 5.4)
   *
   * Called when connectivity is restored or API quota resets.
   * Processes all receipts with status='pending' and updates their status.
   *
   * @returns Count of processed receipts
   */
  async processPendingQueue(): Promise<{ processed: number; completed: number; failed: number }> {
    const results = { processed: 0, completed: 0, failed: 0 };

    try {
      // Check if we're online
      if (!isOnline()) {
        logger.warn('Cannot process pending queue - currently offline');
        return results;
      }

      // Get all pending receipts
      const pendingReceipts = await db.pendingReceipts.where('status').equals('pending').toArray();

      if (pendingReceipts.length === 0) {
        logger.info('No pending receipts to process');
        return results;
      }

      logger.info(`Processing ${pendingReceipts.length} pending receipts`);

      // Process each pending receipt
      for (const receipt of pendingReceipts) {
        results.processed++;

        try {
          // Update status to processing
          await db.pendingReceipts.update(receipt.id!, { status: 'processing' });

          // Process with OCR (this will use the configured LLM provider)
          const ocrResult = await this.processReceipt(receipt.imageData);

          // Update status to completed
          await db.pendingReceipts.update(receipt.id!, {
            status: 'completed',
          });

          results.completed++;

          logger.info('Pending receipt processed successfully', {
            id: receipt.id,
            productsFound: ocrResult.products.length,
          });

          // Note: The caller (ReceiptContext) should handle adding products to inventory
          // This service only handles the OCR processing part
        } catch (error) {
          const appError = handleError(error);

          // Update status to failed with error message
          await db.pendingReceipts.update(receipt.id!, {
            status: 'failed',
            error: appError.message,
          });

          results.failed++;

          logger.error('Failed to process pending receipt', {
            id: receipt.id,
            error: appError.message,
            code: appError.code,
            details: appError.details,
          });
        }
      }

      logger.info('Pending queue processing complete', results);

      // Clean up completed/failed receipts older than 7 days
      await this.cleanupOldPendingReceipts();

      return results;
    } catch (error) {
      const appError = handleError(error);
      logger.error('Failed to process pending queue', appError.details);
      throw appError;
    }
  }

  /**
   * Clean up old processed receipts (Story 5.4)
   *
   * Removes completed and failed receipts older than 7 days
   * to prevent the database from growing indefinitely.
   */
  private async cleanupOldPendingReceipts(): Promise<void> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Get old completed/failed receipts
      const oldReceipts = await db.pendingReceipts
        .where('status')
        .anyOf(['completed', 'failed'])
        .and((receipt) => receipt.createdAt! < sevenDaysAgo)
        .toArray();

      if (oldReceipts.length > 0) {
        const ids = oldReceipts.map((r) => r.id!);
        await db.pendingReceipts.bulkDelete(ids);
        logger.info('Cleaned up old pending receipts', { count: ids.length });
      }
    } catch (error) {
      // Don't throw - cleanup failures shouldn't break the main flow
      logger.error('Failed to cleanup old pending receipts', handleError(error).details);
    }
  }

  /**
   * Get count of pending receipts (Story 5.4)
   *
   * @returns Number of receipts waiting to be processed
   */
  async getPendingCount(): Promise<number> {
    try {
      return await db.pendingReceipts.where('status').equals('pending').count();
    } catch (error) {
      logger.error('Failed to get pending count', handleError(error).details);
      return 0;
    }
  }
}

// Export singleton instance
export const ocrService = new OCRService();
