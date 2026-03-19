# Technical Architecture Reference

## Executive Summary

The Home Inventory Management application is a Progressive Web App (PWA) built with React 19.2.0 and TypeScript 5.9.3, designed for household inventory tracking with offline-first capabilities. The application implements a feature-based modular architecture with service layer abstraction, event-driven cross-context communication, and local-first data storage using IndexedDB.

**Implementation Status:**
- 9 Epics completed
- 35 Stories delivered
- MVP feature-complete
- Production-deployed on Vercel

**Key Architectural Patterns:**
- Feature-based modular organization
- Repository pattern for data access
- Pluggable OCR provider architecture
- Event-driven state synchronization
- Mobile-first responsive design

## Technology Stack

### Core Framework
- **React**: 19.2.0 - UI framework with concurrent features
- **TypeScript**: 5.9.3 - Type-safe development
- **Vite**: 7.2.4 - Build tool with SWC compilation
- **React Router**: 7.11.0 - Client-side routing

### UI Components
- **Material-UI (MUI)**: 7.3.6 - Component library
- **Emotion**: CSS-in-JS styling solution
- **Material Icons**: Icon system

### Data & State Management
- **Dexie.js**: 4.2.1 - IndexedDB wrapper
- **React Context API**: State management
- **useReducer**: Complex state logic
- **Custom Event Bus**: Cross-context communication

### Testing
- **Vitest**: 4.0.16 - Unit/integration tests
- **Playwright**: 1.57.0 - E2E testing
- **Testing Library**: Component testing utilities
- **v8**: Coverage reporting

### PWA & Offline
- **vite-plugin-pwa**: 1.2.0 - PWA configuration
- **Workbox**: Service worker management

## Project Architecture

### Overall Pattern

The application follows a **feature-based modular architecture** with clear separation of concerns:

1. **Service Layer**: Business logic abstraction with repository pattern
2. **Data Layer**: IndexedDB via Dexie.js with automatic migrations
3. **State Management**: React Context with event-driven updates
4. **Presentation Layer**: Feature-organized components with mobile-first design

### Directory Structure

```
src/
├── features/              # Feature modules (inventory, shopping, receipt)
│   ├── inventory/
│   │   ├── context/      # InventoryContext state management
│   │   ├── components/   # ProductCard, InventoryList, AddProductDialog
│   │   └── services/     # Inventory business logic
│   ├── shopping/
│   │   ├── context/      # ShoppingContext state
│   │   ├── components/   # ShoppingList, ShoppingProgress
│   │   └── services/     # Shopping business logic
│   └── receipt/
│       ├── context/      # ReceiptContext for OCR flow
│       ├── components/   # CameraCapture, ReceiptReview
│       ├── hooks/        # Custom receipt hooks
│       └── types/        # Receipt TypeScript types
├── components/           # Shared UI components
│   ├── shared/
│   │   ├── ErrorBoundary/    # Feature-specific error handling
│   │   ├── Layout/          # AppLayout, BottomNav, AppBar
│   │   ├── EmptyState.tsx   # Reusable empty states
│   │   └── Placeholder.tsx  # Loading placeholders
│   └── StockLevelPicker/    # Stock level selection
├── services/            # Core service layer
│   ├── database.ts      # Dexie.js configuration
│   ├── inventory.ts     # Inventory CRUD operations
│   ├── shopping.ts      # Shopping list operations
│   └── ocr/             # OCR services
│       ├── ocr.service.ts
│       └── providers/   # Pluggable OCR implementations
├── theme/              # MUI theme configuration
├── types/              # Shared TypeScript types
├── utils/              # Utility functions
├── test/               # Test setup and utilities
├── integration/        # Integration tests
└── App.tsx            # Main application component
```

## Data Layer

### Database Schema (IndexedDB via Dexie.js)

**Version 3 Schema:**

```typescript
// Product table
interface Product {
  id: string;                // UUID generated at runtime
  name: string;              // Product name (max 255 chars)
  stockLevel: 'high' | 'medium' | 'low' | 'empty';
  createdAt: Date;           // Creation timestamp
  updatedAt: Date;           // Last modification timestamp
  isOnShoppingList: boolean; // Auto-managed based on stock levels
  isChecked: boolean;        // User checked status during shopping
}

// Pending receipts table (offline OCR queue)
interface PendingReceipt {
  id?: number;               // Auto-incremented primary key
  imageData: string;         // Base64 data URL of receipt image
  createdAt: Date;           // Timestamp when receipt was captured
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;            // Error message if failed
}
```

