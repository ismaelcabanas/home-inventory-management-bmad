---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments:
  - "_bmad-output/planning-artifacts/product-brief-home-inventory-management-bmad-2025-12-31.md"
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
workflowType: 'architecture'
project_name: 'home-inventory-management-bmad'
user_name: 'Isma'
date: '2026-01-03'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements (44 Total):**

The application centers on two core automation workflows:

1. **Inventory Management Cycle** (FR1-FR10):
   - Manual product entry with edit/delete capabilities
   - Four-state stock level system (High/Medium/Low/Empty)
   - Single-tap stock updates with immediate visual feedback
   - Persistent stock tracking across sessions

2. **Automatic Shopping List Generation** (FR11-FR16):
   - Products automatically added to shopping list when marked Low/Empty
   - Auto-removal when stock replenished to High
   - Manual add/remove safety nets for user control
   - Real-time list count and progress tracking

3. **In-Store Shopping Experience** (FR17-FR21):
   - Offline-accessible shopping list
   - Single-tap checkbox for item collection
   - Visual progress indicators (X of Y items)
   - One-handed operation support

4. **Receipt OCR Processing** (FR22-FR35):
   - Camera-based receipt capture
   - OCR extraction with 95%+ accuracy target
   - Automatic product matching to existing inventory
   - Review screen with confidence indicators
   - Tap-to-edit error correction interface
   - Manual addition for missed products
   - Automatic inventory updates and stock replenishment
   - New product detection and addition

5. **Data Persistence & User Feedback** (FR36-FR43):
   - Reliable persistence across app closures and device restarts
   - Graceful recovery from unexpected termination
   - Visual confirmation for all user actions
   - Clear error messages and processing status

**Non-Functional Requirements (14 Critical):**

**Performance Requirements:**
- NFR1: All tap/button actions complete within 2 seconds
- NFR2: Receipt OCR processing completes within 5 seconds
- NFR3: App launches to usable state within 2 seconds
- NFR8: Sufficient contrast for in-store (bright) and at-home (dim) environments

**Reliability Requirements:**
- NFR4: Zero data loss across normal operations over 3-month validation
- NFR5: Zero crashes during core workflows
- NFR6: 95%+ OCR product recognition accuracy
- NFR10: App storage under 100MB for typical use

**Architecture-Defining Requirements:**
- NFR9: **All core features function without network connectivity**
- NFR13: **All user data stored locally on device only (no cloud)**
- NFR14: No data transmission to external servers for MVP
- NFR11: Support for iOS/Android browsers covering 90%+ of users

**Usability Requirements:**
- NFR7: New users complete first cycle without tutorial
- NFR7: Core actions require single tap
- NFR7: Error correction intuitive for non-technical users

### Scale & Complexity

**Project Classification:**
- **Complexity Level**: Medium
- **Primary Domain**: Mobile Web Application (Progressive Web App)
- **User Model**: Single-user, local-first
- **Deployment**: Browser-based PWA installable on mobile devices

**Architectural Components (Estimated):**
- **Frontend Layer**: React + MUI component library (6-8 major screens)
- **State Management**: Application state for inventory, shopping list, receipt processing
- **Data Layer**: Local database/storage for product inventory
- **OCR Integration**: ML model or OCR library for receipt text extraction
- **Camera Integration**: Browser media APIs for receipt capture
- **Image Processing**: Enhancement pipeline for improving OCR accuracy

**Complexity Drivers:**

1. **OCR Accuracy Challenge** (High Complexity):
   - 95%+ recognition target with local processing
   - Must work across different receipt formats
   - Requires image enhancement for varied lighting
   - Error correction UX critical for user retention

2. **Local-First Architecture** (Medium Complexity):
   - Complete offline functionality
   - Zero data loss requirement
   - No cloud dependency for MVP
   - Local database with reliable persistence

3. **Cross-Platform PWA** (Medium Complexity):
   - Mobile-first design (iOS/Android browsers)
   - Desktop development companion
   - Single codebase, responsive design
   - Browser API compatibility

4. **Performance Constraints** (Medium Complexity):
   - <2 second response times for all actions
   - <5 second OCR processing
   - Fast app launch (<2 seconds)
   - Minimal battery impact on mobile devices

5. **Trust-Building Through Reliability** (High Criticality):
   - Zero crashes during core workflows
   - Consistent OCR accuracy
   - Data integrity over 3-month validation
   - One failure can destroy weeks of trust

### Technical Constraints & Dependencies

**Platform Constraints:**
- Browser-based PWA (no native app capabilities beyond web APIs)
- Local storage limitations (browser storage quotas)
- Camera access requires HTTPS and user permissions
- OCR must work within browser JavaScript constraints

**MVP Scope Limitations:**
- No multi-user/device sync (single-user only)
- No cloud backup or storage
- No authentication/accounts
- Focus on 1-2 regular supermarkets (receipt format consistency)
- No quantity tracking (4-state system only)
- No barcode scanning
- No price extraction or budget features

**External Dependencies:**
- OCR library or ML model for receipt text extraction (TBD)
- React + MUI framework
- Local database solution (IndexedDB, LocalStorage, or similar)
- Browser APIs: Camera, Storage, Service Workers

**Success Dependencies:**
- OCR accuracy ≥95% on target supermarket receipts
- Browser camera API quality sufficient for receipt photos
- Local storage adequate for hundreds of products
- On-device processing achieves <5 second OCR time

### Cross-Cutting Concerns Identified

**1. Error Handling & Recovery**
- OCR failure scenarios (poor lighting, crumpled receipts, unrecognized formats)
- Data corruption prevention and recovery
- Camera access failures
- Storage quota exceeded scenarios
- Graceful degradation when features unavailable

**2. Performance Monitoring & Optimization**
- <2 second response time enforcement across all actions
- OCR processing time tracking (<5 second target)
- App launch time optimization
- Storage efficiency and query optimization
- Battery usage monitoring on mobile

**3. Data Persistence Strategy**
- Local database selection and schema design
- Data migration strategy for app updates
- Backup/restore capabilities (even without cloud)
- Data integrity validation
- Storage quota management

**4. State Management**
- Inventory state (products, stock levels)
- Shopping list state (items, collection status)
- Receipt processing state (capture, OCR, review, update)
- UI state (current screen, loading states, errors)
- Offline queue management (if any operations need deferral)

**5. Camera & Image Processing**
- Browser camera API integration
- Image capture and quality validation
- Image enhancement pipeline (lighting correction, perspective adjustment)
- Receipt positioning guidance
- Image data handling and memory management

**6. Trust-Building Through Transparency**
- Always-visible system state (stock levels, list status)
- Immediate visual feedback for every action
- Clear processing status during OCR
- Explicit confirmation after inventory updates
- Progress indicators for multi-step operations

**7. Testing Strategy**
- OCR accuracy measurement and validation
- Cross-browser compatibility (mobile Safari, Chrome, Firefox)
- Performance benchmarking (<2s, <5s targets)
- Offline functionality testing
- Data persistence and recovery testing
- 3-month validation period tracking

### UX-Driven Architectural Requirements

**Context-Aware Architecture:**
The system must support three distinct usage contexts with different performance characteristics:

1. **At-Home Context**: Quick marking of consumed items
   - Ultra-fast response (<1 second for stock updates)
   - Minimal friction (single tap)
   - Works in varied home lighting conditions

2. **In-Store Context**: Shopping list access and item checking
   - One-handed operation support
   - Large touch targets
   - High contrast for bright store environments
   - Fast list scrolling and filtering

3. **Post-Shopping Context**: Receipt capture and processing
   - Quick camera launch
   - Clear positioning guidance
   - Fast OCR processing (<5 seconds)
   - Intuitive error correction interface

**Trust-Building Journey:**
Architecture must support progressive trust building from skeptical first use to complete trust at month 3:
- First receipt scan success (week 1)
- Aha moment realization (week 2)
- Trust milestone (month 3)
- Consistent reliability throughout

**Design System Integration:**
- MUI (Material-UI) v5+ component library
- Emotion styling system
- Responsive breakpoints for mobile/desktop
- Theme customization for Phase 2 visual enhancements

## Starter Template Evaluation

### Primary Technology Domain

**Progressive Web Application (PWA)** - Mobile-first web app with offline capabilities, based on:
- React framework for UI
- MUI component library (already selected in UX spec)
- Local-first data architecture
- Camera API integration for receipt scanning

### Technical Stack Confirmed

Based on technical preferences and project requirements:

**Core Technologies:**
- **React 19.x** - Latest stable for UI
- **TypeScript** - Type safety and better developer experience
- **Vite 7.x** - Modern, fast build tool
- **MUI v7** (Material-UI) - Component library from UX spec
- **PWA** - Installable, offline-first web app

**State & Data:**
- **React Context API + useReducer** - Built-in state management (MVP)
- **Dexie.js 4.x** - IndexedDB wrapper for local storage
- **Zustand** - Optional upgrade if Context becomes insufficient

**Key Libraries:**
- **Tesseract.js 7.x** - OCR for receipt scanning (MVP)
- **vite-plugin-pwa 1.x** - PWA configuration and service worker

