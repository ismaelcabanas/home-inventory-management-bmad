# OCR Providers

This directory contains pluggable OCR providers for receipt text extraction. Each provider implements the `IOCRProvider` interface, making it easy to swap between different OCR engines.

## Available Providers

| Provider | Description | Status | Offline | Accuracy |
|----------|-------------|--------|---------|----------|
| **Tesseract.js** | Browser-based OCR using Tesseract.js library | ✅ Active | ✅ Yes | ~70-85% |
| **LLM API** | LLM-based OCR (Claude, GPT-4V, etc.) | 🚧 Placeholder | ❌ No | ~90-98% |

## How to Add a New Provider

### 1. Create the Provider Class

```typescript
// src/services/ocr/providers/MyProvider.ts
import type { IOCRProvider, OCRProviderOptions, OCRProviderResult } from './types';

export class MyProvider implements IOCRProvider {
  readonly name = 'my-provider';

  async process(imageDataUrl: string, options: OCRProviderOptions = {}): Promise<OCRProviderResult> {
    // Your OCR implementation here
    const startTime = performance.now();

    // Call your OCR service/API
    const rawText = await this.callMyOCRService(imageDataUrl, options);

    return {
      rawText,
      provider: this.name,
      processingTimeMs: performance.now() - startTime,
      confidence: 0.9, // if available
    };
  }

  async isAvailable(): Promise<boolean> {
    // Check if API key is configured, network is available, etc.
    return true;
  }

  private async callMyOCRService(image: string, options: OCRProviderOptions): Promise<string> {
    // Your implementation
    return 'extracted text';
  }
}
```

### 2. Export the Provider

```typescript
// src/services/ocr/providers/index.ts
export * from './MyProvider';
```

### 3. Use the New Provider

```typescript
import { ocrService } from '@/services/ocr';
import { myProvider } from '@/services/ocr/providers/MyProvider';

// Option 1: Set globally
ocrService.setOCRProvider(myProvider);

// Option 2: Use at runtime based on conditions
const provider = userHasNetwork ? llmProvider : tesseractProvider;
ocrService.setOCRProvider(provider);
```

## LLM Provider Implementation Example

For LLM-based OCR (higher accuracy), you would implement:

```typescript
async process(imageDataUrl: string, options: LLMProviderOptions = {}): Promise<OCRProviderResult> {
  const { apiKey, model = 'claude-3-opus-20240229' } = options;

  // Call Claude/GPT-4 Vision API
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: [{
          type: 'image',
          source: { type: 'base64', data: imageDataUrl.split(',')[1] }
        }, {
          type: 'text',
          text: `Extract all product names from this receipt image.
          Return JSON: { products: [{name: string, quantity: string, price: string}], rawText: string }`
        }]
      }]
    })
  });

  const result = await response.json();
  const parsed = JSON.parse(result.content[0].text);

  return {
    rawText: parsed.rawText,
    provider: this.name,
    processingTimeMs: 0,
    confidence: 0.95,
  };
}
```

## Provider Selection Strategy

You can implement smart provider selection:

```typescript
// Auto-select based on availability
const selectProvider = () => {
  if (await llmProvider.isAvailable()) {
    return llmProvider; // Higher accuracy
  }
  return tesseractProvider; // Fallback to free option
};

ocrService.setOCRProvider(await selectProvider());
```

## Testing Providers

Each provider should have tests:

```typescript
// src/services/ocr/providers/MyProvider.test.ts
import { describe, it, expect } from 'vitest';
import { MyProvider } from './MyProvider';

describe('MyProvider', () => {
  it('should extract text from receipt image', async () => {
    const provider = new MyProvider();
    const result = await provider.process('data:image/jpeg;base64,...');

    expect(result.rawText).toBeTruthy();
    expect(result.provider).toBe('my-provider');
  });

  it('should check availability', async () => {
    const provider = new MyProvider();
    const available = await provider.isAvailable();

    expect(typeof available).toBe('boolean');
  });
});
```