### Schema Evolution

- **Version 1**: Initial products table
- **Version 2**: Added `isChecked` field for shopping items
- **Version 3**: Added `pendingReceipts` table for offline OCR queue

### Service Layer

The service layer implements the **Repository Pattern** with singleton service instances:

#### InventoryService (`src/services/inventory.ts`)

```typescript
class InventoryService {
  // CRUD Operations
  async getAllProducts(): Promise<Product[]>
  async getProductById(id: string): Promise<Product | undefined>
  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>
  async updateProduct(id: string, updates: Partial<Product>): Promise<void>
  async deleteProduct(id: string): Promise<void>

  // Stock Management
  async cycleStockLevel(productId: string): Promise<void>
  async getProductsByStockLevel(level: StockLevel): Promise<Product[]>

  // Search
  async searchProducts(query: string): Promise<Product[]>

  // Bulk Operations
  async replenishFromReceipt(updates: Array<{id: string, quantity: number}>): Promise<void>
}
```

**Key Features:**
- Automatic shopping list management based on stock levels
- Optimistic UI updates with error rollback
- Transaction-based bulk operations
- Comprehensive error handling

#### ShoppingService (`src/services/shopping.ts`)

```typescript
class ShoppingService {
  // List Management
  async getShoppingList(): Promise<Product[]>
  async addToShoppingList(productId: string): Promise<void>
  async removeFromShoppingList(productId: string): Promise<void>

  // Shopping Mode
  async toggleShoppingMode(): Promise<void>
  async checkItem(productId: string): Promise<void>
  async uncheckItem(productId: string): Promise<void>

  // Progress Tracking
  async getShoppingProgress(): Promise<{total: number, checked: number}>
  async completeShopping(): Promise<void>  // Auto-removes checked items
}
```

**Key Features:**
- Real-time progress calculation
- Auto-removal of checked items after shopping
- Integration with inventory service
- Shopping mode state persistence

#### OCRService (`src/services/ocr/ocr.service.ts`)

```typescript
class OCRService {
  // Provider Management
  private providers: OCRProvider[] = [
    new LLMProvider(),    // OpenAI GPT-4o mini
    new GeminiProvider(), // Alternative LLM
    new MockProvider()    // Testing fallback
  ]

  // Core Operations
  async processReceipt(imageData: string): Promise<OCRResult>
  async processPendingReceipts(): Promise<void>

  // Queue Management (Offline Support)
  async queuePendingReceipt(imageData: string): Promise<void>
  async clearPendingReceipts(): Promise<void>

  // Product Matching
  private matchProductsToInventory(items: ReceiptItem[]): Promise<ProductUpdate[]>
}
```

**Provider Architecture:**

```typescript
interface OCRProvider {
  name: string;
  canProcess(): boolean;  // Provider availability check
  process(imageData: string): Promise<OCRResult>;
}

// LLM Provider (Primary)
class LLMProvider implements OCRProvider {
  async process(imageData: string): Promise<OCRResult> {
    // Calls OpenAI GPT-4o mini API
    // Supports receipt format detection
    // Returns structured product data
  }
}

// Gemini Provider (Alternative)
class GeminiProvider implements OCRProvider {
  async process(imageData: string): Promise<OCRResult> {
    // Calls Gemini API (free tier)
    // Fallback when OpenAI unavailable
  }
}
```

**Key Features:**
- Pluggable provider architecture
- Automatic provider failover
- Offline queue with retry logic
- Receipt format detection (Spanish supermarket, generic)
- Product matching to existing inventory

### Data Persistence

**Local-First Architecture:**
- All data stored client-side in IndexedDB
- No server dependency for core operations
- Offline support for all features
- Automatic schema migrations

**Offline OCR Queue:**
- Receipts captured offline stored in `pendingReceipts` table
- Automatic processing when connection restored
- Network detection via `navigator.onLine`
- Graceful error handling with retry logic

## State Management

### React Context Pattern

The application uses **React Context API** with reducer pattern for complex state:

#### InventoryContext (`src/features/inventory/context/InventoryContext.tsx`)

**State Structure:**
```typescript
interface InventoryState {
  products: Product[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
}

type InventoryAction =
  | { type: 'LOAD_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SEARCH_QUERY'; payload: string };
```

