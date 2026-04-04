---
stepsCompleted: [1, 2, 3]
totalEpics: 12
totalStories: 48 (40 existing + 5 new for Epic 11 + 3 new for Epic 12)
requirementsCoverage: "50/50 FRs (100%)"
note: Epic 11 added for Production Bug Fixes, Epic 12 added for Testing Strategy
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
---

# home-inventory-management-bmad - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for home-inventory-management-bmad, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**FR1:** Users can manually add new products to inventory by entering product name
**FR2:** Users can edit existing product names in inventory
**FR3:** Users can delete products from inventory
**FR4:** Users can view complete list of all products in inventory
**FR5:** Users can search/filter inventory by product name

**FR6:** Users can set product stock level to one of four states: High, Medium, Low, Empty
**FR7:** Users can quickly update stock level with single tap/action
**FR8:** System displays current stock level for each product in inventory
**FR9:** Stock level changes persist across app sessions
**FR10:** System provides immediate visual feedback when stock level is changed

**FR11:** System automatically adds products to shopping list when marked as Low or Empty
**FR12:** System removes products from shopping list when stock is replenished to High
**FR13:** Users can view shopping list showing all items needing purchase
**FR14:** System displays count of items on shopping list
**FR15:** Users can manually add products from inventory to shopping list if needed
**FR16:** Users can manually remove products from shopping list if not needed

**FR17:** Users can access shopping list in-app while shopping
**FR18:** Users can mark items as "collected" or "in cart" while shopping
**FR19:** System displays visual progress indicator (X of Y items collected)
**FR20:** Users can unmark items if removed from cart
**FR21:** Shopping list remains accessible without network connectivity

**FR22:** Users can capture receipt photo using device camera
**FR23:** System processes receipt image to extract product names via OCR
**FR24:** System attempts to match recognized products to existing inventory items
**FR25:** System displays OCR results for user review before finalizing
**FR26:** System achieves 95%+ product recognition accuracy on target supermarket receipts

**FR27:** Users can review all products recognized from receipt
**FR28:** Users can manually correct misrecognized product names
**FR29:** Users can manually add products that OCR failed to recognize
**FR30:** Users can remove incorrectly recognized items from OCR results
**FR31:** Users confirm/save corrected OCR results to update inventory

**FR32:** System updates stock levels to "High" for all confirmed products from receipt
**FR33:** System adds new products (not previously in inventory) from receipt to inventory
**FR34:** System removes purchased items from shopping list after receipt processing
**FR35:** Inventory updates persist reliably without data loss

**FR36:** All inventory data persists across app closures and device restarts
**FR37:** Stock level history is maintained for current session
**FR38:** System recovers gracefully from unexpected app termination
**FR39:** No data loss occurs during normal app operations

**FR40:** System provides visual confirmation for all user actions
**FR41:** System displays error messages for failed operations
**FR42:** System indicates when OCR processing is in progress
**FR43:** System shows success confirmation after receipt processing completes

**FR44:** System uses LLM to intelligently match receipt products to existing inventory (semantically understanding product variations)
**FR45:** LLM receives current inventory alongside receipt products to enable contextual matching decisions
**FR46:** LLM marks products as "high confidence" (clear match), "medium confidence" (likely match), or "requires confirmation" (uncertain)
**FR47:** Users can review and confirm products marked as "requires confirmation" before inventory update
**FR48:** Users can manually override LLM matching decisions during review
**FR49:** System falls back to basic matching (trim, lowercase, substring) when offline or LLM unavailable
**FR50:** System displays confidence indicators for each matched product during review

### NonFunctional Requirements

**NFR1: Response Time**
- All user tap/button actions complete within 2 seconds
- Inventory list loading displays within 1 second
- Shopping list loading displays within 1 second
- Search/filter results appear within 500ms

**NFR2: OCR Processing**
- Receipt OCR processing completes within 5 seconds for standard grocery receipts
- Progress indicator displayed during OCR processing
- Processing does not block other app functions

**NFR3: App Launch**
- App launches to usable state within 2 seconds on target devices
- No splash screen delays beyond 1 second

**NFR4: Data Integrity**
- Zero data loss across normal app operations over Phase 1 validation period (3 months)
- Inventory data persists through app updates and OS updates
- No corruption of inventory database

**NFR5: Crash-Free Operation**
- Zero crashes during core workflows (mark consumed, view lists, scan receipt)
- Graceful error handling for edge cases
- App recovers from background/foreground transitions without data loss

