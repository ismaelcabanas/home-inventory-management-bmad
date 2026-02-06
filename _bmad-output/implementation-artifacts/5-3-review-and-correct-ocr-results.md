# Story 5.3: Review and Correct OCR Results

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want to review the products recognized from my receipt and fix any mistakes,
so that my inventory updates accurately.

## Context

This is the third story in Epic 5 - Receipt Scanning & OCR Processing. It implements the critical error correction UI that allows users to verify and fix OCR mistakes before updating inventory.

**Epic 5 Goal:** Users scan receipts after shopping, system processes with LLM-based OCR (<5 seconds), displays recognized products with confidence indicators, allows quick tap-to-edit corrections, and prepares for inventory update.

**Critical Success Factor:** OCR accuracy targets 98%+ but errors will still occur (~2%). The error correction interface must be intuitive, fast, and confidence-building rather than tedious. If corrections feel like work, users abandon the entire receipt scanning workflow.

**Why This Story Now:** Story 5.4 replaced Tesseract with LLM-based OCR and improved accuracy. This story creates the user interface for reviewing those LLM results and making corrections before the inventory update (Epic 6).

**What This Story Builds:**
- Review screen displaying all recognized products from LLM OCR
- Confidence indicators showing which items are certain vs uncertain
- Tap-to-edit interface for quick product name corrections
- "Add Product" button for items OCR missed
- Remove button for incorrectly recognized items
- "Confirm & Update Inventory" button to proceed to Epic 6

**Integration Points:**
- **Input:** RecognizedProduct[] from OCRService (via Story 5.4 LLM processing)
- **Output:** Confirmed/corrected product list for Epic 6 inventory updates
- **State:** ReceiptContext.ocrState = 'review' (new state for this story)
- **Components:** ReceiptReview (new), OCRProcessing (modified to show review button)

## Acceptance Criteria

### AC1: Display OCR Results Summary

**Given** OCR processing has completed successfully
**When** I view the Review screen
**Then** I see a summary at the top showing recognition statistics (FR25, FR26)
**And** The summary format is: "X of Y products recognized" (e.g., "12 of 14 products recognized")
**And** The count includes all products extracted from the receipt
**And** The summary is prominent and clearly visible

### AC2: Display Recognized Products List

**Given** OCR processing has completed and I'm on the Review screen
**When** I view the list of recognized products
**Then** I see all products recognized from the receipt in a scrollable list (FR27)
**And** Each product item displays:
- Product name extracted from receipt
- Confidence indicator (checkmark icon for high confidence, warning icon for uncertain)
- Visual distinction between confident vs needs-review items (e.g., background color, border)
**And** High-confidence items appear visually distinct from uncertain items
**And** Products are displayed in the order recognized from the receipt

### AC3: Edit Product Names with Tap-to-Edit

**Given** I'm viewing the recognized products list on the Review screen
**When** I tap on a product name (FR28)
**Then** An edit dialog opens showing:
- A MUI `TextField` pre-filled with the recognized product name
- "Cancel" and "Save" buttons
- Clear focus on the text field for immediate editing
**And** When I edit the name and tap "Save":
- The dialog closes
- The product name updates in the list immediately
- Visual confirmation appears (subtle highlight or checkmark)
**And** When I tap "Cancel":
- The dialog closes without saving changes
- The product name remains unchanged
**And** The edit interaction happens within <1 second (NFR1)

### AC4: Add Missing Products

**Given** I'm reviewing OCR results and the LLM missed some products
**When** I tap the "Add Product" button (FR29)
**Then** A dialog opens with:
- An empty MUI `TextField` for product name entry
- "Cancel" and "Add" buttons
- Clear placeholder text: "Enter product name"
**And** When I enter a product name and tap "Add":
- The dialog closes
- The product is added to the review list
- The product appears with a "manually added" indicator (e.g., different icon)
- The recognition summary updates (e.g., "13 of 14 products recognized")
**And** When I tap "Cancel":
- The dialog closes without adding the product

### AC5: Remove Incorrectly Recognized Items

