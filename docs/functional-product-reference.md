# Functional Product Reference
## Home Inventory Management App

**Document Version:** 1.0
**Last Updated:** March 2025
**Product Status:** MVP Complete
**Target Audience:** Product Managers, Stakeholders

---

## Executive Summary

Home Inventory Management is a mobile Progressive Web App (PWA) that eliminates the weekly burden of shopping list creation through intelligent automation. The app tracks household product stock levels, automatically generates shopping lists when items run low, and uses AI-powered receipt scanning to update inventory after shopping trips.

**Target Users:** Busy families and individuals (ages 25-55) who manage weekly household shopping and want to reduce the mental load of inventory tracking.

**Core Value Proposition:** Stop manually checking your fridge and pantry before shopping. The app knows what you need—just mark items as consumed during the week, check the auto-generated shopping list, and scan your receipt to update everything automatically.

**Current Status:** MVP development complete with all 35 stories implemented across 9 epics. Ready for household validation and friends testing phase.

---

## Product Overview

### Problem Solved

Every household faces the same weekly burden: manually checking what's in the fridge and pantry, creating a shopping list, and then tracking purchases to avoid buying duplicates or forgetting essentials. This repetitive process:
- Consumes 20+ minutes per week
- Creates mental load throughout the week
- Results in wasted money (duplicate purchases) or inconvenience (forgotten items)

### Solution

An automated inventory-to-shopping cycle with minimal manual intervention:
1. **Mark consumed** (quick tap when you use something)
2. **Auto-generates shopping list** (items appear automatically when low)
3. **Shop efficiently** (check off items while in-store)
4. **Scan receipt** (AI automatically updates your inventory)

The system handles the mental load of tracking what you have and what you need.

### Target Audience

**Primary Users:**
- Age 25-55
- Manage household grocery shopping
- Weekly shopping trips at 1-2 regular supermarkets
- Frustrated by repetitive manual inventory management
- Basic smartphone proficiency

**Usage Context:**
- At home: Quick marking of consumed items
- In-store: Checking off items while shopping
- Post-shopping: Receipt capture for automatic inventory updates

### Key Differentiators

1. **Receipt OCR as Primary Inventory Engine** – Unlike apps that treat receipt scanning as supplementary, this app makes scanning THE primary method of inventory updates. Manual entry exists only for initial setup.

2. **True Automatic Shopping List Generation** – The list creates itself based on stock levels. No manual "add to list" workflow. Users consume the list but never create it.

3. **Radical Simplicity** – 4-state stock tracking (High/Medium/Low/Empty) instead of quantities. Focus on essential use case, not feature bloat.

### Platform

**Mobile-First PWA** (Progressive Web App)
- Runs in iOS and Android browsers
- Installable on home screen
- Works offline for core features
- Camera access for receipt scanning
- Local data storage (no cloud sync required in MVP)

---

## Feature Reference

### 3.1 Inventory Management

**Purpose:** Track all household products and their current stock levels.

**Capabilities:**
- **View all products** – See complete inventory list at a glance
- **Add products** – Manual entry via text input (used for initial setup)
- **Edit product names** – Fix typos or update descriptions
- **Delete products** – Remove items no longer tracked
- **Search products** – Quick filter when inventory grows large

**Stock Level Tracking** (Core Feature)
The app uses a 4-state stock system instead of quantities:

| State | Color | Meaning | Next State |
|-------|-------|---------|------------|
| **High** | Green | Fully stocked | Medium |
| **Medium** | Yellow | Getting low | Low |
| **Low** | Orange | Needs soon | Empty |
| **Empty** | Red | Buy now | High (after purchase) |

**User Interaction:**
- Single tap on any product card cycles to next stock level
- Immediate visual feedback with color change
- <1 second response time
- Change persists automatically

**Visual Design:**
- Full-width cards with gradient backgrounds
- Color-coded left border indicating stock level
- Product name and stock status text
- 3-dot menu (⋮) for Edit/Delete actions

**Location:** Home screen (`/`), accessible via bottom navigation

---

### 3.2 Shopping List

**Purpose:** Automatically show what needs to be purchased—no manual list creation required.

**Automatic List Generation** (Key Feature)
- Items **automatically appear** on shopping list when marked as Low or Empty
- Items **automatically disappear** when replenished to High
- Zero manual "add to list" actions required
- Updates happen in real-time (<2 seconds)

