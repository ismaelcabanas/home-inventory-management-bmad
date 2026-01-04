---
stepsCompleted: ["step-01-validate-prerequisites", "step-02-design-epics", "step-03-create-stories", "step-04-final-validation"]
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
totalEpics: 6
totalStories: 28
requirementsCoverage: "43/43 FRs (100%)"
---

# home-inventory-management-bmad - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for home-inventory-management-bmad, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

**Product Inventory Management:**
- **FR1:** Users can manually add new products to inventory by entering product name
- **FR2:** Users can edit existing product names in inventory
- **FR3:** Users can delete products from inventory
- **FR4:** Users can view complete list of all products in inventory
- **FR5:** Users can search/filter inventory by product name

**Stock Level Tracking:**
- **FR6:** Users can set product stock level to one of four states: High, Medium, Low, Empty
- **FR7:** Users can quickly update stock level with single tap/action
- **FR8:** System displays current stock level for each product in inventory
- **FR9:** Stock level changes persist across app sessions
- **FR10:** System provides immediate visual feedback when stock level is changed

**Automatic Shopping List Generation:**
- **FR11:** System automatically adds products to shopping list when marked as Low or Empty
- **FR12:** System removes products from shopping list when stock is replenished to High
- **FR13:** Users can view shopping list showing all items needing purchase
- **FR14:** System displays count of items on shopping list
- **FR15:** Users can manually add products from inventory to shopping list if needed
- **FR16:** Users can manually remove products from shopping list if not needed

**In-Store Shopping Experience:**
- **FR17:** Users can access shopping list in-app while shopping
- **FR18:** Users can mark items as "collected" or "in cart" while shopping
- **FR19:** System displays visual progress indicator (X of Y items collected)
- **FR20:** Users can unmark items if removed from cart
- **FR21:** Shopping list remains accessible without network connectivity

**Receipt Scanning & OCR:**
- **FR22:** Users can capture receipt photo using device camera
- **FR23:** System processes receipt image to extract product names via OCR
- **FR24:** System attempts to match recognized products to existing inventory items
- **FR25:** System displays OCR results for user review before finalizing
- **FR26:** System achieves 95%+ product recognition accuracy on target supermarket receipts

**OCR Error Correction:**
- **FR27:** Users can review all products recognized from receipt
- **FR28:** Users can manually correct misrecognized product names
- **FR29:** Users can manually add products that OCR failed to recognize
- **FR30:** Users can remove incorrectly recognized items from OCR results
- **FR31:** Users confirm/save corrected OCR results to update inventory

**Inventory Updates from Receipt:**
- **FR32:** System updates stock levels to "High" for all confirmed products from receipt
- **FR33:** System adds new products (not previously in inventory) from receipt to inventory
- **FR34:** System removes purchased items from shopping list after receipt processing
- **FR35:** Inventory updates persist reliably without data loss

**Data Persistence & Reliability:**
- **FR36:** All inventory data persists across app closures and device restarts
- **FR37:** Stock level history is maintained for current session
- **FR38:** System recovers gracefully from unexpected app termination
- **FR39:** No data loss occurs during normal app operations

**User Feedback & Notifications:**
- **FR40:** System provides visual confirmation for all user actions
- **FR41:** System displays error messages for failed operations
- **FR42:** System indicates when OCR processing is in progress
- **FR43:** System shows success confirmation after receipt processing completes

### Non-Functional Requirements

**Performance:**
- **NFR1:** All user tap/button actions complete within 2 seconds
- **NFR2:** Receipt OCR processing completes within 5 seconds for standard grocery receipts
- **NFR3:** App launches to usable state within 2 seconds on target devices

**Reliability:**
- **NFR4:** Zero data loss across normal app operations over Phase 1 validation period (3 months)
- **NFR5:** Zero crashes during core workflows (mark consumed, view lists, scan receipt)
- **NFR6:** 95% or higher product name recognition rate on receipts from regular supermarkets

**Usability:**
- **NFR7:** New users can complete first shopping cycle (mark consumed → shop → scan receipt) without tutorial
- **NFR7.1:** Core actions (mark consumed, check off item) require single tap
- **NFR7.2:** Error correction UI intuitive enough for non-technical users

**Accessibility:**
- **NFR8:** Sufficient contrast ratios for readability in bright (in-store) and dim (at-home) environments
- **NFR8.1:** Touch targets minimum 44x44 points for easy tapping
- **NFR8.2:** Clear visual feedback for all interactive elements

**Local-First Architecture:**
- **NFR9:** All core features function without network connectivity
- **NFR10:** App storage footprint remains under 100MB for typical use (hundreds of products)

**Platform Compatibility:**
- **NFR11:** Support for iOS/Android browsers covering 90%+ of target user base
- **NFR12:** Acceptable performance on mid-range devices (not just flagship phones)

**Security & Privacy:**
- **NFR13:** All user data stored locally on device only (no cloud transmission for MVP)
- **NFR14:** Explicit user permission required for camera access

### Additional Requirements

**From Architecture Document:**

**Starter Template & Project Initialization (Epic 1, Story 1):**
- Initialize Vite + React 19.x + TypeScript 5.x project using official template
- Install and configure MUI v7 component library with Emotion styling
- Configure PWA capabilities with vite-plugin-pwa 1.x
- Set up Dexie.js 4.x for IndexedDB local database
- Integrate Tesseract.js 7.x for browser-based OCR
- Configure React Router v6 for navigation
- Set up Vitest for unit/integration tests
- Set up Playwright for E2E tests
- Configure GitHub Actions CI/CD pipeline (lint, test, e2e, build)
- Deploy initial skeleton to Vercel with HTTPS enabled
- Configure absolute imports with @/ alias for src/ directory