**Given** I'm viewing the recognized products list
**When** I see an incorrectly recognized item (e.g., non-product text like "subtotal")
**Then** Each product has a "Remove" icon button (trash/delete icon) (FR30)
**And** When I tap the "Remove" button:
- A confirmation dialog appears: "Remove [Product Name]?"
- "Cancel" and "Remove" buttons are shown
**And** When I confirm the removal:
- The product is removed from the list
- The recognition summary updates
- No confirmation message needed (immediate visual feedback)
**And** When I cancel:
- The product remains in the list

### AC6: Confirm and Proceed to Inventory Update

**Given** I've reviewed and corrected the OCR results
**When** I tap the "Confirm & Update Inventory" button at the bottom of the screen (FR31)
**Then** All reviewed and corrected products are prepared for inventory update (Epic 6)
**And** I proceed to the next step (inventory update confirmation)
**And** The button is prominently positioned and clearly labeled
**And** The button is disabled if no products are in the list

### AC7: Error Handling During Review

**Given** I'm on the Review screen
**When** An error occurs (unexpected state, data corruption)
**Then** A clear error message is displayed using MUI `Alert` (FR41)
**And** A "Try Again" button is available to restart OCR from captured image
**And** A "Cancel" button allows returning to scanner
**And** Error details are logged with `logger.error()`

### AC8: Responsive Mobile-Optimized Layout

**Given** I'm using the app on a mobile device
**When** I view the Review screen
**Then** All touch targets (edit, remove, add, confirm buttons) are minimum 44x44 pixels (NFR8.1)
**And** The list is scrollable without blocking the confirm button
**And** The confirm button remains visible at bottom (sticky/fixed positioning)
**And** Text is large enough to read quickly (minimum 16px)
**And** The layout adapts to both mobile and desktop viewports

## Tasks / Subtasks

### Task 1: Add Review State to Receipt State Machine (AC: #1, #2, #6)
- [ ] Subtask 1.1: Add 'review' state to OCRState type
  - Update `src/features/receipt/types/receipt.types.ts`:
    ```typescript
    export type OCRState =
      | 'idle'
      | 'processing'
      | 'review'       // NEW: User reviewing OCR results
      | 'completed'
      | 'error';
    ```
  - Add comment explaining the review state purpose

- [ ] Subtask 1.2: Update ReceiptState with review-specific fields
  - Add `productsInReview: RecognizedProduct[]` to ReceiptState interface
  - Add `confirmedProducts: RecognizedProduct[]` for storing user-confirmed list
  - Update comments to clarify field purposes

- [ ] Subtask 1.3: Add actions for review state management
  - Add `EDIT_PRODUCT_NAME` action to ReceiptAction discriminated union
  - Add `ADD_PRODUCT` action for manual product additions
  - Add `REMOVE_PRODUCT` action for removing incorrect items
  - Add `CONFIRM_REVIEW` action to proceed to inventory update
  - Update TypeScript discriminated union with new action types

- [ ] Subtask 1.4: Write unit tests for review state actions
  - Test reducer handles EDIT_PRODUCT_NAME correctly
  - Test reducer handles ADD_PRODUCT correctly
  - Test reducer handles REMOVE_PRODUCT correctly
  - Test reducer handles CONFIRM_REVIEW correctly
  - Verify immutability (no state mutations)

### Task 2: Create ReceiptReview Component (AC: #1, #2, #3, #4, #5, #6, #8)
- [ ] Subtask 2.1: Create component file structure
  - Create `src/features/receipt/components/ReceiptReview.tsx`
  - Create `src/features/receipt/components/ReceiptReview.test.tsx`

- [ ] Subtask 2.2: Implement review screen layout with MUI components
  - Use MUI `Box` or `Stack` for main container
  - Add summary header showing "X of Y products recognized"
  - Add confidence indicator with icon (CheckCircleIcon, WarningIcon)
  - Use MUI `List` and `ListItem` for products list
  - Add sticky "Confirm & Update Inventory" button at bottom
  - Add "Add Product" button (FAB or standard button)
  - Ensure mobile-responsive layout

- [ ] Subtask 2.3: Implement product list item with confidence indicators
  - Create ProductReviewItem sub-component
  - Display product name with MUI `ListItemText`
  - Show confidence icon based on confidence score:
    - High confidence (≥0.8): CheckCircleIcon in green
    - Medium confidence (0.5-0.8): WarningIcon in orange
    - Low confidence (<0.5): ErrorIcon in red
  - Add background color/border distinction for low-confidence items
  - Add "Remove" IconButton with DeleteIcon
  - Make entire item tappable for editing

