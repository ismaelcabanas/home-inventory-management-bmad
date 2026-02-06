# Story 6.1: Update Inventory from Confirmed Receipt Products

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want products from my receipt to automatically update to "High" stock in my inventory,
So that I don't have to manually mark everything I just bought.

## Context

This is the **first story in Epic 6 - Inventory Updates from Receipt & Complete Automation Loop**. This epic **closes the complete automation cycle** that is the core value proposition of the entire application.

**Epic 6 Goal:** Users experience the complete automated cycle: mark consumed → shopping list auto-generates → shop → scan receipt → inventory updates automatically. The full automation promise is realized.

**Critical Success Factor:** This story delivers the "trust milestone" moment. When users see their inventory automatically update after scanning a receipt, with purchased items removed from the shopping list, they experience the complete value of the automation. This is where mental load disappears.

**Epic 6 Story Flow:**
- Story 6.1 (this story): Core inventory update automation
- Story 6.2: Error handling edge cases and recovery

**Integration Points:**
- **Input:** Confirmed product list from Story 5.3 (ReceiptReview)
- **Output:** Updated inventory (stock to High) + cleared shopping list
- **Services:** InventoryService.replenishStock(), ShoppingService.removeFromList()
- **Database:** Products table updates with stockLevel='high', isOnShoppingList=false

**Why This Matters:**
This story completes the automation loop. Until now, users had to manually mark items as High after shopping. This story eliminates that manual step, making the entire cycle hands-free. When this works, users experience the "aha moment" - the system just knows what they need and updates automatically.

## Acceptance Criteria

### AC1: Update Existing Products to High Stock

**Given** I have products in my inventory that were marked Low or Empty
**And** I have confirmed and corrected the OCR results from Story 5.3
**And** I tap "Confirm & Update Inventory"
**When** The inventory update process begins
**Then** For each confirmed product that already exists in my inventory:
- The stock level is updated to "High" (FR32)
- The `updatedAt` timestamp is updated
- The product immediately shows "High" status when I view the inventory

### AC2: Add New Products from Receipt

**Given** I confirmed a product from the receipt that does NOT exist in my inventory
**And** I tap "Confirm & Update Inventory"
**When** The inventory update process begins
**Then** The new product is created with:
- Product name from the confirmed receipt
- Stock level set to "High" (FR33)
- `createdAt` and `updatedAt` timestamps set
- The product appears in my inventory list immediately

### AC3: Remove Purchased Items from Shopping List

**Given** I have items on my shopping list (Low/Empty products)
**And** I confirmed those products from the receipt
**And** I tap "Confirm & Update Inventory"
**When** The inventory update process completes
**Then** All purchased products are automatically removed from the shopping list (FR34)
**And** The shopping list count badge updates to show the new count
**And** When I navigate to the shopping list, purchased items are no longer visible

### AC4: Display Processing Status

**Given** I have confirmed the OCR results
**When** I tap "Confirm & Update Inventory"
**Then** I see a processing screen with:
- Status message: "Updating inventory..." (FR43)
- Progress indicator (MUI CircularProgress or LinearProgress)
**And** The screen shows until all updates are complete

### AC5: Display Success Confirmation

**Given** The inventory update process has completed successfully
**When** All products are updated and the shopping list is cleared
**Then** A success message appears: "Inventory updated! {X} products replenished" (FR43)
**And** I am automatically navigated to the inventory screen
**And** The updated products are visible immediately with "High" status

### AC6: Persist Updates Reliably

**Given** The inventory update has completed
**When** I close and reopen the app
**Then** All inventory updates persist (FR35, NFR4):
- Products that were updated to "High" remain "High"
- New products that were added remain in the inventory
- Purchased items remain removed from shopping list
- No data is lost or corrupted

### AC7: Handle Update Errors Gracefully