**Manual Safety Nets** (Override Options)
- **Add to list manually** – For items you want to buy despite having Medium/High stock
- **Remove from list** – For items you decide not to buy despite being Low/Empty
- Manual overrides persist across app restarts

**View Features:**
- Count badge showing total items on list
- Empty state message when list is clear
- Each item shows product name and current stock level
- Color-coded backgrounds match inventory visual design

**Location:** Shopping List screen (`/shopping`), accessible via bottom navigation

---

### 3.3 Shopping Mode

**Purpose:** Guide users through the in-store shopping experience with clear states and progress tracking.

**Two Modes of Operation:**

1. **Planning Mode** (Default)
   - View shopping list
   - Add/remove items manually
   - Prepare for shopping trip
   - Prominent "Start Shopping" button

2. **Shopping Mode** (Active In-Store)
   - Header changes to "🛒 Shopping Mode"
   - Visual state change (background/accent color)
   - Larger touch targets for one-handed operation
   - Progress indicator becomes more prominent
   - Clear exit button (✕) in header

**Shopping Mode Features:**
- **Check off items** – Tap checkbox to mark as collected
- **Progress tracking** – "X of Y items collected" counter
- **Visual feedback** – Strikethrough or dimming on checked items
- **Unmark capability** – Tap again to uncheck if removed from cart
- **One-handed operation** – Large touch targets (44x44px minimum)

**Completion Dialog:**
- User-initiated via "End Shopping" button
- Shows summary: "You collected 10 of 12 items"
- Helpful messaging for partial shopping: "Items not collected will stay on your list"
- Celebratory message when all items found: "Great job! You got everything! 🎉"
- Two options: "Yes, I'm done" / "No, continue shopping"

**Post-Shopping Prompt:**
After confirming shopping completion, users see:
- "Scan Receipt?" modal
- Clear messaging: "Update your inventory automatically"
- Primary CTA: "Scan Receipt" button
- Secondary action: "I'll do it later"

**Location:** Shopping List screen (`/shopping`)

---

### 3.4 Receipt Scanning

**Purpose:** Automatically extract purchased products from receipt photos and update inventory without manual entry.

**Capture Flow:**
1. **Camera Launch** – Tap "Scan Receipt" button
2. **Permission Request** – First-time camera access prompt
3. **Guided Capture** – Rectangle overlay shows positioning
4. **Real-time Feedback** – "Position receipt in frame", "Good lighting ✓", "Hold steady"
5. **Photo Confirmation** – Preview with "Use This Photo" / "Retake" options

**OCR Processing** (AI-Powered)
- Uses LLM API with vision capabilities (e.g., GPT-4o mini)
- Processes receipt image to extract product names
- Target accuracy: 98%+ product recognition
- Processing time: <5 seconds for standard receipts
- Progress indicator during processing

**Offline Support:**
- Detects offline status automatically
- Saves receipt photos to pending queue when offline
- Processes all pending receipts when connection restored
- "Pending receipts" counter/badge shows queued items

**Error Handling:**
- Clear error messages for API failures
- API quota handling with friendly messaging
- "Try Again" option without losing receipt photo
- Receipt photos discarded after processing (not stored)

**Location:** Receipt Scanner screen (`/scan`), accessible via:
- Post-shopping prompt (primary flow)
- Shopping List SpeedDial (ad-hoc access)
- Direct URL navigation

---

### 3.5 Inventory Updates (Post-Shopping)

**Purpose:** Complete the automation loop by updating inventory from scanned receipts.

**Review & Validation Screen:**
After OCR processing completes, users see:
- **Summary header** – "12 of 14 products recognized"
- **Product list** – All recognized items with confidence indicators
- **High-confidence items** – Checkmark icon, no action needed
- **Needs-review items** – Warning icon, tap to edit
- **Add Product button** – For items OCR missed
- **Remove icon** – Delete incorrectly recognized items

**Edit Capabilities:**
- **Tap-to-edit** – Quick correction of misrecognized names
- **Add missing products** – Manual entry for OCR misses
- **Remove incorrect items** – Delete false positives
- **Single-screen review** – All corrections on one page

**Inventory Update Actions:**
When user taps "Confirm & Update Inventory":