- [ ] Subtask 2.4: Implement tap-to-edit dialog
  - Create EditProductDialog component using MUI `Dialog`
  - Use MUI `TextField` with autoFocus for immediate editing
  - Pre-fill TextField with current product name
  - Add "Cancel" and "Save" buttons
  - Handle Save: dispatch EDIT_PRODUCT_NAME action
  - Handle Cancel: close dialog without changes

- [ ] Subtask 2.5: Implement add product dialog
  - Create AddProductDialog component using MUI `Dialog`
  - Use MUI `TextField` with empty initial value
  - Add placeholder text: "Enter product name"
  - Add "Cancel" and "Add" buttons
  - Handle Add: dispatch ADD_PRODUCT action
  - Validate input: non-empty, minimum length (2 chars)
  - Show validation error if input is invalid

- [ ] Subtask 2.6: Implement remove product confirmation dialog
  - Create RemoveProductDialog component using MUI `Dialog`
  - Show confirmation message: "Remove [Product Name]?"
  - Add "Cancel" and "Remove" buttons
  - Handle Remove: dispatch REMOVE_PRODUCT action
  - Handle Cancel: close dialog

- [ ] Subtask 2.7: Implement confirm button to proceed to inventory update
  - Add "Confirm & Update Inventory" button at bottom
  - Use fixed/sticky positioning to keep button visible
  - Disable button if products list is empty
  - On click: dispatch CONFIRM_REVIEW action
  - Transition to 'completed' state (Epic 6 will handle update)

- [ ] Subtask 2.8: Write unit tests for ReceiptReview component
  - Test rendering with recognized products
  - Test summary header displays correct count
  - Test confidence indicators show correct icons
  - Test edit dialog opens on product tap
  - Test add product dialog opens on button tap
  - Test remove dialog opens on remove button tap
  - Test confirm button dispatches correct action
  - Test confirm button disabled when list empty

### Task 3: Update ReceiptContext with Review Methods (AC: #1, #2, #3, #4, #5, #6)
- [ ] Subtask 3.1: Add review state transition methods
  - Add `enterReviewState()` method to ReceiptContext
  - Method sets ocrState to 'review'
  - Method populates productsInReview from recognizedProducts
  - Call this method when OCR completes (in processReceiptWithOCR)

- [ ] Subtask 3.2: Implement editProductName method
  - Add `editProductName(productId: string, newName: string)` method
  - Find product in productsInReview by ID
  - Update product.name with newName
  - Dispatch EDIT_PRODUCT_NAME action
  - Handle product not found (log warning)

- [ ] Subtask 3.3: Implement addProduct method
  - Add `addProduct(name: string)` method
  - Create new RecognizedProduct with:
    - Generated UUID
    - Provided name
    - confidence: 1.0 (manually added = certain)
    - isManuallyAdded: true flag
  - Add to productsInReview array
  - Dispatch ADD_PRODUCT action
  - Update recognition summary count

- [ ] Subtask 3.4: Implement removeProduct method
  - Add `removeProduct(productId: string)` method
  - Find product in productsInReview by ID
  - Remove from array
  - Dispatch REMOVE_PRODUCT action
  - Update recognition summary count

- [ ] Subtask 3.5: Implement confirmReview method
  - Add `confirmReview()` method
  - Copy productsInReview to confirmedProducts
  - Dispatch CONFIRM_REVIEW action
  - Set ocrState to 'completed'
  - Prepare confirmed products for Epic 6 consumption

- [ ] Subtask 3.6: Update ReceiptContext interface
  - Add new methods to ReceiptContextValue interface:
    - `editProductName(productId: string, newName: string): void`
    - `addProduct(name: string): void`
    - `removeProduct(productId: string): void`
    - `confirmReview(): void`
  - Update TypeScript exports

- [ ] Subtask 3.7: Write unit tests for review methods
  - Test editProductName updates product correctly
  - Test addProduct creates new product with correct properties
  - Test removeProduct removes product correctly
  - Test confirmReview transitions to completed state
  - Test error handling for edge cases (product not found)

### Task 4: Integrate ReceiptReview into OCR Flow (AC: #1, #6)
- [ ] Subtask 4.1: Update OCRProcessing component to show review button
  - Modify `src/features/receipt/components/OCRProcessing.tsx`
  - When ocrState is 'completed', show "Review Results" button
  - Button navigates to review state
  - Keep existing processing UI for 'processing' state

