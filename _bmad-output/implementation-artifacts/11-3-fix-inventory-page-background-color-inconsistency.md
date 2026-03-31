# Story 11.3: Fix Inventory Page Background Color Inconsistency

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want the inventory page to have a consistent background color throughout,
so that the visual experience is polished and professional.

## Bug Description

When viewing the inventory page, the background of products at the top is blank/white, but when scrolling down, the background becomes black. This creates an inconsistent visual experience.

## Acceptance Criteria

1. **Given** I navigate to the inventory page
   **When** The page initially loads
   **Then** The background color is consistent throughout the entire page
   **And** No color difference exists between the top and scrolled sections

2. **Given** I am on the inventory page
   **When** I scroll down through the product list
   **Then** The background color remains consistent
   **And** No sudden color changes occur (from blank to black)

3. **Given** I view the inventory page on any device or screen size
   **When** The page renders
   **Then** The background color is uniform across all viewports
   **And** The styling matches the app's design system (likely dark theme consistent with other pages)

## Tasks / Subtasks

- [ ] Task 1: Investigate and identify root cause of background inconsistency (AC: 1, 2)
  - [ ] Subtask 1.1: Inspect InventoryList component for conditional styling based on scroll
  - [ ] Subtask 1.2: Check parent container (AppLayout) for background color issues
  - [ ] Subtask 1.3: Verify MUI theme is being applied correctly

- [ ] Task 2: Fix background color consistency (AC: 1, 2, 3)
  - [ ] Subtask 2.1: Apply consistent background color to main container
  - [ ] Subtask 2.2: Ensure all child components inherit or override correctly
  - [ ] Subtask 2.3: Test on different screen sizes and scroll positions

- [ ] Task 3: Add tests and verify fix (AC: 1, 2, 3)
  - [ ] Subtask 3.1: Add visual regression test if applicable
  - [ ] Subtask 3.2: Manually test scrolling behavior
  - [ ] Subtask 3.3: Run all tests to verify no regressions

## Dev Notes

### Root Cause Analysis

**Possible Causes:**
1. **Missing background on root container:** The main Box or container may not have a bgcolor prop
2. **Transparent background defaulting to white:** Some components may have transparent backgrounds that show white (browser default)
3. **MUI Theme issue:** Dark/light theme may not be applied consistently
4. **Conditional styling:** Component may have different styles based on state or scroll position

### Architecture Patterns

- **MUI v7 Component Library:** Uses Material-UI for UI components
- **Emotion Styling System:** CSS-in-JS via sx prop
- **Responsive Design:** Uses MUI breakpoints for mobile/desktop
- **Theme System:** Custom theme defined in `src/theme/theme.ts`

### Code Structure

```
src/
├── features/
│   └── inventory/
│       └── components/
│           └── InventoryList.tsx    # Main inventory component
├── components/
│   └── shared/
│       └── Layout/
│           └── AppLayout.tsx        # Parent layout wrapper
└── theme/
    └── theme.ts                     # MUI theme configuration
```

### Implementation Guidance

**1. Check InventoryList component:**
The component likely has a Box wrapper. Ensure it has:
```tsx
<Box
  sx={{
    bgcolor: 'background.default',  // or 'background.paper'
    minHeight: '100vh',
  }}
>
  {/* content */}
</Box>
```

**2. Check AppLayout component:**
Ensure the layout wrapper applies consistent background:
```tsx
<Box
  sx={{
    bgcolor: 'background.default',
    minHeight: '100vh',
  }}
>
  {/* children */}
</Box>
```

**3. MUI Theme Background Colors:**
- `background.default`: Main background color (often dark in dark mode)
- `background.paper: Paper/card background color
- Verify theme configuration has these set correctly

**4. Common Fixes:**
- Add `bgcolor: 'background.default'` to root Box
- Ensure no `backgroundColor: 'white'` or `'transparent'` overrides
- Check for CSS in files that might override MUI styles
- Verify all nested Boxes have appropriate background inheritance

### Testing Standards

- Manual testing required for visual bugs
- Test on mobile and desktop viewports
- Test scrolling at various speeds
- Run existing unit tests to ensure no regressions

### Project Structure Notes

- **Feature-Based Architecture:** Inventory feature in `src/features/inventory/`
- **Path Aliases:** Uses `@/` alias for imports
- **Component Co-location:** Tests next to components

### Verification Steps

1. Start the app: `npm run dev`
2. Navigate to inventory page (/)
3. Observe background color at top of page
4. Scroll down through product list
5. **BUG:** Background changes color (white → black)
6. **FIXED:** Background remains consistent throughout

### References

- [Source: src/features/inventory/components/InventoryList.tsx] - Inventory list component
- [Source: src/components/shared/Layout/AppLayout.tsx] - Parent layout wrapper
- [Source: src/theme/theme.ts] - MUI theme configuration
- [Source: _bmad-output/planning-artifacts/epics.md#Story 11.3] - Original story definition

## Dev Agent Record

### Agent Model Used

Claude (glm-4.7)

### Debug Log References

### Completion Notes List

### File List

---
