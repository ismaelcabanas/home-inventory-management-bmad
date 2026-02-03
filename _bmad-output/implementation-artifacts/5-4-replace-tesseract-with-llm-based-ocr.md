# Story 5.4: Replace Tesseract with LLM-Based OCR

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want the app to use an AI model to recognize products from my receipt photos,
So that I get accurate product recognition even with complex receipts.

## Context

This is the fourth story in Epic 5 - Receipt Scanning & OCR Processing. It **replaces** the Tesseract.js implementation from Story 5.2 with an LLM-based OCR approach for significantly improved accuracy.

**Epic 5 Goal:** Users scan receipts after shopping, system processes with LLM-based OCR (<5 seconds), displays recognized products with confidence indicators, allows quick tap-to-edit corrections, and prepares for inventory update.

**Critical Success Factor:** OCR accuracy is the lynchpin of the entire automation value proposition. This upgrade from Tesseract (~95% accuracy) to LLM-based OCR (target: 98%+) addresses accuracy issues that frustrate users and break trust.

**Why This Change?**
- Tesseract.js struggles with complex receipt layouts, poor lighting, and crumpled receipts
- LLM vision models understand context and can extract product names more accurately
- Free-tier LLM APIs (GPT-4o mini, Groq) provide cost-effective access
- Offline capture with deferred processing ensures users never lose receipts

**What Changes from Story 5.2:**
- **REMOVE**: Tesseract.js dependency and worker setup
- **ADD**: LLM API client (OpenAI SDK or fetch to Groq/compatible API)
- **ADD**: Offline pending queue (new `pendingReceipts` table in IndexedDB)
- **ADD**: Network detection and automatic queue processing
- **ADD**: API quota handling with user-friendly messaging

**Integration Points:**
- **Input:** Captured image data URL from Story 5.1 (ReceiptContext.capturedImage)
- **Output:** Array of recognized product names for Story 5.3 (Review screen)
- **Database:** NEW pendingReceipts table for offline queue
- **Service:** OCRService updated to call LLM API instead of Tesseract

## Acceptance Criteria

### AC1: LLM-Based OCR Processing

**Given** I have captured a receipt photo and tapped "Use This Photo"
**When** OCR processing begins
**Then** The system uses a free-tier LLM provider with vision capabilities (e.g., OpenAI GPT-4o mini, Groq) to extract product names (FR23)
**And** The API request includes:
- The receipt image (base64 or URL)
- A prompt optimized for grocery receipt product extraction
- API key from environment variable `VITE_LLM_API_KEY`

### AC2: Improved Accuracy Target

**Given** The LLM processes the receipt
**When** Product names are extracted
**Then** The system achieves improved accuracy over Tesseract (target: 98%+ vs previous 95%)
**And** Product extraction is more robust with:
- Better handling of complex receipt layouts
- Improved recognition with poor lighting
- Better context understanding (distinguishing products from prices)

### AC3: Remove Tesseract.js Dependency

**Given** The codebase previously used Tesseract.js
**When** Story 5.4 is complete
**Then** Tesseract.js is completely removed from:
- package.json dependencies
- OCRService implementation
- All imports and references

### AC4: Offline Receipt Capture with Deferred Processing

**Given** I don't have an internet connection when I try to scan a receipt
**When** I tap "Scan Receipt" or after capturing a photo
**Then** The app detects the offline status using `navigator.onLine`
**And** I see a clear message: "Receipt scanning requires internet connection. Your photo will be saved and processed when you're back online."
**And** When I capture a receipt photo while offline:
- The photo is saved to a pending queue in IndexedDB (new `pendingReceipts` table)
- A "Pending receipts" counter/badge appears on the scanner screen
- I can continue using the app normally
**And** When internet connection is restored (detected via `window.addEventListener('online')`):
- The app automatically processes all pending receipts in the queue
- I receive notifications for each processed receipt
- The pending counter updates accordingly

### AC5: API Quota Handling

**Given** The LLM API free tier quota is exhausted
**When** I attempt to scan a new receipt
**Then** I see a friendly error message: "We've reached our monthly AI recognition limit. Receipt scanning will be available again next month."
**And** Pending receipts are queued until the quota resets
**And** The error is logged for monitoring

### AC6: Error Handling for LLM API Failures