- [ ] Subtask 4.2: Add ReceiptReview to ReceiptScanner
  - Modify `src/features/receipt/components/ReceiptScanner.tsx`
  - Add conditional rendering for 'review' state
  - Show ReceiptReview component when ocrState === 'review'
  - Hide other scanner UI elements during review

- [ ] Subtask 4.3: Update OCR flow to transition to review state
  - In ReceiptContext.processReceiptWithOCR()
  - After successful OCR, call enterReviewState()
  - Set ocrState to 'review' (not 'completed')
  - Pass recognized products to review state

- [ ] Subtask 4.4: Write integration tests for OCR to review flow
  - Test OCR completion transitions to review state
  - Test Review button appears after OCR
  - Test ReceiptReview renders with OCR results
  - Test confirm button transitions to completed state

### Task 5: Add Product Matching Enhancement (AC: #2)
- [ ] Subtask 5.1: Enhance product matching in review state
  - Update RecognizedProduct interface to include match status
  - Add field: `matchedProduct?: Product` from inventory
  - Show visual indicator if product matches existing inventory item
  - Display: "✓ Already in inventory" for matched products

- [ ] Subtask 5.2: Update OCRService to return product matches
  - Modify OCRService.processReceipt() to query inventory
  - For each recognized product, search for exact/near matches
  - Populate matchedProduct field if found
  - Use fuzzy matching for near matches (e.g., "Milk" vs "Organic Milk")

- [ ] Subtask 5.3: Display match status in ReceiptReview
  - Update ProductReviewItem to show match indicator
  - Use different icon for matched vs new products
  - Show "New" badge for products not in inventory
  - Show "In inventory" badge for existing products

- [ ] Subtask 5.4: Write tests for product matching
  - Test exact match detection
  - Test fuzzy match detection (case-insensitive, partial matches)
  - Test new product detection (no match)
  - Test match status displays correctly in UI

### Task 6: Write Comprehensive Tests (AC: #1, #2, #3, #4, #5, #6, #7, #8)
- [ ] Subtask 6.1: Create ReceiptReview component unit tests
  - Test rendering with various product lists
  - Test empty state (no products)
  - Test single product state
  - Test multiple products state
  - Test confidence indicator rendering
  - Test edit dialog interaction
  - Test add product dialog interaction
  - Test remove dialog interaction

- [ ] Subtask 6.2: Create review state management tests
  - Test reducer handles all review actions
  - Test immutability of state updates
  - Test action creators produce correct actions
  - Test state transitions (review → completed)

- [ ] Subtask 6.3: Create ReceiptContext review method tests
  - Test editProductName with valid product ID
  - Test editProductName with invalid product ID (error case)
  - Test addProduct with valid name
  - Test addProduct with invalid name (error case)
  - Test removeProduct with valid product ID
  - Test removeProduct with invalid product ID
  - Test confirmReview transitions state correctly

- [ ] Subtask 6.4: Create integration tests for OCR → Review → Confirm flow
  - Test full flow: capture → OCR → review → confirm
  - Test edit during review persists to confirmed products
  - Test add product during review persists to confirmed products
  - Test remove product during review persists to confirmed products
  - Test confirm creates correct product list for Epic 6

- [ ] Subtask 6.5: Run full test suite
  - All existing tests still pass (regression check)
  - All new review tests pass
  - Test coverage ≥92% maintained
  - Fix any failing tests

- [ ] Subtask 6.6: Manual testing checklist
  - [ ] Review screen displays after OCR completes
  - [ ] Summary shows correct count
  - [ ] Confidence indicators display correctly
  - [ ] Tap-to-edit dialog opens and works
  - [ ] Add product dialog creates new product
  - [ ] Remove dialog removes product
  - [ ] Confirm button proceeds to completed state
  - [ ] Touch targets meet 44x44px minimum
  - [ ] Layout works on mobile viewport
  - [ ] Layout works on desktop viewport

