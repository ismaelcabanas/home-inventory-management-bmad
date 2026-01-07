# Home Inventory Management

Automated home inventory and shopping list system with OCR receipt scanning.

## Technology Stack

- React 19.2.3
- TypeScript 5.9.3
- Vite 7.3.0
- MUI 7.3.6
- Dexie.js 4.2.1
- Tesseract.js 7.0.0
- React Router 7.11.0
- Vitest 4.0.16
- Playwright 1.57.0

## Prerequisites

- Node.js 20.x or 22.x
- npm (included with Node.js)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm run test

# Run E2E tests
npm run test:e2e

# Build for production
npm run build
```

## Project Structure

```
src/
├── features/          # Feature-based modules
│   ├── inventory/    # Inventory management
│   ├── shopping/     # Shopping list
│   └── receipt/      # Receipt scanning
├── components/        # Shared components
├── services/          # Business logic & data access
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── theme/             # MUI theme configuration
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run E2E tests

## License

Private - All rights reserved