**Given** The LLM API returns an error (timeout, invalid response, rate limit 429)
**When** Processing fails
**Then** A clear error message is displayed using MUI `Alert` (FR41)
**And** A "Try Again" button allows reprocessing the same receipt
**And** The receipt photo is preserved (not lost)
**And** The error details are logged to console with `logger.error()`

### AC7: Performance Target Maintained

**Given** A receipt image is being processed
**When** The LLM API call runs
**Then** Processing completes within 5 seconds for standard grocery receipts (NFR2)
**And** The loading indicator remains visible during processing
**And** The UI remains responsive (no blocking main thread)

## Tasks / Subtasks

### Task 1: Remove Tesseract.js Dependency (AC: #3)
- [ ] Subtask 1.1: Remove Tesseract.js from package.json
  - Run: `npm uninstall tesseract.js`
  - Verify no breaking changes to other dependencies
- [ ] Subtask 1.2: Update OCRService to remove Tesseract imports
  - Remove: `import Tesseract from 'tesseract.js'`
  - Remove: Worker initialization code
  - Remove: Tesseract-specific logger configurations

### Task 2: Add LLM API Client Configuration (AC: #1)
- [ ] Subtask 2.1: Add environment variable for LLM API key
  - Add `VITE_LLM_API_KEY` to .env files
  - Document API key setup in README
  - Add .env.example with placeholder
- [ ] Subtask 2.2: Choose and configure LLM provider
  - Option A: OpenAI SDK for GPT-4o mini (recommended for vision)
  - Option B: Groq SDK for faster/cheaper alternative
  - Option C: Fetch-based implementation for provider flexibility
  - Create `src/services/llm.ts` for API client abstraction
- [ ] Subtask 2.3: Implement optimized prompt for grocery receipt extraction
  - Create prompt that:
    - Focuses on product names only
    - Excludes prices, dates, totals, store info
    - Returns structured JSON output
    - Handles edge cases (multi-column receipts, abbreviations)
  - Test prompt with sample receipts

### Task 3: Create Pending Receipts Database Schema (AC: #4)
- [ ] Subtask 3.1: Add `pendingReceipts` table to database schema
  - Update `src/services/database.ts`:
    ```typescript
    pendingReceipts!: Table<PendingReceipt>;
    // In version 2:
    this.version(2).stores({
      products: '++id, name, stockLevel, isOnShoppingList, updatedAt',
      pendingReceipts: '++id, createdAt, status'
    });
    ```
  - Define `PendingReceipt` interface:
    ```typescript
    interface PendingReceipt {
      id?: string;
      imageData: string; // base64 data URL
      createdAt: Date;
      status: 'pending' | 'processing' | 'completed' | 'failed';
      error?: string;
    }
    ```
- [ ] Subtask 3.2: Create migration from version 1 to version 2
  - Implement upgrade logic in Dexie.js
  - Test migration preserves existing products
  - Handle edge case of existing users
- [ ] Subtask 3.3: Add database tests for pendingReceipts table
  - Test insert, query, update, delete operations
  - Test status transitions
  - Test migration rollback (if needed)

### Task 4: Implement Network Detection (AC: #4)
- [ ] Subtask 4.1: Create network detection utility
  - Create `src/utils/network.ts`:
    ```typescript
    export const isOnline = (): boolean => navigator.onLine;

    export const onNetworkStatusChange = (callback: (online: boolean) => void) => {
      window.addEventListener('online', () => callback(true));
      window.addEventListener('offline', () => callback(false));
    };
    ```
- [ ] Subtask 4.2: Create network detection tests
  - Mock navigator.onLine
  - Test event listeners
  - Test callback invocation
- [ ] Subtask 4.3: Integrate network detection in ReceiptContext
  - Add `isOnline` state to ReceiptState
  - Listen for online/offline events
  - Update UI to show offline status when detected

### Task 5: Update OCRService with LLM API Integration (AC: #1, #2, #6, #7)
- [ ] Subtask 5.1: Rewrite `processReceipt()` method in OCRService
  - Replace Tesseract.recognize() with LLM API call
  - Implement using OpenAI SDK or fetch:
    ```typescript
    async processReceipt(imageDataUrl: string): Promise<OCRResult> {
      // Call LLM API with image
      // Parse JSON response
      // Extract product names
      // Return OCRResult
    }
    ```