### Task 7: Verify Definition of Done (AC: #1, #2, #3, #4, #5, #6, #7, #8)
- [ ] Subtask 7.1: Verify all acceptance criteria met
  - AC1: OCR results summary displays correctly
  - AC2: Recognized products list with confidence indicators
  - AC3: Tap-to-edit interface works
  - AC4: Add missing products works
  - AC5: Remove incorrectly recognized items works
  - AC6: Confirm and proceed to inventory update works
  - AC7: Error handling during review works
  - AC8: Mobile-optimized layout meets requirements

- [ ] Subtask 7.2: Run ESLint and verify 0 errors
- [ ] Subtask 7.3: Run TypeScript compiler and verify clean compilation
- [ ] Subtask 7.4: Verify app builds with `npm run build`
- [ ] Subtask 7.5: Verify all tests pass (npm run test)
- [ ] Subtask 7.6: Manual testing verification
  - [ ] Test with real receipt and LLM OCR (Story 5.4)
  - [ ] Test review interface on mobile device
  - [ ] Test all edit/add/remove operations
  - [ ] Test confirm flow to Epic 6

## Dev Notes

### Critical Implementation Requirements

**ReceiptReview Component Architecture:**

This is the user-facing component where users verify OCR results before inventory updates. The UX must be fast, intuitive, and confidence-building.

**Component Structure:**
```typescript
// src/features/receipt/components/ReceiptReview.tsx
interface ReceiptReviewProps {
  products: RecognizedProduct[];
  onEditProduct: (id: string, newName: string) => void;
  onAddProduct: (name: string) => void;
  onRemoveProduct: (id: string) => void;
  onConfirm: () => void;
}

export const ReceiptReview: React.FC<ReceiptReviewProps> = ({
  products,
  onEditProduct,
  onAddProduct,
  onRemoveProduct,
  onConfirm
}) => {
  const [editingProduct, setEditingProduct] = useState<RecognizedProduct | null>(null);
  const [addingProduct, setAddingProduct] = useState(false);
  const [removingProduct, setRemovingProduct] = useState<RecognizedProduct | null>(null);

  const highConfidenceCount = products.filter(p => p.confidence >= 0.8).length;
  const totalCount = products.length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Summary Header */}
      <Box sx={{ p: 2, bgcolor: 'background.paper', borderBottom: 1 }}>
        <Typography variant="h6">
          {highConfidenceCount} of {totalCount} products recognized
        </Typography>
        <LinearProgress variant="determinate" value={(highConfidenceCount / totalCount) * 100} />
      </Box>

      {/* Products List */}
      <List sx={{ flexGrow: 1, overflow: 'auto' }}>
        {products.map(product => (
          <ProductReviewItem
            key={product.id}
            product={product}
            onEdit={() => setEditingProduct(product)}
            onRemove={() => setRemovingProduct(product)}
          />
        ))}
      </List>

      {/* Add Product FAB */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 80, right: 16 }}
        onClick={() => setAddingProduct(true)}
      >
        <AddIcon />
      </Fab>

      {/* Confirm Button */}
      <Button
        variant="contained"
        fullWidth
        size="large"
        disabled={products.length === 0}
        onClick={onConfirm}
        sx={{ position: 'fixed', bottom: 0, height: 64 }}
      >
        Confirm & Update Inventory
      </Button>

      {/* Dialogs */}
      <EditProductDialog
        product={editingProduct}
        open={!!editingProduct}
        onSave={(newName) => {
          if (editingProduct) {
            onEditProduct(editingProduct.id, newName);
            setEditingProduct(null);
          }
        }}
        onCancel={() => setEditingProduct(null)}
      />

      <AddProductDialog
        open={addingProduct}
        onAdd={(name) => {
          onAddProduct(name);
          setAddingProduct(false);
        }}
        onCancel={() => setAddingProduct(false)}
      />

      <RemoveProductDialog
        product={removingProduct}
        open={!!removingProduct}
        onRemove={() => {
          if (removingProduct) {
            onRemoveProduct(removingProduct.id);
            setRemovingProduct(null);
          }
        }}
        onCancel={() => setRemovingProduct(null)}
      />
    </Box>
  );
};
```

