# Story 5.2: Process Receipt with OCR

Status: in-progress

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want the app to automatically extract product names from my receipt photo,
so that I don't have to manually type everything.

## Context

This is the second story in Epic 5 - Receipt Scanning & OCR Processing. It implements the core OCR processing functionality that extracts product names from captured receipt images.

**Epic 5 Goal:** Users scan receipts after shopping, system processes with OCR (<5 seconds), displays recognized products with confidence indicators, allows quick tap-to-edit corrections, and prepares for inventory update.

**Prerequisites:** Story 5.1 (Capture Receipt Photo with Camera) must be complete. This story receives the captured image data URL from the ImagePreview component's "Use This Photo" action.

**Critical Success Factor:** OCR accuracy is the lynchpin of the entire automation value proposition. The 95%+ accuracy target (NFR6, FR26) must be achieved for the innovation to work. Poor OCR accuracy = user frustration = abandonment.

**Technical Challenge:** Tesseract.js 7.x must be integrated to run OCR in the browser without external API calls (local-first architecture). Processing must complete in <5 seconds (NFR2).

**Integration Points:**
- **Input:** Captured image data URL from Story 5.1 (ReceiptContext.capturedImage)
- **Output:** Array of recognized product names for Story 5.3 (Review screen)
- **Database:** Query existing products for matching (FR24)
- **Next Story:** Story 5.3 (Review and Correct OCR Results) displays OCR results

**New Service Layer:** This story creates **OCRService** (`src/services/ocr.ts`) - the first new service since Epic 1. Follow established service layer patterns from InventoryService and ShoppingService.

## Acceptance Criteria

### AC1: OCR Processing Screen with Loading Indicator

**Given** I have captured a receipt photo and tapped "Use This Photo"
**When** OCR processing begins
**Then** I see a processing screen with:
- A loading indicator (MUI `CircularProgress`) prominently displayed
- Status message: "Recognizing products..." (FR42)
- Optional: The receipt image displayed for context (visual confirmation)
- The screen is accessible without network connectivity (NFR9: offline-first)

### AC2: Tesseract.js OCR Text Extraction

**Given** The OCR processing screen is displayed
**When** Tesseract.js processes the receipt image
**Then** The OCR engine:
- Uses Tesseract.js 7.x library (browser-based, no API calls)
- Extracts all text from the receipt image (FR23)
- Processes with English language configuration
- Returns extracted text as a string or array of lines
- Processing happens via Web Worker (non-blocking UI)

### AC3: Processing Performance Target

**Given** A receipt image is being processed
**When** The OCR operation runs
**Then** Processing completes within 5 seconds for standard grocery receipts (NFR2)
**And** The loading indicator remains visible during processing
**And** The UI remains responsive (no blocking main thread)

### AC4: Product Name Extraction and Matching

**Given** Tesseract.js has extracted text from the receipt
**When** The OCR results are analyzed
**Then** The system:
- Extracts product names from the raw OCR text
- Filters out non-product items (prices, dates, totals, store info)
- Attempts to match recognized products to existing inventory items (FR24)
- Returns an array of recognized product names
- Returns confidence scores for each product (if available from Tesseract)

### AC5: Navigation to Review Screen

**Given** OCR processing completes successfully
**When** The recognized products are extracted
**Then**:
- I'm automatically taken to the Review screen (Story 5.3)
- A success indicator briefly appears
- The recognized products are passed to the Review context
- The original receipt image is available for reference

### AC6: Error Handling for OCR Failures

**Given** I tap "Use This Photo"
**When** An error occurs during OCR processing
**Then**:
- A clear error message is displayed using MUI Alert (FR41)
- Error messages include:
  - "Failed to process receipt. Please try again."
  - "No text could be recognized from this receipt."
  - "OCR processing timed out. Please try again."
- A "Try Again" button is available
- The error is logged to console with logger.error()
- I can return to camera or retry processing

### AC7: Receipt Image Handling