**Testing:**
- **Vitest** - Unit and integration tests (Vite-native)
- **Playwright** - E2E testing
- **@testing-library/react** - Component testing

### Starter Options Considered

**Option 1: Vite Official Template + Manual PWA Setup**
- Command: `npm create vite@latest my-app -- --template react-ts`
- **Pros**: Clean, minimal, official
- **Cons**: Need to manually add PWA plugin, MUI, Dexie, testing setup

**Option 2: Custom Stack (Recommended)**
- Start with Vite official template
- Add `vite-plugin-pwa` for PWA capabilities
- Configure MUI, Dexie.js, Tesseract.js
- Set up Vitest + Playwright testing
- **Pros**: Full control, modern best practices, learning-optimized
- **Cons**: More initial setup (but documented)

**Option 3: Third-party PWA Starters**
- Various community templates exist
- **Cons**: Often outdated, include unnecessary dependencies, unclear maintenance

### Selected Approach: Vite Official + Curated Additions

**Rationale:**
1. **Clean Foundation**: Vite's official React-TS template is minimal, modern, and well-maintained
2. **Learning-Optimized**: Understanding every dependency added (aligns with "learn modern tooling")
3. **Best Practices**: Each addition follows current 2025/2026 best practices
4. **No Bloat**: Only add what the project actually needs
5. **Full Control**: Complete understanding of architecture

### Initialization Sequence

**Step 1: Create Vite Project**
```bash
npm create vite@latest home-inventory-management -- --template react-ts
cd home-inventory-management
```

**Step 2: Install Core Dependencies**
```bash
# UI Framework
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material

# PWA Support
npm install -D vite-plugin-pwa workbox-window

# Local Database
npm install dexie

# OCR Library
npm install tesseract.js

# State Management (optional, if needed beyond Context)
npm install zustand
```

**Step 3: Install Development Dependencies**
```bash
# Testing
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npm install -D @playwright/test

# Type Definitions
npm install -D @types/node
```

**Step 4: Configure PWA** (vite.config.ts)
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Home Inventory Management',
        short_name: 'HomeInv',
        description: 'Automated home inventory with receipt scanning',
        theme_color: '#1976d2',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          }
        ]
      }
    })
  ]
})
```

### Architectural Decisions Provided by This Setup

**Language & Runtime:**
- TypeScript 5.x for type safety
- ES2022 target for modern JavaScript features
- Strict mode enabled for better type checking
- React 19 with automatic JSX runtime

**Styling Solution:**
- MUI v7 with Emotion (CSS-in-JS)
- Theme customization via `createTheme()`
- Responsive breakpoints built-in
- Mobile-first design system

**Build Tooling:**
- Vite 7 for lightning-fast dev server and builds
- esbuild for ultra-fast JavaScript transformation
- Rollup for production bundling
- Code splitting and tree-shaking automatic
- PWA assets generation via vite-plugin-pwa

**Testing Framework:**
- Vitest for unit/integration tests (Vite-native, fast)
- React Testing Library for component testing
- Playwright for E2E testing (cross-browser)
- Jest-compatible API for easy migration of knowledge

**Code Organization:**
```
src/
├── components/       # React components
│   ├── inventory/   # Inventory management components
│   ├── shopping/    # Shopping list components
│   └── receipt/     # Receipt scanning components
├── services/         # Business logic
│   ├── database.ts  # Dexie.js database setup
│   ├── ocr.ts       # Tesseract.js OCR service
│   └── inventory.ts # Inventory operations
├── hooks/            # Custom React hooks
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
└── App.tsx           # Main app component
```

**Development Experience:**
- Hot Module Replacement (HMR) - instant updates
- TypeScript IntelliSense and autocomplete
- ESLint + Prettier configuration
- Vitest UI for interactive test running
- Playwright test runner with debugging

**PWA Capabilities:**
- Service Worker for offline functionality
- Cache-first strategy for assets
- Background sync capabilities
- Installable on mobile devices
- Push notifications ready (future)

**Local-First Architecture:**
- Dexie.js provides:
  - Versioned database schema
  - Easy migrations
  - IndexedDB wrapper with clean API
  - TypeScript support
  - Query capabilities
  - Transaction support

**OCR Integration:**
- Tesseract.js provides:
  - Browser-based OCR (no server needed)
  - Multiple language support
  - Confidence scores for results
  - Progressive loading
  - Web Worker support for non-blocking processing

### Technology Decision Rationale

**State Management: Context API First**
- Built-in React solution sufficient for single-user, local-first app
- Reduces external dependencies for MVP
- Easy upgrade path to Zustand if complexity grows
- Learning benefit: understand React state fundamentals

**Local Database: Dexie.js**
- IndexedDB is browser standard for offline storage
- Dexie provides clean, Promise-based API over complex IndexedDB API
- Excellent TypeScript support
- Handles hundreds of products with versioning and migrations
- Perfect for zero data loss requirement (NFR4)

**OCR Strategy: Tesseract.js for MVP**
- Completely offline (aligns with NFR9, NFR13)
- Zero API costs during 3-month validation
- Should achieve 90-95% accuracy target with good images
- Future upgrade path to Gemini LLM if accuracy falls short
- Phase 2 can introduce network-based LLM for better accuracy

**Note:** Project initialization using this approach should be the first implementation story.

## Core Architectural Decisions

### Decision Overview

**Decisions Made:** 15 architectural decisions across 5 categories
**Decision Approach:** Collaborative, based on technical preferences and project requirements
**Future Considerations:** Backend REST API planned for Phase 2

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Data schema design (Dexie.js structure)
- Component organization (feature-based)
- Routing strategy (React Router v6)
- CI/CD pipeline (GitHub Actions)
- Hosting platform (Vercel)

**Important Decisions (Shape Architecture):**
- Error boundary strategy (feature-level isolation)
- Service layer pattern (future REST API migration)
- Environment configuration (Vite .env)

**Deferred Decisions (Post-MVP):**
- Authentication & authorization (Phase 2 with backend)
- Runtime data validation (TypeScript sufficient for MVP)
- Performance optimizations (measure first, optimize later)
- Error tracking services (console only for MVP)

---

## Category 1: Data Architecture

### 1.1. Database Schema Design

**Decision:** Minimal MVP schema with Dexie.js (IndexedDB wrapper)

**Product Entity:**
```typescript
interface Product {
  id: string;              // UUID
  name: string;            // Product name
  stockLevel: 'high' | 'medium' | 'low' | 'empty';
  createdAt: Date;         // When product added
  updatedAt: Date;         // Last modified
  isOnShoppingList: boolean; // Auto-added when Low/Empty
}
```

**Dexie.js Configuration:**
```typescript
// src/services/database.ts
import Dexie, { Table } from 'dexie';

export interface Product {
  id?: string;
  name: string;
  stockLevel: 'high' | 'medium' | 'low' | 'empty';
  createdAt: Date;
  updatedAt: Date;
  isOnShoppingList: boolean;
}

class InventoryDatabase extends Dexie {
  products!: Table<Product>;

  constructor() {
    super('HomeInventoryDB');
    this.version(1).stores({
      products: '++id, name, stockLevel, isOnShoppingList, updatedAt'
    });
  }
}

export const db = new InventoryDatabase();
```

**Rationale:**
- Minimal fields for MVP validation (3 months)
- Aligns with 4-state stock tracking from PRD
- `isOnShoppingList` enables automatic list generation
- Phase 2 can add: purchase history, receipt metadata, categories

**Affects:** All features (inventory, shopping, receipt scanning)

---

### 1.2. Data Validation Strategy

**Decision:** TypeScript types only (no runtime validation library)

**Approach:**
- Compile-time type checking via TypeScript strict mode
- No runtime validation with Zod/Yup for MVP
- Can add runtime validation in Phase 2 if needed

**Example:**
```typescript
// src/types/product.ts
export type StockLevel = 'high' | 'medium' | 'low' | 'empty';

export interface Product {
  id: string;
  name: string;
  stockLevel: StockLevel;
  // ... other fields
}

// TypeScript catches type errors at compile time
const product: Product = {
  id: '123',
  name: 'Milk',
  stockLevel: 'medium', // ✅ Valid
  // stockLevel: 'invalid', // ❌ Compile error
};
```

**Rationale:**
- All data entry points controlled (no external API)
- TypeScript strict mode catches issues at compile time
- Simpler for learning frontend development
- Reduces bundle size and runtime overhead
- Runtime validation can be added later if external API added

**Affects:** All service layer operations

---

### 1.3. Data Migration Strategy

**Decision:** Simple Dexie.js versioning for MVP, future backend migration planned

**MVP Approach:**
```typescript
// Version 1 - MVP schema
db.version(1).stores({
  products: '++id, name, stockLevel, isOnShoppingList, updatedAt'
});