**NFR6: OCR Accuracy**
- 95% or higher product name recognition rate on receipts from regular supermarkets
- Successful product matching to inventory for 90%+ of recognized items
- Clear indication when OCR confidence is low

**NFR7: Simplicity**
- New users can complete first shopping cycle (mark consumed → shop → scan receipt) without tutorial
- Core actions (mark consumed, check off item) require single tap
- Error correction UI intuitive enough for non-technical users

**NFR8: Accessibility**
- Sufficient contrast ratios for readability in bright (in-store) and dim (at-home) environments
- Touch targets minimum 44x44 points for easy tapping
- Clear visual feedback for all interactive elements

**NFR9: Offline Functionality**
- All core features function without network connectivity
- No cloud dependencies for MVP workflows
- Receipt OCR processing happens on-device or with cached models

**NFR10: Storage Efficiency**
- App storage footprint remains under 100MB for typical use (hundreds of products)
- Efficient local database queries for fast list operations
- No storage leaks or unbounded growth

**NFR11: OS Support**
- Support for iOS/Android versions covering 90%+ of target user base
- Graceful degradation on older OS versions if necessary
- Testing across common device sizes and resolutions

**NFR12: Device Performance**
- Acceptable performance on mid-range devices (not just flagship phones)
- Minimal battery impact during normal use
- No thermal issues during extended shopping sessions

**NFR13: Data Privacy**
- All user data stored locally on device only
- No data transmission to external servers for MVP
- No analytics or tracking in MVP

**NFR14: Camera Privacy**
- Explicit user permission required for camera access
- Receipt photos not saved to device photo library by default
- Clear user control over data

**NFR15: LLM Matching Accuracy**
- LLM achieves >90% accuracy in correctly matching products from receipts to existing inventory
- Clear distinction between high-confidence matches and uncertain matches requiring user confirmation
- User can review all matching decisions before inventory update

**NFR16: Offline Fallback**
- Basic product matching (trim, lowercase, substring) works without network connectivity
- LLM matching available when online, with automatic fallback to basic matching when offline
- No data loss or corruption when switching between online/offline modes

**NFR17: API Cost Efficiency**
- LLM matching adds minimal cost (<10% increase over OCR-only approach)
- Inventory data sent only when processing receipts (not continuous monitoring)

### Additional Requirements

**From Architecture:**
- Starter Template: Vite Official + Curated Additions approach (npm create vite@latest with react-ts template)
- Technology Stack: React 19.x, TypeScript, Vite 7.x, MUI v7, PWA
- State Management: React Context API + useReducer (MVP)
- Local Database: Dexie.js 4.x for IndexedDB
- LLM Provider: OpenAI GPT-4o mini API for OCR and product matching
- PWA Configuration: vite-plugin-pwa 1.x for offline capabilities
- Testing: Vitest for unit/integration tests, Playwright for E2E tests, @testing-library/react for component tests
- Service Layer Pattern: InventoryService, OCRService with provider architecture
- Error Boundary Strategy: Feature-level isolation for error handling
- Environment Configuration: Vite .env for API keys and settings
- CI/CD Pipeline: GitHub Actions for deployment to Vercel
- Logging: Structured logging utility for debugging and monitoring

**From UX Design:**
- MUI v7 component library for UI
- Emotion styling system
- Responsive breakpoints for mobile/desktop
- Theme customization capability
- Context-aware design for at-home, in-store, and post-shopping contexts
- Trust-building through transparency and immediate visual feedback

### FR Coverage Map

**Epic 1 - Project Foundation & Initial Inventory Setup:**
- FR1: Manual product entry
- FR2: Edit product names
- FR3: Delete products
- FR4: View inventory list
- FR5: Search/filter inventory
- FR36: Data persistence across app closures
- FR37: Stock level history maintained
- FR38: Graceful recovery from termination
- FR39: No data loss during operations

**Epic 2 - Stock Level Tracking & Visual Feedback:**
- FR6: Four-state stock levels (High/Medium/Low/Empty)
- FR7: Single-tap stock updates
- FR8: Display current stock level
- FR9: Stock level persists across sessions
- FR10: Immediate visual feedback
- FR40: Visual confirmation for actions

**Epic 3 - Automatic Shopping List Generation:**
- FR11: Auto-add to shopping list (Low/Empty)
- FR12: Auto-remove from list (High)
- FR13: View shopping list
- FR14: Display list count
- FR15: Manual add to list
- FR16: Manual remove from list