**Database Schema (Foundation):**
- Implement Dexie.js database with Product entity containing: id (UUID), name (string), stockLevel ('high'|'medium'|'low'|'empty'), createdAt (Date), updatedAt (Date), isOnShoppingList (boolean)
- Set up database versioning for future migrations
- No runtime data validation for MVP (TypeScript compile-time only)
- Process and discard receipt images after OCR (no image storage)

**Service Layer Architecture:**
- Abstract all data operations in service layer (InventoryService, ShoppingService, OCRService)
- Service layer calls Dexie.js directly in MVP
- Design service interfaces for future REST API migration (Phase 2)
- Components never call database directly, only through services

**State Management Pattern:**
- Use React Context API + useReducer for all feature state
- One Context per feature: InventoryContext, ShoppingContext, ReceiptContext
- All state updates immutable (spread operators, no mutations)
- Loading states: boolean flags (loading, saving, scanning)
- Error handling: Convert all errors to AppError interface via handleError() utility

**Component Architecture:**
- Feature-based folder structure: src/features/{inventory,shopping,receipt}
- Each feature contains: components/, context/, hooks/, types/ subdirectories
- Shared components in src/components/shared/
- Co-locate test files with source files (Component.test.tsx)
- Wrap each feature in FeatureErrorBoundary for isolated failure handling

**Routing & Navigation:**
- React Router v6 with routes: / (InventoryList), /shopping (ShoppingList), /scan (ReceiptScanner), /product/:id (ProductDetail)
- MUI BottomNavigation for mobile navigation
- Browser back button support

**Error Handling Standards:**
- All errors converted to AppError interface with user-friendly messages
- Use logger utility for all console output (debug/info/warn/error)
- Display errors using MUI Alert or Snackbar components
- Feature-level error boundaries catch uncaught errors

**Naming & Code Conventions:**
- PascalCase for React components and TypeScript files
- camelCase for variables, functions, database fields
- Absolute imports with @/ alias (no deep relative paths)
- Date objects for all timestamps (no ISO strings in app code)

**Infrastructure:**
- Vercel hosting with automatic HTTPS (required for PWA camera access)
- GitHub Actions CI/CD: lint → unit tests → E2E tests → build → deploy
- Environment configuration via Vite .env files
- Browser DevTools console only for MVP logging (no external error tracking)

**From UX Design Document:**

**Mobile-First PWA Design:**
- Primary platform: Mobile browsers (iOS/Android) for end users
- Development platform: Desktop/web for development and testing
- Responsive design adapts between mobile and desktop contexts
- Offline-first functionality for all core workflows

**Context-Aware UX Patterns:**
- **At-Home Context**: Ultra-fast stock marking (<1 second), minimal friction (single tap), works in varied home lighting
- **In-Store Context**: One-handed operation support, large touch targets (44x44px minimum), high contrast for bright store environments, fast list scrolling
- **Post-Shopping Context**: Quick camera launch, clear positioning guidance, fast OCR (<5 seconds), intuitive error correction

**Trust-Building Journey:**
- Onboarding sets expectations, gets users to first receipt scan within one week
- First receipt scan success builds confidence (week 1)
- Aha moment when user realizes shopping list auto-generated (week 2)
- Trust milestone at month 3: complete reliance on app without manual verification
- Visual reliability indicators throughout (stock levels always accurate)

**Camera & OCR UX Patterns (from Inspiring Products):**
- Guided camera frame with rectangle overlay showing receipt positioning
- Real-time feedback: "Move closer", "Hold steady", "Good lighting ✓"
- Auto-capture when properly aligned (with manual trigger option)
- Confidence indicators: "12 of 14 products recognized" summary
- Visual distinction between high-confidence vs needs-review items
- Tap-to-edit interface for quick corrections on single review screen
- Clear "Add Product" button for items OCR missed
- Progressive disclosure: Capture → Review → Confirm → Update
- Transparency through visibility of OCR processing status

**MUI Component Strategy:**
- Use MUI components directly: List, ListItem, Button, IconButton, TextField, Chip, Dialog, CircularProgress, LinearProgress, AppBar, BottomNavigation, Card
- Custom components: CameraCapture (camera API wrapper), ReceiptReview (OCR review with tap-to-edit), StockLevelPicker (High/Medium/Low/Empty buttons), ConfidenceIndicator (OCR confidence chips)
- Default Material Design theme for MVP (Phase 2: Bring!-inspired visual enhancements)

**Interaction Principles:**
- Single-tap primary actions (no confirmation dialogs for common operations)
- Immediate visual feedback (<2 second response times build trust)
- 4-state stock system (High/Medium/Low/Empty) vs quantity tracking (simplicity over complexity)
- Automatic shopping list generation (users consume list, never create it)
- Manual safety nets always available (add/remove from list, manual product additions)