// Future versions add upgrade logic
// db.version(2).stores({...}).upgrade(tx => {
//   // Migration logic here
// });
```

**Future Backend Migration (Phase 2):**
- REST API will become source of truth
- Dexie.js becomes local cache
- Sync strategy: offline-first with background sync
- Service layer abstraction makes migration easier

**Rationale:**
- Keep MVP simple with local-only storage
- Backend REST API planned for Phase 2
- Service layer pattern enables easy migration
- Dexie.js versioning handles schema changes cleanly

**Affects:** Database initialization, future scalability

---

### 1.4. Receipt Image Storage

**Decision:** Process and discard receipt images (no caching)

**Approach:**
- Capture receipt photo
- Process with Tesseract.js OCR
- Extract product names
- Discard image immediately
- Do not store in IndexedDB or cache

**Rationale:**
- Dramatically reduces storage usage (images are large)
- Sufficient for MVP validation (user can re-scan if needed)
- Meets offline-first requirement (no need to store images)
- Phase 2 can add "receipt history" feature if valuable
- Keeps IndexedDB storage under 1MB for typical use

**Storage Projection:**
- 500 products × ~200 bytes = ~100KB
- Well under browser storage limits (50MB-10GB)

**Affects:** Receipt scanning workflow, storage requirements

---

## Category 2: Authentication & Security

### Decision: Defer to Phase 2

**MVP (Single-User Local-First):**
- ❌ No authentication required
- ❌ No authorization required  
- ❌ No data encryption required (IndexedDB sandboxed per-origin)

**Security Measures Built-In:**
- ✅ XSS Prevention: React JSX escaping automatic
- ✅ Input Sanitization: MUI TextField components handle basics
- ✅ Camera Permissions: Browser permission prompts
- ✅ HTTPS Required: Vercel provides automatic (needed for PWA camera access)

**Phase 2 Considerations (With Backend REST API):**
- JWT or session-based authentication
- Token storage strategy (localStorage vs httpOnly cookies)
- API request authentication headers
- User account management
- Data encryption in transit (HTTPS)

**Rationale:**
- Single-user MVP has no auth requirements
- Browser security sandbox sufficient for local data
- Backend introduction triggers auth architecture
- Avoid premature complexity

**Affects:** MVP scope, Phase 2 planning

---

## Category 3: API & Communication Patterns

### 3.1. Service Layer Pattern

**Decision:** Abstract data operations in service layer for future REST API migration

**Architecture:**
```typescript
// src/services/inventory.ts
// MVP: Uses Dexie.js directly
// Phase 2: Swaps to REST API calls (same interface)

import { db } from './database';
import type { Product } from '../types/product';

export class InventoryService {
  // Get all products
  async getProducts(): Promise<Product[]> {
    // MVP: Local database
    return db.products.orderBy('updatedAt').reverse().toArray();
    
    // Phase 2: REST API (same interface!)
    // return api.get<Product[]>('/products');
  }

  // Update stock level
  async updateStockLevel(id: string, stockLevel: StockLevel): Promise<void> {
    // MVP: Local update
    await db.products.update(id, { 
      stockLevel, 
      updatedAt: new Date(),
      isOnShoppingList: stockLevel === 'low' || stockLevel === 'empty'
    });
    
    // Phase 2: API call
    // await api.patch(`/products/${id}`, { stockLevel });
  }

  // Add product from OCR
  async addProductFromReceipt(name: string): Promise<Product> {
    // MVP: Local insert
    const product: Product = {
      id: crypto.randomUUID(),
      name,
      stockLevel: 'high',
      createdAt: new Date(),
      updatedAt: new Date(),
      isOnShoppingList: false
    };
    await db.products.add(product);
    return product;
    
    // Phase 2: API call
    // return api.post<Product>('/products', { name });
  }
}

export const inventoryService = new InventoryService();
```

**Benefits:**
- Components only call service methods, never Dexie.js directly
- Future REST API migration = change service implementation only
- Business logic centralized
- Easy to mock for testing

**Rationale:**
- Backend REST API explicitly planned for Phase 2
- Service abstraction prevents tight coupling to Dexie.js
- Makes migration path clear and straightforward
- Good architectural practice for learning

**Affects:** All data operations, future migration effort

---

### 3.2. MVP Communication Architecture

**Decision:** All communication is local (in-process)

**Data Flow:**
```
React Components
    ↓
Service Layer (InventoryService, OCRService)
    ↓
Dexie.js (IndexedDB wrapper)
    ↓