**ProductReviewItem Component:**
```typescript
interface ProductReviewItemProps {
  product: RecognizedProduct;
  onEdit: () => void;
  onRemove: () => void;
}

const ProductReviewItem: React.FC<ProductReviewItemProps> = ({ product, onEdit, onRemove }) => {
  const getConfidenceIcon = () => {
    if (product.confidence >= 0.8) return <CheckCircleIcon color="success" />;
    if (product.confidence >= 0.5) return <WarningIcon color="warning" />;
    return <ErrorIcon color="error" />;
  };

  const getBackgroundColor = () => {
    if (product.confidence < 0.5) return 'error.main'; // Red tint
    if (product.confidence < 0.8) return 'warning.main'; // Orange tint
    return 'transparent';
  };

  return (
    <ListItem
      onClick={onEdit}
      sx={{
        bgcolor: getBackgroundColor(),
        cursor: 'pointer',
        minHeight: 64, // 44x44px touch target
        '&:hover': { bgcolor: 'action.hover' }
      }}
    >
      <ListItemIcon>{getConfidenceIcon()}</ListItemIcon>
      <ListItemText primary={product.name} />
      <ListItemSecondaryAction>
        <IconButton edge="end" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
          <DeleteIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};
```

**State Machine Integration:**

The 'review' state fits into the OCR state machine:
```
processing → completed → [auto-transition to] review → [user confirms] → completed
                              ↓
                           (user edits/adds/removes products)
```

**ReceiptContext Review Methods:**
```typescript
// src/features/receipt/context/ReceiptContext.tsx
const editProductName = useCallback((productId: string, newName: string) => {
  dispatch({
    type: 'EDIT_PRODUCT_NAME',
    payload: { productId, newName }
  });
}, []);

const addProduct = useCallback((name: string) => {
  if (name.trim().length < 2) {
    dispatch({ type: 'SET_ERROR', payload: 'Product name must be at least 2 characters' });
    return;
  }

  const newProduct: RecognizedProduct = {
    id: crypto.randomUUID(),
    name: name.trim(),
    confidence: 1.0,
    isCorrect: true,
    isManuallyAdded: true
  };

  dispatch({
    type: 'ADD_PRODUCT',
    payload: newProduct
  });
}, []);

const removeProduct = useCallback((productId: string) => {
  dispatch({
    type: 'REMOVE_PRODUCT',
    payload: productId
  });
}, []);

const confirmReview = useCallback(() => {
  const confirmedProducts = state.productsInReview.map(p => ({
    ...p,
    isCorrect: true
  }));

  dispatch({
    type: 'CONFIRM_REVIEW',
    payload: confirmedProducts
  });

  dispatch({ type: 'SET_OCR_STATE', payload: 'completed' });
}, [state.productsInReview]);
```

**Reducer Cases for Review Actions:**
```typescript
// ReceiptContext reducer
case 'EDIT_PRODUCT_NAME':
  return {
    ...state,
    productsInReview: state.productsInReview.map(p =>
      p.id === action.payload.productId
        ? { ...p, name: action.payload.newName }
        : p
    )
  };

case 'ADD_PRODUCT':
  return {
    ...state,
    productsInReview: [...state.productsInReview, action.payload]
  };

case 'REMOVE_PRODUCT':
  return {
    ...state,
    productsInReview: state.productsInReview.filter(p => p.id !== action.payload)
  };

case 'CONFIRM_REVIEW':
  return {
    ...state,
    confirmedProducts: action.payload,
    productsInReview: []
  };
```

**From Story 5.4 (LLM-Based OCR):**

The LLM OCR returns structured product names (not raw text like Tesseract). This simplifies the review UI - we don't need to parse raw text, just display the extracted products.

**RecognizedProduct Structure:**
```typescript
interface RecognizedProduct {
  id: string;           // UUID
  name: string;         // Product name from LLM
  confidence: number;   // 0-1 score (could use LLM confidence if available)
  matchedProduct?: Product;  // Existing inventory match (Task 5)
  isCorrect: boolean;   // User confirmed flag
  isManuallyAdded?: boolean; // Flag for manually added products (Task 2.5)
}
```

**Product Matching (Task 5):**

Enhance the review experience by showing which products are already in inventory vs new additions.

```typescript
// OCRService enhancement
const findMatchingProduct = (productName: string, inventory: Product[]): Product | undefined => {
  // Exact match (case-insensitive)
  const exactMatch = inventory.find(p =>
    p.name.toLowerCase() === productName.toLowerCase()
  );
  if (exactMatch) return exactMatch;

  // Fuzzy match (contains substring)
  const fuzzyMatch = inventory.find(p =>
    p.name.toLowerCase().includes(productName.toLowerCase()) ||
    productName.toLowerCase().includes(p.name.toLowerCase())
  );
  return fuzzyMatch;
};
```

