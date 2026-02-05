# Home Inventory Management

Automated home inventory and shopping list system with OCR receipt scanning.

## Technology Stack

- React 19.2.3
- TypeScript 5.9.3
- Vite 7.3.0
- MUI 7.3.6
- Dexie.js 4.2.1
- React Router 7.11.0
- Vitest 4.0.16
- Playwright 1.57.0

## Prerequisites

- Node.js 20.x or 22.x
- npm (included with Node.js)
- API key for LLM-based OCR receipt scanning (OpenAI OR Gemini)

## Environment Configuration

### LLM Provider Options

This app supports multiple LLM providers for receipt OCR:

| Provider | Model | Cost | Vision | Notes |
|----------|-------|------|--------|-------|
| **Gemini** | gemini-2.0-flash-exp | ✅ Free tier | ✅ Yes | **Recommended** - Generous free tier |
| **OpenAI** | gpt-4o-mini | 💰 Paid | ✅ Yes | High accuracy, requires payment setup |
| **Mock** | - | - | - | Testing only (no API calls) |

### Local Development

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Choose your provider and get an API key:
   - **Gemini (Free)**: https://aistudio.google.com/app/apikey
   - **OpenAI (Paid)**: https://platform.openai.com/api-keys

3. Configure your provider in `.env`:
   ```bash
   # Choose provider: gemini (free) or openai (paid)
   VITE_LLM_PROVIDER=gemini

   # Add your API key
   VITE_LLM_API_KEY=your-actual-api-key-here
   ```

4. **IMPORTANT**: Never commit `.env` to Git (it's in `.gitignore`)

### Deployment (Any Platform)

**⚠️ SECURITY WARNING**: Never commit API keys to Git repositories!

For any deployment platform (Vercel, Netlify, AWS, Railway, Render, etc.):

1. **DO NOT** commit your actual API key to the repository
2. Add `VITE_LLM_API_KEY` as an environment variable in your deployment platform's dashboard
3. The value should be your OpenAI API key (e.g., `sk-proj-...`)

**Platform-specific locations:**
- **Vercel**: Settings → Environment Variables
- **Netlify**: Site settings → Environment variables
- **Railway**: Variables tab
- **Render**: Environment tab
- **AWS Amplify**: App settings → Environment variables

**For CI/CD:**
- **GitHub Actions**: Settings → Secrets and variables → Actions
- **GitLab CI**: Settings → CI/CD → Variables

**Note:** Environment variables prefixed with `VITE_` are exposed to the client-side code. This is necessary for the LLM OCR feature to work in the browser.

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