**Given** An error occurs during inventory update (database error, unexpected failure)
**When** The error happens
**Then** The processing stops gracefully
**And** A clear error message is displayed using MUI Alert (FR41):
- User-friendly message (e.g., "Failed to update inventory. Please try again.")
- Technical error code logged (for debugging)
**And** A "Try Again" button is available to retry the update
**And** Products remain in their original state (no partial updates)

## Tasks / Subtasks

### Task 1: Create Inventory Update Service Methods (AC: #1, #2)

- [ ] Subtask 1.1: Add `replenishStock()` method to InventoryService
  - Method signature: `async replenishStock(productNames: string[]): Promise<void>`
  - For each productName in productNames:
    - Query existing product by name (case-insensitive match)
    - If found: update stockLevel to 'high', update updatedAt timestamp
    - If not found: call `addProductFromReceipt()`
  - Use database transaction for atomicity (NFR4)
  - Handle errors with try/catch and AppError conversion
  - Log all operations with logger utility

- [ ] Subtask 1.2: Add `addProductFromReceipt()` method to InventoryService
  - Method signature: `async addProductFromReceipt(name: string): Promise<Product>`
  - Create new Product with:
    - name: from parameter
    - stockLevel: 'high'
    - isOnShoppingList: false
    - createdAt: new Date()
    - updatedAt: new Date()
  - Return created Product
  - Handle duplicate name errors gracefully

- [ ] Subtask 1.3: Write InventoryService unit tests
  - Test `replenishStock()` with existing products (stockLevel → 'high')
  - Test `replenishStock()` with new products (create new products)
  - Test `replenishStock()` with mixed existing/new products
  - Test database transaction rollback on error
  - Test case-insensitive product name matching
  - Test error handling (database errors)

### Task 2: Create Shopping List Update Service Methods (AC: #3)

- [ ] Subtask 2.1: Add `removePurchasedItems()` method to ShoppingService
  - Method signature: `async removePurchasedItems(productNames: string[]): Promise<number>`
  - For each productName in productNames:
    - Query product by name (case-insensitive match)
    - If found: set isOnShoppingList to false
  - Return count of items removed
  - Use database transaction for atomicity
  - Handle errors with try/catch and AppError conversion

- [ ] Subtask 2.2: Write ShoppingService unit tests
  - Test `removePurchasedItems()` removes matching products from shopping list
  - Test `removePurchasedItems()` handles products not on shopping list
  - Test `removePurchasedItems()` returns correct count
  - Test database transaction rollback on error

### Task 3: Update ReceiptContext with Inventory Update State (AC: #4, #5, #7)

- [ ] Subtask 3.1: Add new state to ReceiptState
  - `updatingInventory: boolean` - true during inventory update process
  - `updateError: AppError | null` - error if update fails
  - `productsUpdated: number` - count of products successfully updated

- [ ] Subtask 3.2: Add `updateInventoryFromReceipt()` action to ReceiptContext
  - Action type: `UPDATE_INVENTORY_FROM_RECEIPT`
  - Handler function:
    - Set `updatingInventory: true`
    - Call `inventoryService.replenishStock(confirmedProducts)`
    - Call `shoppingService.removePurchasedItems(confirmedProducts)`
    - On success:
      - Set `productsUpdated` count
      - Show success message
      - Navigate to inventory screen
    - On error:
      - Set `updateError` with AppError
      - Show error Alert
      - Allow retry
    - Set `updatingInventory: false` in finally block

- [ ] Subtask 3.3: Update ReceiptContext reducer
  - Handle `SET_UPDATING_INVENTORY` action
  - Handle `INVENTORY_UPDATE_SUCCESS` action
  - Handle `INVENTORY_UPDATE_ERROR` action
  - Ensure immutable state updates

- [ ] Subtask 3.4: Write ReceiptContext tests for inventory update flow
  - Test successful inventory update flow
  - Test error handling and retry
  - Test navigation to inventory screen
  - Test state transitions

### Task 4: Update ReceiptReview Component (AC: #1, #2, #3, #4, #5)