1. **Existing products** – Stock level updated to "High"
2. **New products** – Added to inventory with "High" stock
3. **Shopping list** – Purchased items automatically removed
4. **Confirmation** – Success message: "Inventory updated! 12 products replenished"

**Data Persistence:**
- All updates persist reliably across app restarts
- Zero data loss guarantee
- Database transactions ensure consistency
- Changes visible immediately in inventory and shopping list

**Location:** Part of receipt scanning flow (`/scan`)

---

## User Journeys

### Journey 1: First-Time Setup

**Scenario:** New user downloads app and prepares for first shopping cycle.

**Steps:**
1. **Add products manually** (10-15 minutes)
   - Enter common household items (milk, bread, eggs, etc.)
   - All items start at "High" stock level
2. **Set initial stock levels**
   - Tap items to adjust to current state (Medium/Low/Empty)
   - Watch shopping list auto-generate as items marked Low/Empty
3. **Ready to shop**
   - Shopping list shows items needing purchase
   - First automated cycle ready to begin

**Time Investment:** ~15 minutes one-time setup

**Outcome:** Complete inventory database, ready for automation

---

### Journey 2: Weekly Usage (Primary Flow)

**Scenario:** Standard weekly shopping cycle—the app's core use case.

**Steps:**

**During the Week:**
1. **Mark items consumed** (ongoing)
   - Finish the milk → Tap milk card to "Low"
   - Partner uses last of bread → Tap bread card to "Empty"
   - Each tap takes <1 second
   - Items automatically appear on shopping list

**Pre-Shopping:**
2. **Review shopping list**
   - Open Shopping List tab
   - See all Low/Empty items gathered automatically
   - No manual list creation needed
   - Optional: Add/remove items manually if needed

**In-Store:**
3. **Start Shopping Mode**
   - Tap "Start Shopping" button
   - Visual state change indicates active shopping
   - Progress indicator shows "0 of Y items"

4. **Check off items while shopping**
   - Tap checkbox as each item goes in cart
   - Watch progress update: "5 of 12 items collected"
   - One-handed operation optimized
   - Uncheck if item removed from cart

**Post-Shopping:**
5. **Complete shopping**
   - Tap "End Shopping" when done
   - See summary: "You collected 10 of 12 items"
   - Confirm "Yes, I'm done"

6. **Scan receipt** (prompted automatically)
   - Tap "Scan Receipt" in completion modal
   - Capture receipt photo with camera
   - Wait <5 seconds for AI processing
   - Review recognized products (correct if needed)

7. **Inventory updates automatically**
   - All purchased items → "High" stock
   - New products added to inventory
   - Shopping list clears purchased items
   - Confirmation: "Inventory updated! 12 products replenished"

**Outcome:** Complete weekly cycle with zero manual inventory management

**Time Savings:** ~20 minutes per week vs. manual methods

---

### Journey 3: Alternative Flows

**Scan Receipt Anytime**
- Access scanner from Shopping List SpeedDial
- Use when forgot to scan immediately after shopping
- No shopping mode requirement
- Same full OCR and review flow

**Defer Receipt Scanning**
- Tap "I'll do it later" in post-shopping prompt
- Shopping list remains in current state
- Scan later via SpeedDial when convenient
- Inventory updates when scan completed

**Manual Overrides**
- Add item to list despite Medium/High stock (special occasion)
- Remove item from list despite Low/Empty stock (decided not to buy)
- Overrides persist until stock level changes

**Mid-Week Shopping**
- App doesn't assume weekly schedule
- Works for any shopping pattern
- Mark items consumed → list updates → shop → scan
- Handles irregular usage gracefully

---

## Current Scope

### Included in MVP ✅

**Core Functionality:**
- ✅ Single-user, single-device
- ✅ Local storage (IndexedDB)
- ✅ 4-state stock tracking (High/Medium/Low/Empty)
- ✅ Automatic shopping list generation
- ✅ Receipt OCR with AI (LLM-based)
- ✅ Offline support for receipt capture
- ✅ Mobile-optimized PWA (iOS/Android browsers)
- ✅ Camera integration for receipt scanning
- ✅ Event-driven state synchronization
- ✅ Complete shopping lifecycle (planning → shopping → scanning)