**Given** OCR processing has completed
**When** The image has been processed
**Then**:
- The receipt image is processed and then discarded (not stored permanently)
- No image data is saved to IndexedDB (per architecture decision)
- The image remains in memory for Story 5.3 (Review screen) only
- Memory is properly cleaned up after confirmation

## Tasks / Subtasks

### Task 1: Create OCRService with Tesseract.js Integration (AC: #2, #3, #4, #7)
- [ ] Subtask 1.1: Install and configure Tesseract.js
  - Verify Tesseract.js 7.x is installed (should be from Epic 1 setup)
  - Create worker configuration for non-blocking processing
  - Configure English language: `import 'tesseract.js-core/tesseract-core-worker.js'`
- [ ] Subtask 1.2: Create `src/services/ocr.ts`
  - Create OCRService class following service layer pattern
  - Export singleton: `export const ocrService = new OCRService()`
- [ ] Subtask 1.3: Implement `processReceipt(imageDataUrl: string)` method
  - Accept image data URL from Story 5.1
  - Call Tesseract.js recognize() with worker
  - Configure options: { language: 'eng', logger: m => logger.debug(m) }
  - Return Promise<OCRResult>
- [ ] Subtask 1.4: Implement `extractProductNames(ocrText: string)` method
  - Parse raw OCR text into lines
  - Filter out non-product lines (dates, prices, totals, store headers)
  - Apply heuristics to identify product names:
    - Lines with text but no numbers
    - Lines longer than 3 characters
    - Lines not matching common receipt patterns
  - Return array of candidate product names
- [ ] Subtask 1.5: Implement `matchExistingProducts(names: string[])` method
  - Inject InventoryService dependency
  - For each candidate name, search existing products:
    - Exact match (case-insensitive)
    - Fuzzy match (contains substring)
  - Return array of { name: string, matchedProduct?: Product, confidence: number }
- [ ] Subtask 1.6: Add error handling with handleError utility
  - Wrap all Tesseract.js calls in try/catch
  - Handle timeout errors (>5 seconds)
  - Handle worker initialization failures
  - Handle image processing errors
  - Convert to AppError with user-friendly messages
  - Log technical details with logger.error()
- [ ] Subtask 1.7: Create `src/services/ocr.test.ts`
  - Mock Tesseract.js recognize() function
  - Test processReceipt() with valid image
  - Test extractProductNames() with sample OCR text
  - Test matchExistingProducts() with mock inventory
  - Test error handling for OCR failures
  - Test timeout scenarios

### Task 2: Create OCR Types and Interfaces (AC: #2, #4)
- [ ] Subtask 2.1: Update `src/features/receipt/types/receipt.types.ts`
  - Add `OCRState` type: 'idle' | 'processing' | 'completed' | 'error'
  - Add `RecognizedProduct` interface:
    ```typescript
    interface RecognizedProduct {
      id: string; // UUID
      name: string; // Extracted from OCR
      matchedProduct?: Product; // If found in inventory
      confidence: number; // 0-1 score
      isCorrect: boolean; // User confirmed in next story
    }
    ```
  - Add `OCRResult` interface for service return type
- [ ] Subtask 2.2: Update `ReceiptAction` discriminated union
  - Add `START_OCR_PROCESSING` action
  - Add `OCR_PROCESSING_COMPLETE` action with RecognizedProduct[] payload
  - Add `OCR_PROCESSING_ERROR` action with error message

### Task 3: Update ReceiptContext with OCR State Management (AC: #1, #5, #6)
- [ ] Subtask 3.1: Add OCR state to ReceiptState interface
  - `ocrState: OCRState`
  - `processingProgress: number` (0-100 for progress indicator)
  - `recognizedProducts: RecognizedProduct[]`
- [ ] Subtask 3.2: Add context methods for OCR processing
  - `processReceiptWithOCR(imageDataUrl: string)` - Main orchestration method
  - Update receiptReducer to handle OCR actions
