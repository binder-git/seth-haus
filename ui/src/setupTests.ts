// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Mock environment variables
const envMock = {
  VITE_COMMERCE_LAYER_CLIENT_ID: 'test-client-id',
  VITE_COMMERCE_LAYER_CLIENT_SECRET: 'test-client-secret',
  VITE_COMMERCE_LAYER_BASE_URL: 'https://test.api.commercelayer.io',
  VITE_COMMERCE_LAYER_AUTH_URL: 'https://test.auth.commercelayer.io/oauth/token',
};

// Mock import.meta.env
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: envMock,
    },
  },
  configurable: true,
});

// Mock window.localStorage
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock the brain module
jest.mock('brain', () => ({
  __esModule: true,
  default: {
    get_commerce_layer_products: jest.fn(),
    get_product_details: jest.fn(),
  },
}));

// Mock the sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}));