**Epic 4 - In-Store Shopping Experience:**
- FR17: Access shopping list in-app
- FR18: Mark items as collected
- FR19: Visual progress indicator (X of Y)
- FR20: Unmark items
- FR21: Offline accessibility

**Epic 5 - Receipt Scanning & OCR Processing:**
- FR22: Capture receipt photo with camera
- FR23: OCR product extraction
- FR24: Match to existing inventory
- FR25: Display OCR results for review
- FR26: 95%+ OCR accuracy
- FR27: Review recognized products
- FR28: Correct misrecognized names
- FR29: Add missed products
- FR30: Remove incorrect items
- FR31: Confirm/save results
- FR42: OCR processing status
- FR43: Success confirmation

**Epic 6 - Inventory Updates from Receipt:**
- FR32: Update stock to High
- FR33: Add new products
- FR34: Remove purchased items from list
- FR35: Inventory updates persist
- FR41: Error messages

**Epic 7 - UX Improvements & Polish:**
- UX enhancements (no new FRs)
- Improved layout and navigation

**Epic 8 - Technical Debt & Performance:**
- Performance improvements (no new FRs)
- Event-driven synchronization
- Bundle size optimization

**Epic 9 - Shopping Lifecycle & Experience:**
- UX enhancements (no new FRs)
- Shopping mode states
- Post-shopping receipt scan prompt

**Epic 10 - LLM-Powered Product Matching:**
- FR44: LLM intelligent matching
- FR45: LLM receives inventory context
- FR46: Confidence-based matching
- FR47: Review uncertain matches
- FR48: Manual override
- FR49: Offline fallback
- FR50: Confidence indicators
- NFR15: >90% LLM accuracy
- NFR16: Offline fallback capability
- NFR17: API cost efficiency

**Epic 11 - Production Bug Fixes:**
- Bug fixes for production issues (no new FRs)

## Epic List

### Epic 1: Project Foundation & Initial Inventory Setup

Users can manually manage their product inventory with reliable data persistence.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR36, FR37, FR38, FR39

### Epic 2: Stock Level Tracking & Visual Feedback

Users can quickly mark items as consumed with instant visual feedback.
**FRs covered:** FR6, FR7, FR8, FR9, FR10, FR40

### Epic 3: Automatic Shopping List Generation

Users experience their first "aha moment" - the shopping list creates itself automatically.
**FRs covered:** FR11, FR12, FR13, FR14, FR15, FR16

### Epic 4: In-Store Shopping Experience

Users can efficiently complete shopping trips using the auto-generated list.
**FRs covered:** FR17, FR18, FR19, FR20, FR21

### Epic 5: Receipt Scanning & OCR Processing

Users scan receipts after shopping, and the system automatically extracts product names.
**FRs covered:** FR22, FR23, FR24, FR25, FR26, FR27, FR28, FR29, FR30, FR31, FR42, FR43

### Epic 6: Inventory Updates from Receipt & Complete Automation Loop

Users experience the complete automated cycle: mark consumed → shopping list → shop → scan receipt → inventory updates.
**FRs covered:** FR32, FR33, FR34, FR35, FR41

### Epic 7: UX Improvements & Polish

Users experience a cleaner, more efficient interface.
**FRs covered:** N/A (UX enhancement)

### Epic 8: Technical Debt & Performance Improvements

Users experience faster performance and better battery life.
**FRs covered:** N/A (Technical debt)

### Epic 9: Shopping Lifecycle & Post-Shopping Experience

Users have a clear, intentional shopping journey with friction-free transitions.
**FRs covered:** N/A (UX enhancement)

### Epic 10: LLM-Powered Product Matching & Smart Deduplication

Users scan receipts and the system intelligently matches products even with different names/typography from different stores (e.g., "Galletas Dinosauru" = "Galleta Dinosaurus Cucharad").
**FRs covered:** FR44, FR45, FR46, FR47, FR48, FR49, FR50
**NFRs covered:** NFR15, NFR16, NFR17

### Epic 11: Production Bug Fixes

Users experience a stable, reliable application with fixed production bugs affecting navigation, state management, visual consistency, user interactions, and core functionality.
**FRs covered:** N/A (Bug fixes)
**Priority:** High - Production issues affecting user experience

### Epic 12: Testing Strategy Documentation and Reorganization

Developers follow consistent testing practices with clear guidelines on when and how to write unit, integration, and E2E tests. Integration tests are reorganized to follow React/Vitest industry standards.
**FRs covered:** N/A (Technical improvement - documentation and organization)
**Priority:** Medium - Improves code quality and maintainability

---

### Story 10.1: Enhanced LLM Prompt with Inventory Context