- [ ] Subtask 5.2: Implement timeout handling (5 second target)
  - Wrap API call in Promise.race with timeout
  - Show specific timeout error message
  - Allow retry with same image
- [ ] Subtask 5.3: Implement API error handling
  - Catch HTTP 429 (rate limit) - show quota message
  - Catch 401 (invalid key) - show configuration error
  - Catch 500+ (server error) - show try again message
  - Catch timeout - show specific timeout message
  - Log all errors with logger.error()
- [ ] Subtask 5.4: Update product name extraction for LLM output
  - Parse JSON response from LLM
  - Handle structured output format
  - Apply same filtering heuristics (dates, prices, totals)
  - Return RecognizedProduct[] array
- [ ] Subtask 5.5: Update OCRService tests for LLM API
  - Mock LLM API client (fetch or SDK)
  - Test successful OCR with mock response
  - Test timeout scenarios
  - Test error scenarios (429, 401, 500)
  - Test JSON parsing errors

### Task 6: Implement Offline Queue Processing (AC: #4)
- [ ] Subtask 6.1: Add `queuePendingReceipt()` method to OCRService
  - Save receipt to pendingReceipts table with status='pending'
  - Return immediately (no processing attempt)
- [ ] Subtask 6.2: Add `processPendingQueue()` method to OCRService
  - Query all pendingReceipts where status='pending'
  - For each pending receipt:
    - Update status to 'processing'
    - Attempt LLM API call
    - On success: Update status to 'completed', trigger receipt processing
    - On failure: Update status to 'failed' with error message
  - Return count of processed receipts
- [ ] Subtask 6.3: Wire automatic queue processing on 'online' event
  - In ReceiptContext, listen for 'online' event
  - Call `processPendingQueue()` when connection restored
  - Show notification for each processed receipt
  - Update pending counter in UI
- [ ] Subtask 6.4: Add pending receipt counter to ReceiptScanner UI
  - Query count of pending receipts from database
  - Display badge on scanner screen: "X pending receipts"
  - Update count when receipts are queued/processed

### Task 7: Update ReceiptContext for LLM OCR + Offline Support (AC: #1, #4, #5)
- [ ] Subtask 7.1: Add network state to ReceiptState
  - `isOnline: boolean` - from navigator.onLine
  - `pendingReceiptsCount: number` - from pendingReceipts table query
- [ ] Subtask 7.2: Update `processReceiptWithOCR()` method
  - Check `isOnline` before attempting API call
  - If offline: Call `queuePendingReceipt()` instead
  - Show offline message to user
  - Update pending counter
- [ ] Subtask 7.3: Handle API quota errors (HTTP 429)
  - Check error code in OCRService
  - Dispatch specific action for quota exceeded
  - Show friendly quota message in UI
  - Queue receipt for later processing
- [ ] Subtask 7.4: Add network event listeners
  - Listen for 'online' event → process queue
  - Listen for 'offline' event → update state
  - Clean up event listeners on unmount
- [ ] Subtask 7.5: Update ReceiptContext tests
  - Test offline flow (receipt queued)
  - Test online event processing (queue processed)
  - Test quota error handling
  - Test network state transitions

### Task 8: Update UI Components for Offline Support (AC: #4)
- [ ] Subtask 8.1: Update ReceiptScanner component
  - Display pending receipts count when > 0
  - Show "X pending receipts" badge
  - Update count via useEffect polling or state listener
- [ ] Subtask 8.2: Add offline indicator to OCRProcessing component
  - Check navigator.onLine before showing processing UI
  - If offline: Show "No internet connection. Receipt will be saved and processed when you're back online."
  - Allow user to proceed with capture
- [ ] Subtask 8.3: Add quota exceeded message display
  - Check for quota error state
  - Show friendly message: "We've reached our monthly AI recognition limit..."
  - Explain pending receipts will be processed when quota resets
- [ ] Subtask 8.4: Test offline/online UI transitions
  - Test capturing receipt while offline
  - Test UI shows pending counter
  - Test counter updates when processed
  - Test quota message appears when appropriate

### Task 9: Write Comprehensive Tests (AC: #1, #2, #3, #4, #5, #6, #7)
- [ ] Subtask 9.1: Create OCRService LLM API unit tests
  - Mock LLM API (fetch or SDK)
  - Test successful product extraction
  - Test timeout scenarios (5 second limit)
  - Test error handling (429, 401, 500, timeout)
  - Test JSON parsing with valid/invalid responses
  - Test prompt formatting
