
// setupTests.ts
import '@testing-library/jest-dom';
import { jest } from '@jest/globals'; // Importar explícitamente jest

// Mock Chrome API
global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
    },
  },
  action: {
    onClicked: {
        addListener: jest.fn()
    }
  },
  contextMenus: {
      create: jest.fn(),
      onClicked: {
          addListener: jest.fn()
      }
  },
  sidePanel: {
      setOptions: jest.fn(),
      open: jest.fn()
  },
  tabs: {
      create: jest.fn(),
      query: jest.fn(),
      sendMessage: jest.fn()
  },
  scripting: {
      executeScript: jest.fn()
  }
} as any;

// Mock TextDecoder/TextEncoder for Node environment (if needed by Jest JSDOM)
import { TextDecoder, TextEncoder } from 'util';
global.TextDecoder = TextDecoder as any;
global.TextEncoder = TextEncoder as any;