- [ ] Subtask 3.3: Implement `processReceiptWithOCR()` in ReceiptContext
  - Dispatch START_OCR_PROCESSING
  - Call ocrService.processReceipt(capturedImage)
  - Handle loading state with try/catch/finally
  - Update processingProgress if Tesseract provides progress callbacks
  - On success: Dispatch OCR_PROCESSING_COMPLETE
  - On error: Dispatch OCR_PROCESSING_ERROR with user message
- [ ] Subtask 3.4: Update ReceiptContext tests
  - Test OCR state transitions
  - Test processReceiptWithOCR() with mocked OCRService
  - Test error handling in OCR flow
  - Test cleanup on error

### Task 4: Create OCRProcessing Component (AC: #1, #6, #7, #8)
- [ ] Subtask 4.1: Create `src/features/receipt/components/OCRProcessing.tsx`
  - Display during OCR processing state
  - Uses useReceiptContext for state
- [ ] Subtask 4.2: Add MUI CircularProgress loading indicator
  - Centered on screen
  - Large size for visibility
  - Indeterminate mode (or determinate if progress available)
- [ ] Subtask 4.3: Add status message display
  - "Recognizing products..." (FR42)
  - Updates based on processingProgress if available
  - Styled with MUI Typography
- [ ] Subtask 4.4: Add optional receipt image preview
  - Show captured image in background or small preview
  - Reduced opacity to not distract from loading indicator
  - Visual confirmation that correct receipt is processing
- [ ] Subtask 4.5: Add accessibility attributes
  - aria-label for screen readers: "Processing receipt with OCR"
  - role="status" for live region updates
- [ ] Subtask 4.6: Create OCRProcessing.test.tsx
  - Test CircularProgress displays
  - Test status message shows correctly
  - Test preview image displays when available
  - Note: Tests covered by integration tests in ReceiptContext.test.tsx

### Task 5: Wire OCR Processing into ReceiptScanner State Flow (AC: #1, #5)
- [ ] Subtask 5.1: Update ReceiptScanner component state handling
  - Add OCRProcessing state to render logic
  - Render OCRProcessing when ocrState === 'processing'
  - Auto-transition to Review when ocrState === 'completed'
  - Show error alert when ocrState === 'error'
- [ ] Subtask 5.2: Connect ImagePreview "Use This Photo" to OCR
  - Update ImagePreview's "Use This Photo" button
  - Call processReceiptWithOCR(capturedImage)
  - State machine: preview → processing → (next story)
- [ ] Subtask 5.3: Test complete flow integration
  - Capture → Preview → Use Photo → Processing → Complete
  - Verify state transitions are smooth
  - Verify no memory leaks

### Task 6: Implement Product Name Extraction Logic (AC: #4)
- [ ] Subtask 6.1: Create receipt parsing heuristics
  - Create helper function `isProductLine(line: string): boolean`
  - Filter patterns to exclude:
    - Date lines (MM/DD/YYYY, DD-MM-YYYY)
    - Price lines ($$$, €€€, decimal numbers)
    - Store headers (STORE, MARKET, receipt headers)
    - Totals (TOTAL, SUM, SUBTOTAL)
    - Empty lines or whitespace only
    - Lines with only numbers or symbols
- [ ] Subtask 6.2: Implement fuzzy product name extraction
  - Remove quantity prefixes (2x, 3 KG, etc.)
  - Remove price suffixes
  - Clean up OCR artifacts (extra spaces, misrecognized chars)
  - Capitalize properly for display
- [ ] Subtask 6.3: Create unit tests for extraction logic
  - Test with sample receipt OCR outputs
  - Test date filtering
  - Test price filtering
  - Test store header filtering
  - Test product name cleaning

### Task 7: Implement Product Matching to Inventory (AC: #4)
- [ ] Subtask 7.1: Create product matching algorithm
  - Exact match: name.toLowerCase() === product.name.toLowerCase()
  - Contains match: product.name.toLowerCase().includes(name.toLowerCase())
  - Case-insensitive comparison
- [ ] Subtask 7.2: Calculate confidence scores
  - Exact match: confidence = 1.0
  - Contains match: confidence = 0.8
  - No match: confidence = 0.5 (user will review)