**Anti-Patterns to Avoid:**
- Complex multi-screen onboarding (get to value immediately)
- Hidden OCR confidence (show what's certain vs uncertain)
- Tedious error correction (single screen, tap-to-edit)
- No manual overrides (users must feel in control)
- Mystery processing (clear status messages, progress indicators)
- Overwhelming metadata requirements (MVP: just names and stock levels)

### FR Coverage Map

**Epic 1: Project Foundation & Initial Inventory Setup**
- FR1: Users can manually add new products to inventory by entering product name
- FR2: Users can edit existing product names in inventory
- FR3: Users can delete products from inventory
- FR4: Users can view complete list of all products in inventory
- FR5: Users can search/filter inventory by product name
- FR36: All inventory data persists across app closures and device restarts
- FR37: Stock level history is maintained for current session
- FR38: System recovers gracefully from unexpected app termination
- FR39: No data loss occurs during normal app operations

**Epic 2: Stock Level Tracking & Visual Feedback**
- FR6: Users can set product stock level to one of four states: High, Medium, Low, Empty
- FR7: Users can quickly update stock level with single tap/action
- FR8: System displays current stock level for each product in inventory
- FR9: Stock level changes persist across app sessions
- FR10: System provides immediate visual feedback when stock level is changed
- FR40: System provides visual confirmation for all user actions

**Epic 3: Automatic Shopping List Generation**
- FR11: System automatically adds products to shopping list when marked as Low or Empty
- FR12: System removes products from shopping list when stock is replenished to High
- FR13: Users can view shopping list showing all items needing purchase
- FR14: System displays count of items on shopping list
- FR15: Users can manually add products from inventory to shopping list if needed
- FR16: Users can manually remove products from shopping list if not needed

**Epic 4: In-Store Shopping Experience**
- FR17: Users can access shopping list in-app while shopping
- FR18: Users can mark items as "collected" or "in cart" while shopping
- FR19: System displays visual progress indicator (X of Y items collected)
- FR20: Users can unmark items if removed from cart
- FR21: Shopping list remains accessible without network connectivity

**Epic 5: Receipt Scanning & OCR Processing**
- FR22: Users can capture receipt photo using device camera
- FR23: System processes receipt image to extract product names via OCR
- FR24: System attempts to match recognized products to existing inventory items
- FR25: System displays OCR results for user review before finalizing
- FR26: System achieves 95%+ product recognition accuracy on target supermarket receipts
- FR27: Users can review all products recognized from receipt
- FR28: Users can manually correct misrecognized product names
- FR29: Users can manually add products that OCR failed to recognize
- FR30: Users can remove incorrectly recognized items from OCR results
- FR31: Users confirm/save corrected OCR results to update inventory
- FR42: System indicates when OCR processing is in progress
- FR43: System shows success confirmation after receipt processing completes

**Epic 6: Inventory Updates from Receipt & Complete Automation Loop**
- FR32: System updates stock levels to "High" for all confirmed products from receipt
- FR33: System adds new products (not previously in inventory) from receipt to inventory
- FR34: System removes purchased items from shopping list after receipt processing
- FR35: Inventory updates persist reliably without data loss
- FR41: System displays error messages for failed operations

**Non-Functional Requirements (Cross-Cutting):**
All NFRs (NFR1-NFR14) apply as implementation constraints across all epics:
- Performance: <2s actions, <5s OCR, <2s launch (NFR1-NFR3)
- Reliability: Zero data loss, zero crashes, 95% OCR accuracy (NFR4-NFR6)
- Usability: No tutorial needed, single-tap actions, intuitive UI (NFR7-NFR7.2)
- Accessibility: Contrast ratios, 44x44px targets, clear feedback (NFR8-NFR8.2)
- Offline-first: All core features work offline, <100MB storage (NFR9-NFR10)
- Compatibility: 90% browser coverage, mid-range devices (NFR11-NFR12)
- Security: Local-only data, explicit camera permissions (NFR13-NFR14)

## Epic List

### Epic 1: Project Foundation & Initial Inventory Setup

**Goal:** Developer has a working PWA application with basic inventory capabilities, enabling users to manually manage their product inventory.

**User Outcome:** Users can add, edit, delete, view, and search products in their inventory with reliable data persistence. The foundation is established for building automation features.

**FRs Covered:** FR1, FR2, FR3, FR4, FR5, FR36, FR37, FR38, FR39

**Technical Foundation:**
- Vite + React 19 + TypeScript 5 + MUI v7 starter template initialized
- PWA configuration with vite-plugin-pwa (offline support, installable)
- Dexie.js 4.x database setup with Product schema
- Service layer architecture (InventoryService abstraction)
- Context API + useReducer state management (InventoryContext)
- Feature-based folder structure with co-located tests
- React Router v6 routing (/, /shopping, /scan, /product/:id)
- FeatureErrorBoundary for isolated error handling
- Vitest unit/integration tests + Playwright E2E tests
- GitHub Actions CI/CD pipeline (lint → test → e2e → build)
- Vercel deployment with HTTPS enabled
- Absolute imports with @/ alias configured

**Why This Epic First:** Establishes complete foundation and delivers immediate value - users can start tracking inventory manually. All subsequent epics build upon this base.

---

### Epic 2: Stock Level Tracking & Visual Feedback

**Goal:** Users can quickly mark items as consumed with instant visual feedback, establishing the habit that powers automatic shopping list generation.

**User Outcome:** Users tap products to update stock levels (High → Medium → Low → Empty) with <1 second response time. Visual feedback confirms every action. The core interaction habit is established.

**FRs Covered:** FR6, FR7, FR8, FR9, FR10, FR40

**Key Features:**
- StockLevelPicker component (single-tap interface for 4-state system)
- Immediate visual feedback with MUI Chip color coding
- Stock level persistence across sessions (Dexie.js updates)
- Visual indicators on ProductCard components
- <2 second response time for all tap actions (NFR1)

**Why This Epic:** Builds the core interaction (marking consumed) that users repeat weekly. Must feel effortless (<1 second) to establish the habit. Prerequisite for Epic 3's automatic list generation.

---

### Epic 3: Automatic Shopping List Generation

**Goal:** Users experience their first "aha moment" - the shopping list creates itself automatically when items are marked Low/Empty.

**User Outcome:** Products automatically appear on shopping list when marked Low/Empty. Products automatically disappear when replenished to High. Users realize they didn't create a list - the system just knew what they needed.

**FRs Covered:** FR11, FR12, FR13, FR14, FR15, FR16

**Key Features:**
- Automatic list generation (isOnShoppingList flag triggers on Low/Empty)
- ShoppingList component displays all items needing purchase
- Item count badge showing list size
- Manual add/remove safety nets (manual override available)
- ShoppingContext manages list state
- ShoppingService handles list operations

**Why This Epic:** Delivers the first major automation value. The "aha moment" when users realize the mental load disappeared. Builds trust in automation.

---

### Epic 4: In-Store Shopping Experience

**Goal:** Users can efficiently complete shopping trips using the auto-generated list with progress tracking and one-handed operation.

**User Outcome:** Users access shopping list in-store (offline), check off items as they shop, see progress (8/12 items collected), and complete shopping efficiently with one-handed mobile operation.

**FRs Covered:** FR17, FR18, FR19, FR20, FR21

**Key Features:**
- Offline-accessible shopping list (PWA service worker, NFR9)
- Single-tap checkbox to mark items collected
- ShoppingProgress component showing X/Y items
- Unmark capability if item removed from cart
- One-handed operation (44x44px touch targets, NFR8.1)
- MUI BottomNavigation for mobile navigation
- High contrast for bright store environments (NFR8)

**Why This Epic:** Completes the shopping workflow. Users can now: mark consumed → see auto-list → shop efficiently. Only missing piece is automated inventory updates after shopping.

---

### Epic 5: Receipt Scanning & OCR Processing

**Goal:** Users scan receipts after shopping, and the system automatically extracts product names, completing the automation promise.

**User Outcome:** Users capture receipt photo with camera, system processes with OCR (<5 seconds), displays recognized products with confidence indicators, allows quick tap-to-edit corrections, and prepares for inventory update. First successful scan validates the entire value proposition.

**FRs Covered:** FR22, FR23, FR24, FR25, FR26, FR27, FR28, FR29, FR30, FR31, FR42, FR43

**Key Features:**
- CameraCapture component (browser camera API wrapper)
- Guided camera frame with positioning overlay (UX pattern from banking apps)
- Real-time feedback ("Move closer", "Good lighting")
- Tesseract.js 7.x OCR integration (<5 second processing, NFR2)
- ReceiptReview component with confidence indicators ("12 of 14 recognized")
- Tap-to-edit error correction interface (single review screen)
- Add missing products button
- Visual distinction (high-confidence vs needs-review items)
- OCRService handles processing and product matching
- ReceiptContext manages scanning state (capturing → processing → reviewing)
- CircularProgress indicator during OCR processing
- Success confirmation dialog

**Why This Epic:** The critical automation moment. Receipt scanning eliminates manual inventory updates. 95%+ accuracy requirement (NFR6) validates the innovation. First successful scan = trust building begins.

---

### Epic 6: Inventory Updates from Receipt & Complete Automation Loop

**Goal:** Users experience the complete automated cycle: mark consumed → shopping list auto-generates → shop → scan receipt → inventory updates automatically. The full automation promise is realized.

**User Outcome:** Confirmed products from receipt automatically update inventory to "High". New products automatically added to inventory. Purchased items automatically removed from shopping list. The complete weekly cycle works end-to-end without manual intervention. Trust milestone achieved.

**FRs Covered:** FR32, FR33, FR34, FR35, FR41

**Key Features:**
- InventoryService.replenishStock() updates stock to High
- InventoryService.addProductFromReceipt() creates new products
- ShoppingService removes purchased items from list
- Database transactions ensure data consistency (FR35, NFR4)
- Error handling with AppError interface (FR41)
- MUI Alert/Snackbar for error display
- Inventory and Shopping contexts automatically update
- Zero data loss guarantee (NFR4)

**Why This Epic:** Closes the automation loop. After this epic, users can trust the complete cycle. Week 2 "aha moment" becomes possible. Month 3 trust milestone becomes achievable. The product delivers on its core promise.

---

## Epic 1: Project Foundation & Initial Inventory Setup

### Story 1.1: Initialize Project with Technical Stack

As a **developer**,
I want to initialize the project with Vite, React 19, TypeScript 5, and configure all necessary tooling,
So that I have a solid foundation to build features with modern best practices.

**Acceptance Criteria:**

**Given** I have Node.js and npm installed
**When** I run the initialization commands
**Then** A new Vite + React + TypeScript project is created
**And** MUI v7 (@mui/material, @emotion/react, @emotion/styled, @mui/icons-material) is installed and configured
**And** vite-plugin-pwa is installed and configured for PWA capabilities
**And** React Router v6 is installed for navigation
**And** Dexie.js 4.x is installed for local database
**And** Tesseract.js 7.x is installed for OCR (future use)
**And** Vitest is configured for unit/integration tests
**And** Playwright is configured for E2E tests
**And** ESLint and Prettier are configured for code quality
**And** Absolute imports with @/ alias are configured in tsconfig.json and vite.config.ts
**And** GitHub Actions CI/CD workflow is created (lint → test → e2e → build)
**And** Vercel configuration (vercel.json) is added for deployment
**And** The app runs locally with `npm run dev` on http://localhost:5173
**And** The app builds successfully with `npm run build`
**And** HTTPS is enabled via Vercel deployment

---

### Story 1.2: Set Up Database Schema and Service Layer

As a **developer**,
I want to create the Dexie.js database schema and service layer abstraction,
So that I have a reliable data layer for inventory management with future REST API migration path.

**Acceptance Criteria:**

**Given** The project is initialized with Dexie.js installed
**When** I implement the database and service layer
**Then** A Dexie.js database is created in `src/services/database.ts` with the following schema:
- Table name: `products`
- Fields: `id` (string, UUID), `name` (string), `stockLevel` (enum: 'high'|'medium'|'low'|'empty'), `createdAt` (Date), `updatedAt` (Date), `isOnShoppingList` (boolean)
- Indexes: `++id, name, stockLevel, isOnShoppingList, updatedAt`
**And** Database versioning is set to version 1
**And** An `InventoryService` class is created in `src/services/inventory.ts` with methods:
- `getProducts(): Promise<Product[]>` - Get all products
- `getProduct(id: string): Promise<Product | undefined>` - Get single product
- `addProduct(name: string): Promise<Product>` - Add new product
- `updateProduct(id: string, updates: Partial<Product>): Promise<void>` - Update product
- `deleteProduct(id: string): Promise<void>` - Delete product
- `searchProducts(query: string): Promise<Product[]>` - Search by name
**And** A singleton instance `inventoryService` is exported
**And** TypeScript interfaces are defined in `src/types/product.ts` for Product and StockLevel
**And** Service methods use Dexie.js directly for MVP
**And** Error handling wraps all database operations with try/catch
**And** Unit tests exist for all service methods in `src/services/inventory.test.ts`
**And** The database persists data across app restarts (FR36)

---

### Story 1.3: Create Inventory Context and State Management

As a **developer**,
I want to implement the InventoryContext with useReducer for state management,
So that components can access and update inventory state consistently.

**Acceptance Criteria:**

**Given** The service layer is implemented
**When** I create the InventoryContext
**Then** An `InventoryContext` is created in `src/features/inventory/context/InventoryContext.tsx` with:
- State interface: `{ products: Product[], loading: boolean, error: string | null }`
- Action types: `SET_PRODUCTS`, `ADD_PRODUCT`, `UPDATE_PRODUCT`, `DELETE_PRODUCT`, `SET_LOADING`, `SET_ERROR`
- Reducer function that handles all actions immutably (using spread operators)
- Context provider component `InventoryProvider`
- Custom hook `useInventoryContext()` that throws error if used outside provider
**And** Provider methods are implemented:
- `loadProducts()` - Fetches products via inventoryService
- `addProduct(name: string)` - Adds product via service
- `updateProduct(id: string, updates: Partial<Product>)` - Updates product
- `deleteProduct(id: string)` - Deletes product
- `searchProducts(query: string)` - Searches products
**And** All methods use try/catch with error handling via `handleError()` utility
**And** Loading states are set appropriately (loading: true before async, false in finally)
**And** Error states are cleared when new operations start
**And** Unit tests exist in `src/features/inventory/context/InventoryContext.test.tsx`
**And** The context follows the standard pattern from Architecture document

---

### Story 1.4: Add and View Products in Inventory

As a **user**,
I want to add products to my inventory and see them displayed in a list,
So that I can start tracking what products I have at home.

**Acceptance Criteria:**

**Given** I open the application
**When** I interact with the inventory features
**Then** I see an inventory list screen at route `/` with:
- A "Add Product" button at the top of the screen
- An empty state message "No products yet. Add your first product!" when no products exist
- A list of all my products when products exist
**And** When I click the "Add Product" button:
- A MUI `Dialog` opens with a form
- The form contains a `TextField` for product name
- The form has "Cancel" and "Add" buttons
**And** When I enter a product name (e.g., "Milk") and click "Add":
- The dialog closes
- The product appears immediately in the list (FR1, FR40)
- The product shows with a default stock level of "High"
- A success message confirms the product was added
**And** Each product in the list displays:
- Product name prominently
- Current stock level indicator (Chip showing "High")
- Product card is a MUI `ListItem` with responsive layout
**And** When I close and reopen the app:
- All products I added are still visible (FR36)
- No data is lost (FR39)
**And** The entire flow can be tested by running the app and adding products

---

### Story 1.5: Edit Product Names

As a **user**,
I want to edit product names in my inventory,
So that I can fix typos or update product descriptions.

**Acceptance Criteria:**

**Given** I have products in my inventory
**When** I interact with a product card
**Then** I see an "Edit" icon button (MUI `IconButton` with edit icon) on each product card
**And** When I click the edit button:
- A MUI `Dialog` opens with an edit form
- The form contains a `TextField` pre-filled with the current product name
- The form has "Cancel" and "Save" buttons
**And** When I change the product name and click "Save":
- The dialog closes
- The product name updates immediately in the list (FR2, FR40)
- A success message confirms "Product updated"
- The `updatedAt` timestamp is updated
**And** When I click "Cancel":
- The dialog closes without saving changes
- The product name remains unchanged
**And** When I close and reopen the app:
- The edited product name is still correct (FR36)
- No data is lost (FR39)
**And** The entire edit flow can be tested by running the app

---

### Story 1.6: Delete Products

As a **user**,
I want to delete products from my inventory,
So that I can remove items I no longer want to track.

**Acceptance Criteria:**

**Given** I have products in my inventory
**When** I interact with a product card
**Then** I see a "Delete" icon button (MUI `IconButton` with delete icon) on each product card
**And** When I click the delete button:
- A MUI confirmation `Dialog` appears asking "Delete [Product Name]?"
- The dialog shows "Cancel" and "Delete" buttons
**And** When I click "Delete":
- The dialog closes
- The product is immediately removed from the list (FR3, FR40)
- A success message confirms "Product deleted"
- The product is removed from the database
**And** When I click "Cancel":
- The dialog closes without deleting
- The product remains in the list
**And** When I close and reopen the app:
- Deleted products do not reappear (FR36)
- Remaining products are still present (FR39)
**And** The entire delete flow can be tested by running the app

---

### Story 1.7: Search and Filter Products

As a **user**,
I want to search for products in my inventory by name,
So that I can quickly find specific items when I have many products.

**Acceptance Criteria:**

**Given** I have multiple products in my inventory
**When** I access the inventory list
**Then** I see a search bar (MUI `TextField` with search icon) at the top of the screen
**And** When I type text in the search bar (e.g., "milk"):
- The product list filters immediately to show only matching products (FR5)
- Products containing the search term in their name are displayed (case-insensitive)
- Non-matching products are hidden
- The filter happens with <500ms response time
**And** When I clear the search bar:
- All products are displayed again
**And** When no products match the search:
- An empty state message shows "No products found matching '[search term]'"
**And** The search works locally (no network required, NFR9)
**And** The entire search flow can be tested by running the app with multiple products

---

### Story 1.8: Set Up Error Handling and Logging Utilities

As a **developer**,
I want standardized error handling and logging utilities,
So that errors are handled consistently and debugging is easier.

**Acceptance Criteria:**

**Given** The project structure is established
**When** I implement error handling utilities
**Then** An `AppError` interface is defined in `src/types/error.ts` with:
- `message: string` (user-friendly message)
- `code?: string` (error code like 'DB_ERROR', 'OCR_FAILED')
- `details?: unknown` (technical details for logging)
**And** A `handleError()` function is created in `src/utils/errorHandler.ts` that:
- Accepts `error: unknown` parameter
- Returns `AppError` interface
- Converts Error objects to user-friendly messages
- Extracts error codes when available
- Handles unknown error types gracefully
**And** A `logger` utility is created in `src/utils/logger.ts` with methods:
- `debug()` - Only logs in development mode
- `info()` - Logs normal operations
- `warn()` - Logs recoverable issues
- `error()` - Logs failures with error details
**And** All methods prefix messages with log level tags ([DEBUG], [INFO], etc.)
**And** Unit tests exist for both utilities
**And** Existing service layer methods use these utilities for error handling
**And** No sensitive data is logged (passwords, tokens, personal info)

---

### Story 1.9: Implement Feature Error Boundaries and Navigation

As a **user**,
I want the app to handle errors gracefully without crashing,
So that I can continue using other features even if one feature fails.

**Acceptance Criteria:**

**Given** The error handling utilities exist
**When** I implement error boundaries and navigation
**Then** A `FeatureErrorBoundary` component is created in `src/components/shared/ErrorBoundary/FeatureErrorBoundary.tsx` that:
- Catches React errors in child components
- Displays a user-friendly error message using MUI `Alert`
- Shows a "Try Again" button to reset the error state
- Logs error details to console with `logger.error()`
- Accepts a `featureName` prop for context
**And** The inventory feature is wrapped in `<FeatureErrorBoundary featureName="Inventory">`
**And** React Router v6 routes are configured in `src/App.tsx`:
- `/` → InventoryList
- `/shopping` → Placeholder component for now
- `/scan` → Placeholder component for now
**And** MUI `BottomNavigation` is implemented in `src/components/shared/Layout/BottomNav.tsx` with:
- Home/Inventory icon (navigates to `/`)
- Shopping List icon (navigates to `/shopping`)
- Receipt Scanner icon (navigates to `/scan`)
- Active state highlighting current route
- Fixed to bottom of screen on mobile
**And** When an error occurs in a feature, other navigation items remain functional
**And** The navigation can be tested by clicking between routes

---

### Story 1.10: Deploy Application with CI/CD Pipeline

As a **developer**,
I want automated testing and deployment,
So that code quality is maintained and deployments are reliable.

**Acceptance Criteria:**

**Given** The application is functional locally
**When** I set up CI/CD and deployment
**Then** A GitHub Actions workflow exists in `.github/workflows/ci.yml` that:
- Runs on push to main and pull requests
- Executes lint checks (ESLint)
- Runs unit tests (Vitest)
- Runs E2E tests (Playwright)
- Builds production bundle
- All jobs must pass before deployment
**And** Vercel is configured for deployment with:
- Automatic deployment from main branch
- HTTPS enabled (required for PWA camera access)
- Preview deployments for pull requests
- Environment variables configured (if needed)
**And** The deployed app is accessible via Vercel URL
**And** PWA features work correctly (installable, offline-capable)
**And** Service worker is generated and functional
**And** The app can be installed on mobile devices
**And** Basic E2E tests verify core user flows work in production

---

## Epic 2: Stock Level Tracking & Visual Feedback

### Story 2.1: Implement Stock Level Picker Component

As a **user**,
I want to change a product's stock level with a single tap,
So that I can quickly mark items as consumed throughout the week.

**Acceptance Criteria:**

**Given** I have products in my inventory
**When** I tap on a product card
**Then** A `StockLevelPicker` component appears showing four options:
- High (green Chip)
- Medium (yellow/orange Chip)
- Low (orange/red Chip)
- Empty (red Chip)
**And** The current stock level is visually highlighted
**And** When I tap a stock level option:
- The stock level updates immediately (FR7)
- The picker closes automatically
- The product card reflects the new stock level (FR8)
- The update happens within <1 second (NFR1)
- A subtle visual confirmation appears (FR40)
**And** The `updatedAt` timestamp is updated
**And** When I close and reopen the app:
- The stock level remains as I set it (FR9, FR36)
**And** The entire flow can be tested by running the app

---

### Story 2.2: Enhanced Visual Stock Level Indicators

As a **user**,
I want to see clear visual indicators of stock levels at a glance,
So that I can quickly identify which items are running low without opening each product.

**Acceptance Criteria:**

**Given** I have products with different stock levels in my inventory
**When** I view the inventory list
**Then** Each product card displays a color-coded MUI `Chip` showing the current stock level:
- "High" - Green background (#4caf50)
- "Medium" - Yellow/Orange background (#ff9800)
- "Low" - Orange/Red background (#ff5722)
- "Empty" - Red background (#f44336)
**And** The chip uses sufficient color contrast for accessibility (NFR8)
**And** The chip includes both text label and color for color-blind users
**And** Stock level chips are positioned consistently on all product cards
**And** When a stock level changes:
- The chip color updates immediately with a smooth transition (FR10, FR40)
- No page reload is required
- The visual change happens within <500ms
**And** The visual design works well in both bright (in-store) and dim (at-home) lighting conditions
**And** The entire visual system can be tested by changing stock levels and observing the color updates

---

## Epic 3: Automatic Shopping List Generation

### Story 3.1: View Shopping List with Automatic Item Addition

As a **user**,
I want to see a shopping list that automatically includes items I've marked as Low or Empty,
So that I experience the first automation "aha moment" - the list creates itself.

**Acceptance Criteria:**

**Given** I have products in my inventory
**When** I navigate to the Shopping List tab (via bottom navigation)
**Then** I see a `ShoppingList` screen at route `/shopping` that displays:
- A list of all products where stock level is Low or Empty
- An empty state message "Your shopping list is empty" when no items are Low/Empty
- A count badge showing total items on the list (FR14)
**And** When I mark a product as Low or Empty in the inventory:
- The product automatically appears on the shopping list (FR11)
- The change is immediate (<2 seconds, NFR1)
- The count badge updates automatically
- No manual "add to list" action is required
**And** Each item on the shopping list displays:
- Product name
- Current stock level (Low or Empty indicator)
**And** When I close and reopen the app:
- All Low/Empty items are still on the shopping list
- The automation continues to work (FR36)
**And** The entire flow can be tested by:
- Adding products in inventory
- Marking some as Low/Empty
- Navigating to shopping list
- Seeing them automatically appear

---

### Story 3.2: Automatic Removal from Shopping List When Replenished

As a **user**,
I want items to automatically disappear from my shopping list when I mark them as High,
So that the list stays current without manual management.

**Acceptance Criteria:**

**Given** I have items on my shopping list (marked Low or Empty)
**When** I return to the inventory and mark a product as High
**Then** The product automatically disappears from the shopping list (FR12)
**And** The removal happens immediately (<2 seconds)
**And** The shopping list count badge updates automatically
**And** When I navigate back to the shopping list:
- The replenished item is no longer visible
- Other Low/Empty items remain on the list
**And** The entire automation loop can be tested by:
- Marking item as Low (appears on list)
- Marking same item as High (disappears from list)
- Verifying the list updates correctly

---

### Story 3.3: Manual Shopping List Management (Safety Nets)

As a **user**,
I want to manually add or remove items from my shopping list,
So that I have control when the automation doesn't match my needs.

**Acceptance Criteria:**

**Given** I have products in my inventory
**When** I view a product in the inventory list
**Then** I see an "Add to Shopping List" button on products with Medium or High stock
**And** I see a "Remove from Shopping List" button on products already on the list
**And** When I manually add a product to the shopping list (FR15):
- The product appears on the shopping list immediately
- The product stays on the list even if stock level is Medium or High
- A confirmation message appears
**And** When I manually remove a product from the shopping list (FR16):
- The product disappears from the list immediately
- The product stays removed even if stock level is Low or Empty
- A confirmation message appears
**And** The manual overrides persist across app restarts
**And** The entire manual control can be tested by adding and removing items regardless of stock level

---

## Epic 4: In-Store Shopping Experience

### Story 4.1: Check Off Items While Shopping

As a **user**,
I want to check off items as I collect them while shopping,
So that I can track what I've already grabbed and what I still need.

**Acceptance Criteria:**

**Given** I have items on my shopping list
**When** I'm on the Shopping List screen
**Then** Each item displays a checkbox (unchecked by default)
**And** When I tap a checkbox to mark an item as collected:
- The checkbox shows a checkmark immediately (FR18)
- The item visually indicates it's collected (strikethrough or dimmed)
- The action happens with <1 second response time (NFR1)
- A subtle visual confirmation appears (FR40)
**And** When I tap a checked checkbox to unmark an item (FR20):
- The checkmark disappears immediately
- The item returns to normal appearance
- The action happens with <1 second response time
**And** The checked/unchecked state persists if I navigate away and return
**And** The shopping list works offline without network connectivity (FR21, NFR9)
**And** The entire flow can be tested by:
- Going to shopping list
- Checking off items
- Unchecking items
- Verifying offline functionality

---

### Story 4.2: Shopping Progress Indicator

As a **user**,
I want to see how many items I've collected out of the total,
So that I know when I'm done shopping.

**Acceptance Criteria:**

**Given** I have items on my shopping list
**When** I'm on the Shopping List screen
**Then** I see a progress indicator at the top showing "X of Y items collected" (FR19)
**And** The progress updates immediately when I check or uncheck items
**And** When all items are checked:
- The progress shows "12 of 12 items collected" (or full count)
- A visual completion indicator appears (e.g., green checkmark, success message)
- A congratulatory message like "Shopping complete!" is displayed
**And** When no items are checked:
- The progress shows "0 of Y items collected"
**And** The progress indicator is clearly visible and doesn't require scrolling
**And** The entire flow can be tested by checking off items and watching the progress update

---

### Story 4.3: Mobile-Optimized Shopping List Layout

As a **user**,
I want the shopping list to work well on my phone with one hand,
So that I can use it easily while pushing a shopping cart.

**Acceptance Criteria:**

**Given** I'm using the app on a mobile device
**When** I view the shopping list
**Then** All touch targets (checkboxes, items) are minimum 44x44 pixels (NFR8.1)
**And** The list is optimized for one-handed operation:
- Checkboxes are positioned for easy thumb reach
- No horizontal scrolling required
- Text is large enough to read quickly (minimum 16px)
- Adequate spacing between items to prevent mis-taps
**And** The list displays with high contrast for bright store environments (NFR8)
**And** The list scrolls smoothly with touch gestures
**And** The bottom navigation doesn't interfere with list items
**And** The entire layout can be tested on mobile devices and in the browser's mobile view

---

## Epic 5: Receipt Scanning & OCR Processing

### Story 5.1: Capture Receipt Photo with Camera

As a **user**,
I want to take a photo of my receipt using my phone's camera,
So that I can start the automatic inventory update process.

**Acceptance Criteria:**

**Given** I'm on the app after shopping
**When** I navigate to the Receipt Scanner tab (via bottom navigation)
**Then** I see a Receipt Scanner screen at route `/scan` with:
- A "Scan Receipt" button prominently displayed
- Instructions: "Take a photo of your receipt to update inventory"
**And** When I tap "Scan Receipt":
- The device camera launches with permission request if first time (NFR14)
- I see a camera viewfinder with a rectangular overlay guide
- Real-time feedback messages appear: "Position receipt in frame", "Good lighting ✓", "Hold steady"
**And** When the receipt is properly positioned:
- An "Auto-capture" happens automatically, OR
- A manual "Capture" button is available to tap
**And** After capture:
- The camera closes
- The captured image is displayed for confirmation
- "Use This Photo" and "Retake" buttons appear (FR22)
**And** When I tap "Use This Photo":
- The photo is accepted and I proceed to OCR processing
**And** When I tap "Retake":
- The camera reopens for another attempt
**And** The entire capture flow can be tested with a real receipt

---

### Story 5.2: Process Receipt with OCR

As a **user**,
I want the app to automatically extract product names from my receipt photo,
So that I don't have to manually type everything.

**Acceptance Criteria:**

**Given** I have captured a receipt photo and tapped "Use This Photo"
**When** OCR processing begins
**Then** I see a processing screen with:
- A loading indicator (MUI `CircularProgress`)
- Status message: "Recognizing products..." (FR42)
- The receipt image displayed (optional, for context)
**And** The OCR processing uses Tesseract.js to extract text from the image (FR23)
**And** The processing completes within 5 seconds for standard grocery receipts (NFR2)
**And** The system attempts to match recognized text to existing inventory products (FR24)
**And** When processing completes:
- I'm automatically taken to the Review screen
- A success indicator briefly appears
**And** When processing fails (OCR error, camera issue):
- A clear error message is displayed (FR41)
- A "Try Again" button allows me to retake the photo
- The error is logged for debugging
**And** The receipt image is processed and then discarded (not stored permanently)
**And** The entire processing can be tested with various receipt types and lighting conditions

---

### Story 5.3: Review and Correct OCR Results

As a **user**,
I want to review the products recognized from my receipt and fix any mistakes,
So that my inventory updates accurately.

**Acceptance Criteria:**

**Given** OCR processing has completed
**When** I view the Review screen
**Then** I see a summary at the top: "12 of 14 products recognized" (FR25, FR26)
**And** I see a list of all recognized products with:
- Product names extracted from receipt
- Confidence indicators (checkmark for high confidence, warning icon for uncertain) (FR27)
- Visual distinction between confident vs needs-review items
**And** When I tap a product name (FR28):
- An edit dialog opens with a `TextField` pre-filled with the recognized name
- I can edit the name
- "Cancel" and "Save" buttons are available
- When I save, the product name updates in the list
**And** I see an "Add Product" button to manually add items OCR missed (FR29)
**And** When I tap "Add Product":
- A dialog opens with an empty `TextField`
- I enter the product name
- The product is added to the review list
**And** Each product has a "Remove" icon button to delete incorrectly recognized items (FR30)
**And** When I'm done reviewing, I see a "Confirm & Update Inventory" button at the bottom
**And** When I tap "Confirm & Update Inventory" (FR31):
- All reviewed and corrected products are ready for inventory update (Epic 6)
- I proceed to the next step
**And** The entire review and correction flow can be tested with real receipt photos

---

## Epic 6: Inventory Updates from Receipt & Complete Automation Loop

### Story 6.1: Update Inventory from Confirmed Receipt Products

As a **user**,
I want products from my receipt to automatically update to "High" stock in my inventory,
So that I don't have to manually mark everything I just bought.

**Acceptance Criteria:**

**Given** I have confirmed and corrected the OCR results and tapped "Confirm & Update Inventory"
**When** The inventory update process begins
**Then** I see a processing screen with:
- Status message: "Updating inventory..." (FR43)
- Progress indicator
**And** For each product on the confirmed receipt:
- If the product already exists in inventory:
  - The stock level is updated to "High" (FR32)
  - The `updatedAt` timestamp is updated
- If the product does NOT exist in inventory:
  - A new product is created with stock level "High" (FR33)
  - The product appears in the inventory list
**And** All purchased items are automatically removed from the shopping list (FR34)
**And** When the update completes:
- A success message appears: "Inventory updated! 12 products replenished" (FR43)
- I'm automatically navigated to the inventory screen
- The updated products are visible immediately
**And** All inventory updates persist reliably across app restarts (FR35, NFR4)
**And** When I navigate to the shopping list:
- All purchased items are removed (no longer Low/Empty)
**And** The entire automation loop can be tested by:
- Marking items as Low/Empty
- Going shopping
- Scanning receipt
- Verifying inventory updates and shopping list clears

---

### Story 6.2: Handle Inventory Update Errors

As a **user**,
I want clear error messages if something goes wrong during inventory updates,
So that I can retry or fix the issue.

**Acceptance Criteria:**

**Given** An inventory update is in progress
**When** An error occurs (database error, unexpected failure)
**Then** The processing stops gracefully
**And** A clear error message is displayed using MUI `Alert` (FR41):
- User-friendly message (e.g., "Failed to update inventory. Please try again.")
- Technical error code for debugging (in console logs)
**And** A "Try Again" button is available
**And** When I tap "Try Again":
- The inventory update is reattempted with the same confirmed products
**And** A "Cancel" button allows me to exit without updating
**And** If the error persists:
- Products remain in their original state
- Shopping list remains unchanged
- No data is lost or corrupted (NFR4)
**And** Error details are logged to console with `logger.error()`
**And** The error handling can be tested by simulating database failures

---