- [ ] Subtask 9.2: Create pendingReceipts database tests
  - Test schema migration (v1 → v2)
  - Test CRUD operations on pendingReceipts table
  - Test status transitions
  - Test concurrent access
- [ ] Subtask 9.3: Create network detection utility tests
  - Mock navigator.onLine
  - Test event listener registration
  - Test callback invocation on status change
  - Test cleanup on unmount
- [ ] Subtask 9.4: Create offline queue integration tests
  - Test queue receipt when offline
  - Test process queue when online
  - Test partial queue processing (some succeed, some fail)
  - Test queue persistence across app restarts
- [ ] Subtask 9.5: Create ReceiptContext LLM flow tests
  - Test LLM processing with mocked API
  - Test offline flow (receipt queued)
  - Test quota error handling
  - Test automatic queue processing on 'online' event
  - Test network state transitions
- [ ] Subtask 9.6: Run full test suite
  - All existing tests still pass (regression check)
  - All new LLM tests pass
  - Test coverage ≥92% maintained
- [ ] Subtask 9.7: Manual testing checklist
  - [ ] LLM OCR processes receipt successfully
  - [ ] Product recognition accuracy improved vs Tesseract
  - [ ] Offline capture saves receipt to queue
  - [ ] Pending counter displays correctly
  - [ ] Queue processes automatically when online
  - [ ] Quota error message shows correctly
  - [ ] Timeout error shows after 5 seconds
  - [ ] Tesseract.js completely removed from codebase

### Task 10: Verify Definition of Done (AC: #1, #2, #3, #4, #5, #6, #7)
- [ ] Subtask 10.1: Verify all acceptance criteria met
  - AC1: LLM-based OCR working with free-tier API
  - AC2: Improved accuracy over Tesseract (98%+ target)
  - AC3: Tesseract.js dependency removed
  - AC4: Offline capture with deferred processing
  - AC5: API quota handling with friendly messages
  - AC6: Error handling for LLM API failures
  - AC7: Performance target maintained (<5 seconds)
- [ ] Subtask 10.2: Run ESLint and verify 0 errors
- [ ] Subtask 10.3: Run TypeScript compiler and verify clean compilation
- [ ] Subtask 10.4: Verify app builds with `npm run build`
- [ ] Subtask 10.5: Verify all tests pass (npm run test)
- [ ] Subtask 10.6: Manual testing verification
  - [ ] Test with real receipt and LLM API
  - [ ] Test offline flow (airplane mode)
  - [ ] Test queue processing on reconnect
  - [ ] Test quota error (simulate 429 response)
  - [ ] Verify Tesseract.js removed from node_modules

## Dev Notes

### Critical Implementation Requirements

**LLM API Integration:**

Story 5.4 replaces Tesseract.js with an LLM vision API for significantly improved OCR accuracy. This is a major architectural change to the OCR processing pipeline.

**LLM Provider Options:**

**Option A: OpenAI GPT-4o mini (Recommended)**
```bash
npm install openai
```
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_LLM_API_KEY,
  dangerouslyAllowBrowser: true // Required for client-side calls
});

const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{
    role: "user",
    content: [
      { type: "text", text: OCR_PROMPT },
      { type: "image_url", image_url: { url: base64Image } }
    ]
  }]
});
```

**Option B: Groq (Faster, Cheaper)**
```bash
npm install groq-sdk
```
```typescript
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_LLM_API_KEY,
  dangerouslyAllowBrowser: true
});

const response = await groq.chat.completions.create({
  model: "llava-v1.5-7b-4096-preview", // Vision model
  messages: [{
    role: "user",
    content: [
      { type: "text", text: OCR_PROMPT },
      { type: "image_url", image_url: { url: base64Image } }
    ]
  }]
});
```

**Option C: Fetch-Based (Provider Agnostic)**
```typescript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_LLM_API_KEY}`
  },
  body: JSON.stringify({
    model: "gpt-4o-mini",
    messages: [{
      role: "user",
      content: [
        { type: "text", text: OCR_PROMPT },
        { type: "image_url", image_url: { url: base64Image } }
      ]
    }]
  })
});
```