- [ ] Subtask 7.3: Handle multiple matches
  - If multiple products match, pick highest confidence
  - If tie, pick most recently updated product
- [ ] Subtask 7.4: Create unit tests for matching logic
  - Test exact match returns 1.0 confidence
  - Test contains match returns 0.8 confidence
  - Test no match returns 0.5 confidence
  - Test case-insensitive matching
  - Test multiple match scenarios

### Task 8: Add Error States and Recovery (AC: #6, #8)
- [ ] Subtask 8.1: Create ReceiptError component
  - MUI Alert with severity="error"
  - Shows error message from context
  - "Try Again" button to retry OCR
  - "Cancel" button to return to camera
- [ ] Subtask 8.2: Implement error recovery flow
  - "Try Again" → re-call processReceiptWithOCR()
  - "Cancel" → return to idle/camera state
  - Clean up previous OCR state
- [ ] Subtask 8.3: Add timeout handling
  - Set 5-second timeout for Tesseract.js
  - Show specific timeout error message
  - Allow retry with same image
- [ ] Subtask 8.4: Test error scenarios
  - Test OCR timeout error
  - Test image processing error
  - Test worker initialization error
  - Test "Try Again" recovery
  - Test "Cancel" returns to camera

### Task 9: Write Comprehensive Tests (AC: #1, #2, #3, #4, #5, #6, #7, #8)
- [ ] Subtask 9.1: Create OCRService unit tests with Tesseract.js mocked
  - Test successful OCR processing
  - Test product name extraction with sample receipt text
  - Test product matching with mock inventory
  - Test error handling (timeout, invalid image, worker error)
- [ ] Subtask 9.2: Create ReceiptContext OCR flow integration tests
  - Test complete processing flow with mocked service
  - Test state transitions (processing → completed)
  - Test error flow (processing → error)
  - Test recovery (error → processing)
- [ ] Subtask 9.3: Test performance requirements
  - Mock Tesseract.js to measure processing time
  - Verify <5 second target (NFR2)
  - Verify UI remains responsive during processing
- [ ] Subtask 9.4: Test product extraction heuristics
  - Create fixture with real receipt OCR output
  - Verify correct products extracted
  - Verify non-product lines filtered out
  - Edge cases: empty receipts, poorly formatted receipts
- [ ] Subtask 9.5: Run full test suite
  - All existing tests still pass (regression check)
  - All new OCR tests pass
  - Test coverage ≥92% maintained
- [ ] Subtask 9.6: Test offline functionality (NFR9)
  - Verify Tesseract.js worker loads without network
  - Verify processing works in airplane mode
  - Note: Requires manual testing on actual device

### Task 10: Verify Definition of Done (AC: #1, #2, #3, #4, #5, #6, #7, #8)
- [ ] Subtask 10.1: Verify all acceptance criteria met
  - AC1: Processing screen with loading indicator
  - AC2: Tesseract.js OCR integration working
  - AC3: <5 second processing time achieved
  - AC4: Product extraction and matching functional
  - AC5: Navigation to Review screen ready (for Story 5.3)
  - AC6: Error handling works
  - AC7: Image handling correct (not stored permanently)
  - AC8: Performance requirements met
- [ ] Subtask 10.2: Run ESLint and verify 0 errors
- [ ] Subtask 10.3: Run TypeScript compiler and verify clean compilation
- [ ] Subtask 10.4: Verify app builds with `npm run build`
- [ ] Subtask 10.5: Verify all tests pass (npm run test)
- [ ] Subtask 10.6: Manual testing checklist:
  - [ ] OCR processing screen shows with captured image
  - [ ] Loading indicator displays during processing
  - [ ] Processing completes in <5 seconds
  - [ ] Recognized products are extracted
  - [ ] Products match existing inventory when applicable
  - [ ] Error messages show correctly on failures
  - [ ] "Try Again" button works
  - [ ] No receipt images stored in database

