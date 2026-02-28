# Story 8.1: Event-Driven Synchronization to Replace Polling

Status: review

## Story

As a **system architect/developer**,
I want **to replace the polling mechanism between Inventory and Shopping contexts with event-driven synchronization**,
so that **the application eliminates unnecessary database queries, reduces battery drain on mobile devices, and provides instant UI updates when stock levels change**.

## Context & Rationale

**Current State (Tech Debt #10):**
The ShoppingList component polls the database every 5 seconds to detect stock level changes from the InventoryContext. This was implemented as a temporary solution in Story 3.1.

**Current Implementation Location:**
- `src/features/shopping/components/ShoppingList.tsx:22-33`

**Problems:**
1. **Unnecessary queries** - Database polled every 5 seconds even when data unchanged
2. **Battery drain** - Constant background activity on mobile devices
3. **Reactive lag** - Up to 5-second delay before UI updates
4. **Scalability** - Pattern doesn't scale with more features (Epic 4-6)
5. **Not event-driven** - React/modern web pattern is event-based, not polling

**Referenced In:**
- `docs/technical-debt.md` - Issue #10

## Acceptance Criteria

1. **Given** the ShoppingList component is mounted
   **When** a product's stock level changes in InventoryContext
   **Then** the ShoppingList updates within <1 second (no 5-second lag)

2. **Given** the application is idle on a mobile device
   **When** no stock level changes occur
   **Then** zero database queries are made (no polling)

3. **Given** a user changes stock level from High to Low in Inventory
   **When** the change is persisted
   **Then** the ShoppingList immediately adds the product (if not already there)

4. **Given** a user changes stock level from Low to High in Inventory
   **When** the change is persisted
   **Then** the ShoppingList immediately removes the product

5. **Given** the application is running
   **When** I inspect the network/database activity
   **Then** no polling intervals are found

6. **Given** multiple rapid stock level changes occur
   **When** events are emitted
   **Then** all events are handled correctly without race conditions

7. **Given** the ShoppingList component unmounts
   **When** cleanup occurs
   **Then** event listeners are properly removed (no memory leaks)

8. **Given** the count badge displays shopping list size
   **When** stock level changes affect the list
   **Then** the badge updates instantly

## Tasks / Subtasks

- [x] **Task 1: Create Event Bus Utility** (AC: #1, #5, #6)
  - [x] 1.1 Create `src/utils/eventBus.ts` with EventEmitter class
  - [x] 1.2 Implement `on(event, callback)` method
  - [x] 1.3 Implement `off(event, callback)` method
  - [x] 1.4 Implement `emit(event, data)` method
  - [x] 1.5 Export singleton `eventBus` instance
  - [x] 1.6 Add TypeScript types for event names and data

- [x] **Task 2: Emit Events from InventoryContext** (AC: #2, #3, #4)
  - [x] 2.1 Import eventBus in InventoryContext
  - [x] 2.2 Emit event after successful `updateProduct()` call
  - [x] 2.3 Define event name: `'inventory:product:updated'`
  - [x] 2.4 Include `{ id, updates }` in event payload
  - [x] 2.5 Remove polling interval from ShoppingList component

- [x] **Task 3: Listen for Events in ShoppingList** (AC: #1, #3, #4, #8)
  - [x] 3.1 Import eventBus in ShoppingList component
  - [x] 3.2 Set up event listener in `useEffect`
  - [x] 3.3 Call `loadShoppingList()` on event
  - [x] 3.4 Clean up listener on component unmount
  - [x] 3.5 Remove `setInterval` polling code

- [x] **Task 4: Add Tests** (AC: #1, #6, #7)
  - [x] 4.1 Test EventBus class (on, off, emit)
  - [x] 4.2 Test InventoryContext emits events on update
  - [x] 4.3 Test ShoppingList updates on event
  - [x] 4.4 Test cleanup prevents memory leaks
  - [x] 4.5 Test multiple rapid events are handled

- [x] **Task 5: Update Documentation** (AC: #5)
  - [x] 5.1 Update `docs/technical-debt.md` - mark Issue #10 as resolved
  - [x] 5.2 Add comment in eventBus.ts explaining event-driven pattern
  - [x] 5.3 Document event names and payloads

## Dev Notes

### Recommended Implementation: Event Emitter Pattern

**Step 1: Create Event Bus Utility**

```typescript
// src/utils/eventBus.ts
type EventCallback = (data?: any) => void;

class EventBus {
  private events: Map<string, Set<EventCallback>> = new Map();

  on(event: string, callback: EventCallback): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(callback);
  }

  off(event: string, callback: EventCallback): void {
    this.events.get(event)?.delete(callback);
  }

  emit(event: string, data?: any): void {
    this.events.get(event)?.forEach(callback => callback(data));
  }
}

export const eventBus = new EventBus();

// Event name constants for type safety
export const EVENTS = {
  INVENTORY_PRODUCT_UPDATED: 'inventory:product:updated',
} as const;
```

**Step 2: Update InventoryContext**

```typescript
// src/features/inventory/context/InventoryContext.tsx
import { eventBus, EVENTS } from '@/utils/eventBus';

const updateProduct = async (id: string, updates: Partial<Product>) => {
  // ... existing validation and logic

  try {
    dispatch({ type: 'SET_LOADING', payload: true });
    await inventoryService.updateProduct(id, updates);

    // Emit event after successful update
    eventBus.emit(EVENTS.INVENTORY_PRODUCT_UPDATED, { id, updates });

    // ... rest of existing code
  } catch (error) {
    // ... existing error handling
  }
};
```

**Step 3: Update ShoppingList Component**

```typescript
// src/features/shopping/components/ShoppingList.tsx
import { eventBus, EVENTS } from '@/utils/eventBus';

function ShoppingListContent() {
  const { loadShoppingList } = useShoppingList();

  useEffect(() => {
    // Initial load
    loadShoppingList();

    // Set up event listener
    const handleProductUpdate = () => {
      loadShoppingList();
    };

    eventBus.on(EVENTS.INVENTORY_PRODUCT_UPDATED, handleProductUpdate);

    // Cleanup
    return () => {
      eventBus.off(EVENTS.INVENTORY_PRODUCT_UPDATED, handleProductUpdate);
    };
  }, [loadShoppingList]);

  // ... rest of component
}
```

### Architecture Compliance

**Project Structure Notes:**
- Event bus follows existing utility pattern in `src/utils/`
- No new dependencies required (lightweight implementation)
- Maintains existing Context API architecture
- Consistent with service layer abstraction

**Testing Standards:**
- Unit tests for EventBus class (Vitest)
- Integration tests for context communication
- Mock eventBus for component testing
- Test memory leak prevention (cleanup)

**Performance Considerations:**
- Event listeners are lightweight (no polling overhead)
- Zero unnecessary database queries
- Instant UI updates (<1 second)
- Proper cleanup prevents memory leaks

### Files to Modify

| File | Action |
|------|--------|
| `src/utils/eventBus.ts` | CREATE - New event bus utility |
| `src/features/inventory/context/InventoryContext.tsx` | MODIFY - Add event emission |
| `src/features/shopping/components/ShoppingList.tsx` | MODIFY - Replace polling with listener |
| `src/utils/eventBus.test.ts` | CREATE - Unit tests |
| `src/features/inventory/context/InventoryContext.test.tsx` | MODIFY - Add event emission tests |
| `src/features/shopping/components/ShoppingList.test.tsx` | MODIFY - Add listener tests |
| `docs/technical-debt.md` | MODIFY - Mark Issue #10 resolved |

### Files to Reference

| File | Reference For |
|------|---------------|
| `src/features/shopping/components/ShoppingList.tsx:22-33` | Current polling implementation to remove |
| `docs/technical-debt.md:843-1003` | Tech Debt #10 full details |
| `src/features/inventory/context/InventoryContext.tsx:121-153` | updateProduct method to modify |
| `src/features/shopping/context/ShoppingContext.tsx:136-153` | loadShoppingList method called by listener |

### Alternative Approaches Considered

**Option A: Event Emitter (Recommended)**
- ✅ Lightweight, no dependencies
- ✅ Standard pattern used by Redux, Zustand
- ✅ Easy to implement and test
- ✅ Minimal code changes

**Option B: Lift State to App-Level Context**
- ❌ Major refactor (6-8 hours)
- ❌ Breaks existing patterns
- ❌ Out of scope for tech debt item

**Option C: React Query / SWR**
- ❌ Requires learning new library
- ❌ Major architectural shift
- 💡 Better as separate epic/story (future consideration)

### Testing Checklist

- [x] EventBus.on() registers callback
- [x] EventBus.off() removes callback
- [x] EventBus.emit() calls all registered callbacks
- [x] InventoryContext emits event after updateProduct()
- [x] ShoppingList calls loadShoppingList() on event
- [x] ShoppingList cleans up listener on unmount
- [x] Multiple rapid events handled correctly
- [x] No memory leaks (listeners cleaned up)
- [x] All existing tests still pass (59/59 passing)

## Dev Agent Record

### Agent Model Used

glm-4.7 (Claude Code)

### Debug Log References

None - Initial story creation

### Completion Notes List

**Implementation Summary:**
- Created EventBus utility (src/utils/eventBus.ts) with on/off/emit methods
- Added event emission in InventoryContext after successful updateProduct() calls
- Replaced polling in ShoppingList with event-driven listener
- All tests passing (59 tests: 13 EventBus, 21 InventoryContext, 25 ShoppingList)
- Technical debt Issue #10 marked as resolved in docs/technical-debt.md

**Technical Implementation:**
- Event-driven synchronization eliminates unnecessary database queries
- Zero battery drain from polling - no 5-second intervals
- Instant UI updates (<1 second) when stock levels change
- Proper cleanup on component unmount prevents memory leaks
- Scales to any number of contexts without compounding effects

### File List

**New Files:**
- `src/utils/eventBus.ts` - EventBus utility with EventEmitter class
- `src/utils/eventBus.test.ts` - Comprehensive EventBus tests (13 tests)

**Modified Files:**
- `src/features/inventory/context/InventoryContext.tsx` - Added eventBus import and emit after updateProduct
- `src/features/shopping/components/ShoppingList.tsx` - Replaced setInterval with eventBus.on/off
- `src/features/inventory/context/InventoryContext.test.tsx` - Added event emission tests (3 new tests)
- `src/features/shopping/components/ShoppingList.test.tsx` - Added event-driven tests (5 new tests)
- `docs/technical-debt.md` - Marked Issue #10 as resolved

**New Files:**
- `src/utils/eventBus.ts`
- `src/utils/eventBus.test.ts`

**Modified Files:**
- `src/features/inventory/context/InventoryContext.tsx`
- `src/features/shopping/components/ShoppingList.tsx`
- `src/features/inventory/context/InventoryContext.test.tsx`
- `src/features/shopping/components/ShoppingList.test.tsx`
- `docs/technical-debt.md`
