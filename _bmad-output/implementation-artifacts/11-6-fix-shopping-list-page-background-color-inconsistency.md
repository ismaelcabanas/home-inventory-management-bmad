# Story 11.6: Fix Shopping List Page Background Color Inconsistency

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want the shopping list page to have a consistent background color throughout,
so that the visual experience is polished and professional.

## Bug Description

When viewing the shopping list page, the background of items at the top is blank/white, but when scrolling down, the background becomes black. This creates an inconsistent visual experience similar to the issue fixed in Story 11.3 for the inventory page.

## Acceptance Criteria

1. **Given** I navigate to the shopping list page
   **When** The page initially loads
   **Then** The background color is consistent throughout the entire page
   **And** No color difference exists between the top and scrolled sections

2. **Given** I am on the shopping list page
   **When** I scroll down through the shopping list items
   **Then** The background color remains consistent
   **And** No sudden color changes occur (from blank to black)

3. **Given** I view the shopping list page on any device or screen size
   **When** The page renders
   **Then** The background color is uniform across all viewports
   **And** The styling matches the app's design system (dark theme consistent with other pages)

## Tasks / Subtasks

- [ ] Task 1: Investigate and identify root cause of background inconsistency (AC: 1, 2)
  - [ ] Subtask 1.1: Inspect ShoppingList component for conditional styling based on scroll
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

**Similar to Story 11.3:** This is the same issue that was fixed for the inventory page, but occurring on the shopping list page.

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
│   └── shopping-list/
│       └── components/
│           └── ShoppingList.tsx    # Main shopping list component
├── components/
│   └── shared/
│       └── Layout/
│           └── AppLayout.tsx        # Parent layout wrapper
└── theme/
    └── theme.ts                     # MUI theme configuration
```

### Implementation Guidance

**Reference Story 11.3 Fix:**
The inventory page was fixed by adding `bgcolor: 'background.default'` to the root container.

**1. Check ShoppingList component:**
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
- `background.paper`: Paper/card background color
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

- **Feature-Based Architecture:** Shopping list feature in `src/features/shopping-list/`
- **Path Aliases:** Uses `@/` alias for imports
- **Component Co-location:** Tests next to components

### Verification Steps

1. Start the app: `npm run dev`
2. Navigate to shopping list page (/shopping-list)
3. Observe background color at top of page
4. Scroll down through shopping list items
5. **BUG:** Background changes color (white → black)
6. **FIXED:** Background remains consistent throughout

### References

- **Similar Fix:** [Source: _bmad-output/implementation-artifacts/11-3-fix-inventory-page-background-color-inconsistency.md] - Inventory page fix
- [Source: src/features/shopping-list/components/ShoppingList.tsx] - Shopping list component
- [Source: src/components/shared/Layout/AppLayout.tsx] - Parent layout wrapper
- [Source: src/theme/theme.ts] - MUI theme configuration

## Dev Agent Record

### Agent Model Used

Claude (glm-4.7)

### Debug Log References

### Completion Notes List

### File List

---