- [ ] Subtask 4.1: Add "Confirm & Update Inventory" button to ReceiptReview
  - Button at bottom of review screen
  - MUI Button variant="contained" color="primary"
  - Disabled when no products confirmed
  - Full width for mobile touch targets (44x44px minimum)

- [ ] Subtask 4.2: Implement inventory update processing UI
  - Show processing screen when `updatingInventory === true`
  - Display MUI CircularProgress or LinearProgress
  - Show status message: "Updating inventory..."
  - Disable back button during processing

- [ ] Subtask 4.3: Implement success confirmation UI
  - Show success message: "Inventory updated! {X} products replenished"
  - Use MUI Alert or Dialog for success
  - Auto-navigate to inventory screen after 1-2 seconds
  - Or provide "View Inventory" button

- [ ] Subtask 4.4: Implement error recovery UI
  - Show MUI Alert with error message on `updateError`
  - Display user-friendly error message
  - Provide "Try Again" button (retriggers updateInventoryFromReceipt)
  - Provide "Cancel" button (returns to review screen)

- [ ] Subtask 4.5: Test ReceiptReview component
  - Test button click triggers inventory update
  - Test processing UI shows correctly
  - Test success confirmation and navigation
  - Test error display and retry flow

### Task 5: Implement Product Matching Logic (AC: #1, #2)

- [ ] Subtask 5.1: Add `findExistingProduct()` helper to InventoryService
  - Method signature: `async findExistingProduct(name: string): Promise<Product | undefined>`
  - Query products table with case-insensitive name match
  - Handle product name variations (e.g., "Milk" vs "Milk 1L" vs "Organic Milk")
  - Return first matching product or undefined

- [ ] Subtask 5.2: Implement fuzzy matching heuristics
  - Exact match: product names equal (case-insensitive)
  - Partial match: one name contains the other (e.g., "Milk" in "Organic Milk")
  - Strip common words (brand names, sizes, weights)
  - Match if similarity > 80% (optional, for MVP use exact/partial)

- [ ] Subtask 5.3: Write product matching tests
  - Test exact match (case-insensitive)
  - Test partial match scenarios
  - Test no match scenarios
  - Test edge cases (empty string, special characters)

### Task 6: Update Database Transactions (AC: #6, #7)

- [ ] Subtask 6.1: Wrap inventory updates in database transaction
  - Use Dexie.js transaction API
  - Include products table operations
  - Ensure all-or-nothing updates (atomicity)
  - Rollback on any error

- [ ] Subtask 6.2: Test transaction rollback
  - Simulate database error during update
  - Verify no partial updates occur
  - Verify products remain in original state

### Task 7: Integration Tests (AC: #1, #2, #3, #6)

- [ ] Subtask 7.1: Create integration test for complete inventory update flow
  - Start with products in Low/Empty state
  - Simulate confirmed OCR results
  - Call `updateInventoryFromReceipt()`
  - Verify:
    - Existing products updated to High
    - New products created with High stock
    - Shopping list items removed
    - Success message shown
    - Navigation to inventory screen

- [ ] Subtask 7.2: Test edge cases
  - Empty product list (no confirmed products)
  - All new products (no existing matches)
  - All existing products (no new products)
  - Duplicate product names in confirmed list

### Task 8: E2E Tests (AC: #1, #2, #3, #4, #5, #6)

- [ ] Subtask 8.1: Create E2E test for complete automation cycle
  - Add 3 products to inventory, set to Low/Empty
  - Verify they appear in shopping list
  - Navigate to scan page
  - Mock OCR to return same 3 products
  - Review and confirm products
  - Tap "Confirm & Update Inventory"
  - Verify processing screen appears
  - Verify success message appears
  - Verify navigation to inventory screen
  - Verify all 3 products show High stock
  - Verify shopping list is empty

- [ ] Subtask 8.2: Create E2E test for new products from receipt
  - Start with empty inventory
  - Mock OCR to return 2 new products
  - Review and confirm products
  - Confirm inventory update
  - Verify both new products appear in inventory with High stock