**Provided Actions:**
- `loadProducts()` - Load all products from database
- `addProduct(productData)` - Create new product
- `updateProduct(id, updates)` - Update existing product
- `deleteProduct(id)` - Remove product
- `cycleStockLevel(productId)` - Cycle through stock levels
- `searchProducts(query)` - Filter products by name

#### ShoppingContext (`src/features/shopping/context/ShoppingContext.tsx`)

**State Structure:**
```typescript
interface ShoppingState {
  items: Product[];
  loading: boolean;
  error: string | null;
  count: number;
  isShoppingMode: boolean;
}
```

**Provided Actions:**
- `loadShoppingList()` - Load shopping list items
- `addToShoppingList(productId)` - Add item to list
- `removeFromShoppingList(productId)` - Remove from list
- `toggleShoppingMode()` - Enter/exit shopping mode
- `checkItem(productId)` - Mark item as checked
- `uncheckItem(productId)` - Unmark item
- `completeShopping()` - Finalize shopping (auto-removes checked items)

#### ReceiptContext (`src/features/receipt/context/ReceiptContext.tsx`)

**State Structure:**
```typescript
interface ReceiptState {
  // Camera
  cameraOpen: boolean;
  capturedImage: string | null;

  // OCR
  ocrProcessing: boolean;
  ocrResult: OCRResult | null;
  ocrError: string | null;

  // Review
  reviewItems: ReceiptItem[];
  inventoryUpdates: ProductUpdate[];

  // Progress
  processingStep: 'idle' | 'capturing' | 'processing' | 'review' | 'updating';
}
```

**Provided Actions:**
- `openCamera()` / `closeCamera()` - Camera control
- `captureReceipt(imageData)` - Capture and queue for OCR
- `processReceipt(imageData)` - Execute OCR processing
- `confirmInventoryUpdates()` - Apply OCR results to inventory
- `cancelReview()` - Discard OCR results

### Event-Driven Architecture

**EventBus Implementation** (`src/utils/eventBus.ts`):

```typescript
type EventBusEvents = {
  'inventory:update': { productId: string };
  'shopping:list:change': { count: number };
  'shopping:mode:toggle': { isActive: boolean };
  'shopping:complete': void;
};

class EventBus {
  on<K extends keyof EventBusEvents>(
    event: K,
    callback: (data: EventBusEvents[K]) => void
  ): () => void;

  emit<K extends keyof EventBusEvents>(
    event: K,
    data: EventBusEvents[K]
  ): void;
}
```

**Usage Pattern:**
```typescript
// Subscribe to events
const unsubscribe = EventBus.on('inventory:update', ({ productId }) => {
  // React to inventory changes
});

// Emit events
EventBus.emit('inventory:update', { productId: '123' });

// Cleanup
useEffect(() => {
  return () => unsubscribe();
}, []);
```

**Benefits:**
- Replaced polling-based sync (30% performance improvement)
- Zero unnecessary queries
- Instant cross-context updates
- Type-safe event definitions
- Automatic cleanup on unmount

## Component Architecture

### Patterns

**Functional Components with Hooks:**
- All components are functional
- Hooks for side effects and state
- Custom hooks for logic extraction

**Feature-Based Organization:**
- Components co-located with feature logic
- Clear ownership boundaries
- Easy feature extraction

**Error Boundaries:**
- Feature-specific error boundaries
- Prevent cascading failures
- User-friendly error messages

**Mobile-First Design:**
- Responsive breakpoints
- Touch-optimized (44px minimum targets)
- Bottom navigation for thumb reach

### Shared Components

#### ErrorBoundary (`src/components/shared/ErrorBoundary/ErrorBoundary.tsx`)

```typescript
interface FeatureErrorBoundaryProps {
  feature: string;
  children: ReactNode;
  fallback?: (error: Error) => ReactNode;
}
```

**Features:**
- Feature-specific error isolation
- Custom fallback UI
- Error logging integration
- Recovery mechanisms

#### Layout Components

**AppLayout** (`src/components/shared/Layout/AppLayout.tsx`):
- Top AppBar with title
- Bottom navigation (2 tabs)
- Content area with routing
- Responsive container

**BottomNav** (`src/components/shared/Layout/BottomNav.tsx`):
- Inventory tab
- Shopping tab
- SpeedDial integration
- Active route highlighting

#### StockLevelPicker (`src/components/StockLevelPicker/StockLevelPicker.tsx`)

