import { vi } from 'vitest'
import '@testing-library/jest-dom'
import 'fake-indexeddb/auto'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  get length() { return 0; },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  key: (index: number) => null,
};

global.localStorage = localStorageMock as Storage;