IndexedDB (Browser storage)
```

**No External APIs for MVP:**
- ❌ No backend server
- ❌ No external OCR API (Tesseract.js runs in browser)
- ❌ No analytics or tracking services
- ✅ Complete offline functionality (NFR9)
- ✅ Zero network dependency (NFR13)

**Rationale:**
- Meets offline-first requirement
- Simplifies MVP development
- Zero API costs during 3-month validation
- Aligns with local-first architecture

**Affects:** All features, offline capability

---

## Category 4: Frontend Architecture

### 4.1. Routing Strategy

**Decision:** React Router v6 for URL-based navigation

**Installation:**
```bash
npm install react-router-dom
```

**Route Structure:**
```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InventoryList />} />
        <Route path="/shopping" element={<ShoppingList />} />
        <Route path="/scan" element={<ReceiptScanner />} />
        <Route path="/product/:id" element={<ProductDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
```

**Navigation:**
- MUI BottomNavigation for mobile
- Browser back button support
- Deep linking (shareable URLs)

**Rationale:**
- Desktop development companion benefits from URL navigation
- Browser back button is natural UX
- Deep linking useful for testing specific screens
- Standard pattern for React apps
- Minimal complexity for 4-5 routes

**Affects:** Component rendering, navigation UX

---

### 4.2. Component Architecture Pattern

**Decision:** Feature-based folder structure

**Directory Structure:**
```
src/
├── features/
│   ├── inventory/
│   │   ├── components/
│   │   │   ├── InventoryList.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   └── StockLevelPicker.tsx
│   │   ├── hooks/
│   │   │   └── useInventory.ts
│   │   └── types/
│   │       └── inventory.types.ts
│   │
│   ├── shopping/
│   │   ├── components/
│   │   │   ├── ShoppingList.tsx
│   │   │   └── ShoppingItem.tsx
│   │   ├── hooks/
│   │   │   └── useShopping.ts
│   │   └── types/
│   │       └── shopping.types.ts
│   │
│   └── receipt/
│       ├── components/
│       │   ├── ReceiptScanner.tsx
│       │   ├── ReceiptReview.tsx
│       │   └── CameraCapture.tsx
│       ├── hooks/
│       │   └── useOCR.ts
│       └── types/
│           └── receipt.types.ts
│
├── components/
│   └── shared/          # Reusable UI components
│       ├── Button/
│       ├── Card/
│       └── Layout/
│
├── services/            # Business logic & data access
│   ├── database.ts
│   ├── inventory.ts
│   └── ocr.ts
│
├── types/               # Global TypeScript types
│   └── product.ts
│
├── utils/               # Utility functions
│   └── validation.ts
│
└── App.tsx              # Root component
```

**Rationale:**
- All related code lives together (components, hooks, types)
- Easy to find files when working on a feature
- Scales well as features grow
- Better for learning React patterns
- Clear separation: features vs shared components vs services

**Affects:** Code organization, development workflow

---

### 4.3. Error Boundary Strategy

**Decision:** Feature-level error boundaries for isolated failure handling

**Implementation:**
```typescript
// src/components/shared/ErrorBoundary/FeatureErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Button, Box } from '@mui/material';

interface Props {
  children: ReactNode;
  featureName: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class FeatureErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Error in ${this.props.featureName}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p={3}>
          <Alert severity="error">
            Something went wrong in {this.props.featureName}.
            <Button onClick={() => this.setState({ hasError: false })}>
              Try Again
            </Button>
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}
```

**Usage:**
```typescript
// Wrap each feature
<FeatureErrorBoundary featureName="Inventory">
  <InventoryList />
</FeatureErrorBoundary>

<FeatureErrorBoundary featureName="Receipt Scanner">
  <ReceiptScanner />
</FeatureErrorBoundary>
```

**Rationale:**
- Receipt OCR might fail without crashing entire app
- Inventory remains accessible even if shopping list errors
- Critical for trust-building (NFR5: Zero crashes in core workflows)
- User can retry failed feature without app restart
- Meets "graceful recovery" requirement (FR38)

**Affects:** Error handling, app reliability, user experience

---

### 4.4. Performance Optimization Strategy

**Decision:** Start without optimizations, measure first, optimize later

**MVP Approach:**
- ❌ No React.memo initially
- ❌ No virtual scrolling initially
- ❌ No useMemo/useCallback unless needed
- ✅ Let Vite/React defaults handle performance

**Optimization Triggers (add only if needed):**
- If list scrolling feels slow → Add virtual scrolling (react-window)
- If components re-render too often → Add React.memo selectively
- If expensive calculations lag → Add useMemo

**Performance Monitoring:**
```typescript
// Use React DevTools Profiler
// Measure: Time to Interactive, render times
// Target: <2s for all actions (NFR1)
```

**Rationale:**
- React 19 is fast for your scale (hundreds of products)
- Premature optimization adds complexity
- "Profile first, optimize later" is best practice
- Meets <2 second response time requirement without optimization
- Learning benefit: understand performance when you need it

**Affects:** Component implementation, bundle size

---

## Category 5: Infrastructure & Deployment

### 5.1. Hosting Platform

**Decision:** Vercel for PWA hosting

**Configuration:**
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

**Features Used:**
- ✅ Automatic HTTPS (required for PWA camera access)
- ✅ Auto-deploy from Git (main branch)
- ✅ Preview deployments for PRs
- ✅ Edge network for fast global access
- ✅ Free tier sufficient for personal project

**Domain:**
- Vercel subdomain: `home-inventory-management.vercel.app`
- Custom domain optional in Phase 2

**Rationale:**
- Easiest setup for Vite + React projects
- Automatic HTTPS enables PWA features (camera, offline)
- Great developer experience (learning goal)
- Free tier perfect for 3-month validation
- Simple migration if needs change

**Affects:** Deployment process, HTTPS availability

---

### 5.2. Environment Configuration

**Decision:** Vite's built-in `.env` files for environment variables

**Structure:**
```bash
.env                  # Committed: Defaults for all environments
.env.local            # Gitignored: Local overrides
.env.development      # Committed: Development-specific
.env.production       # Committed: Production-specific
```

**Environment Variables:**
```bash
# .env
VITE_APP_NAME=Home Inventory Management
VITE_VERSION=0.1.0
VITE_OCR_LANGUAGE=eng

# .env.production
VITE_APP_URL=https://home-inventory-management.vercel.app
```

**Usage in Code:**
```typescript
const appName = import.meta.env.VITE_APP_NAME;
const ocrLanguage = import.meta.env.VITE_OCR_LANGUAGE;
```

**Rationale:**
- Vite's standard pattern (no additional config needed)
- Type-safe with vite-env.d.ts
- Separates dev/prod configuration cleanly
- `.env.local` keeps secrets out of Git

**Affects:** Configuration management, secrets handling

---

### 5.3. CI/CD Pipeline

**Decision:** GitHub Actions with lint, test, e2e, and build checks

**Workflow Configuration:**
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    name: Lint Code
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  test:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test

  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e

  build:
    name: Production Build
    needs: [lint, test, e2e]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
```

**Quality Gates:**
1. ✅ ESLint must pass (code quality)
2. ✅ Vitest unit tests must pass
3. ✅ Playwright E2E tests must pass
4. ✅ Production build must succeed
5. Then: Vercel auto-deploys via GitHub integration

**Rationale:**
- Catches errors before deployment
- Good learning experience with CI/CD
- Prevents broken code from reaching production
- E2E tests validate critical user flows (receipt scan, shopping)
- Free for public repositories

**Affects:** Code quality, deployment reliability

---

### 5.4. Monitoring & Error Tracking

**Decision:** Browser DevTools console only for MVP

**Approach:**
- Use browser DevTools during development and validation
- Console logs for debugging
- React DevTools for component inspection
- No external error tracking service

**Phase 2 Considerations:**
- Add Sentry when opening to friends/public
- Track error rates, crash reports
- User session replay for debugging

**Rationale:**
- Single user (you) during 3-month MVP validation
- Can see errors directly in DevTools
- Zero cost, no privacy concerns
- No external dependencies (local-first)
- Add monitoring when user base expands

**Affects:** Error visibility, debugging workflow

---

## Decision Impact Analysis

### Implementation Sequence

**Priority 1 - Project Setup (Story 1):**
1. Initialize Vite + React + TypeScript project
2. Install and configure dependencies (MUI, Dexie.js, React Router, Tesseract.js)
3. Configure PWA with vite-plugin-pwa
4. Set up ESLint, Prettier, Vitest, Playwright
5. Configure GitHub Actions CI/CD
6. Deploy initial skeleton to Vercel

**Priority 2 - Foundation (Story 2-3):**
7. Implement Dexie.js database schema (v1)
8. Create service layer (InventoryService, OCRService)
9. Set up React Router routes
10. Implement feature-level error boundaries
11. Create shared MUI component wrappers

**Priority 3 - Features (Story 4+):**
12. Build Inventory feature (list, card, stock picker)
13. Build Shopping feature (list, items, progress)
14. Build Receipt Scanner feature (camera, OCR, review)
15. Integrate features via service layer

### Cross-Component Dependencies

**Database Schema → Service Layer → Features:**
- All features depend on Dexie.js schema
- Services abstract database operations
- Components only interact with services

**Error Boundaries → All Features:**
- Each feature wrapped in error boundary
- Isolated failure handling

**Router → Navigation:**
- All features accessed via routes
- MUI BottomNavigation uses router links

**CI/CD → Quality:**
- All code changes go through pipeline
- Tests must pass before deployment

### Technology Version Summary

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.x | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 7.x | Build tool |
| MUI | 7.x | Component library |
| Dexie.js | 4.x | IndexedDB wrapper |
| Tesseract.js | 7.x | OCR engine |
| React Router | 6.x | Routing |
| Vitest | Latest | Unit testing |
| Playwright | Latest | E2E testing |
| vite-plugin-pwa | 1.x | PWA configuration |

All versions verified as of January 2026.

## Implementation Patterns & Consistency Rules

### Pattern Overview

**Critical Conflict Points Addressed:** 8 major areas where AI agents could make different implementation choices

**Purpose:** Ensure all AI agents implementing different features write compatible, consistent code that integrates seamlessly.

---

## Naming Patterns

### File & Component Naming

**Rule:** Use PascalCase for all React components and TypeScript files

**Examples:**
```
✅ ProductCard.tsx
✅ InventoryList.tsx
✅ useInventory.ts
✅ FeatureErrorBoundary.tsx

❌ product-card.tsx
❌ inventory-list.tsx
❌ use-inventory.ts
```

**Rationale:** Matches component names exactly, follows React community standard

---

### Database Field Naming (Dexie.js)

**Rule:** Use camelCase for all database fields

**Example:**
```typescript
interface Product {
  id: string;
  name: string;
  stockLevel: 'high' | 'medium' | 'low' | 'empty';
  createdAt: Date;
  updatedAt: Date;
  isOnShoppingList: boolean;
}

// Dexie.js schema
db.version(1).stores({
  products: '++id, name, stockLevel, isOnShoppingList, updatedAt'
});
```

**Rationale:** Consistent with JavaScript/TypeScript conventions, no conversion needed with IndexedDB

---

### Variable & Function Naming

**Rules:** Follow standard TypeScript conventions

**Examples:**
```typescript
// Variables and functions: camelCase
const productName = 'Milk';
const userId = '123';
function getUserProducts() { }
async function updateStockLevel(id: string) { }

// Constants: SCREAMING_SNAKE_CASE
const MAX_PRODUCTS = 500;
const DEFAULT_STOCK_LEVEL = 'high';
const API_TIMEOUT_MS = 5000;

// React Components: PascalCase
function ProductCard() { }
const InventoryList = () => { };

// Custom Hooks: camelCase with 'use' prefix
function useInventory() { }
const useOCR = () => { };

// Types/Interfaces: PascalCase
interface Product { }
type StockLevel = 'high' | 'medium' | 'low' | 'empty';
enum LoadingState { Idle, Loading, Success, Error }

// Private variables (optional underscore prefix)
const _internalCache = new Map();
```

**Rationale:** Standard TypeScript/React conventions, widely recognized

---

## Structure Patterns

### Testing File Organization

**Rule:** Co-locate test files with source files

**Example:**
```
src/features/inventory/
├── components/
│   ├── ProductCard.tsx
│   ├── ProductCard.test.tsx          ← Test next to component
│   ├── InventoryList.tsx
│   └── InventoryList.test.tsx
├── hooks/
│   ├── useInventory.ts
│   └── useInventory.test.ts          ← Test next to hook
└── services/
    ├── inventoryService.ts
    └── inventoryService.test.ts
```

**Test file naming:** `{ComponentName}.test.tsx` or `{fileName}.test.ts`

**Rationale:** Easier to maintain tests with code, aligns with feature-based structure

---

### Import Path Patterns

**Rule:** Use absolute imports with @/ alias for src/ directory

**tsconfig.json configuration:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

**vite.config.ts configuration:**
```typescript
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

**Examples:**
```typescript
// ✅ Good: Absolute imports with @/ alias
import { useInventory } from '@/features/inventory/hooks/useInventory';
import { Product } from '@/types/product';
import { db } from '@/services/database';
import { logger } from '@/utils/logger';

// ❌ Avoid: Deep relative paths
import { useInventory } from '../../../hooks/useInventory';
import { Product } from '../../../../types/product';
```

**Exception:** Same-directory imports can use relative paths
```typescript
// OK for same directory
import { ProductCard } from './ProductCard';
```

**Rationale:** Cleaner imports, easier refactoring, clear module structure

---

## State Management Patterns

### Context API with useReducer Pattern

**Rule:** All feature state management follows this pattern

**Standard Template:**
```typescript
// src/features/{feature}/context/{Feature}Context.tsx

import { createContext, useContext, useReducer, ReactNode } from 'react';

// 1. Define State Interface
interface FeatureState {
  data: DataType[];
  loading: boolean;
  error: string | null;
}

// 2. Define Action Types (Discriminated Union)
type FeatureAction =
  | { type: 'SET_DATA'; payload: DataType[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// 3. Reducer Function (Pure, Immutable)
function featureReducer(state: FeatureState, action: FeatureAction): FeatureState {
  switch (action.type) {
    case 'SET_DATA':
      return { ...state, data: action.payload, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

// 4. Context Type Definition
interface FeatureContextType {
  state: FeatureState;
  dispatch: React.Dispatch<FeatureAction>;
}

// 5. Create Context
const FeatureContext = createContext<FeatureContextType | undefined>(undefined);

// 6. Provider Component
export function FeatureProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(featureReducer, {
    data: [],
    loading: false,
    error: null
  });

  return (
    <FeatureContext.Provider value={{ state, dispatch }}>
      {children}
    </FeatureContext.Provider>
  );
}

// 7. Custom Hook (Mandatory)
export function useFeatureContext() {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error('useFeatureContext must be used within FeatureProvider');
  }
  return context;
}
```

**Usage in Components:**
```typescript
function MyComponent() {
  const { state, dispatch } = useFeatureContext();
  
  // Read state
  const products = state.data;
  
  // Update state
  dispatch({ type: 'SET_LOADING', payload: true });
}
```

**Rules:**
1. One Context per feature (InventoryContext, ShoppingContext, ReceiptContext)
2. Always use `useReducer`, not `useState` for feature state
3. Type all actions with discriminated unions
4. Reducers must be pure functions (no side effects)
5. Always return new state objects (immutable updates)
6. Provide custom hook that throws error if used outside provider
7. Context files located at `src/features/{feature}/context/`

**Rationale:** Consistent state management, predictable updates, easy testing

---

## Error Handling Patterns

### AppError Standard Format

**Rule:** All errors converted to AppError interface

**Type Definition:**
```typescript
// src/types/error.ts
export interface AppError {
  message: string;        // User-friendly message
  code?: string;         // Error code (e.g., 'OCR_FAILED', 'DB_ERROR')
  details?: unknown;     // Technical details for logging only
}
```

**Error Handler Utility:**
```typescript
// src/utils/errorHandler.ts
import type { AppError } from '@/types/error';

export function handleError(error: unknown): AppError {
  // Handle known error types
  if (error instanceof Error) {
    return {
      message: getUserFriendlyMessage(error),
      code: getErrorCode(error),
      details: error.stack
    };
  }
  
  // Handle unknown errors
  return {
    message: 'An unexpected error occurred. Please try again.',
    details: error
  };
}

function getUserFriendlyMessage(error: Error): string {
  // Map technical errors to user-friendly messages
  if (error.message.includes('network')) {
    return 'Unable to connect. Please check your connection.';
  }
  if (error.message.includes('permission')) {
    return 'Permission denied. Please check your settings.';
  }
  return error.message;
}

function getErrorCode(error: Error): string {
  // Extract or assign error codes
  if ('code' in error) return String(error.code);
  return 'UNKNOWN_ERROR';
}
```

**Usage Pattern:**
```typescript
// In async operations
async function loadProducts() {
  try {
    dispatch({ type: 'SET_LOADING', payload: true });
    const products = await inventoryService.getProducts();
    dispatch({ type: 'SET_PRODUCTS', payload: products });
  } catch (error) {
    const appError = handleError(error);
    logger.error('Failed to load products', appError.details);
    dispatch({ type: 'SET_ERROR', payload: appError.message });
  } finally {
    dispatch({ type: 'SET_LOADING', payload: false });
  }
}
```

**Error Display (MUI):**
```typescript
// Show errors using MUI Alert or Snackbar
{state.error && (
  <Alert 
    severity="error" 
    onClose={() => dispatch({ type: 'SET_ERROR', payload: null })}
  >
    {state.error}
  </Alert>
)}
```

**Rules:**
1. Always use `handleError()` to convert errors
2. User-friendly messages in `message` field (shown to user)
3. Technical details in `details` field (console only, never shown to user)
4. Optional `code` for programmatic error handling
5. Use MUI Alert or Snackbar for error display
6. Feature-level error boundaries catch uncaught errors
7. Log technical details with `logger.error()`

**Rationale:** Consistent error handling, good UX with user-friendly messages, debugging support

---

## Date/Time Handling Patterns

### Date Object Standard

**Rule:** Use JavaScript Date objects for all timestamps

**Type Definition:**
```typescript
interface Product {
  createdAt: Date;
  updatedAt: Date;
}
```

**Creation:**
```typescript
const product: Product = {
  id: crypto.randomUUID(),
  name: 'Milk',
  stockLevel: 'high',
  createdAt: new Date(),
  updatedAt: new Date(),
  isOnShoppingList: false
};
```

**Display:**
```typescript
// Localized date formatting
<Typography>
  Added: {product.createdAt.toLocaleDateString()}
</Typography>

<Typography>
  Updated: {product.updatedAt.toLocaleString()}
</Typography>

// Relative time (install date-fns if needed)
<Typography>
  {formatDistanceToNow(product.createdAt)} ago
</Typography>
```

**Comparison:**
```typescript
// Date arithmetic
const isRecent = Date.now() - product.createdAt.getTime() < 86400000; // 24 hours

// Sorting
products.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
```

**Rules:**
1. Always use `Date` objects in application code
2. Dexie.js stores Date objects natively (no conversion needed)
3. Use `toLocaleDateString()` and `toLocaleString()` for display
4. Phase 2 REST API conversion handled in service layer (Date ↔ ISO string)

**Rationale:** Dexie.js handles Date objects perfectly, simpler code, no conversions needed for MVP

---

## Loading State Patterns

### Loading State Management

**Rule:** Use boolean flags in context state for loading indicators

**State Structure:**
```typescript
interface FeatureState {
  data: DataType[];
  loading: boolean;          // Global feature loading (initial load)
  saving: boolean;           // Specific operation: saving
  scanning: boolean;         // Specific operation: OCR scanning
  error: string | null;
}
```

**Usage in Components:**
```typescript
function InventoryList() {
  const { state, dispatch } = useInventoryContext();
  
  // Full-screen loading (initial data fetch)
  if (state.loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <>
      {/* Inline loading (operation in progress) */}
      {state.saving && <LinearProgress />}
      
      {/* Content */}
      <List>
        {state.products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </List>
    </>
  );
}
```

**Async Operation Pattern:**
```typescript
async function saveProduct(product: Product) {
  try {
    dispatch({ type: 'SET_SAVING', payload: true });
    await inventoryService.saveProduct(product);
    dispatch({ type: 'ADD_PRODUCT', payload: product });
  } catch (error) {
    const appError = handleError(error);
    dispatch({ type: 'SET_ERROR', payload: appError.message });
  } finally {
    dispatch({ type: 'SET_SAVING', payload: false }); // Always in finally
  }
}
```

**Rules:**
1. Use `loading` for initial data fetch
2. Use specific flags (`saving`, `scanning`, `processing`) for operations
3. MUI `CircularProgress` for full-screen loading
4. MUI `LinearProgress` for inline/top-of-screen loading
5. Always set loading to false in finally block
6. Never block UI for <2 seconds operations (per NFR1)

**Rationale:** Clear loading states, good UX, meets <2 second response requirement

---

## Logging Patterns

### Logger Utility Standard

**Rule:** Use logger utility for all console output

**Logger Implementation:**
```typescript
// src/utils/logger.ts
const isDevelopment = import.meta.env.DEV;

export const logger = {
  debug: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },
  
  info: (message: string, ...args: unknown[]) => {
    console.info(`[INFO] ${message}`, ...args);
  },
  
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  
  error: (message: string, error?: unknown) => {
    console.error(`[ERROR] ${message}`, error);
  }
};
```

**Usage Examples:**
```typescript
// Debug (development only)
logger.debug('Loading products from database');
logger.debug('OCR processing started', { imageSize, language });

// Info (normal operations)
logger.info('Products loaded successfully', { count: products.length });
logger.info('Receipt scanned', { productsFound: 12 });

// Warn (recoverable issues)
logger.warn('Product name already exists', { name });
logger.warn('OCR confidence below threshold', { confidence: 0.7 });

// Error (failures)
logger.error('Failed to save product', error);
logger.error('Database connection failed', { details: error });
```

**Rules:**
1. Use `logger` utility, never direct `console` calls
2. `debug()` only appears in development mode
3. `info()` for successful operations
4. `warn()` for recoverable issues or unexpected states
5. `error()` for failures and exceptions
6. Never log sensitive data (passwords, tokens, personal info)
7. Include context objects for debugging (counts, IDs, states)

**Rationale:** Consistent logging, production-ready, easy to disable/filter

---

## Enforcement Guidelines

### All AI Agents MUST:

1. **Follow naming conventions exactly** - PascalCase for components, camelCase for variables/functions
2. **Use absolute imports with @/ alias** - No deep relative paths
3. **Co-locate test files** - `Component.test.tsx` next to `Component.tsx`
4. **Use Context + useReducer pattern** - For all feature state management
5. **Convert all errors to AppError** - Using `handleError()` utility
6. **Use Date objects** - No ISO strings or timestamps in application code
7. **Use logger utility** - No direct console calls
8. **Follow loading state patterns** - Boolean flags with MUI components
9. **Write immutable reducers** - Always return new state objects
10. **Provide custom context hooks** - That throw errors outside providers

### Pattern Verification

**During Code Review:**
- Check import paths use @/ alias
- Verify error handling uses `handleError()`
- Confirm loading states use try/catch/finally
- Validate state updates are immutable

**During Testing:**
- Tests co-located with source files
- Context providers tested with custom hooks
- Error scenarios covered

**Continuous Integration:**
- ESLint enforces naming conventions
- TypeScript enforces type safety
- Tests must pass before merge

### Pattern Evolution

**Updating Patterns:**
1. Discuss pattern changes in architecture document
2. Update this section with new patterns
3. Refactor existing code to match (if necessary)
4. Document breaking changes

**Adding New Patterns:**
- Identify new conflict points as they emerge
- Define pattern through team discussion
- Add to this document
- Communicate to all agents/developers

---

## Pattern Examples

### Good Example: Complete Feature Implementation

```typescript
// ✅ GOOD: Follows all patterns

// src/features/inventory/context/InventoryContext.tsx
import { createContext, useContext, useReducer, ReactNode } from 'react';
import type { Product } from '@/types/product';
import { inventoryService } from '@/services/inventory';
import { handleError } from '@/utils/errorHandler';
import { logger } from '@/utils/logger';

interface InventoryState {
  products: Product[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

type InventoryAction =
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

function inventoryReducer(state: InventoryState, action: InventoryAction): InventoryState {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_SAVING':
      return { ...state, saving: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false, saving: false };
    default:
      return state;
  }
}

const InventoryContext = createContext<{
  state: InventoryState;
  dispatch: React.Dispatch<InventoryAction>;
  loadProducts: () => Promise<void>;
} | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(inventoryReducer, {
    products: [],
    loading: false,
    saving: false,
    error: null
  });

  const loadProducts = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      logger.debug('Loading products from database');
      
      const products = await inventoryService.getProducts();
      
      dispatch({ type: 'SET_PRODUCTS', payload: products });
      logger.info('Products loaded successfully', { count: products.length });
    } catch (error) {
      const appError = handleError(error);
      logger.error('Failed to load products', appError.details);
      dispatch({ type: 'SET_ERROR', payload: appError.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <InventoryContext.Provider value={{ state, dispatch, loadProducts }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventoryContext() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventoryContext must be used within InventoryProvider');
  }
  return context;
}
```

### Anti-Pattern Examples

```typescript
// ❌ BAD: Violates multiple patterns

// Wrong file naming (kebab-case instead of PascalCase)
// src/features/inventory/components/product-card.tsx

// Wrong imports (relative paths instead of @/ alias)
import { useInventory } from '../../../hooks/use-inventory';
import { Product } from '../../../../types/product';

// Wrong: Direct console calls instead of logger
console.log('Loading products');

// Wrong: No error handling
async function loadProducts() {
  const products = await inventoryService.getProducts();
  setProducts(products);
}

// Wrong: Mutable state updates
function reducer(state, action) {
  state.products.push(action.payload); // Mutating state!
  return state;
}

// Wrong: No custom hook, no error throwing
export const InventoryContext = createContext();
```

---

## Summary

These patterns ensure that all AI agents implementing different features will:
- Write code that integrates seamlessly
- Follow consistent naming and structure
- Handle errors and loading states uniformly
- Use compatible state management patterns
- Produce maintainable, predictable code

**Total Patterns Defined:** 8 major categories
**Conflict Points Addressed:** All identified implementation variations
**Enforcement:** ESLint, TypeScript, code review, CI/CD

## Project Structure & Boundaries

### Complete Project Directory Structure

```
home-inventory-management/
├── README.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── vercel.json
├── .env
├── .env.local
├── .env.development
├── .env.production
├── .env.example
├── .gitignore
├── .eslintrc.cjs
├── .prettierrc
├── index.html
├── .github/
│   └── workflows/
│       └── ci.yml                  # CI/CD pipeline (lint, test, e2e, build)
│
├── public/
│   ├── favicon.ico
│   ├── pwa-192x192.png             # PWA icon
│   ├── pwa-512x512.png             # PWA icon
│   ├── apple-touch-icon.png
│   ├── manifest.json               # PWA manifest (auto-generated)
│   └── robots.txt
│
├── src/
│   ├── main.tsx                    # Application entry point
│   ├── App.tsx                     # Root component with Router
│   ├── App.test.tsx
│   ├── vite-env.d.ts               # Vite environment types
│   │
│   ├── features/                   # Feature-based organization
│   │   │
│   │   ├── inventory/              # FR1-FR10: Inventory Management & Stock Tracking
│   │   │   ├── components/
│   │   │   │   ├── InventoryList.tsx
│   │   │   │   ├── InventoryList.test.tsx
│   │   │   │   ├── ProductCard.tsx
│   │   │   │   ├── ProductCard.test.tsx
│   │   │   │   ├── StockLevelPicker.tsx
│   │   │   │   ├── StockLevelPicker.test.tsx
│   │   │   │   ├── ProductForm.tsx
│   │   │   │   ├── ProductForm.test.tsx
│   │   │   │   └── ProductDetail.tsx
│   │   │   │       ProductDetail.test.tsx
│   │   │   ├── context/
│   │   │   │   ├── InventoryContext.tsx
│   │   │   │   └── InventoryContext.test.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useInventory.ts
│   │   │   │   └── useInventory.test.ts
│   │   │   └── types/
│   │   │       └── inventory.types.ts
│   │   │
│   │   ├── shopping/               # FR11-FR21: Shopping List & In-Store Experience
│   │   │   ├── components/
│   │   │   │   ├── ShoppingList.tsx
│   │   │   │   ├── ShoppingList.test.tsx
│   │   │   │   ├── ShoppingItem.tsx
│   │   │   │   ├── ShoppingItem.test.tsx
│   │   │   │   └── ShoppingProgress.tsx
│   │   │   │       ShoppingProgress.test.tsx
│   │   │   ├── context/
│   │   │   │   ├── ShoppingContext.tsx
│   │   │   │   └── ShoppingContext.test.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useShopping.ts
│   │   │   │   └── useShopping.test.ts
│   │   │   └── types/
│   │   │       └── shopping.types.ts
│   │   │
│   │   └── receipt/                # FR22-FR35: Receipt Scanning & OCR Processing
│   │       ├── components/
│   │       │   ├── ReceiptScanner.tsx
│   │       │   ├── ReceiptScanner.test.tsx
│   │       │   ├── CameraCapture.tsx
│   │       │   ├── CameraCapture.test.tsx
│   │       │   ├── ReceiptReview.tsx
│   │       │   ├── ReceiptReview.test.tsx
│   │       │   └── ProductMatcher.tsx
│   │       │       ProductMatcher.test.tsx
│   │       ├── context/
│   │       │   ├── ReceiptContext.tsx
│   │       │   └── ReceiptContext.test.tsx
│   │       ├── hooks/
│   │       │   ├── useOCR.ts
│   │       │   ├── useOCR.test.ts
│   │       │   └── useCamera.ts
│   │       │       useCamera.test.ts
│   │       └── types/
│   │           └── receipt.types.ts
│   │
│   ├── components/                 # Shared/Reusable Components
│   │   └── shared/
│   │       ├── ErrorBoundary/
│   │       │   ├── FeatureErrorBoundary.tsx
│   │       │   └── FeatureErrorBoundary.test.tsx
│   │       ├── Layout/
│   │       │   ├── AppLayout.tsx
│   │       │   ├── AppLayout.test.tsx
│   │       │   └── BottomNav.tsx
│   │       │       BottomNav.test.tsx
│   │       └── Loading/
│   │           ├── LoadingSpinner.tsx
│   │           └── LoadingSpinner.test.tsx
│   │
│   ├── services/                   # Business Logic & Data Access (FR36-FR39)
│   │   ├── database.ts             # Dexie.js database setup
│   │   ├── database.test.ts
│   │   ├── inventory.ts            # Inventory service layer
│   │   ├── inventory.test.ts
│   │   ├── shopping.ts             # Shopping service layer
│   │   ├── shopping.test.ts
│   │   ├── ocr.ts                  # Tesseract.js OCR service
│   │   └── ocr.test.ts
│   │
│   ├── types/                      # Global TypeScript Types
│   │   ├── product.ts              # Product interface & StockLevel type
│   │   ├── error.ts                # AppError interface
│   │   └── index.ts                # Type exports
│   │
│   ├── utils/                      # Utility Functions
│   │   ├── errorHandler.ts         # Error handling utility
│   │   ├── errorHandler.test.ts
│   │   ├── logger.ts               # Logging utility
│   │   ├── logger.test.ts
│   │   └── validation.ts           # Validation helpers
│   │       validation.test.ts
│   │
│   ├── theme/                      # MUI Theme Configuration
│   │   └── theme.ts                # MUI theme customization
│   │
│   └── assets/                     # Static Assets
│       ├── icons/
│       └── images/
│
├── tests/                          # E2E Tests (Playwright)
│   ├── e2e/
│   │   ├── inventory.spec.ts       # Inventory feature E2E tests
│   │   ├── shopping.spec.ts        # Shopping list E2E tests
│   │   └── receipt-scanning.spec.ts # Receipt OCR E2E tests
│   ├── fixtures/
│   │   ├── mock-products.ts
│   │   └── mock-receipts/
│   │       ├── receipt-1.jpg
│   │       └── receipt-2.jpg
│   └── playwright.config.ts
│
└── dist/                           # Build output (gitignored)
    └── ...
```

---

### Architectural Boundaries

**Component Boundaries:**

**Feature Isolation:**
- Each feature (`inventory`, `shopping`, `receipt`) is self-contained
- Features communicate through shared services, never directly
- Context providers scoped to features
- Components within a feature can import freely from each other
- Cross-feature communication only through service layer

**Shared Components:**
- Located in `src/components/shared/`
- Generic, reusable across all features
- No feature-specific logic
- Import MUI components, not feature components

**Communication Pattern:**
```
Feature Component → Feature Context → Service Layer → Dexie.js → IndexedDB
                                           ↓
                              Other Feature Contexts (via state updates)
```

---

**Service Boundaries:**

**Service Layer Rules:**
- Services are singletons (`export const inventoryService = new InventoryService()`)
- Services handle all data operations
- Services never import React components or contexts
- Services can call other services
- Services abstract Dexie.js operations

**Service Communication:**
```typescript
// ✅ Good: Services calling services
class InventoryService {
  async addProductFromReceipt(name: string) {
    const product = await this.createProduct(name);
    await shoppingService.checkAndAddToList(product); // Service → Service OK
    return product;
  }
}

// ❌ Bad: Services importing contexts
import { useInventoryContext } from '@/features/inventory/context'; // NEVER
```

---

**Data Boundaries:**

**Database Access:**
- **ONLY** service layer accesses Dexie.js directly
- Components never import `db` from `database.ts`
- All database operations go through service methods

**Data Flow:**
```
Component → Context (dispatch action) → Context Provider → Service Layer → Database
                                                                              ↓
Component ← Context (state update)    ← Context Provider ← Service Layer ← Database
```

**Database Schema Boundary:**
```typescript
// src/services/database.ts
export const db = new InventoryDatabase(); // Singleton

// ✅ Services import db
import { db } from '@/services/database';

// ❌ Components NEVER import db
// import { db } from '@/services/database'; // FORBIDDEN in components
```

---

**State Management Boundaries:**

**Context Scope:**
- Each feature has its own Context (`InventoryContext`, `ShoppingContext`, `ReceiptContext`)
- Contexts do NOT share state directly
- State synchronization happens through service layer

**State Update Flow:**
```
User Action → Component → dispatch() → Reducer → New State → Re-render
                              ↓
                        Service Call (side effect)
                              ↓
                        Database Update
                              ↓
                    Other Contexts Notified (if needed)
```

---

### Requirements to Structure Mapping

**FR1-FR5: Product Inventory Management**
- **Components**: `src/features/inventory/components/ProductCard.tsx`, `ProductForm.tsx`, `ProductDetail.tsx`
- **Service**: `src/services/inventory.ts` → `addProduct()`, `updateProduct()`, `deleteProduct()`
- **Database**: `db.products.add()`, `.update()`, `.delete()`
- **Context**: `InventoryContext` with actions `ADD_PRODUCT`, `UPDATE_PRODUCT`, `DELETE_PRODUCT`
- **Tests**: Co-located `.test.tsx` files + `tests/e2e/inventory.spec.ts`

**FR6-FR10: Stock Level Tracking**
- **Components**: `src/features/inventory/components/StockLevelPicker.tsx`, `ProductCard.tsx`
- **Service**: `src/services/inventory.ts` → `updateStockLevel()`
- **Database**: `db.products.update(id, { stockLevel, isOnShoppingList })`
- **Context**: `InventoryContext` action `UPDATE_STOCK_LEVEL`
- **Integration**: Triggers `ShoppingContext` update when stock goes Low/Empty

**FR11-FR16: Automatic Shopping List Generation**
- **Components**: `src/features/shopping/components/ShoppingList.tsx`, `ShoppingItem.tsx`
- **Service**: `src/services/shopping.ts` → `getShoppingList()`, `addToList()`, `removeFromList()`
- **Database**: Queries `db.products.where('isOnShoppingList').equals(true)`
- **Context**: `ShoppingContext` automatically reflects `isOnShoppingList` changes
- **Integration**: Listens to inventory stock level changes

**FR17-FR21: In-Store Shopping Experience**
- **Components**: `src/features/shopping/components/ShoppingList.tsx`, `ShoppingProgress.tsx`
- **Service**: `src/services/shopping.ts` → `markCollected()`, `getProgress()`
- **Context**: `ShoppingContext` tracks collection state
- **Tests**: `tests/e2e/shopping.spec.ts` validates offline functionality

**FR22-FR26: Receipt Scanning & OCR**
- **Components**: `src/features/receipt/components/ReceiptScanner.tsx`, `CameraCapture.tsx`
- **Service**: `src/services/ocr.ts` → `processReceipt()`, `extractProducts()`
- **External Dependency**: Tesseract.js (imported in `ocr.ts`)
- **Context**: `ReceiptContext` manages scanning state (idle, capturing, processing, reviewing)
- **Tests**: `tests/e2e/receipt-scanning.spec.ts` with mock receipt fixtures

**FR27-FR31: OCR Error Correction**
- **Components**: `src/features/receipt/components/ReceiptReview.tsx`, `ProductMatcher.tsx`
- **Service**: `src/services/ocr.ts` → `matchProducts()`, `getConfidenceScores()`
- **Context**: `ReceiptContext` manages review state and corrections
- **Integration**: Shows existing inventory products for matching

**FR32-FR35: Inventory Updates from Receipt**
- **Components**: `src/features/receipt/components/ReceiptReview.tsx`
- **Service**: `src/services/inventory.ts` → `addProductFromReceipt()`, `replenishStock()`
- **Database**: `db.products.add()` for new products, `.update()` for existing
- **Context**: Updates `InventoryContext` after receipt confirmation
- **Integration**: Removes from `ShoppingContext` if replenished

**FR36-FR39: Data Persistence & Reliability**
- **Implementation**: `src/services/database.ts` (Dexie.js setup)
- **Schema**: Single table `products` with versioning
- **Service Layer**: All services use database for persistence
- **Error Handling**: Try/catch in service methods, graceful recovery
- **Tests**: Database migration tests, persistence tests across app restarts

**FR40-FR43: User Feedback & Notifications**
- **Components**: `src/components/shared/` (Alerts, Snackbars using MUI)
- **Pattern**: Error/success messages in each Context state
- **Display**: MUI `Alert` component in feature components
- **Integration**: All async operations provide user feedback

---

### Cross-Cutting Concerns Mapping

**Error Handling:**
- **Location**: `src/utils/errorHandler.ts`, `src/types/error.ts`
- **Usage**: All service methods wrap operations in try/catch
- **Display**: Feature contexts store error state, components show MUI Alerts
- **Boundaries**: `FeatureErrorBoundary` wraps each feature in `App.tsx`

**Logging:**
- **Location**: `src/utils/logger.ts`
- **Usage**: All services log operations (debug, info, warn, error)
- **Pattern**: Imported in every service file
- **Development**: Debug logs only in development mode

**Loading States:**
- **Location**: Feature contexts (state.loading, state.saving, etc.)
- **Display**: MUI `CircularProgress` (full-screen), `LinearProgress` (inline)
- **Pattern**: Set in try/finally blocks in context provider methods

**Routing:**
- **Location**: `src/App.tsx` (React Router v6 setup)
- **Routes**:
  - `/` → InventoryList
  - `/shopping` → ShoppingList
  - `/scan` → ReceiptScanner
  - `/product/:id` → ProductDetail
- **Navigation**: MUI `BottomNavigation` in `src/components/shared/Layout/BottomNav.tsx`

**Theme & Styling:**
- **Location**: `src/theme/theme.ts`
- **Application**: Wrapped in `ThemeProvider` in `main.tsx`
- **Usage**: All components use MUI components with theme
- **Customization**: Phase 2 can modify theme for Bring!-style visual design

---

### Integration Points

**Internal Communication:**

**Feature → Service → Database:**
```typescript
// Component dispatches action
dispatch({ type: 'SET_LOADING', payload: true });

// Context provider calls service
const products = await inventoryService.getProducts();

// Service accesses database
return db.products.toArray();

// Context updates state
dispatch({ type: 'SET_PRODUCTS', payload: products });
```

**Cross-Feature Communication (via Services):**
```typescript
// Inventory updates stock level
await inventoryService.updateStockLevel(id, 'low');
  // ↓ Updates database
  await db.products.update(id, { stockLevel: 'low', isOnShoppingList: true });
  
// Shopping feature queries database
const shoppingList = await shoppingService.getShoppingList();
  // ↓ Reads updated data
  return db.products.where('isOnShoppingList').equals(true).toArray();
  
// Shopping context automatically gets updated list
```

**Receipt → Inventory Integration:**
```typescript
// Receipt scanning completes
const recognizedProducts = await ocrService.processReceipt(image);

// User confirms products
await receiptContext.confirmProducts(recognizedProducts);

// For each product, update inventory
for (const product of recognizedProducts) {
  if (existingProduct) {
    await inventoryService.replenishStock(existingProduct.id);
  } else {
    await inventoryService.addProductFromReceipt(product.name);
  }
}

// Inventory context reflects changes
// Shopping context automatically updates (items no longer Low/Empty)
```

---

**External Integrations:**

**Tesseract.js (OCR Library):**
- **Location**: Imported in `src/services/ocr.ts`
- **Usage**: `Tesseract.recognize(image, 'eng')`
- **Configuration**: Language set via environment variable `VITE_OCR_LANGUAGE`
- **Error Handling**: Wrapped in try/catch, provides user-friendly errors
- **No Network**: Runs completely in-browser (Web Worker)

**Browser APIs:**
- **Camera API**: `navigator.mediaDevices.getUserMedia()` in `useCamera.ts` hook
- **IndexedDB**: Via Dexie.js abstraction
- **Service Worker**: Configured via vite-plugin-pwa for offline support
- **LocalStorage**: Environment-specific settings (optional, not for main data)

**Phase 2 Integrations (Planned):**
- REST API backend for multi-device sync
- Gemini LLM for improved OCR accuracy (network-based)
- Sentry for error tracking (when public)

---

**Data Flow:**

**Primary Flow (User Marks Item Consumed):**
```
1. User taps stock level in ProductCard
     ↓
2. Component calls Context method: updateStockLevel(id, 'low')
     ↓
3. Context dispatches SET_LOADING
     ↓
4. Context calls inventoryService.updateStockLevel(id, 'low')
     ↓
5. Service updates database:
   db.products.update(id, { stockLevel: 'low', isOnShoppingList: true })
     ↓
6. Context dispatches UPDATE_PRODUCT with new data
     ↓
7. Component re-renders with new stock level
     ↓
8. ShoppingContext queries database (on next render)
     ↓
9. Shopping list automatically shows new item
```

**OCR Flow (User Scans Receipt):**
```
1. User taps "Scan Receipt" button
     ↓
2. CameraCapture component requests camera permission
     ↓
3. User captures photo
     ↓
4. ReceiptContext dispatches SET_SCANNING
     ↓
5. Context calls ocrService.processReceipt(imageData)
     ↓
6. OCR service processes with Tesseract.js (5 seconds)
     ↓
7. Service returns { products: [...], confidence: 0.92 }
     ↓
8. Context dispatches SET_REVIEW_PRODUCTS
     ↓
9. ReceiptReview component renders with editable list
     ↓
10. User confirms/edits products
     ↓
11. Context calls inventoryService.addProductsFromReceipt(products)
     ↓
12. Service adds/updates products in database
     ↓
13. InventoryContext automatically reflects changes (via database query)
     ↓
14. ShoppingContext updates (items replenished, removed from list)
```

---

### File Organization Patterns

**Configuration Files (Root Level):**
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration (strict mode, paths)
- `vite.config.ts` - Vite build config + PWA plugin + path aliases
- `vercel.json` - Deployment configuration
- `.env.*` - Environment variables (see Decision 5.2)
- `.eslintrc.cjs` - ESLint rules
- `.prettierrc` - Code formatting rules
- `playwright.config.ts` - Located in tests/ directory

**Source Organization (src/):**
- `main.tsx` - App entry, renders `<App />` with providers
- `App.tsx` - Root component with React Router and feature providers
- `features/` - Feature-based modules (inventory, shopping, receipt)
- `components/shared/` - Reusable components across features
- `services/` - Business logic and data access layer
- `types/` - Global TypeScript type definitions
- `utils/` - Pure utility functions (no React dependencies)
- `theme/` - MUI theme configuration
- `assets/` - Static assets (icons, images)

**Test Organization:**
- **Unit/Integration**: Co-located with source files (`*.test.tsx`, `*.test.ts`)
- **E2E**: Separate `tests/e2e/` directory with Playwright specs
- **Fixtures**: `tests/fixtures/` for mock data and test receipts
- **Test Utilities**: Shared test helpers in `tests/` root

**Asset Organization:**
- `public/` - Static files served as-is (PWA icons, manifest, favicon)
- `src/assets/` - Assets imported in components (processed by Vite)
- `tests/fixtures/mock-receipts/` - Test receipt images

---

### Development Workflow Integration

**Development Server:**
```bash
npm run dev
# Starts Vite dev server on http://localhost:5173
# Hot Module Replacement (HMR) for instant updates
# PWA features work with proper certificates
```

**File Watching:**
- Vite watches all `src/` files
- Changes trigger instant HMR
- TypeScript checked in background
- Tests run separately (`npm run test:watch`)

---

**Build Process:**
```bash
npm run build
# 1. TypeScript compilation check
# 2. Vite builds production bundle
# 3. PWA service worker generated
# 4. Assets optimized and hashed
# 5. Output to dist/ directory
```

**Build Structure (dist/):**
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js          # Main bundle
│   ├── index-[hash].css         # Styles
│   └── vendor-[hash].js         # Third-party code (MUI, React, etc.)
├── pwa-192x192.png
├── pwa-512x512.png
├── manifest.json
└── sw.js                        # Service worker
```

---

**Deployment Process:**

**Vercel Integration:**
1. Push to `main` branch
2. Vercel detects push via GitHub integration
3. Vercel runs: `npm ci && npm run build`
4. Build output (`dist/`) deployed to edge network
5. HTTPS automatically configured
6. PWA features enabled (camera access works)

**CI/CD Flow (GitHub Actions):**
```
Push to branch
    ↓
Lint (ESLint) runs
    ↓
Unit tests (Vitest) run
    ↓
E2E tests (Playwright) run
    ↓
Build (npm run build) runs
    ↓
If all pass and branch = main:
    ↓
Vercel auto-deploys
```

---

## Architecture Summary

### Technology Stack (Finalized)

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | React | 19.x | UI framework |
| | TypeScript | 5.x | Type safety |
| | MUI | 7.x | Component library |
| | React Router | 6.x | Routing |
| | Emotion | - | Styling (with MUI) |
| **Build** | Vite | 7.x | Build tool & dev server |
| | vite-plugin-pwa | 1.x | PWA configuration |
| **State** | Context API | Built-in | State management |
| | useReducer | Built-in | Complex state logic |
| **Data** | Dexie.js | 4.x | IndexedDB wrapper |
| | IndexedDB | Browser API | Local database |
| **OCR** | Tesseract.js | 7.x | Receipt OCR (browser-based) |
| **Testing** | Vitest | Latest | Unit/integration tests |
| | Playwright | Latest | E2E tests |
| | Testing Library | Latest | Component testing |
| **Deployment** | Vercel | - | Hosting platform |
| | GitHub Actions | - | CI/CD pipeline |

### Architectural Characteristics

**Achieved:**
- ✅ Local-first, offline-capable PWA
- ✅ Feature-based modular architecture
- ✅ Clear separation of concerns (components, services, data)
- ✅ Consistent implementation patterns
- ✅ Type-safe with TypeScript strict mode
- ✅ Comprehensive testing strategy
- ✅ Modern build tooling with Vite
- ✅ Automated CI/CD pipeline
- ✅ Ready for Phase 2 backend migration

**Design Principles Applied:**
1. **Separation of Concerns**: Features, services, data layer clearly separated
2. **Single Responsibility**: Each module has one clear purpose
3. **Dependency Injection**: Services as singletons, easily mockable
4. **Immutability**: State updates use spread operators, never mutations
5. **Composition**: Components compose smaller components
6. **Type Safety**: Strict TypeScript enforced throughout

**Scalability Path:**
- MVP: Single-user, local-first
- Phase 2: Add REST API backend, retain local caching
- Phase 3: Multi-user sync, authentication, cloud backup

---

## Implementation Readiness

This architecture document provides:
- ✅ Complete project structure (all files and directories)
- ✅ Clear architectural boundaries (components, services, data)
- ✅ Implementation patterns (naming, structure, state, errors, logging)
- ✅ Technology decisions with versions verified
- ✅ Requirements mapped to specific locations
- ✅ Integration points documented
- ✅ Data flow patterns defined

**AI agents can now implement features consistently by following:**
1. Starter template initialization sequence
2. Implementation patterns and consistency rules
3. Project structure and boundaries
4. Service layer abstractions
5. Context + useReducer state management pattern
6. Error handling and logging standards

**Next Step**: Create Epics & Stories based on this architecture, then begin implementation with Story 1: Project Setup & Infrastructure.