```typescript
interface StockLevelPickerProps {
  value: StockLevel;
  onChange: (level: StockLevel) => void;
  label?: string;
}
```

**Features:**
- Color-coded levels (green, yellow, orange, gray)
- Touch-friendly selection
- Accessible labels
- Visual feedback

### Feature Components

#### Inventory Components

**ProductCard** (`src/features/inventory/components/ProductCard.tsx`):
```typescript
interface ProductCardProps {
  product: Product;
  onStockLevelCycle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}
```

**Features:**
- Stock level display with color coding
- Tap-to-cycle stock levels
- Delete confirmation dialog
- Edit product dialog

**InventoryList** (`src/features/inventory/components/InventoryList.tsx`):
- Search/filter functionality
- Empty state handling
- Loading skeletons
- Infinite scroll (future)

**AddProductDialog** (`src/features/inventory/components/AddProductDialog.tsx`):
- Form validation
- Stock level selection
- Duplicate detection
- Auto-save on close

#### Shopping Components

**ShoppingList** (`src/features/shopping/components/ShoppingList.tsx`):
```typescript
interface ShoppingListProps {
  items: Product[];
  isShoppingMode: boolean;
  onCheckItem: (id: string) => void;
  onUncheckItem: (id: string) => void;
}
```

**Features:**
- Check/uncheck with animation
- Shopping mode visual distinction
- Progress indicator
- Empty state when no items

**ShoppingProgress** (`src/features/shopping/components/ShoppingProgress.tsx`):
- Visual progress bar
- Count display (X/Y items)
- Color-coded progress
- Completion celebration

**ShoppingModeToggle** (`src/features/shopping/components/ShoppingModeToggle.tsx`):
- Large, prominent button
- Mode confirmation dialog
- Progress persistence
- Exit with completion prompt

#### Receipt Components

**CameraCapture** (`src/features/receipt/components/CameraCapture.tsx`):
- Camera access with permissions
- Image preview
- Capture/retake functionality
- Front/back camera support

**ReceiptReview** (`src/features/receipt/components/ReceiptReview.tsx`):
- Parsed items display
- Edit before confirm
- Product matching status
- Inventory update preview

**OCRProcessing** (`src/features/receipt/components/OCRProcessing.tsx`):
- Progress steps display
- Loading animation
- Error handling
- Cancellation support

## Routing & Navigation

### Routes Configuration

```typescript
// React Router 7.11.0 configuration
const routes = [
  {
    path: '/',
    element: <InventoryList />
  },
  {
    path: '/shopping',
    element: <ShoppingList />
  },
  {
    path: '/scan',
    element: <ReceiptScanner />
  }
];
```

### Navigation Structure

**Bottom Navigation (2 Tabs):**
1. **Inventory** (`/`) - Home screen
2. **Shopping** (`/shopping`) - Shopping list

**SpeedDial Actions:**
- **Inventory tab**: Add product, Scan receipt
- **Shopping tab**: Scan receipt

**Browser History:**
- Full history support
- Back button handling
- Route-based code splitting (future)

### Navigation Patterns

**Programmatic Navigation:**
```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/shopping');
navigate('/scan');
```

**Declarative Navigation:**
```typescript
<Link to="/shopping">Shopping List</Link>
```

## Testing Strategy

### Three-Tier Testing Pyramid

```
        E2E Tests
       (Playwright)
      /             \
   Integration     Unit Tests
      Tests       (Vitest)
```

### 1. Unit Tests (Vitest)

**Scope:**
- Component testing
- Service layer testing
- Utility function testing
- Hook testing

**Examples:**
```typescript
// Service test
describe('InventoryService', () => {
  it('should create product with generated ID', async () => {
    const product = await inventoryService.createProduct({
      name: 'Milk',
      stockLevel: 'high'
    });
    expect(product.id).toBeDefined();
    expect(product.name).toBe('Milk');
  });
});

// Component test
describe('ProductCard', () => {
  it('should cycle stock level on tap', async () => {
    const onCycle = vi.fn();
    render(<ProductCard product={mockProduct} onStockLevelCycle={onCycle} />);
    fireEvent.click(screen.getByText('Milk'));
    expect(onCycle).toHaveBeenCalledWith('123');
  });
});
```

### 2. Integration Tests

**Scope:**
- Cross-feature interactions
- Data persistence
- Context integration

**Examples:**
- Check-off items persistence
- Auto-removal after shopping
- Cross-context state sync