**OCR Prompt Engineering:**

```typescript
const OCR_PROMPT = `
You are a grocery receipt product extraction expert. Extract ONLY product names from this receipt image.

CRITICAL RULES:
1. Extract ONLY product names (food items, household products)
2. EXCLUDE: prices, dates, totals, store names, payment info, discounts, weights
3. EXCLUDE: non-product items like "subtotal", "tax", "cashier", "thank you"
4. Return ONLY valid product names that a user would actually buy
5. Clean up OCR artifacts (fix obvious misrecognitions)
6. Remove quantities (e.g., "2x Milk" → "Milk")
7. Remove weights/sizes (e.g., "Milk 1L" → "Milk")

OUTPUT FORMAT (JSON only):
{
  "products": ["Product 1", "Product 2", "Product 3"]
}

Return valid JSON only. No explanations, no additional text.
`;
```

**Critical Considerations:**
- **Browser API Calls**: Use `dangerouslyAllowBrowser: true` for SDKs or fetch directly
- **API Key Security**: Store in environment variable, never commit to Git
- **Timeout Handling**: Wrap in Promise.race() for 5-second limit
- **Rate Limiting**: Handle HTTP 429 responses gracefully
- **JSON Parsing**: LLM may return markdown code blocks, strip before parsing
- **Error Recovery**: Preserve receipt image for retry on failure
- **Cost Management**: Free tiers have limits, track usage

**Offline Queue Architecture:**

The offline queue ensures users never lose receipt photos when network is unavailable.

**Database Schema (Version 2):**
```typescript
// src/services/database.ts
export interface PendingReceipt {
  id?: string;
  imageData: string;        // base64 data URL
  createdAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

class InventoryDatabase extends Dexie {
  products!: Table<Product>;
  pendingReceipts!: Table<PendingReceipt>;

  constructor() {
    super('HomeInventoryDB');
    this.version(2).stores({
      products: '++id, name, stockLevel, isOnShoppingList, updatedAt',
      pendingReceipts: '++id, createdAt, status'
    }).upgrade(tx => {
      // Migration from v1 to v2
      // No data migration needed, just adding new table
    });
  }
}
```

**Queue Processing Flow:**
```
Offline Capture:
  User captures photo → Check navigator.onLine
  If offline: Save to pendingReceipts (status='pending')
  Show "Pending: 1 receipts" badge

Online Event:
  window.addEventListener('online') → Process queue
  For each pending receipt:
    Update status='processing'
    Call LLM API
    If success: status='completed', trigger product extraction
    If failure: status='failed', store error
  Update pending counter
```

**Network Detection:**
```typescript
// src/utils/network.ts
export const isOnline = (): boolean => navigator.onLine;

export const onNetworkStatusChange = (
  onlineCallback: () => void,
  offlineCallback: () => void
) => {
  window.addEventListener('online', onlineCallback);
  window.addEventListener('offline', offlineCallback);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', onlineCallback);
    window.removeEventListener('offline', offlineCallback);
  };
};
```

**State Machine Integration:**

The OCR/LLM processing extends the Receipt state machine:

```
preview → Check Online → [online: processing → completed/error]
                      → [offline: queued → (wait for online) → processing → completed/error]
```

**New States:**
- `isOnline: boolean` - Network status from navigator.onLine
- `pendingCount: number` - Count of pending receipts
- `quotaExceeded: boolean` - API quota limit reached

**Service Layer Architecture:**