As a **developer**,
I want to enhance the LLM OCR prompt to include the current inventory context,
So that the LLM can intelligently match receipt products to existing inventory items.

**Acceptance Criteria:**

**Given** the LLM OCR service is configured with an API key
**When** a receipt photo is processed
**Then** The LLM API request includes:
  - The receipt image for product extraction
  - The current inventory as context (array of product names and IDs)
  - A prompt instructing the LLM to match recognized products to inventory items
**And** The prompt instructs the LLM to:
  - Extract product names from the receipt
  - For each extracted product, check if it matches any product in the provided inventory
  - Mark products as "high confidence" (exact match), "medium confidence" (likely match), or "requires confirmation" (uncertain)
**And** The prompt instructs the LLM to return results in a structured JSON format
**And** The inventory context includes all product names and their IDs (FR45)
**And** The total request size remains within LLM API limits (<128k tokens for context window)

**Given** the LLM API returns a successful response
**When** the response is parsed
**Then** The structured response includes:
  - Extracted product names from the receipt
  - For each product: match status, matched product ID (if applicable), confidence level, and a boolean flag `requiresConfirmation`
  - Confidence levels: "high", "medium", or "low"
**And** Products with clear exact matches have `requiresConfirmation: false` and `confidence: "high"`
**And** Products that are similar but not identical have `requiresConfirmation: true` and `confidence: "medium"`
**And** Products with no matches have `requiresConfirmation: true` and `confidence: "low"`

**Given** the LLM API call fails (timeout, rate limit 429, network error)
**When** the error occurs
**Then** A clear error message is displayed to the user
**And** The system falls back to the receipt photo being saved for later processing (existing offline queue)

**Technical Notes:**
- Update `src/services/ocr/providers/LLMProvider.ts` to accept inventory parameter
- Modify the prompt to include inventory context in the system message
- Ensure inventory array is formatted efficiently (names and IDs only, not full product objects)
- Estimate token usage: ~500-2000 tokens depending on inventory size

---

### Story 10.3: User Review Interface for Uncertain Matches

As a **user**,
I want to review products the LLM is uncertain about before updating my inventory,
So that I have control over which products get merged and avoid incorrect duplicates.

**Acceptance Criteria:**

**Given** I have scanned a receipt and the LLM has processed it
**When** I view the OCR review screen
**Then** I see a summary at the top indicating how many products require confirmation (e.g., "3 products need your review")
**And** Products marked as "requires confirmation" are visually distinguished with warning icons or borders
**And** Products requiring confirmation display both:
  - The receipt product name (what the LLM extracted)
  - A suggested matching product name (if the LLM found a potential match)
**And** A confirmation checkbox or toggle is available next to each uncertain product

**Given** I review a product marked "requires confirmation"
**When** I examine the suggested match
**Then** I see both product names clearly displayed:
  - Receipt product: "Galletas Dinosauru"
  - Suggested match: "Galletas Dinosaurus Cucharad"
**And** The system asks "Is this the same product?" or shows a "Confirm match" toggle
**And** I can choose to:
  - ✓ Confirm the match (products will be merged/inventory updated to matched product)
  - ✗ Indicate it's a different product (treated as new product)
  - Edit either product name before confirming

**Given** I confirm a product match
**When** I finalize the receipt review
**Then** The matched product from inventory is used (not creating a duplicate)
**And** The receipt product name is discarded
**And** The stock level for the matched inventory product is updated to "High"
**And** No new duplicate product is created in the inventory (FR44, FR47)

**Given** I indicate a product is different (not a match)
**When** I finalize the receipt review
**Then** The receipt product is treated as a new product
**And** A new product entry is created in the inventory
**And** The stock level is set to "High"

**Given** there are products marked "requires confirmation"
**When** I tap the "Confirm & Update Inventory" button
**Then** I see a validation modal if I haven't reviewed all uncertain products
**And** The modal lists products requiring my decision
**And** I can either:
  - "Review now" - return to review screen
  - "Treat all as new" - mark all as different products
  - "Treat all as matches" - accept all suggested matches (if available)

**Given** I complete the review and confirm
**When** inventory updates complete
**Then** A success message shows how many products were matched vs added as new
**And** The inventory accurately reflects my decisions (no accidental duplicates)

**Technical Notes:**
- Update `ReceiptReview` component to display uncertain matches with dual product names
- Add confirmation checkbox/toggle for each uncertain product
- Create validation modal before final confirmation
- Update `InventoryService.replenishStock()` to handle confirmed matches
- Store user decisions in a temporary state during review
- Use MUI `Dialog` for validation modal and confirmation UI
- Ensure all uncertain products are resolved before inventory update (FR47, FR50)

