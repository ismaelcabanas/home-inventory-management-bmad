import { describe, it, expect } from 'vitest';
import {
  getNextStockLevel,
  getStockLevelGradient,
  getStockLevelBorderColor,
  getStockLevelText,
  STOCK_LEVELS,
} from './stockLevels';
import type { StockLevel } from './stockLevels';

describe('stockLevels utility functions', () => {
  describe('STOCK_LEVELS constant', () => {
    it('should contain all four stock levels in correct order', () => {
      expect(STOCK_LEVELS).toEqual(['high', 'medium', 'low', 'empty']);
    });
  });

  describe('getNextStockLevel', () => {
    it('should cycle from high to medium', () => {
      expect(getNextStockLevel('high')).toBe('medium');
    });

    it('should cycle from medium to low', () => {
      expect(getNextStockLevel('medium')).toBe('low');
    });

    it('should cycle from low to empty', () => {
      expect(getNextStockLevel('low')).toBe('empty');
    });

    it('should wrap from empty back to high', () => {
      expect(getNextStockLevel('empty')).toBe('high');
    });

    it('should cycle through all levels correctly', () => {
      const levels: StockLevel[] = ['high', 'medium', 'low', 'empty', 'high'];
      for (let i = 0; i < levels.length - 1; i++) {
        expect(getNextStockLevel(levels[i])).toBe(levels[i + 1]);
      }
    });
  });

  describe('getStockLevelGradient', () => {
    it('should return green gradient for high stock level', () => {
      const gradient = getStockLevelGradient('high');
      expect(gradient).toContain('#e8f5e9');
      expect(gradient).toContain('#c8e6c9');
      expect(gradient).toContain('linear-gradient');
    });

    it('should return yellow/orange gradient for medium stock level', () => {
      const gradient = getStockLevelGradient('medium');
      expect(gradient).toContain('#fff8e1');
      expect(gradient).toContain('#ffecb3');
      expect(gradient).toContain('linear-gradient');
    });

    it('should return orange/red gradient for low stock level', () => {
      const gradient = getStockLevelGradient('low');
      expect(gradient).toContain('#fff3e0');
      expect(gradient).toContain('#ffe0b2');
      expect(gradient).toContain('linear-gradient');
    });

    it('should return red gradient for empty stock level', () => {
      const gradient = getStockLevelGradient('empty');
      expect(gradient).toContain('#ffebee');
      expect(gradient).toContain('#ffcdd2');
      expect(gradient).toContain('linear-gradient');
    });
  });

  describe('getStockLevelBorderColor', () => {
    it('should return green color for high stock level', () => {
      expect(getStockLevelBorderColor('high')).toBe('#4caf50');
    });

    it('should return orange color for medium stock level', () => {
      expect(getStockLevelBorderColor('medium')).toBe('#ff9800');
    });

    it('should return red-orange color for low stock level', () => {
      expect(getStockLevelBorderColor('low')).toBe('#ff5722');
    });

    it('should return red color for empty stock level', () => {
      expect(getStockLevelBorderColor('empty')).toBe('#f44336');
    });
  });

  describe('getStockLevelText', () => {
    it('should return "In stock" for high stock level', () => {
      expect(getStockLevelText('high')).toBe('In stock');
    });

    it('should return "Running low" for medium stock level', () => {
      expect(getStockLevelText('medium')).toBe('Running low');
    });

    it('should return "Almost empty" for low stock level', () => {
      expect(getStockLevelText('low')).toBe('Almost empty');
    });

    it('should return "Empty" for empty stock level', () => {
      expect(getStockLevelText('empty')).toBe('Empty');
    });
  });
});