**User Experience:**
- ✅ Planning Mode vs. Shopping Mode
- ✅ Progress tracking while shopping
- ✅ User-initiated shopping completion
- ✅ Post-shopping receipt scan prompt
- ✅ Ad-hoc receipt scanning access
- ✅ Tap-to-cycle stock levels
- ✅ Visual stock indicators with gradients
- ✅ Manual list management (add/remove overrides)

**Technical:**
- ✅ React 19 + TypeScript 5
- ✅ Material UI v7 components
- ✅ Vite + PWA configuration
- ✅ Vitest unit tests + Playwright E2E tests
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ Vercel deployment with HTTPS

**Total Implementation:** 35 stories across 9 epics, all complete

---

### Future (Not Implemented) ❌

**Version 2.0 - Smart Inventory:**
- ❌ Multi-user household accounts with cloud sync
- ❌ Quantity-based tracking with units
- ❌ Product categories and list organization
- ❌ Enhanced inventory management (favorites, custom thresholds)

**Version 3.0 - Price Intelligence:**
- ❌ Price extraction and tracking from receipts
- ❌ Historical price trends
- ❌ Multi-store price comparison
- ❌ Budget tracking and savings recommendations

**Version 4.0 - Smart Shopping Assistant:**
- ❌ Barcode scanning for product entry
- ❌ Recipe and meal planning integration
- ❌ Store route optimization
- ❌ Predictive restocking based on consumption patterns

**Platform Features:**
- ❌ Native iOS/Android apps (PWA-only for MVP)
- ❌ Cloud sync or backup
- ❌ User accounts and authentication
- ❌ Multi-store support (MVP optimized for 1-2 stores)

---

## Success Metrics

From the PRD, success is measured by user behavior and experience quality:

### User Success Indicators

**The Ultimate Measure: Complete Trust**
- ✅ Users stop manually checking fridge/pantry before shopping
- ✅ Complete trust in auto-generated shopping list
- ✅ Zero mental backup plans—"just check the app"

**Behavioral Changes:**
- ✅ Zero manual inventory checks before shopping trips
- ✅ Automatic workflow adoption (mark → list → shop → scan)
- ✅ Complete weekly cycles for 4+ consecutive weeks
- ✅ 100% of shopping trips rely solely on auto-generated list

**The "Aha!" Moment:**
When user realizes they went through an entire week (or multiple weeks) without manually creating a shopping list or checking what they have. The system just worked automatically.

### Technical Success Indicators

**OCR Accuracy:**
- ✅ 95%+ correct product name recognition on receipts
- ✅ 98%+ accuracy target with LLM-based OCR
- ✅ Successful product matching to existing inventory

**Performance:**
- ✅ All actions complete in <2 seconds
- ✅ Receipt OCR processing <5 seconds
- ✅ App launches to usable state in <2 seconds

**Reliability:**
- ✅ Zero crashes during core workflows
- ✅ Zero data loss across operations
- ✅ Graceful error handling

### Validation Phase

**Phase 1 (Current):** Household + Friends Validation
- 3 months of personal household use
- Friends testing for cross-household proof
- OCR accuracy tracking
- Trust milestone achievement

**Phase 2 (Future):** Public Release
- App store submission
- GitHub repository publication
- Portfolio case study
- Public availability

**Explicitly NOT Success Metrics:**
- User adoption numbers or growth
- Community engagement or contributions
- Revenue or monetization
- Active user counts beyond personal use

---

## Navigation Structure

### Primary Navigation (Bottom Tabs)

The app uses a **2-tab bottom navigation** system:

| Tab | Route | Icon | Purpose |
|-----|-------|------|---------|
| **Inventory** | `/` | 🏠 | View all products, manage stock levels |
| **Shopping** | `/shopping` | 🛒 | View shopping list, shopping mode, scan receipt |

### Secondary Actions

**Shopping List SpeedDial** (⋮ menu):
- ➕ **Add Products** – Manually add items to shopping list
- 🛒 **Start/End Shopping Mode** – Toggle shopping mode
- 📸 **Scan Receipt** – Ad-hoc receipt scanning access

### Product Actions

**Inventory Card Actions** (3-dot ⋮ menu):
- **Edit** – Change product name
- **Delete** – Remove product from inventory