**Mobile Optimization Requirements (NFR8.1):**

All touch targets must be minimum 44x44 pixels:
- Edit area (entire ListItem): 64px min-height
- Remove button: IconButton (48x48px default)
- Add FAB: 56x56px default
- Confirm button: 64px height
- Dialog buttons: Button with 36px min-height + padding

**Architecture Compliance:**

**From Architecture Document:**

**State Management Pattern:**
- Use Context + useReducer
- Discriminated union for actions
- Immutable state updates
- Custom hook that throws outside provider

**Component Architecture:**
- Feature-based folder structure
- Co-located tests (Component.test.tsx)
- MUI components for UI
- Custom components for business logic

**Error Handling:**
- Use handleError() utility
- Convert errors to AppError
- User-friendly messages in UI
- Technical details logged

**Testing Strategy:**

**Unit Tests:**
- ReceiptReview component tests
- ProductReviewItem component tests
- EditProductDialog component tests
- AddProductDialog component tests
- RemoveProductDialog component tests
- Review state reducer tests
- ReceiptContext review method tests

**Integration Tests:**
- OCR → Review flow tests
- Edit/Add/Remove operations integration
- Confirm → Completed state transition

**E2E Tests:**
- Full receipt scanning flow (capture → OCR → review → confirm)
- Mock OCR provider returns predefined products
- Test review corrections persist to confirmation

**Test Fixtures:**
- Mock RecognizedProduct[] arrays
- Mock inventory for product matching
- Various confidence scores for testing

**UX Design Patterns (from UX Specification):**

**From Expensify Receipt Scanners Pattern:**
- Quick camera launch ✓ (Story 5.1)
- Confidence indicators ✓ (this story)
- Tap-to-edit interface ✓ (this story)
- Clear review-before-commit flow ✓ (this story)
- Add missing items functionality ✓ (this story)

**Error Recovery:**
When OCR fails (~2% of cases), the correction UI must be:
- Intuitive for non-technical users (NFR7.2)
- Fast to use (not frustrating)
- Clear about what needs correction
- Confidence-building rather than trust-eroding

**Performance Requirements (NFR1):**

All actions must complete within 2 seconds:
- Edit product name: <1 second
- Add product: <1 second
- Remove product: <1 second
- Confirm review: <1 second
- Render product list: <500ms

**Previous Story Intelligence:**

**From Story 5.4 (LLM-Based OCR):**
- LLM OCR returns structured JSON output
- Product names are pre-extracted (no raw text parsing)
- OCRService.processReceipt() returns OCRResult with products array
- Recognition accuracy improved to 98%+ target

**Applying to Story 5.3:**
- Display pre-extracted product names directly
- No need to parse raw text (unlike Tesseract)
- Focus on UI for review/edit operations
- Product matching enhancement can leverage LLM accuracy

**Key Differences from Original Epic:**
- Story 5.4 was completed before 5.3 (out of order)
- LLM OCR structure differs from original Tesseract plan
- Review UI can be simpler (no raw text display)
- Product names are cleaner from LLM vs Tesseract

**Git Intelligence:**

**Current Branch:** `feat/story-5-3-review-and-correct-ocr-results`
**Based On:** main after Story 5.4 merge

**Files Modified from Story 5.4:**
- `src/features/receipt/types/receipt.types.ts` - Add review state and actions
- `src/features/receipt/context/ReceiptContext.tsx` - Add review methods
- `src/features/receipt/components/OCRProcessing.tsx` - Add review button
- `src/features/receipt/components/ReceiptScanner.tsx` - Add review rendering

**New Files:**
- `src/features/receipt/components/ReceiptReview.tsx` - Main review component
- `src/features/receipt/components/ReceiptReview.test.tsx` - Component tests
- `src/features/receipt/components/ProductReviewItem.tsx` - Product list item
- `src/features/receipt/components/EditProductDialog.tsx` - Edit dialog
- `src/features/receipt/components/AddProductDialog.tsx` - Add dialog
- `src/features/receipt/components/RemoveProductDialog.tsx` - Remove dialog