**Location:** `src/integration/`

### 3. E2E Tests (Playwright)

**Scope:**
- Full user flows
- Critical paths
- Cross-browser testing

**Examples:**
- Complete shopping workflow
- Receipt scan to inventory update
- Stock level cycling impact on shopping list

**Location:** `tests/e2e/`

### Testing Utilities

**FakeIndexedDB** (`src/test/fakeIndexedDB.ts`):
```typescript
// In-memory database for testing
export function createFakeDB(): Dexie {
  const db = new Dexie('TestDB');
  db.version(1).stores({
    products: '++id, name, stockLevel, isOnShoppingList, isChecked'
  });
  return db;
}
```

**Mock OCR Provider** (`src/services/ocr/providers/MockProvider.ts`):
```typescript
class MockProvider implements OCRProvider {
  async process(imageData: string): Promise<OCRResult> {
    return {
      items: [
        { name: 'Milk', quantity: 2, unit: 'L' }
      ],
      confidence: 1.0
    };
  }
}
```

### Coverage Targets

- **Components**: 80%+ coverage
- **Services**: 90%+ coverage
- **Utils**: 100% coverage
- **E2E**: All critical paths covered

## Configuration

### Build Configuration (Vite)

**vite.config.ts:**
```typescript
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Home Inventory',
        short_name: 'Inventory',
        theme_color: '#1976d2',
        icons: [...]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    strictPort: true
  }
});
```

**Key Features:**
- SWC compilation (fast builds)
- Path aliases (`@/` for src)
- PWA manifest auto-generation
- Hot module replacement

### Development Configuration

**ESLint** (.eslintrc.cjs):
```javascript
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    'react-hooks/rules-of-hooks': 'error'
  }
};
```

**Prettier** (.prettierrc):
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

**TypeScript** (tsconfig.json):
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx"
  }
}
```

### Environment Variables

**.env.example:**
```bash
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

**Usage:**
```typescript
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "preview": "vite preview"
  }
}
```

## Performance Optimizations

### Implemented Optimizations

**1. Event-Driven Sync:**
- Replaced 30-second polling with EventBus
- 30% reduction in unnecessary queries
- Instant UI updates

**2. Optimistic UI Updates:**
```typescript
// Immediate UI feedback
setProducts(prev => [...prev, newProduct]);

// Database update in background
await inventoryService.createProduct(productData);

// Rollback on error
try {
  await inventoryService.createProduct(productData);
} catch (error) {
  setProducts(prev => prev.filter(p => p.id !== newProduct.id));
}
```

**3. Memoization:**
```typescript
const sortedProducts = useMemo(() =>
  products.sort((a, b) => a.name.localeCompare(b.name)),
  [products]
);

const handleDelete = useCallback((id: string) => {
  deleteProduct(id);
}, []);
```

**4. PWA Caching:**
- Service worker caching
- Offline asset serving
- Background sync

### Performance Metrics

