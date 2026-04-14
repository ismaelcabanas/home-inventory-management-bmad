# Story 11.10: Fix Product Matching - Prevent Duplicate Products on Receipt Scan

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want the system to correctly match products from new receipts with existing inventory,
so that I don't get duplicate products when scanning receipts after shopping.

## User Story Context

**Bug Description:**
When scanning receipts after shopping, the product matching logic fails to match products that should match, resulting in 50% confidence and creating duplicate products in inventory if confirmed. This occurs because the matching logic only checks if the inventory product name contains the OCR name, but not the reverse. OCR typically returns more detailed names (e.g., "Leche entera 1L") while inventory has simplified names (e.g., "Leche"), causing the one-directional check to fail.

**Example of the Bug:**
- Inventory has: "Leche", "Pan", "Manzanas"
- OCR recognizes: "Leche entera 1L", "Pan barra 500g", "Manzanas Golden 1kg"
- Current behavior: Only checks if "Leche" contains "Leche entera 1L" (FALSE)
- Expected behavior: Should also check if "Leche entera 1L" contains "Leche" (TRUE)

**Acceptance Criteria:**

1. **Given** I have existing products in my inventory (e.g., "Leche", "Pan", "Manzanas")
   **When** I scan a new receipt after shopping
   **Then** Products on the receipt should match existing inventory even if the OCR name is more detailed
   **And** "Leche entera 1L" from OCR should match "Leche" in inventory with high confidence
   **And** "Pan barra 500g" from OCR should match "Pan" in inventory with high confidence
   **And** "Manzanas Golden 1kg" from OCR should match "Manzanas" in inventory with high confidence

2. **Given** the OCR product name is more detailed than the inventory product name
   **When** the matching algorithm compares them
   **Then** The system should perform bidirectional matching:
     - Check if inventory name contains OCR name (existing behavior)
     - Check if OCR name contains inventory name (new behavior)
   **And** A match should be found if either condition is true
   **And** Confidence should be set to 0.8 for partial/inverse matches

3. **Given** I have a product "Coca-Cola" in inventory
   **When** OCR recognizes "Coca-Cola Zero 33cl" on receipt
   **Then** The system should recognize this as a match to "Coca-Cola"
   **And** Display confidence of 0.8 (medium confidence, requires confirmation)
   **And** Not create a duplicate "Coca-Cola Zero 33cl" product

4. **Given** I review matched products before confirming
   **When** I see products with 0.8 confidence
   **Then** I can choose to:
     - Confirm the match (uses existing inventory product)
     - Mark as different product (creates new product)
   **And** The default behavior prevents accidental duplicates

5. **Given** I confirm the receipt scan
   **When** The inventory is updated
   **Then** No duplicate products are created for items that matched existing inventory
   **And** Stock levels are updated for matched products
   **And** Only truly new products are added to inventory

6. **Given** I scan multiple receipts over time
   **When** The same product appears with slightly different names
   **Then** The system consistently matches them to the same inventory product
   **And** My inventory doesn't accumulate duplicates of the same product

## Tasks / Subtasks

- [ ] Task 1: Implement bidirectional product matching logic (AC: 1, 2, 3)
  - [ ] Subtask 1.1: Update `matchExistingProducts()` method in `src/services/ocr/ocr.service.ts` (line 481)
  - [ ] Subtask 1.2: Change one-directional contains check to bidirectional:
    ```typescript
    // Current (one-directional):
    const matches = products.filter((p) => p.name.toLowerCase().includes(lowerOcrName));

    // Proposed (bidirectional):
    const matches = products.filter((p) =>
      p.name.toLowerCase().includes(lowerOcrName) ||
      lowerOcrName.includes(p.name.toLowerCase())
    );
    ```
  - [ ] Subtask 1.3: Set confidence to 0.8 for bidirectional matches (same as existing partial matches)
  - [ ] Subtask 1.4: Add normalization logic (trim, remove extra spaces) before matching
  - [ ] Subtask 1.5: Ensure most-recently-used matching is preserved for multiple matches