**OCRService Updates:**
```typescript
// src/services/ocr.ts
class OCRService {
  // NEW: Queue pending receipt for offline processing
  async queuePendingReceipt(imageDataUrl: string): Promise<void> {
    await db.pendingReceipts.add({
      imageData: imageDataUrl,
      createdAt: new Date(),
      status: 'pending'
    });
  }

  // NEW: Process all pending receipts
  async processPendingQueue(): Promise<number> {
    const pending = await db.pendingReceipts
      .where('status').equals('pending')
      .toArray();

    let processed = 0;
    for (const receipt of pending) {
      try {
        await db.pendingReceipts.update(receipt.id!, { status: 'processing' });

        // Call LLM API
        const result = await this.processReceiptWithLLM(receipt.imageData);

        await db.pendingReceipts.update(receipt.id!, { status: 'completed' });
        // Trigger product extraction flow
        processed++;
      } catch (error) {
        await db.pendingReceipts.update(receipt.id!, {
          status: 'failed',
          error: handleError(error).message
        });
      }
    }
    return processed;
  }

  // REPLACES processReceipt() from Story 5.2
  private async processReceiptWithLLM(imageDataUrl: string): Promise<OCRResult> {
    // Call LLM API with timeout
    const response = await Promise.race([
      this.callLLMAPI(imageDataUrl),
      this.timeout(5000)
    ]);

    // Parse JSON response
    const products = this.parseLLMResponse(response);

    // Match to existing inventory
    const matched = this.matchExistingProducts(products);

    return { products: matched, rawText: '' };
  }

  // NEW: LLM API call
  private async callLLMAPI(imageDataUrl: string): Promise<any> {
    const API_KEY = import.meta.env.VITE_LLM_API_KEY;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: OCR_PROMPT },
            { type: "image_url", image_url: { url: imageDataUrl } }
          ]
        }],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('QUOTA_EXCEEDED');
      }
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  }

  // NEW: Parse LLM JSON response
  private parseLLMResponse(response: any): string[] {
    const content = response.choices[0].message.content;

    // Handle markdown code blocks
    const jsonStr = content.replace(/```json\n?|\n?```/g, '');

    const parsed = JSON.parse(jsonStr);
    return parsed.products || [];
  }
}

export const ocrService = new OCRService();
```

**Component Architecture Updates:**

**ReceiptScanner** (Modified)
- Add pending counter badge
- Listen to pendingReceipts table changes
- Show "X pending receipts" when count > 0

**OCRProcessing** (Modified)
- Check `isOnline` before processing
- If offline: Show offline message instead of processing UI
- Queue receipt automatically

**ReceiptContext** (Extended)
- New state: `isOnline`, `pendingCount`, `quotaExceeded`
- New method: `processPendingQueue()`
- Network event listeners for auto-processing

**Performance Requirements:**

**NFR2: <5 Second LLM Processing**
- Target: Receipt processing completes within 5 seconds
- Measurement: From "Use This Photo" tap to "completed" state
- Strategy:
  - Use fast LLM models (GPT-4o mini, Llava)
  - Optimize image size before sending (resize if >2MP)
  - Show progress indicator to user
  - Timeout enforcement (show error after 5 seconds)

**NFR9: Offline-First Functionality:**
- Receipt capture works without network
- Photos saved to IndexedDB queue
- Automatic processing when connection restored
- PWA service worker doesn't interfere with LLM API calls

**Architecture Compliance:**

**From Architecture Document:**

**Service Layer Pattern:**
- OCRService remains singleton export
- Service methods return Promises
- Error handling with try/catch
- LLM API calls abstracted in service

**State Management Pattern:**
- Use Context + useReducer
- Discriminated union for actions
- Immutable state updates
- Custom hook that throws outside provider

**Error Handling:**
- Use handleError() utility
- Convert errors to AppError
- User-friendly messages in UI
- Technical details logged

**Testing Strategy:**

**Unit Tests:**
- OCRService tests with LLM API mocked
- Network detection utility tests
- PendingReceipts database tests
- JSON parsing tests

**Integration Tests:**
- ReceiptContext offline flow tests
- Queue processing on 'online' event
- Error recovery flow tests

**E2E Tests:**
- Complete offline → online flow
- Queue processing scenarios
- Quota error handling

**Test Fixtures:**
- Mock LLM API responses (JSON format)
- Mock network status changes
- Sample receipt images

**Previous Story Learnings:**

**From Story 5.2 (Tesseract OCR):**
- OCRService pattern established
- Product extraction heuristics developed
- Product matching algorithm works well
- OCRProcessing component UI patterns proven

**Applying to Story 5.4:**
- Replace Tesseract.recognize() with LLM API call
- Keep product extraction and matching logic
- Extend state machine for offline/online states
- Add pendingReceipts queue for offline support
- Remove all Tesseract.js dependencies

**Key Differences:**
- LLM requires network (Tesseract was offline)
- LLM returns structured JSON (Tesseract returned raw text)
- LLM has API quotas (Tesseract was unlimited)
- LLM is more accurate but requires careful error handling
- LLM API calls need timeout enforcement

**Git Intelligence:**