- [ ] Subtask 8.3: Create E2E test for error recovery
  - Mock database error during inventory update
  - Verify error message appears
  - Verify "Try Again" button works
  - Verify retry succeeds on second attempt

### Task 9: Manual Testing Checklist (AC: #1, #2, #3, #4, #5, #6, #7)

- [ ] Subtask 9.1: Test happy path with real receipt
  - Capture real receipt photo
  - Review and confirm OCR results
  - Tap "Confirm & Update Inventory"
  - Verify processing screen shows
  - Verify success message appears
  - Verify inventory updates correctly
  - Verify shopping list clears

- [ ] Subtask 9.2: Test with mixed existing/new products
  - Some products already in inventory (Low/Empty)
  - Some products new (not in inventory)
  - Verify existing products updated to High
  - Verify new products created correctly

- [ ] Subtask 9.3: Test product matching edge cases
  - Product with slight name variation (e.g., "Organic Milk" vs "Milk")
  - Verify correct matching or creation as new product

- [ ] Subtask 9.4: Test error recovery
  - Simulate database error
  - Verify error message appears
  - Verify retry works correctly
  - Verify products unchanged after error

- [ ] Subtask 9.5: Test persistence
  - Complete inventory update
  - Close and reopen app
  - Verify all updates persisted

## Dev Notes

### Critical Implementation Requirements

**Complete Automation Loop:**

This story is the culmination of the entire product vision. When this works, users experience the complete automated cycle:

```
Mark consumed (tap) → Auto-generated shopping list → Shop → Scan receipt → Inventory updates automatically
```

This is the "trust milestone" moment. Users realize they never have to manually create a shopping list or manually mark items as purchased again.

**Service Layer Architecture:**

**InventoryService Updates:**
```typescript
// src/services/inventory.ts
class InventoryService {
  // NEW: Update existing products to High stock, add new products
  async replenishStock(productNames: string[]): Promise<void> {
    await db.transaction('rw', db.products, async () => {
      for (const name of productNames) {
        const existing = await this.findExistingProduct(name);

        if (existing) {
          // Update existing product to High
          await db.products.update(existing.id!, {
            stockLevel: 'high',
            updatedAt: new Date()
          });
          logger.info(`Updated product to High: ${name}`);
        } else {
          // Add new product
          await this.addProductFromReceipt(name);
        }
      }
    });
  }

  // NEW: Find existing product by name (case-insensitive, fuzzy match)
  async findExistingProduct(name: string): Promise<Product | undefined> {
    const normalized = name.toLowerCase().trim();

    // Try exact match first
    let product = await db.products
      .filter(p => p.name.toLowerCase().trim() === normalized)
      .first();

    if (product) return product;

    // Try partial match (one contains the other)
    const allProducts = await db.products.toArray();
    return allProducts.find(p => {
      const pName = p.name.toLowerCase().trim();
      return pName.includes(normalized) || normalized.includes(pName);
    });
  }

  // NEW: Add product from receipt
  async addProductFromReceipt(name: string): Promise<Product> {
    const id = await db.products.add({
      name: name.trim(),
      stockLevel: 'high',
      isOnShoppingList: false,
      isChecked: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    logger.info(`Added new product from receipt: ${name}`);
    return (await db.products.get(id))!;
  }
}

export const inventoryService = new InventoryService();
```

**ShoppingService Updates:**
```typescript
// src/services/shopping.ts
class ShoppingService {
  // NEW: Remove purchased items from shopping list
  async removePurchasedItems(productNames: string[]): Promise<number> {
    let removedCount = 0;

    await db.transaction('rw', db.products, async () => {
      for (const name of productNames) {
        const product = await inventoryService.findExistingProduct(name);

        if (product && product.isOnShoppingList) {
          await db.products.update(product.id!, {
            isOnShoppingList: false
          });
          removedCount++;
          logger.info(`Removed from shopping list: ${name}`);
        }
      }
    });

    return removedCount;
  }
}

export const shoppingService = new ShoppingService();
```