**Shopping List Item Actions** (3-dot ⋮ menu):
- **Remove from list** – Manual override to remove item

### Navigation Patterns

- **Tap product card** – Cycle stock level (Inventory screen)
- **Tap checkbox** – Check off item while shopping (Shopping screen)
- **Bottom nav** – Switch between Inventory and Shopping
- **SpeedDial** – Access context-specific actions
- **Back button** – Browser history support throughout

### Context-Specific Routing

**Receipt Scanner** (`/scan`):
- Accessed via post-shopping prompt (primary flow)
- Accessed via Shopping List SpeedDial (ad-hoc flow)
- Not in main navigation (contextual action only)

**Mobile Optimization:**
- All navigation accessible with one hand
- Touch targets minimum 44x44 pixels
- High contrast for bright environments
- Smooth transitions between screens

---

## Technical Implementation Notes

### Data Architecture

**Local-First Design:**
- All data stored on device (IndexedDB via Dexie.js)
- No cloud dependency for core features
- Works offline for inventory and shopping list
- Receipt capture queued when offline

**Database Schema:**
```
Product {
  id: string (UUID)
  name: string
  stockLevel: 'high' | 'medium' | 'low' | 'empty'
  createdAt: Date
  updatedAt: Date
  isOnShoppingList: boolean
}
```

### State Management

**React Context API:**
- `InventoryContext` – Product data and stock levels
- `ShoppingContext` – Shopping list and checked items
- `ReceiptContext` – OCR processing state

**Event-Driven Sync:**
- Custom event bus for cross-context communication
- Instant updates without polling
- Reduced battery drain on mobile

### Service Layer

**Business Logic Abstraction:**
- `InventoryService` – Product CRUD operations
- `ShoppingService` – List management
- `OCRService` – Receipt processing and LLM integration
- Services call database directly (MVP)
- Designed for future REST API migration

### Performance Optimizations

**Code Splitting:**
- Lazy-loaded routes
- Reduced bundle size
- Faster initial load

**Event-Driven Architecture:**
- Replaced polling with event listeners
- Instant UI updates
- Zero unnecessary database queries

**Mobile Optimization:**
- Efficient rendering
- Minimal battery impact
- Smooth scrolling and animations

---

## Usage Guidelines

### For Product Managers

**This Document Helps With:**
- Understanding what the app currently does
- Planning future feature development
- Communicating with stakeholders
- Onboarding new team members
- Making prioritization decisions

**Key Points to Remember:**
- MVP scope is intentionally limited (radical simplicity)
- Receipt OCR is THE primary inventory update mechanism
- Automatic list generation is THE core value proposition
- Manual entry/overrides are safety nets, not primary flows
- Future versions depend on Phase 1 validation success

**When Considering New Features:**
- Does it support the core automation loop?
- Does it maintain simplicity or add complexity?
- Does it require multi-user/cloud (Phase 2+ only)?
- Does it fit the 4-state stock model or require quantities?

### For Stakeholders

**What Users Experience:**
1. Setup: Add products once (~15 min)
2. Weekly: Mark consumed items (<1 min total)
3. Shop: Check auto-generated list, check off items
4. Post-shop: Scan receipt, inventory updates automatically

**What Makes This Different:**
- No manual list creation ever
- No quantity tracking (simple 4-state system)
- Receipt scanning is primary, not supplementary
- Designed for single-device household use
- Mobile-first PWA (no app store install required)

**Current Limitations:**
- Single user only (no household sharing)
- No cloud backup (local data only)
- No price tracking or budgeting
- No categories or advanced organization
- iOS/Android browsers only (not native apps)

**Next Steps:**
- Phase 1 validation (3 months household + friends testing)
- Success decision: proceed to Phase 2 or stop
- Phase 2: Public release, portfolio demonstration

---

## Document History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | March 2025 | Initial creation based on MVP completion (35 stories, 9 epics) | System |

---

## Related Documents

- **PRD:** `_bmad-output/planning-artifacts/prd.md` – Full product requirements
- **Epics:** `_bmad-output/planning-artifacts/epics.md` – Complete story breakdown
- **Technical Debt:** `docs/technical-debt.md` – Known technical issues and improvements
- **Architecture:** `_bmad-output/planning-artifacts/architecture.md` – Technical architecture decisions

---

*End of Functional Product Reference*
