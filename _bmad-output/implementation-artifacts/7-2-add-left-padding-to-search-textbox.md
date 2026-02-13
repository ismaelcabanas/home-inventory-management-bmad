# Story 7.2: Add Left Padding to Search Textbox

Status: ready-for-dev

## Story

As a user,
I want the search products textbox to have proper left padding,
so that it's visually balanced and easier to read.

## Acceptance Criteria

1. **Given** I am viewing the inventory page
**When** I look at the search textbox at the bottom of the content area
**Then** The search textbox has appropriate left padding (12-16px)
**And** The padding matches the edge margins used for product cards (12px from Story 7.1)
**And** The textbox is visually aligned with the rest of the page content

2. **Given** I am viewing the inventory page on a mobile device
**When** I look at the search textbox
**Then** The left padding is appropriate for mobile viewing (not too wide, not flush to edge)
**And** The padding is consistent with the 12px edge margins used throughout the page

3. **Given** I am viewing the inventory page on a desktop browser
**When** I look at the search textbox
**Then** The left padding maintains visual consistency with mobile layout
**And** The search row (search bar + FAB) is properly aligned above the bottom navigation

## Tasks / Subtasks

- [ ] Add left padding to search textbox component (AC: 1, 2, 3)
  - [ ] Locate the search TextField component in InventoryList or SearchBar
  - [ ] Add left padding using MUI sx prop: `sx={{ pl: 2 }}` or custom padding
  - [ ] Ensure padding matches 12px edge margins from Story 7.1
  - [ ] Test on mobile viewport to verify spacing is appropriate
  - [ ] Test on desktop viewport to verify consistency

- [ ] Verify visual alignment (AC: 1, 3)
  - [ ] Check that search textbox aligns with product card edges
  - [ ] Confirm search row positioning above bottom navigation is maintained
  - [ ] Ensure no horizontal layout shifts or overflow issues

- [ ] Write/update tests (AC: 1, 2, 3)
  - [ ] Add visual regression test or E2E test to verify padding is applied
  - [ ] Ensure existing search functionality still works correctly

## Dev Notes

### Architecture Patterns and Constraints

**From Architecture Document:**
- **MUI Component Strategy**: Use MUI components directly with sx prop for custom styling
- **Component Location**: `src/features/inventory/components/` (feature-based folder structure)
- **Styling System**: MUI v7 with Emotion styling, use sx prop for custom styles

**From Story 7.1 Context:**
- Product cards use 12px edge margins: `padding: 12px` or `sx={{ px: 1.5 }}`
- Search bar is positioned in a row above bottom navigation with `position: sticky; bottom: 56px`
- Search row contains: search bar (~70% width) + Add FAB (48x48px on right)

**Technical Implementation:**
- This is a CSS-only change, no logic modifications required
- Target the MUI TextField used for search functionality
- Use `sx={{ pl: 2 }}` for MUI spacing (2 = 16px) or `sx={{ pl: '12px' }}` for exact match
- Alternatively, use className with custom CSS if needed

### Source Tree Components to Touch

**Primary File:**
- `src/features/inventory/components/InventoryList.tsx` - If search is embedded here
- OR `src/features/inventory/components/SearchBar.tsx` - If search is a separate component
- OR `src/features/inventory/index.tsx` - If search is at feature level

**Find the search TextField** (likely pattern):
```tsx
<TextField
  placeholder="Search products..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  // Add sx prop here
  sx={{ pl: 2 }}  // <-- This is what we're adding
/>
```

### Testing Standards

**From Architecture Document:**
- Vitest for unit/integration tests
- Playwright for E2E tests
- Co-locate test files with source files

**Test Approach:**
1. Visual regression: Verify search textbox has left padding
2. E2E: Confirm search functionality still works after padding change
3. Test on both mobile and desktop viewports

### Project Structure Notes

**Alignment:** This story follows the established feature-based structure:
- Location: `src/features/inventory/`
- Naming: camelCase for components, PascalCase for files
- Absolute imports with @/ alias

**No Conflicts:** Pure styling change, no structural variances needed.

### References

- **Epic 7, Story 7.1**: Redesign Inventory Page Layout and Navigation - established 12px edge margins and search/FAB row positioning
- **Architecture Document**: MUI Component Strategy, Styling System
- **UX Design Specification**: NFR8 - Accessibility (sufficient contrast ratios), NFR8.1 - Touch targets minimum 44x44 points

## Dev Agent Record

### Agent Model Used

claude-opus-4-5-20251101

### Debug Log References

None (story not yet implemented)

### Completion Notes List

Story created via correct-course workflow to address user feedback about search textbox lacking left padding.

### File List

(Expected files to be modified during implementation):
- `src/features/inventory/components/InventoryList.tsx` (or SearchBar.tsx)
- `src/features/inventory/components/InventoryList.test.tsx` (test updates)

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-02-13 | Story created via correct-course workflow | Isma |