---

### Story 10.4: Manual Override of LLM Matching Decisions

As a **user**,
I want to manually override the LLM's matching decisions during review,
So that I have full control when the LLM gets it wrong or I disagree with its assessment.

**Acceptance Criteria:**

**Given** I am reviewing products from my receipt
**When** I disagree with the LLM's confidence assessment or matching decision
**Then** I can manually override the LLM's suggestion regardless of confidence level

**Given** the LLM marked a product as "high confidence" (automatic match)
**When** I disagree and want to treat it as a different product
**Then** I can mark it as "Not a match" or "Treat as new product"
**And** The product is removed from automatic matching
**And** It will be added as a new product when I confirm the receipt

**Given** the LLM marked a product as "requires confirmation" with a suggested match
**When** I disagree with the suggested match
**Then** I can select "Not a match" or "Choose different product"
**And** If I choose "Choose different product", I can search/select from my existing inventory
**And** The system updates to use my selected product instead of the LLM's suggestion
**And** My manual decision overrides the LLM's recommendation (FR48)

**Given** the LLM marked a product as "low confidence" (no match found)
**When** I believe I know which product it should match
**Then** I can manually select a matching product from my inventory
**And** I can search or browse my inventory to find the correct product
**And** The system uses my manual selection instead of treating it as new

**Given** I make any manual override
**When** I view the review screen
**Then** My override is clearly indicated visually (e.g., "Manual override" badge or icon)
**And** I can revert my override and return to the LLM's original suggestion if needed

**Given** I have made manual overrides
**When** I tap "Confirm & Update Inventory"
**Then** The system respects all my manual decisions
**And** Products are matched, merged, or created according to my selections
**And** No automatic LLM matching overrides my manual choices

**Technical Notes:**
- Add "Not a match" option to product review actions
- Add "Choose different product" option with product search dialog
- Implement product search dialog with inventory filtering
- Add visual indicator for manual overrides (badge/icon)
- Store override state alongside each product during review
- Create `ProductSelector` component for manual product matching
- Allow reverting overrides (undo functionality)
- Ensure manual overrides take precedence over LLM suggestions (FR48)

---

### Story 10.5: Offline Fallback to Basic Matching

As a **user**,
I want the system to still work when I'm offline or the LLM is unavailable,
So that I can continue to process receipts even without internet connection.

**Acceptance Criteria:**

**Given** I am offline (no internet connectivity) or the LLM API is unavailable
**When** I scan a receipt
**Then** The system detects the offline status using `navigator.onLine` or LLM API failure
**And** I see a clear message: "LLM matching is unavailable. Using basic matching instead."
**And** The system proceeds to process the receipt with basic product matching

**Given** basic matching is active
**When** products are extracted from the receipt
**Then** The system uses basic string matching rules:
  - Trim whitespace and convert to lowercase
  - Exact match: product name exactly equals inventory product name
  - Partial match: product name is contained in inventory product name OR inventory product name is contained in product name