- [ ] Task 2: Add comprehensive unit tests for bidirectional matching (AC: 1, 2, 3, 6)
  - [ ] Subtask 2.1: Test OCR name more detailed than inventory name (e.g., "Leche entera 1L" matches "Leche")
  - [ ] Subtask 2.2: Test inventory name more detailed than OCR name (existing behavior)
  - [ ] Subtask 2.3: Test brand variations (e.g., "Coca-Cola Zero 33cl" matches "Coca-Cola")
  - [ ] Subtask 2.4: Test Spanish product names with quantities/weights
  - [ ] Subtask 2.5: Test normalization (extra spaces, trimming)
  - [ ] Subtask 2.6: Test multiple receipt scans with same product (consistency)
  - [ ] Subtask 2.7: Test no false positives (e.g., "Pan" shouldn't match "Mantecado")

- [ ] Task 3: Run full test suite and validate no regressions (AC: 4, 5, 6)
  - [ ] Subtask 3.1: Run all existing OCR service tests
  - [ ] Subtask 3.2: Run integration tests for receipt flow
  - [ ] Subtask 3.3: Run E2E tests for receipt scanning
  - [ ] Subtask 3.4: Manual testing: Scan receipt with products that have detailed OCR names

## Dev Notes

### Bug Root Cause

The current `matchExistingProducts()` method at line 481 of `src/services/ocr/ocr.service.ts` performs one-directional matching:

```typescript
// Line 481 - Current (BUGGY):
const matches = products.filter((p) => p.name.toLowerCase().includes(lowerOcrName));
```

This only works when:
- Inventory name = "Whole Milk"
- OCR name = "Milk" (contains match works: "Whole Milk".includes("milk"))

But FAILS when:
- Inventory name = "Leche"
- OCR name = "Leche entera 1L" (contains match fails: "Leche".includes("leche entera 1l"))

### Architecture Patterns

- **Service Layer:** OCR service uses repository pattern with inventory service dependency injection
- **Pluggable Providers:** Multiple OCR providers (LLM, Tesseract) share same matching logic
- **Confidence Scoring:** 1.0 = exact match, 0.8 = partial/inverse match, 0.5 = no match
- **Match Priority:** Most recently updated product wins when multiple matches exist

### Code Structure

```
src/
└── services/
    └── ocr/
        ├── ocr.service.ts           # ← UPDATE matchExistingProducts() method (line 481)
        └── ocr.service.test.ts      # ← ADD bidirectional matching tests
```

### Implementation Guidance

**Step 1: Update matchExistingProducts() method**

Location: `src/services/ocr/ocr.service.ts`, starting at line 449

```typescript
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
    // NORMALIZATION: Trim and normalize whitespace
    const normalizedOcrName = ocrName.trim().replace(/\s+/g, ' ');
    const lowerOcrName = normalizedOcrName.toLowerCase();

    // Try exact match first
    const match = products.find((p) => {
      const normalizedProductName = p.name.trim().replace(/\s+/g, ' ');
      return normalizedProductName.toLowerCase() === lowerOcrName;
    });

    if (match) {
      recognizedProducts.push({
        id: crypto.randomUUID(),
        name: ocrName, // Keep original OCR name for display
        matchedProduct: match,
        confidence: 1.0,
        isCorrect: false,
      });
      continue;
    }

    // BIDIRECTIONAL MATCHING: Check both directions
    const matches = products.filter((p) => {
      const normalizedName = p.name.trim().replace(/\s+/g, ' ');
      const lowerName = normalizedName.toLowerCase();

      // Direction 1: Inventory contains OCR (existing)
      const inventoryContainsOcr = lowerName.includes(lowerOcrName);

      // Direction 2: OCR contains inventory (NEW - fixes the bug)
      const ocrContainsInventory = lowerOcrName.includes(lowerName);

      return inventoryContainsOcr || ocrContainsInventory;
    });

    if (matches.length > 0) {
      // Pick most recently updated
      matches.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      recognizedProducts.push({
        id: crypto.randomUUID(),
        name: ocrName,
        matchedProduct: matches[0],
        confidence: 0.8, // Medium confidence for partial/inverse matches
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
```

**Step 2: Add comprehensive tests**

Location: `src/services/ocr/ocr.service.test.ts`

Add new test suite for bidirectional matching:

```typescript
describe('Bidirectional Product Matching', () => {
  it('should match when OCR name is more detailed than inventory name', async () => {
    const inventoryProducts: Product[] = [
      { id: '1', name: 'Leche', stockLevel: 'high', createdAt: new Date(), updatedAt: new Date(), isOnShoppingList: false, isChecked: false },
      { id: '2', name: 'Pan', stockLevel: 'high', createdAt: new Date(), updatedAt: new Date(), isOnShoppingList: false, isChecked: false },
    ];

    ocrService.setInventoryService({
      getProducts: () => Promise.resolve(inventoryProducts),
    } as MockInventoryService);

    const result = await ocrService.matchExistingProducts(['Leche entera 1L', 'Pan barra 500g']);

    expect(result).toHaveLength(2);
    expect(result[0].matchedProduct?.name).toBe('Leche');
    expect(result[0].confidence).toBe(0.8);
    expect(result[1].matchedProduct?.name).toBe('Pan');
    expect(result[1].confidence).toBe(0.8);
  });

  it('should match brand variations (e.g., Coca-Cola Zero matches Coca-Cola)', async () => {
    const inventoryProducts: Product[] = [
      { id: '1', name: 'Coca-Cola', stockLevel: 'high', createdAt: new Date(), updatedAt: new Date(), isOnShoppingList: false, isChecked: false },
    ];

    ocrService.setInventoryService({
      getProducts: () => Promise.resolve(inventoryProducts),
    } as MockInventoryService);

    const result = await ocrService.matchExistingProducts(['Coca-Cola Zero 33cl']);

    expect(result).toHaveLength(1);
    expect(result[0].matchedProduct?.name).toBe('Coca-Cola');
    expect(result[0].confidence).toBe(0.8);
  });

  it('should normalize whitespace before matching', async () => {
    const inventoryProducts: Product[] = [
      { id: '1', name: 'Manzanas', stockLevel: 'high', createdAt: new Date(), updatedAt: new Date(), isOnShoppingList: false, isChecked: false },
    ];

    ocrService.setInventoryService({
      getProducts: () => Promise.resolve(inventoryProducts),
    } as MockInventoryService);

    const result = await ocrService.matchExistingProducts(['  Manzanas   Golden   1kg  ']);

    expect(result).toHaveLength(1);
    expect(result[0].matchedProduct?.name).toBe('Manzanas');
    expect(result[0].confidence).toBe(0.8);
  });

  it('should not create false positives for partial word matches', async () => {
    const inventoryProducts: Product[] = [
      { id: '1', name: 'Pan', stockLevel: 'high', createdAt: new Date(), updatedAt: new Date(), isOnShoppingList: false, isChecked: false },
    ];

    ocrService.setInventoryService({
      getProducts: () => Promise.resolve(inventoryProducts),
    } as MockInventoryService);

    const result = await ocrService.matchExistingProducts(['Mantecado']);

    expect(result).toHaveLength(1);
    expect(result[0].matchedProduct).toBeUndefined();
    expect(result[0].confidence).toBe(0.5); // No match
  });

  it('should handle multiple scans of same product consistently', async () => {
    const inventoryProducts: Product[] = [
      { id: '1', name: 'Leche', stockLevel: 'high', createdAt: new Date(), updatedAt: new Date(), isOnShoppingList: false, isChecked: false },
    ];

    ocrService.setInventoryService({
      getProducts: () => Promise.resolve(inventoryProducts),
    } as MockInventoryService);

    // First scan
    const result1 = await ocrService.matchExistingProducts(['Leche entera 1L']);
    // Second scan with different variation
    const result2 = await ocrService.matchExistingProducts(['Leche semi 1L']);

    expect(result1[0].matchedProduct?.id).toBe(result2[0].matchedProduct?.id);
    expect(result1[0].confidence).toBe(0.8);
    expect(result2[0].confidence).toBe(0.8);
  });
});
```

### Edge Cases

1. **Normalization needed:** Extra spaces, inconsistent spacing should be normalized before matching
2. **False positives:** "Pan" shouldn't match "Mantecado" just because "pan" is in "mantecado"
3. **Multiple matches:** When multiple products match, most recently updated wins (existing behavior)
4. **Exact matches:** Still take priority over partial matches (confidence 1.0 vs 0.8)

### Testing Standards

- Unit tests for all bidirectional matching scenarios
- Test both directions: OCR→Inventory and Inventory→OCR
- Test Spanish product names with quantities/weights
- Test normalization (trim, extra spaces)
- Test consistency across multiple scans
- Manual testing: Scan real receipt and verify no duplicates

### Previous Story Intelligence (11.9)

Story 11.9 added the "quick-add mode" for empty inventory. Key learnings:
- Be explicit about mode detection and state handling
- Ensure new features don't break existing flows
- Clear separation between modes

For this story (11.10):
- The matching logic change affects ALL receipt scans (normal and quick-add)
- Must ensure existing behavior (exact matches, inventory→OCR direction) still works
- Only change is adding OCR→Inventory direction for partial matches

### Git Intelligence

Recent commits show patterns:
- Feature branches: `feat/story-XX-YYYY-description`
- Commit messages follow conventional commit format
- All changes tested before commit
- Previous OCR-related stories: 5.4 (offline queue), 10.x (LLM matching)

### Project Structure Notes

- **Service Layer:** OCR service is singleton with dependency injection
- **Test Organization:** Tests co-located with source files
- **Type Safety:** All types defined in `@/types/product` and `@/features/receipt/types/receipt.types`
- **Confidence Levels:** 1.0 = exact, 0.8 = partial/inverse, 0.5 = no match

### References

- **OCR Service:** [Source: src/services/ocr/ocr.service.ts#L449-L512]
- **OCR Tests:** [Source: src/services/ocr/ocr.service.test.ts#L271-L332]
- **Product Type:** [Source: src/types/product.ts]
- **Receipt Types:** [Source: src/features/receipt/types/receipt.types.ts]
- **Previous OCR Work:** Story 5.2 (OCR processing), Story 5.3 (Review UI), Story 10.1-10.5 (LLM matching)

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