**ReceiptContext Integration:**

**New State:**
```typescript
// src/features/receipt/types/receipt.types.ts
export interface ReceiptState {
  // ... existing state
  updatingInventory: boolean;
  updateError: AppError | null;
  productsUpdated: number;
}
```

**New Actions:**
```typescript
// src/features/receipt/context/ReceiptContext.tsx
type ReceiptAction =
  // ... existing actions
  | { type: 'SET_UPDATING_INVENTORY'; payload: boolean }
  | { type: 'INVENTORY_UPDATE_SUCCESS'; payload: number }
  | { type: 'INVENTORY_UPDATE_ERROR'; payload: AppError };

// In ReceiptProvider
const updateInventoryFromReceipt = async (confirmedProducts: string[]) => {
  dispatch({ type: 'SET_UPDATING_INVENTORY', payload: true });

  try {
    // Update inventory (existing → High, new → create)
    await inventoryService.replenishStock(confirmedProducts);

    // Remove purchased items from shopping list
    const removedCount = await shoppingService.removePurchasedItems(confirmedProducts);

    dispatch({ type: 'INVENTORY_UPDATE_SUCCESS', payload: confirmedProducts.length });

    // Show success message
    dispatch({
      type: 'SET_SUCCESS_MESSAGE',
      payload: `Inventory updated! ${confirmedProducts.length} products replenished`
    });

    // Navigate to inventory screen after 1.5 seconds
    setTimeout(() => {
      navigate('/'); // Navigate to inventory
    }, 1500);

  } catch (error) {
    const appError = handleError(error);
    dispatch({ type: 'INVENTORY_UPDATE_ERROR', payload: appError });
  } finally {
    dispatch({ type: 'SET_UPDATING_INVENTORY', payload: false });
  }
};
```

**Component Updates:**

**ReceiptReview Component:**
```typescript
// src/features/receipt/components/ReceiptReview.tsx
export const ReceiptReview: React.FC = () => {
  const { confirmedProducts, updatingInventory, updateInventoryFromReceipt } = useReceiptContext();

  const handleConfirmUpdate = async () => {
    const productNames = confirmedProducts.map(p => p.name);
    await updateInventoryFromReceipt(productNames);
  };

  if (updatingInventory) {
    return <InventoryUpdatingScreen />;
  }

  return (
    <>
      {/* ... review list UI */}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleConfirmUpdate}
        disabled={confirmedProducts.length === 0}
        sx={{ mt: 2, minHeight: 44 }} // 44px touch target
      >
        Confirm & Update Inventory
      </Button>
    </>
  );
};

// NEW: Processing screen component
const InventoryUpdatingScreen: React.FC = () => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="200px">
      <CircularProgress size={60} />
      <Typography variant="h6" sx={{ mt: 2 }}>
        Updating inventory...
      </Typography>
    </Box>
  );
};
```

**Database Transaction Pattern:**

Use Dexie.js transaction to ensure atomicity (all-or-nothing updates):

```typescript
await db.transaction('rw', db.products, async () => {
  // All database operations here
  // If any fails, all are rolled back
});
```

**Product Matching Heuristics:**

For MVP, use two-tier matching:
1. **Exact match** (case-insensitive): "Milk" === "milk"
2. **Partial match**: "Organic Milk" contains "Milk"

This handles common receipt variations without complex fuzzy matching.

**Error Handling:**

Use the established error handling pattern:
```typescript
try {
  // ... operation
} catch (error) {
  const appError = handleError(error);
  // Dispatch error action
  // Show user-friendly message via MUI Alert
  // Log technical details via logger.error()
}
```

**Performance Requirements:**

**NFR1: <2 Second Response Time**
- Inventory update should complete within 2 seconds for typical receipts (10-20 products)
- Use database transactions efficiently (batch operations)
- Show progress indicator for transparency

**NFR4: Zero Data Loss**
- Database transactions ensure atomicity
- No partial updates on error
- Products remain in original state on failure

