/**
 * OCR Service Tests
 * Tests for OCR processing, product extraction, and matching functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OCRService } from './ocr';
import type { Product } from '@/types/product';

// Mock inventory service interface
interface MockInventoryService {
  getProducts: () => Promise<Product[]>;
}

// Mock Tesseract.js
vi.mock('tesseract.js', () => ({
  default: {
    recognize: vi.fn(),
  },
}));

// Mock inventory service
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Whole Milk',
    stockLevel: 'high',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isOnShoppingList: false,
    isChecked: false,
  },
  {
    id: '2',
    name: 'Almond Milk',
    stockLevel: 'medium',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
    isOnShoppingList: false,
    isChecked: false,
  },
  {
    id: '3',
    name: 'Bread',
    stockLevel: 'low',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-03'),
    isOnShoppingList: true,
    isChecked: false,
  },
];

describe('OCRService', () => {
  let ocrService: OCRService;
  let Tesseract: { default: { recognize: ReturnType<typeof vi.fn> } };

  beforeEach(async () => {
    ocrService = new OCRService();
    Tesseract = await import('tesseract.js') as typeof Tesseract;
    vi.clearAllMocks();
  });

  describe('processReceipt', () => {
    it('should process receipt image and return OCR result', async () => {
      const mockImageDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRg...';
      const mockOCRText = 'WHOLE MILK $4.99\nBREAD $2.50\nTOTAL $7.49';

      Tesseract.default.recognize.mockResolvedValue({
        data: { text: mockOCRText },
      });

      const result = await ocrService.processReceipt(mockImageDataUrl);

      expect(Tesseract.default.recognize).toHaveBeenCalledWith(
        mockImageDataUrl,
        'eng',
        expect.any(Object) // logger function
      );
      expect(result.rawText).toBe(mockOCRText);
      expect(result.products).toBeDefined();
    });

    it('should extract product names from OCR text', async () => {
      const mockImageDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRg...';
      const mockOCRText = 'WHOLE MILK $4.99\nBREAD $2.50\nTOTAL $7.49';

      Tesseract.default.recognize.mockResolvedValue({
        data: { text: mockOCRText },
      });

      const result = await ocrService.processReceipt(mockImageDataUrl);

      expect(result.products.length).toBeGreaterThan(0);
      // Should exclude prices and totals
      const productNames = result.products.map((p) => p.name.toLowerCase());
      expect(productNames).toContain('whole milk');
      expect(productNames).toContain('bread');
    });

    it('should handle OCR processing errors', async () => {
      const mockImageDataUrl = 'data:image/jpeg;base64,invalid';
      const mockError = new Error('OCR processing failed');

      Tesseract.default.recognize.mockRejectedValue(mockError);

      await expect(ocrService.processReceipt(mockImageDataUrl)).rejects.toThrow();
    });
  });

  describe('extractProductNames', () => {
    it('should extract product names from receipt text', () => {
      const ocrText = `WHOLE MILK $4.99
BREAD $2.50
ALMOND MILK $3.99
TOTAL $11.48`;

      const products = ocrService.extractProductNames(ocrText);

      expect(products).toEqual(['WHOLE MILK', 'BREAD', 'ALMOND MILK']);
    });

    it('should filter out dates', () => {
      const ocrText = `01/15/2024
MILK $4.99
12/31/2023`;

      const products = ocrService.extractProductNames(ocrText);

      expect(products).toEqual(['MILK']);
    });

    it('should filter out prices', () => {
      const ocrText = `$4.99
MILK`;

      const products = ocrService.extractProductNames(ocrText);

      expect(products).toEqual(['MILK']);
    });

    it('should filter out totals', () => {
      const ocrText = `MILK
TOTAL $10.00
SUBTOTAL $9.00`;

      const products = ocrService.extractProductNames(ocrText);

      expect(products).toEqual(['MILK']);
    });

    it('should filter out empty lines', () => {
      const ocrText = `MILK

BREAD


CHEESE`;

      const products = ocrService.extractProductNames(ocrText);

      expect(products).toEqual(['MILK', 'BREAD', 'CHEESE']);
    });

    it('should filter out payment info', () => {
      const ocrText = `MILK
CASH
CARD
CHANGE`;

      const products = ocrService.extractProductNames(ocrText);

      expect(products).toEqual(['MILK']);
    });

    it('should clean up product names', () => {
      const ocrText = `2X MILK 1L
ORGANIC EGGS`;

      const products = ocrService.extractProductNames(ocrText);

      expect(products).toContain('MILK');
      expect(products).toContain('ORGANIC EGGS');
    });
  });

  describe('Spanish Supermarket Format', () => {
    it('should detect Spanish supermarket format', () => {
      const spanishReceipt = `MERCADONA, S.A.
C/ EMILIA PARDO BAZÁN, 5
AGUACATE BANDEJA 1 3,28
SETA LAMINADA 1 2,10
TOTAL 60,95
TARJETA BANCARIA`;

      const products = ocrService.extractProductNames(spanishReceipt);

      // Should extract Spanish products
      expect(products.length).toBeGreaterThan(0);
      expect(products).toContain('AGUACATE BANDEJA');
      expect(products).toContain('SETA LAMINADA');
    });

    it('should handle Mercadona format', () => {
      const mercadonaText = `MERCADONA, S.A.
AGUACATE BANDEJA         1       3,28
SETA LAMINADA            1       2,10
PIÑA GRANEL       1,874 kg  2,00/kg   3,75
TOTAL 9,73`;

      const products = ocrService.extractProductNames(mercadonaText, 'spanish-supermarket');

      expect(products).toContain('AGUACATE BANDEJA');
      expect(products).toContain('SETA LAMINADA');
      expect(products).toContain('PIÑA GRANEL');
    });

    it('should handle Ahorramas format with category codes', () => {
      const ahorramasText = `AHORRAMAS
PECHUGA DE PAVO COCIDA LA S      0,305 kg  20,39 €/kg  A  6,22 €
CHORIZO CULAR IB.NIETO M.65      0,350 kg  20,99 €/kg  A  7,35 €
MANDARINA O CLEMENTINA FONT      1,210 kg  4,59 €/kg  C  5,55 €
TOTAL 107,79 €`;

      const products = ocrService.extractProductNames(ahorramasText, 'spanish-supermarket');

      expect(products).toContain('PECHUGA DE PAVO COCIDA LA S');
      expect(products).toContain('CHORIZO CULAR IB.NIETO M.65');
      expect(products).toContain('MANDARINA O CLEMENTINA FONT');
    });

    it('should remove category codes from Spanish products', () => {
      const text = `LECHE ALIPENDE 1L DESNATADA      6 Un  0,84 €/Un  C  5,04 €`;

      const products = ocrService.extractProductNames(text, 'spanish-supermarket');

      expect(products[0]).toBe('LECHE ALIPENDE 1L DESNATADA');
    });

    it('should handle weight-based Spanish products', () => {
      const text = `PIÑA GRANEL       1,874 kg  2,00/kg   3,75
PLATANO          0,866 kg  2,10/kg   1,82`;

      const products = ocrService.extractProductNames(text, 'spanish-supermarket');

      expect(products).toContain('PIÑA GRANEL');
      expect(products).toContain('PLATANO');
    });

    it('should filter out Spanish receipt metadata', () => {
      const text = `MERCADONA, S.A.
C/ EMILIA PARDO BAZÁN, 5
26/01/2026 17:37
OP: 1987128
TOTAL 60,95
TARJETA BANCARIA`;

      const products = ocrService.extractProductNames(text, 'spanish-supermarket');

      // Should not include metadata as products
      expect(products).not.toContain('MERCADONA');
      expect(products).not.toContain('TOTAL');
      expect(products).not.toContain('TARJETA');
    });
  });

  describe('matchExistingProducts', () => {
    it('should match exact product names with high confidence', async () => {
      const names = ['Whole Milk', 'Bread', 'Almond Milk'];

      ocrService.setInventoryService({
        getProducts: () => Promise.resolve(mockProducts),
      } as MockInventoryService);

      const result = await ocrService.matchExistingProducts(names);

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('Whole Milk');
      expect(result[0].matchedProduct).toEqual(mockProducts[0]);
      expect(result[0].confidence).toBe(1.0);
    });

    it('should match substring with medium confidence', async () => {
      const names = ['Milk'];

      ocrService.setInventoryService({
        getProducts: () => Promise.resolve(mockProducts),
      } as MockInventoryService);

      const result = await ocrService.matchExistingProducts(names);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Milk');
      expect(result[0].matchedProduct).toEqual(mockProducts[1]); // Almond Milk (most recently updated with 'milk' in name)
      expect(result[0].confidence).toBe(0.8);
    });

    it('should return no match with low confidence for unknown products', async () => {
      const names = ['Unknown Product'];

      ocrService.setInventoryService({
        getProducts: () => Promise.resolve(mockProducts),
      } as MockInventoryService);

      const result = await ocrService.matchExistingProducts(names);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Unknown Product');
      expect(result[0].matchedProduct).toBeUndefined();
      expect(result[0].confidence).toBe(0.5);
    });

    it('should be case-insensitive', async () => {
      const names = ['WHOLE MILK', 'bread', 'AlMoNd MiLk'];

      ocrService.setInventoryService({
        getProducts: () => Promise.resolve(mockProducts),
      } as MockInventoryService);

      const result = await ocrService.matchExistingProducts(names);

      expect(result).toHaveLength(3);
      expect(result[0].confidence).toBe(1.0); // Whole Milk exact match
      expect(result[1].confidence).toBe(1.0); // bread exact match
      expect(result[2].matchedProduct).toEqual(mockProducts[1]); // Almond Milk
      expect(result[2].confidence).toBe(1.0); // Exact match (case-insensitive)
    });
  });

  describe('isProductLine', () => {
    it('should identify product lines correctly', () => {
      expect(ocrService.isProductLine('WHOLE MILK')).toBe(true);
      expect(ocrService.isProductLine('Organic Eggs')).toBe(true);
      expect(ocrService.isProductLine('BREAD')).toBe(true);
    });

    it('should filter out date lines', () => {
      expect(ocrService.isProductLine('01/15/2024')).toBe(false);
      expect(ocrService.isProductLine('12-31-2023')).toBe(false);
      expect(ocrService.isProductLine('2024-01-15')).toBe(false);
    });

    it('should filter out price lines', () => {
      expect(ocrService.isProductLine('$4.99')).toBe(false);
      expect(ocrService.isProductLine('12.99')).toBe(false);
      expect(ocrService.isProductLine('$12.99')).toBe(false);
    });

    it('should filter out totals', () => {
      expect(ocrService.isProductLine('TOTAL')).toBe(false);
      expect(ocrService.isProductLine('SUBTOTAL')).toBe(false);
      expect(ocrService.isProductLine('SUM')).toBe(false);
    });

    it('should filter out payment info', () => {
      expect(ocrService.isProductLine('CASH')).toBe(false);
      expect(ocrService.isProductLine('CARD')).toBe(false);
      expect(ocrService.isProductLine('CHANGE')).toBe(false);
    });

    it('should filter out empty lines', () => {
      expect(ocrService.isProductLine('')).toBe(false);
      expect(ocrService.isProductLine('   ')).toBe(false);
    });

    it('should filter out times', () => {
      expect(ocrService.isProductLine('14:30')).toBe(false);
      expect(ocrService.isProductLine('2:45')).toBe(false);
    });

    it('should require minimum 3 characters', () => {
      expect(ocrService.isProductLine('AB')).toBe(false);
      expect(ocrService.isProductLine('A')).toBe(false);
      expect(ocrService.isProductLine('MILK')).toBe(true);
    });
  });

  describe('cleanProductName', () => {
    it('should remove quantity prefixes', () => {
      expect(ocrService.cleanProductName('2X MILK')).toBe('MILK');
      expect(ocrService.cleanProductName('3 KG FLOUR')).toBe('FLOUR');
    });

    it('should remove weight suffixes', () => {
      expect(ocrService.cleanProductName('MILK 1L')).toBe('MILK');
      expect(ocrService.cleanProductName('JUICE 500ML')).toBe('JUICE');
    });

    it('should trim whitespace', () => {
      expect(ocrService.cleanProductName('  MILK  ')).toBe('MILK');
    });

    it('should capitalize first letter', () => {
      expect(ocrService.cleanProductName('milk')).toBe('Milk');
      expect(ocrService.cleanProductName('WHOLE MILK')).toBe('WHOLE MILK');
    });

    it('should handle empty strings', () => {
      expect(ocrService.cleanProductName('')).toBe('');
    });
  });
});