**And** Products with exact matches are automatically matched
**And** Products with partial matches are marked as "requires confirmation"
**And** Products with no matches are treated as new products
**And** No confidence scores are displayed (since basic matching doesn't provide them)

**Given** I am reviewing products processed with basic matching
**When** I view the review screen
**Then** I can see which products were matched and which are new
**And** Partial matches require my confirmation (similar to LLM uncertain matches)
**And** The UI works the same way as LLM matching, just without confidence indicators

**Given** I am offline and process a receipt
**When** The receipt is processed
**Then** The receipt photo is saved to the pending queue (existing offline queue)
**And** Basic matching is performed locally
**And** I can review and confirm the results
**And** When I come back online, the receipt is not re-processed (avoiding duplicate work)

**Given** the LLM API becomes available again (online, quota restored, etc.)
**When** I scan my next receipt
**Then** The system automatically switches back to LLM-powered matching
**And** I see a brief message: "LLM matching is now active."
**And** The enhanced matching with confidence indicators returns
**And** No manual intervention is required to switch between modes

**Given** the system experiences a transient LLM failure (timeout, API error)
**When** the error occurs during receipt processing
**Then** The system gracefully falls back to basic matching for that receipt only
**And** I see a message: "LLM matching temporarily unavailable. Using basic matching."
**And** The receipt is still processed successfully (just with less intelligent matching)
**And** The next receipt attempt will retry LLM matching automatically

**Given** I am in offline mode
**When** I view my inventory
**Then** All core features work normally (viewing, adding, editing, deleting products)
**And** The shopping list functions normally
**And** I can manually manage my inventory without any LLM dependency (FR49, NFR16)

**Technical Notes:**
- Update `OCRService` to detect online/offline status with `navigator.onLine`
- Create `BasicMatchingStrategy` utility class with `matchProducts(inventory, receiptProducts)` method
- Modify `ReceiptReview` component to work without confidence indicators when basic matching is active
- Add service detection logic: check LLM API availability, handle network errors gracefully
- Store matching mode state (LLM vs Basic) in receipt context
- Implement fallback logic: try LLM first, catch errors, fallback to basic
- Ensure basic matching produces similar enough results that the UI works identically
- Test offline scenarios: disable network, API failures, rate limits (NFR16)

---

### Story 11.1: Fix "View Inventory" Button Navigation

As a **user**,
I want the "View Inventory" button to navigate me to the inventory page after completing a purchase,
So that I can see my updated inventory without encountering a blank page.

**Bug Description:**
After completing the purchase workflow and reaching the confirmation page showing products added to inventory, clicking the "View Inventory" button results in a blank page instead of navigating to the inventory page.

**Acceptance Criteria:**

**Given** I have completed a purchase workflow
**When** The confirmation page is displayed showing products added to inventory
**And** I tap the "View Inventory" button
**Then** I am successfully navigated to the inventory page
**And** The inventory page displays all products correctly
**And** No blank page is shown

**Given** I am on the inventory page via "View Inventory" button
**When** The page loads
**Then** The inventory list is visible and populated
**And** All products are displayed with their correct stock levels
**And** The page is fully functional (search, scroll, etc.)

**Technical Notes:**
- Investigate the navigation logic in the receipt confirmation component
- Check if the route path is correctly configured for inventory page
- Verify that the inventory page component is properly mounted when navigation occurs
- Check for any JavaScript errors in console during navigation
- Ensure the inventory page data is loaded before or during navigation
- Related files: `src/pages/ReceiptConfirmation.tsx`, `src/pages/Inventory.tsx`, routing configuration

---

### Story 11.2: Fix Shopping Session State Persistence

As a **user**,
I want each new shopping session to start fresh without previous receipt data,
So that I can complete a new shopping trip without seeing old receipt information.

**Bug Description:**
After navigating to the inventory page and starting a new shopping session, when the shopping is completed and the app asks to scan the receipt, the app shows the "Inventory Updated" page with the previously scanned receipt data instead of starting a new session.

**Acceptance Criteria:**

**Given** I have completed a shopping session and scanned a receipt
**When** I navigate to the inventory page manually
**And** I start a new shopping session
**Then** The shopping session state is completely reset
**And** No previous receipt or shopping data is carried over

**Given** I start a new shopping session
**When** I complete the shopping and the app prompts to scan a receipt
**Then** I am presented with a fresh receipt scanning flow
**And** No previous receipt data is displayed
**And** The "Inventory Updated" page is not shown with old data

**Given** I am in a new shopping session
**When** I view the shopping state
**Then** All session-specific data (shopping list, collected items, receipt) is empty or reset
**And** The session ID or identifier is different from the previous session

**Technical Notes:**
- Investigate shopping session state management in the shopping context/reducer
- Ensure session state is properly reset when starting a new shopping session
- Check for cached receipt data that persists between sessions
- Verify that navigation events trigger proper state cleanup
- Consider adding explicit session reset logic when entering shopping mode
- Related files: `src/contexts/ShoppingContext.tsx`, `src/pages/Shopping.tsx`, state management

---

### Story 11.3: Fix Inventory Page Background Color Inconsistency

As a **user**,
I want the inventory page to have a consistent background color throughout,
So that the visual experience is polished and professional.

**Bug Description:**
When viewing the inventory page, the background of products at the top is blank/white, but when scrolling down, the background becomes black. This creates an inconsistent visual experience.

**Acceptance Criteria:**

**Given** I navigate to the inventory page
**When** The page initially loads
**Then** The background color is consistent throughout the entire page
**And** No color difference exists between the top and scrolled sections

**Given** I am on the inventory page
**When** I scroll down through the product list
**Then** The background color remains consistent
**And** No sudden color changes occur (from blank to black)

**Given** I view the inventory page on any device or screen size
**When** The page renders
**Then** The background color is uniform across all viewports
**And** The styling matches the app's design system (likely dark theme consistent with other pages)

**Technical Notes:**
- Investigate CSS/styling for the inventory page component
- Check for conditional styling based on scroll position
- Verify that the parent container and product list have consistent background colors
- Look for any JavaScript that dynamically changes background on scroll
- Ensure the MUI theme or styling system is properly applied throughout
- Related files: `src/pages/Inventory.tsx`, `src/components/ProductList.tsx`, styling files

---

### Story 11.4: Prevent Accidental Interactions When Scrolling

As a **user**,
I want to scroll through the product list without accidentally triggering stock updates or edit popups,
So that I can browse my inventory without frustration.

**Bug Description:**
When scrolling down with a finger on the inventory product list, accidental touches trigger stock updates and edit product popups, creating a poor user experience.

**Acceptance Criteria:**

**Given** I am viewing the inventory product list
**When** I scroll through the list using touch gestures
**Then** No stock updates are triggered
**And** No edit product popups are launched
**And** The scrolling feels smooth and responsive

**Given** I want to interact with a product
**When** I intentionally tap on a product (not during scroll)
**Then** The appropriate action occurs (stock update or edit)
**And** The interaction is deliberate and not accidental

**Given** I am scrolling through the product list
**When** My finger moves across multiple items
**Then** The system distinguishes between scrolling and tapping
**And** Only deliberate taps trigger actions, not scroll gestures

**Technical Notes:**
- Implement touch event handling to distinguish between scroll and tap gestures
- Consider adding a threshold/delay before accepting tap actions during touch events
- Review the current interaction model - consider separating scroll and tap zones
- Evaluate if the current UI makes it too easy to accidentally trigger actions
- Possible solutions:
  - Add explicit edit buttons separate from the product card
  - Require long-press or double-tap for edit actions
  - Add confirmation dialogs for destructive actions
  - Improve touch event handling with gesture recognition
- Related files: `src/components/ProductList.tsx`, `src/components/ProductCard.tsx`, inventory interaction handlers

---

### Story 11.5: Fix Remove Item Functionality in Shopping Page

As a **user**,
I want to remove items from my shopping list when needed,
So that I can manage my shopping list accurately.

**Bug Description:**
The remove item button/functionality in the shopping page does not work, preventing users from removing unwanted items from their shopping list.

**Acceptance Criteria:**

**Given** I am viewing the shopping list
**When** I tap the remove button/icon for an item
**Then** The item is immediately removed from the shopping list
**And** The shopping list updates to reflect the removal
**And** The item count decreases by one

**Given** I remove an item from the shopping list
**When** The removal is processed
**Then** The change persists across navigation and app restarts
**And** The item no longer appears in the shopping list

**Given** I accidentally remove an item
**When** I want to add it back
**Then** I can manually add the item again through the inventory or shopping list
**And** The item appears in the shopping list as expected

**Technical Notes:**
- Investigate the remove item button's event handler in the shopping list component
- Check if the handler is properly wired to the shopping context/action
- Verify that the remove action updates the state correctly
- Check for any JavaScript errors when clicking remove
- Ensure the UI provides visual feedback when removal succeeds
- Test that the removal persists to the database/local storage
- Related files: `src/components/ShoppingList.tsx`, `src/contexts/ShoppingContext.tsx`, `src/services/InventoryService.ts`

---

## Epic 11 Summary

**Stories Created:** 5 stories
- Story 11.1: Fix "View Inventory" Button Navigation
- Story 11.2: Fix Shopping Session State Persistence
- Story 11.3: Fix Inventory Page Background Color Inconsistency
- Story 11.4: Prevent Accidental Interactions When Scrolling
- Story 11.5: Fix Remove Item Functionality in Shopping Page

**FRs Covered:** N/A (Bug fixes - existing functionality)
**Priority:** High - Production issues affecting user experience

**Bug Categories:**
- Navigation: Story 11.1
- State Management: Story 11.2
- Visual/Styling: Story 11.3
- User Interaction/UX: Story 11.4
- Functional Bug: Story 11.5

---

### Story 12.1: Create Testing Guidelines Documentation

As a **developer**,
I want comprehensive testing guidelines documentation,
So that all contributors follow consistent testing practices.

**Acceptance Criteria:**

**Given** I am a new developer joining the project
**When** I need to write tests
**Then** I can refer to `TESTING_GUIDELINES.md` for:
  - Test type definitions (Unit, Integration, E2E)
  - Folder structure conventions
  - When to use each test type
  - File naming conventions
  - Coverage targets per story
  - Testing best practices

**Given** I review the testing guidelines
**When** I look for the current state
**Then** I see documented:
  - Current test coverage gaps (Stories 5-11 missing integration/E2E)
  - Current integration test location issue (`src/integration/` vs standard)
  - **Action item:** Review current testing strategy before adding new integration/E2E tests

**Technical Notes:**
- Create `TESTING_GUIDELINES.md` in project root
- Document current test structure: 19 integration tests (Stories 3.2, 4.1), ~12 E2E tests
- Document coverage gaps for Stories 5-11
- Include React/Vitest/Playwright conventions
- Note that adding new integration/E2E tests is deferred pending strategy review

---

### Story 12.2: Move Integration Tests to Standard Location

As a **developer**,
I want integration tests to follow React/Vitest conventions,
So that the test structure matches industry standards.

**Acceptance Criteria:**

**Given** integration tests currently exist in `src/integration/`
**When** the migration is complete
**Then** All integration tests are moved to `src/__tests__/integration/`
**And** All imports in test files are updated to reflect new paths
**And** `vitest.config.ts` includes the new test pattern if needed
**And** All tests still pass after migration

**Given** the migration is complete
**When** I run `npm test`
**Then** All 19 integration tests execute successfully
**And** No import errors occur
**And** Test coverage reports remain accurate

**Technical Notes:**
- Move `src/integration/auto-removal.integration.test.ts` → `src/__tests__/integration/auto-removal.integration.test.ts`
- Move `src/integration/auto-removal.persistence.test.ts` → `src/__tests__/integration/auto-removal.persistence.test.ts`
- Move `src/integration/check-off-items.persistence.test.ts` → `src/__tests__/integration/check-off-items.persistence.test.ts`
- Update all import statements in moved files
- Update `vitest.config.ts` if needed to include `src/__tests__/integration/` pattern
- Verify all 19 tests pass after migration
- Delete empty `src/integration/` directory after migration

---

### Story 12.3: Review and Update CI Configuration for Test Execution

As a **developer**,
I want CI to run tests in optimal order,
So that feedback is fast and reliable.

**Acceptance Criteria:**

**Given** the project uses GitHub Actions or similar CI
**When** I review the CI configuration
**Then** Tests run in this order:
  1. Unit tests (fastest feedback)
  2. Integration tests (Vitest)
  3. E2E tests (slowest, only if previous pass)

**Given** a test type fails
**When** the failure occurs
**Then** Subsequent test types are skipped (fail fast)
**And** Developers get quick feedback on what broke

**Given** the CI configuration is updated
**When** I push code to the repository
**Then** I see separate test results for each test type
**And** Coverage reports are generated for unit and integration tests
**And** E2E test results show pass/fail status with screenshots on failure

**Technical Notes:**
- Review `.github/workflows/` or CI configuration file
- Add separate jobs for each test type if not already present
- Configure test reporting and coverage thresholds
- Add integration test job after unit tests
- Run E2E tests only on main branch or PR merge (not on every push)
- Ensure fail-fast behavior is configured
- Add test result artifacts (coverage reports, E2E screenshots)
- Consider parallel execution for faster feedback

---

## Epic 12 Summary

**Stories Created:** 3 stories
- Story 12.1: Create Testing Guidelines Documentation
- Story 12.2: Move Integration Tests to Standard Location
- Story 12.3: Review and Update CI Configuration

**FRs Covered:** N/A (Technical improvement - documentation and organization)
**Priority:** Medium - Improves code quality and maintainability

**Note:** This epic focuses on documentation and reorganization only. Adding new integration/E2E test coverage for Stories 5-11 will be deferred until after a careful review of the current testing strategy.

---

## Epic 10 Summary

**Stories Created:** 5 stories
- Story 10.1: Enhanced LLM Prompt with Inventory Context
- Story 10.2: Confidence-Based Product Matching
- Story 10.3: User Review Interface for Uncertain Matches
- Story 10.4: Manual Override of LLM Matching Decisions
- Story 10.5: Offline Fallback to Basic Matching

**FRs Covered:** FR44, FR45, FR46, FR47, FR48, FR49, FR50
**NFRs Covered:** NFR15, NFR16, NFR17

All requirements for Epic 10 have been covered by stories.

Users scan receipts and the system intelligently matches products even with different names/typography from different stores (e.g., "Galletas Dinosauru" = "Galleta Dinosaurus Cucharad").
**FRs covered:** FR44, FR45, FR46, FR47, FR48, FR49, FR50
**NFRs covered:** NFR15, NFR16, NFR17