## Dev Notes

### Critical Implementation Requirements

**Tesseract.js Integration:**

Story 5.2 requires Tesseract.js 7.x integration for browser-based OCR. This is the core technical challenge of the entire automation value proposition.

**Browser OCR Pattern:**
```typescript
import Tesseract from 'tesseract.js';

// Process receipt image
const result = await Tesseract.recognize(
  imageDataUrl,
  'eng',
  {
    logger: m => logger.debug(m) // Optional progress logging
  }
);

// Extract product names from result.data.text
const products = extractProductNames(result.data.text);

// Match to existing inventory
const matched = matchExistingProducts(products);
```

**Critical Considerations:**
- **Worker-Based Processing**: Tesseract.js uses Web Workers for non-blocking UI
- **Language Configuration**: Use 'eng' for English receipts (configurable via VITE_OCR_LANGUAGE)
- **Progress Callbacks**: Tesseract provides progress updates (0-1) for status indicator
- **Timeout Handling**: Must wrap in timeout logic to enforce <5 second target
- **Memory Management**: Clean up worker after processing completes
- **Error Scenarios**: Worker init failures, invalid images, timeout errors

**State Machine Integration:**

The OCR processing extends the Receipt state machine:

```
preview → processing → completed (→ Story 5.3 Review)
            ↓
          error
            ↓
      ← (try again) or (cancel to camera)
```

**New State:**
- `ocrState: 'processing'` - OCR active
- `ocrState: 'completed'` - Products recognized, ready for review
- `ocrState: 'error'` - Processing failed

**Service Layer Architecture:**

**OCRService** follows established service layer patterns from Epic 1:

```typescript
// src/services/ocr.ts
class OCRService {
  async processReceipt(imageDataUrl: string): Promise<OCRResult> {
    // Tesseract.js integration
    // Returns: { products: RecognizedProduct[], rawText: string }
  }

  extractProductNames(ocrText: string): string[] {
    // Parse and filter receipt text
  }

  matchExistingProducts(names: string[]): RecognizedProduct[] {
    // Query inventory via InventoryService
  }
}

export const ocrService = new OCRService();
```

**Service Dependencies:**
- InventoryService for product matching queries
- No database writes (Story 5.3 handles inventory updates)
- handleError utility for error conversion
- logger utility for debugging

**Component Architecture:**

**OCRProcessing** (New component)
- Shows during ocrState === 'processing'
- MUI CircularProgress (large, centered)
- Status message: "Recognizing products..."
- Optional receipt preview (faded background)
- Progress percentage if available from Tesseract

**ReceiptError** (New component)
- Shows during ocrState === 'error'
- MUI Alert with error message
- "Try Again" button (restarts OCR)
- "Cancel" button (returns to camera)

**ImagePreview** (Modified from Story 5.1)
- "Use This Photo" button now triggers OCR processing
- Calls processReceiptWithOCR(capturedImage)
- Transitions to processing state

**ReceiptContext** (Extended)
- New state: ocrState, processingProgress, recognizedProducts
- New method: processReceiptWithOCR(imageDataUrl)
- New actions: START_OCR_PROCESSING, OCR_PROCESSING_COMPLETE, OCR_PROCESSING_ERROR

**Product Extraction Heuristics:**

Receipt OCR requires intelligent filtering to extract actual product names from raw text.

**Exclusion Patterns:**
```typescript
// Lines to exclude from product list:
const EXCLUDE_PATTERNS = [
  /^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}$/, // Dates: 12/25/2023, 25-12-23
  /^\$?\d+\.\d{2}$/, // Prices: $12.99, 12.99
  /^(TOTAL|SUBTOTAL|SUM|TAX)/i, // Totals
  /^(CASH|CARD|CHANGE)/i, // Payment info
  /^\d{1,2}:\d{2}$/, // Times: 14:30
  /^$/, // Empty lines
];

// Product line patterns (candidates to include):
const PRODUCT_PATTERNS = [
  /^[A-Z][a-z].*[a-z]$/, // Starts with capital, contains lowercase
  /^.{3,}$/, // At least 3 characters
  !/\d{2}:\d{2}/, // Not a time
  !/^\$/, // Not empty
];
```