**Story 5.4 Branch:**
- Branch: `feat/story-5-4-replace-tesseract-with-llm-based-ocr`
- Based on main after Story 5.2 merge
- Commit message: "Story 5.4: Replace Tesseract with LLM-Based OCR"

**Files Modified from Story 5.2:**
- `src/services/ocr.ts` - Replace Tesseract with LLM API
- `src/services/database.ts` - Add pendingReceipts table (v2)
- `src/features/receipt/context/ReceiptContext.tsx` - Add offline/online state
- `src/features/receipt/components/ReceiptScanner.tsx` - Add pending counter
- `src/features/receipt/components/OCRProcessing.tsx` - Add offline message
- `package.json` - Remove tesseract.js, add LLM SDK

**New Files:**
- `src/utils/network.ts` - Network detection utility
- `src/utils/network.test.ts` - Network detection tests

### Project Structure Notes

**Updated Service:**
```
src/services/
├── database.ts              # MODIFIED - Add pendingReceipts table (v2)
├── inventory.ts
├── shopping.ts
└── ocr.ts                   # MODIFIED - Replace Tesseract with LLM API
```

**New Utility:**
```
src/utils/
├── errorHandler.ts
├── logger.ts
└── network.ts               # NEW - Network detection
```

**Extended Receipt Feature:**
```
src/features/receipt/
├── components/
│   ├── ReceiptScanner.tsx         # MODIFIED - Add pending counter
│   ├── CameraCapture.tsx
│   ├── ImagePreview.tsx
│   ├── OCRProcessing.tsx          # MODIFIED - Offline message
│   └── ReceiptError.tsx
├── context/
│   ├── ReceiptContext.tsx         # MODIFIED - Offline/online state
│   └── ReceiptContext.test.tsx    # MODIFIED - Add offline tests
├── hooks/
│   └── useCamera.ts
└── types/
    └── receipt.types.ts           # MODIFIED - Add offline types
```

**Database Migration:**
```
Version 1: products table only
Version 2: products + pendingReceipts tables
```

### References

**Source Documents:**
- [Source: _bmad-output/planning-artifacts/architecture.md#Service Layer Pattern]
- [Source: _bmad-output/planning-artifacts/architecture.md#State Management Pattern]
- [Source: _bmad-output/planning-artifacts/architecture.md#Error Handling]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure]
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 5 Story 5.4]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Camera & OCR UX Patterns]
- [Source: _bmad-output/implementation-artifacts/5-1-capture-receipt-photo-with-camera.md]
- [Source: _bmad-output/implementation-artifacts/5-2-process-receipt-with-ocr.md]

**External References:**
- OpenAI API Documentation - https://platform.openai.com/docs/guides/vision
- GPT-4o mini Model Card - https://platform.openai.com/docs/models/gpt-4o-mini
- Groq Documentation - https://console.groq.com/docs
- MDN: Navigator.onLine - https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine
- MDN: Online/Offline Events - https://developer.mozilla.org/en-US/docs/Web/API/Window/online_event

## Dev Agent Record

### Agent Model Used

claude-opus-4-5-20251101

### Debug Log References

### Completion Notes List

**Story 5.4 Created: Replace Tesseract with LLM-Based OCR**

1. **Branch Created**: `feat/story-5-4-replace-tesseract-with-llm-based-ocr` from main

2. **Story File Created**: Comprehensive story document with:
   - 7 Acceptance Criteria covering LLM OCR, offline queue, and quota handling
   - 10 Tasks with 50+ Subtasks for complete implementation
   - Detailed Dev Notes with architecture patterns and code examples
   - Previous story intelligence from Stories 5.1 and 5.2

3. **Sprint Status Updated**: Story 5-4 marked as `ready-for-dev`

4. **Implementation Scope**:
   - Remove Tesseract.js dependency completely
   - Integrate free-tier LLM API (GPT-4o mini or Groq)
   - Add offline pending queue (new `pendingReceipts` table)
   - Implement network detection and auto-processing
   - Handle API quota exhaustion gracefully
   - Target: 98%+ OCR accuracy (vs previous 95%)

### File List

**Created:**
- _bmad-output/implementation-artifacts/5-4-replace-tesseract-with-llm-based-ocr.md

**Modified:**
- _bmad-output/implementation-artifacts/sprint-status.yaml