**Architecture Compliance:**

**From Architecture Document:**

**Service Layer:**
- Services are singleton exports
- Service methods return Promises
- Error handling with try/catch
- AppError conversion via handleError()

**State Management:**
- Context + useReducer pattern
- Discriminated union for actions
- Immutable state updates
- Custom hook throws outside provider

**Testing:**
- Unit tests for service methods
- Integration tests for complete flow
- E2E tests for user journey
- Manual testing with real receipts

**Project Structure:**

```
src/
├── services/
│   ├── inventory.ts       # MODIFIED - Add replenishStock(), findExistingProduct(), addProductFromReceipt()
│   └── shopping.ts         # MODIFIED - Add removePurchasedItems()
├── features/
│   └── receipt/
│       ├── components/
│       │   └── ReceiptReview.tsx    # MODIFIED - Add Confirm button, processing UI
│       ├── context/
│       │   └── ReceiptContext.tsx   # MODIFIED - Add inventory update state/actions
│       └── types/
│           └── receipt.types.ts     # MODIFIED - Add updatingInventory, updateError state
```

**Previous Story Learnings:**

**From Story 5.4 (LLM-Based OCR):**
- LLM API integration pattern established
- Error handling for network operations proven
- Database transaction pattern verified
- State machine extension pattern works well

**From Story 5.3 (Review OCR Results):**
- ReceiptReview component UI patterns established
- Confirmed products array structure defined
- User confirmation flow tested

**Applying to Story 6.1:**
- Extend ReceiptContext with new inventory update state
- Add processing screen similar to OCRProcessing
- Use same error handling patterns (MUI Alert + retry)
- Leverage database transactions for data integrity

**Key Considerations:**
- This is the FINAL piece of the automation loop
- Success = complete user trust in the system
- Error recovery is critical (no partial updates)
- Success message reinforces automation value

### Project Structure Notes

**Service Modifications:**
```
src/services/
├── database.ts              # No changes needed (v3 schema from Story 5.4)
├── inventory.ts             # MODIFIED - Add replenishStock(), findExistingProduct(), addProductFromReceipt()
└── shopping.ts              # MODIFIED - Add removePurchasedItems()
```

**Receipt Feature Extensions:**
```
src/features/receipt/
├── components/
│   ├── ReceiptReview.tsx           # MODIFIED - Add Confirm button, processing/success/error UI
│   └── InventoryUpdatingScreen.tsx # NEW - Processing screen component
├── context/
│   ├── ReceiptContext.tsx          # MODIFIED - Add inventory update actions/state
│   └── ReceiptContext.test.tsx     # MODIFIED - Add inventory update tests
└── types/
    └── receipt.types.ts            # MODIFIED - Add updatingInventory, updateError, productsUpdated
```

### References

**Source Documents:**
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 6 Story 6.1]
- [Source: _bmad-output/planning-artifacts/architecture.md#Service Layer Pattern]
- [Source: _bmad-output/planning-artifacts/architecture.md#State Management Pattern]
- [Source: _bmad-output/planning-artifacts/architecture.md#Error Handling]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Trust-Building Through Transparency]
- [Source: _bmad-output/implementation-artifacts/5-3-review-and-correct-ocr-results.md]
- [Source: _bmad-output/implementation-artifacts/5-4-replace-tesseract-with-llm-based-ocr.md]

**Previous Stories for Context:**
- [Source: _bmad-output/implementation-artifacts/5-3-review-and-correct-ocr-results.md] - ReceiptReview component patterns
- [Source: _bmad-output/implementation-artifacts/5-4-replace-tesseract-with-llm-based-ocr.md] - Database v3 schema, LLM integration
- [Source: _bmad-output/implementation-artifacts/3-2-automatic-removal-from-shopping-list-when-replenished.md] - Shopping list removal patterns

## Dev Agent Record

### Agent Model Used

claude-opus-4-5-20251101

### Debug Log References

### Completion Notes List

### File List