**Product Name Cleaning:**
- Remove quantity prefixes: "2x Milk" → "Milk"
- Remove weights: "Milk 1L" → "Milk"
- Clean OCR artifacts: "M!lk" → "Milk" (character substitution)
- Trim whitespace
- Capitalize first letter

**Product Matching Algorithm:**

**Matching Strategy:**
1. **Exact Match** (confidence: 1.0): Names match exactly (case-insensitive)
2. **Contains Match** (confidence: 0.8): Inventory name contains OCR name
3. **No Match** (confidence: 0.5): User will need to review

**Example:**
```typescript
// OCR extracts: "milk"
// Inventory has: "Whole Milk", "Almond Milk", "Bread"

// Match results:
[
  { name: "milk", matchedProduct: Whole Milk, confidence: 0.8 }, // Contains match
  { name: "milk", matchedProduct: Almond Milk, confidence: 0.8 }, // Contains match
  // Choose highest: Whole Milk (alphabetically if tied)
]

// User can correct in Story 5.3 if wrong match
```

**Fuzzy Matching Considerations:**
- OCR errors: "Mtlk" should match "Milk"
- Abbreviations: "Org" should match "Organic"
- Plurals: "Apples" should match "Apple"
- MVP: Basic contains match, future: Levenshtein distance

**Performance Requirements:**

**NFR2: <5 Second OCR Processing**
- Target: Receipt processing completes within 5 seconds
- Measurement: From "Use This Photo" tap to "completed" state
- Strategy:
  - Use Tesseract.js Web Worker (non-blocking UI)
  - Optimize image size before processing (resize if >2MP)
  - Show progress indicator to user
  - Timeout enforcement (show error after 5 seconds)

**NFR1: <2 Second Response for Actions**
- All UI actions remain responsive during OCR
- Loading states show immediately
- No blocking main thread

**NFR9: Offline-First Functionality**
- Tesseract.js runs completely in-browser
- No network calls during OCR
- Worker loads from local bundle
- PWA service worker doesn't interfere

**Architecture Compliance:**

**From Architecture Document:**

**Service Layer Pattern (Lines 716-786):**
- Abstract data operations in service layer
- Service methods return Promises
- Services can call other services
- Error handling with try/catch

**State Management Pattern (Lines 1468-1563):**
- Use Context + useReducer
- Discriminated union for actions
- Immutable state updates
- Custom hook that throws outside provider

**Error Handling (Lines 1566-1663):**
- Use handleError() utility
- Convert errors to AppError
- User-friendly messages in UI
- Technical details logged

**Testing Strategy:**

**Unit Tests:**
- OCRService tests with Tesseract.js mocked
- Product extraction heuristics tests
- Product matching algorithm tests
- Error handling tests

**Integration Tests:**
- ReceiptContext OCR flow tests
- State transition tests
- Error recovery flow tests

**E2E Tests:**
- Complete capture → process → review flow (Story 5.1 → 5.2 → 5.3)
- Error scenarios
- Performance benchmarks (with mocked Tesseract timing)

**Test Fixtures:**
- Sample OCR output strings
- Mock receipt images (base64 data URLs)
- Mock inventory data for matching

**Previous Story Learnings:**

**From Story 5.1 (Camera Capture):**
- Receipt feature structure established
- ReceiptContext state machine pattern proven
- useCamera hook provides MediaStream lifecycle management
- ImagePreview component pattern for confirmation
- Image data URL passed between components
- MediaStream cleanup critical for memory management

**Applying to Story 5.2:**
- Extend ReceiptContext (no new context needed)
- Follow same component structure (OCRProcessing)
- Extend same state machine with OCR states
- Pass capturedImage from ImagePreview to OCR
- Clean up worker resources like MediaStream