**Product Matching Enhancement (Task 5):**
- `src/services/ocr/ocr.service.ts` - Add product matching logic
- Update OCRResult to include matched products

### Project Structure Notes

**Updated Receipt Feature:**
```
src/features/receipt/
├── components/
│   ├── ReceiptScanner.tsx         # MODIFIED - Add review state rendering
│   ├── CameraCapture.tsx          # No changes
│   ├── ImagePreview.tsx           # No changes
│   ├── OCRProcessing.tsx          # MODIFIED - Add review button
│   ├── ReceiptError.tsx           # No changes
│   ├── ReceiptReview.tsx          # NEW - Main review component
│   ├── ProductReviewItem.tsx      # NEW - Product list item
│   ├── EditProductDialog.tsx      # NEW - Edit dialog
│   ├── AddProductDialog.tsx       # NEW - Add dialog
│   └── RemoveProductDialog.tsx    # NEW - Remove dialog
├── context/
│   ├── ReceiptContext.tsx         # MODIFIED - Add review methods
│   └── ReceiptContext.test.tsx    # MODIFIED - Add review tests
└── types/
    └── receipt.types.ts           # MODIFIED - Add review state and actions
```

**Service Layer:**
```
src/services/ocr/
├── ocr.service.ts                 # MODIFIED - Add product matching
└── providers/                     # No changes (LLM from Story 5.4)
```

### References

**Source Documents:**
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 5 Story 5.3]
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 5 Story 5.4]
- [Source: _bmad-output/planning-artifacts/architecture.md#State Management Pattern]
- [Source: _bmad-output/planning-artifacts/architecture.md#Component Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Error Handling]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Camera & OCR UX Patterns]
- [Source: _bmad-output/implementation-artifacts/5-4-replace-tesseract-with-llm-based-ocr.md]

**External References:**
- MUI List Component - https://mui.com/material-ui/react-list/
- MUI Dialog Component - https://mui.com/material-ui/react-dialog/
- MUI Button Component - https://mui.com/material-ui/react-button/
- MUI FAB Component - https://mui.com/material-ui/floating-action-button/

## Dev Agent Record

### Agent Model Used

claude-opus-4-5-20251101

### Debug Log References

### Completion Notes List

**Story 5.3 Created: Review and Correct OCR Results**

1. **Branch Created**: `feat/story-5-3-review-and-correct-ocr-results` from main

2. **Story File Created**: Comprehensive story document with:
   - 8 Acceptance Criteria covering review UI, edit/add/remove operations, and mobile optimization
   - 7 Tasks with 35+ Subtasks for complete implementation
   - Detailed Dev Notes with component architecture, code examples, and patterns
   - Previous story intelligence from Stories 5.1, 5.2, and 5.4
   - Product matching enhancement for better UX

3. **Context Loaded**:
   - Epic 5 complete requirements and context
   - Story 5.4 (LLM-Based OCR) implementation details
   - Architecture patterns and constraints
   - UX design patterns for error correction
   - Existing code structure (receipt feature, OCR services)

4. **Implementation Scope**:
   - Add 'review' state to OCR state machine
   - Create ReceiptReview component with confidence indicators
   - Implement tap-to-edit, add product, remove product dialogs
   - Update ReceiptContext with review management methods
   - Integrate review into OCR flow (OCR → Review → Confirm)
   - Add product matching enhancement (show inventory status)
   - Mobile-optimized layout (44x44px touch targets)

5. **Key Design Decisions**:
   - Review state added to state machine (not separate screen)
   - Product list uses MUI List with ListItem for consistency
   - Confidence indicators: CheckCircle (≥0.8), Warning (0.5-0.8), Error (<0.5)
   - Fixed/sticky confirm button for mobile usability
   - Product matching shows "In inventory" vs "New" status
   - Edit/Add/Remove operations update state immutably

6. **Integration Points**:
   - Input: RecognizedProduct[] from Story 5.4 LLM OCR
   - Output: Confirmed product list for Epic 6 inventory updates
   - State: ReceiptContext.ocrState transitions to 'review'
   - Components: ReceiptReview, ProductReviewItem, dialogs

7. **Sprint Status**: Will be marked as `ready-for-dev` after sprint-status update

### File List

**Created:**
- _bmad-output/implementation-artifacts/5-3-review-and-correct-ocr-results.md