**Bundle Size:**
- Current: ~604 KB (minified)
- Gzipped: ~189 KB
- Growth: ~4% per feature
- Status: Above 500KB target (Issue #7)

**Action Targets:**
- OCR Processing: <5s (achieved)
- UI Response: <2s (achieved)
- Navigation: <500ms (achieved)

### Optimization Opportunities

**Bundle Splitting** (Future):
```typescript
// Route-based code splitting
const Inventory = lazy(() => import('./features/inventory'));
const Shopping = lazy(() => import('./features/shopping'));
```

**Manual Chunks** (Future):
```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'mui': ['@mui/material', '@mui/icons-material'],
        'ocr': ['tesseract.js']
      }
    }
  }
}
```

## Technical Debt Summary

### High Priority

**Issue #11: NFR14 Compliance (External API Disclosure)**
- **Description**: Document OCR API usage and costs
- **Effort**: 3-5 hours
- **Impact**: Regulatory compliance

**Issue #8: Stock Level UI Space**
- **Description**: Optimize stock level display on cards
- **Effort**: 2-3 hours
- **Impact**: UX improvement

### Medium Priority

**Issue #3: Concurrent Operations**
- **Description**: Handle rapid sequential actions
- **Effort**: 5-8 hours
- **Impact**: Data consistency

**Issue #7: Bundle Size**
- **Description**: Reduce bundle below 500KB
- **Effort**: 5-8 hours
- **Impact**: Performance

**Issue #10: Event-Driven Sync ✅**
- **Description**: Replaced polling with EventBus
- **Effort**: 3-5 hours
- **Status**: RESOLVED

### Low Priority

**Issue #4: ESLint Comments**
- **Description**: Document ESLint rule exemptions
- **Effort**: 2-3 hours
- **Impact**: Code maintainability

**Issue #5: readonly Modifiers**
- **Description**: Add readonly to interface properties
- **Effort**: 1-2 hours
- **Impact**: Type safety

**Total Estimated Effort:** 21-43 hours

## Development Workflow

### Git Workflow

**Branch Strategy:**
```
main (production)
  └── develop (staging)
      └── feature/story-XX-description
      └── bugfix/issue-XX-description
```

**Commit Conventions:**
```
feat: add product search functionality
fix: resolve stock level cycling bug
docs: update API documentation
test: add integration tests for shopping
refactor: extract OCR provider interface
```

### CI/CD Pipeline

**GitHub Actions Workflow:**
```yaml
name: CI/CD

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps: [eslint]

  test:
    runs-on: ubuntu-latest
    steps: [vitest, coverage]

  e2e:
    runs-on: ubuntu-latest
    steps: [playwright]

  build:
    runs-on: ubuntu-latest
    steps: [vite build]
    needs: [lint, test, e2e]

  deploy:
    runs-on: ubuntu-latest
    steps: [vercel deploy]
    needs: [build]
    if: github.ref == 'refs/heads/main'
```

**Quality Gates:**
1. Lint must pass
2. Unit tests must pass
3. E2E tests must pass
4. Build must succeed
5. Coverage must not decrease

### Code Quality Standards

**TypeScript Strict Mode:**
- All files must pass strict type checking
- No `any` types without justification
- Interface definitions for all data structures

**Test Requirements:**
- New features require unit tests
- Critical paths require E2E tests
- Integration tests for cross-feature logic

**Documentation Requirements:**
- Complex logic requires comments
- Public APIs require JSDoc
- Architectural decisions documented in ADRs

## Deployment & Infrastructure

### Hosting Configuration

**Platform:** Vercel
**URL:** https://home-inventory-app.vercel.app
**HTTPS:** Automatic (required for PWA camera)

### Build Process

1. **Trigger:** Push to `main` branch
2. **Build:** `npm run build`
3. **Test:** Run full test suite
4. **Deploy:** Automatic deployment to Vercel
5. **Notify:** GitHub status update

### Environment Management

**Development:**
- Local development server (Vite)
- Hot module replacement
- Source maps enabled

**Production:**
- Optimized minified build
- Service worker registered
- Source maps excluded
- Environment variables injected

### Infrastructure

**CDN:** Vercel Edge Network
**Database:** Client-side IndexedDB (no server)
**APIs:** Direct client calls to OpenAI/Gemini
**Storage:** Browser storage (IndexedDB + LocalStorage)

### Monitoring

**CI/CD:** GitHub Actions
**Coverage:** V8 provider reports
**Bundle Size:** Tracked in CI
**E2E:** Playwright dashboard

## Known Limitations

### MVP Scope

**Single-User Only:**
- No multi-user household support
- No shared inventories
- No collaboration features

**Local-Only Data:**
- No cloud sync
- No backup/restore
- Data loss on browser clear

**No Authentication:**
- No user accounts
- No access control
- No privacy settings

### Technical Limitations

**Mobile Browsers Only:**
- PWA requires mobile browser
- Camera API limitations on desktop
- Touch-optimized UI

**No Native Apps:**
- No iOS/Android native apps
- No app store distribution
- Limited offline capabilities

**Client-Side OCR:**
- API calls from client
- API keys exposed in client
- Rate limiting by provider

**Storage Limits:**
- IndexedDB quotas vary by browser
- Large receipt images may hit limits
- No automatic cleanup of old data

### Future Enhancements

**Planned Features:**
- Multi-user household support
- Cloud sync and backup
- Native mobile apps (React Native)
- Quantity-based tracking
- Price tracking and history
- Recipe integration
- Barcode scanning
- Expiration date tracking

**Technical Improvements:**
- Bundle size optimization
- Route-based code splitting
- Server-side OCR processing
- IndexedDB cleanup service
- Background sync improvements

## Component Reference

### Key Component APIs

#### ProductCard
```typescript
interface ProductCardProps {
  product: Product;
  onStockLevelCycle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}
```
**Location:** `src/features/inventory/components/ProductCard.tsx`

#### ShoppingList
```typescript
interface ShoppingListProps {
  items: Product[];
  isShoppingMode: boolean;
  onCheckItem: (id: string) => void;
  onUncheckItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
}
```
**Location:** `src/features/shopping/components/ShoppingList.tsx`

#### ReceiptScanner
```typescript
interface ReceiptScannerProps {
  onScanComplete: (result: OCRResult) => void;
  onError: (error: Error) => void;
}
```
**Location:** `src/features/receipt/components/ReceiptScanner.tsx`

## Service API Reference

### InventoryService

```typescript
class InventoryService {
  private static instance: InventoryService;

  static getInstance(): InventoryService;

  // Product CRUD
  async getAllProducts(): Promise<Product[]>;
  async getProductById(id: string): Promise<Product | undefined>;
  async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>;
  async updateProduct(id: string, updates: Partial<Product>): Promise<void>;
  async deleteProduct(id: string): Promise<void>;

  // Stock Management
  async cycleStockLevel(productId: string): Promise<Product>;
  async getProductsByStockLevel(level: StockLevel): Promise<Product[]>;

  // Search
  async searchProducts(query: string): Promise<Product[]>;

  // Bulk Operations
  async replenishFromReceipt(updates: ProductUpdate[]): Promise<void>;
}
```
**Location:** `src/services/inventory.ts`

### ShoppingService

```typescript
class ShoppingService {
  private static instance: ShoppingService;

  static getInstance(): ShoppingService;

  // List Management
  async getShoppingList(): Promise<Product[]>;
  async addToShoppingList(productId: string): Promise<void>;
  async removeFromShoppingList(productId: string): Promise<void>;

  // Shopping Mode
  async toggleShoppingMode(): Promise<void>;
  async checkItem(productId: string): Promise<void>;
  async uncheckItem(productId: string): Promise<void>;

  // Progress
  async getShoppingProgress(): Promise<{total: number, checked: number}>;
  async completeShopping(): Promise<void>;
}
```
**Location:** `src/services/shopping.ts`

### OCRService

```typescript
class OCRService {
  private static instance: OCRService;

  static getInstance(): OCRService;

  // OCR Processing
  async processReceipt(imageData: string): Promise<OCRResult>;
  async processPendingReceipts(): Promise<void>;

  // Queue Management
  async queuePendingReceipt(imageData: string): Promise<void>;
  async clearPendingReceipts(): Promise<void>;

  // Provider Management
  private getAvailableProvider(): OCRProvider;
  private matchProductsToInventory(items: ReceiptItem[]): Promise<ProductUpdate[]>;
}
```
**Location:** `src/services/ocr/ocr.service.ts`

## Appendix

### File Organization Best Practices

**Feature Structure:**
```
feature-name/
├── context/          # State management
├── components/       # Feature components
├── hooks/           # Custom hooks
├── services/        # Business logic
├── types/           # TypeScript types
└── index.ts         # Public API
```

**Import Conventions:**
```typescript
// Good: Feature imports
import { useInventory } from '@/features/inventory';

// Good: Shared imports
import { Button } from '@/components/shared';

// Bad: Deep imports
import { InventoryContext } from '@/features/inventory/context/InventoryContext';
```

### TypeScript Patterns

**Type Exports:**
```typescript
// types.ts
export interface Product {
  id: string;
  name: string;
  stockLevel: StockLevel;
}

export type StockLevel = 'high' | 'medium' | 'low' | 'empty';
```

**Generic Utilities:**
```typescript
export function createResult<T, E>(
  data: T,
  error?: E
): Result<T, E> {
  return { data, error };
}
```

### Testing Patterns

**Component Testing:**
```typescript
describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Milk',
    stockLevel: 'high'
  };

  it('renders product name', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Milk')).toBeInTheDocument();
  });
});
```

**Service Testing:**
```typescript
describe('InventoryService', () => {
  let service: InventoryService;
  let mockDB: Dexie;

  beforeEach(() => {
    mockDB = createFakeDB();
    service = new InventoryService(mockDB);
  });

  it('creates product with ID', async () => {
    const product = await service.createProduct({
      name: 'Milk',
      stockLevel: 'high'
    });
    expect(product.id).toBeDefined();
  });
});
```

---

**Document Version:** 1.0.0
**Last Updated:** 2025-03-19
**Maintained By:** Development Team
**Feedback:** Create issue or PR for corrections