**Key Differences:**
- OCR involves async service call (camera was synchronous API)
- OCR requires new service (OCRService)
- OCR has timeout requirement (<5 seconds)
- OCR error scenarios differ from camera errors

**Git Intelligence:**

**Recent Commit Patterns:**
- Story 5.1: Receipt feature initialized
- Commit message format: "Story 5.1: Capture Receipt Photo with Camera (#22)"
- PR numbering for tracking

**Applying to Story 5.2:**
- Branch: `feat/story-5-2-process-receipt-with-ocr`
- Continue commit message pattern
- Extend Receipt feature files
- Create new OCRService file

**Files Modified in Story 5.1:**
- Created: `src/features/receipt/*` (entire feature)
- Modified: `src/App.tsx` (added ReceiptProvider)

**Story 5.2 Will Modify:**
- Create: `src/services/ocr.ts`
- Modify: `src/features/receipt/context/ReceiptContext.tsx`
- Modify: `src/features/receipt/types/receipt.types.ts`
- Modify: `src/features/receipt/components/ReceiptScanner.tsx`
- Modify: `src/features/receipt/components/ImagePreview.tsx`
- Create: `src/features/receipt/components/OCRProcessing.tsx`
- Create: `src/features/receipt/components/ReceiptError.tsx`

### Project Structure Notes

**New Service:**
```
src/services/
├── database.ts
├── inventory.ts
├── shopping.ts
└── ocr.ts                    # NEW - OCR processing
```

**Extended Receipt Feature:**
```
src/features/receipt/
├── components/
│   ├── ReceiptScanner.tsx         # MODIFIED - Add OCR state handling
│   ├── CameraCapture.tsx
│   ├── ImagePreview.tsx           # MODIFIED - Trigger OCR
│   ├── OCRProcessing.tsx          # NEW - Processing screen
│   └── ReceiptError.tsx           # NEW - Error display
├── context/
│   ├── ReceiptContext.tsx         # MODIFIED - Add OCR methods
│   └── ReceiptContext.test.tsx    # MODIFIED - Add OCR tests
├── hooks/
│   └── useCamera.ts
└── types/
    └── receipt.types.ts           # MODIFIED - Add OCR types
```

**No Database Changes:**
- Story 5.2 does NOT modify Product schema
- No Dexie.js changes needed
- OCRService reads from inventory (queries)
- Inventory updates happen in Story 5.3

### References

**Source Documents:**
- [Source: _bmad-output/planning-artifacts/architecture.md#Service Layer Pattern]
- [Source: _bmad-output/planning-artifacts/architecture.md#State Management Pattern]
- [Source: _bmad-output/planning-artifacts/architecture.md#Error Handling]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure]
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 5 Story 5.2]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Camera & OCR UX Patterns]
- [Source: _bmad-output/implementation-artifacts/5-1-capture-receipt-photo-with-camera.md]

**External References:**
- Tesseract.js Documentation - https://tesseract.projectnapua.com/
- Tesseract.js GitHub - https://github.com/naptha/tesseract.js
- MDN: Web Workers - https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API
- MUI CircularProgress - https://mui.com/material-ui/react-progress/

## Dev Agent Record

### Agent Model Used

claude-opus-4-5-20251101

### Debug Log References

### Completion Notes List

### File List
- **Created:**
  - `src/services/ocr.ts` - OCR service with Tesseract.js integration
  - `src/services/ocr.test.ts` - OCR service unit tests (27 tests)
  - `src/features/receipt/components/OCRProcessing.tsx` - Processing screen component
- **Modified:**
  - `src/features/receipt/types/receipt.types.ts` - Added OCRState, RecognizedProduct, OCRResult
  - `src/features/receipt/context/ReceiptContext.tsx` - Added processReceiptWithOCR method
  - `src/features/receipt/components/ReceiptScanner.tsx` - Added OCR state handling
  - `src/features/receipt/components/ImagePreview.tsx` - Wired OCR to "Use This Photo" button
  - `_bmad-output/implementation-artifacts/sprint-status.yaml` - Updated story status
