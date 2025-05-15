import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import * as CommerceLayerSDK from '@commercelayer/sdk';
import { CommerceLayerProvider, useCommerceLayer } from '../CommerceLayerContext';

// Mock environment variables
const mockEnv = {
  VITE_COMMERCE_LAYER_CLIENT_ID: 'test_client_id',
  VITE_COMMERCE_LAYER_ORGANIZATION: 'test_org',
  VITE_COMMERCE_LAYER_MARKET_ID_EU: 'market:id:qjANwhQrJg',
  VITE_COMMERCE_LAYER_MARKET_ID_UK: 'market:id:vjzmJhvEDo'
};

// Mock Commerce Layer SDK
jest.mock('@commercelayer/sdk', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    accessToken: 'test_token',
    organization: 'test_org'
  }))
}));

// Declare a more precise ImportMetaEnv type
interface ImportMetaEnv {
  readonly VITE_COMMERCE_LAYER_CLIENT_ID: string;
  readonly VITE_COMMERCE_LAYER_ORGANIZATION: string;
  readonly VITE_COMMERCE_LAYER_MARKET_ID_EU: string;
  readonly VITE_COMMERCE_LAYER_MARKET_ID_UK: string;
}

// Extend global interface to allow import and its properties
declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
    readonly url: string;
    resolve(path: string): string;
    glob(pattern: string): Promise<string[]>;
  }

  interface Global {
    import: {
      meta: ImportMeta;
    };
  }
}

// Explicitly mock global environment
const mockProcess = {
  env: mockEnv
} as unknown as NodeJS.Process;

global.process = mockProcess;

// Explicitly mock import object
global.import = {
  meta: {
    env: mockEnv as ImportMetaEnv,
    url: 'mock://url',
    resolve: () => 'mock://resolved',
    glob: async () => ['mock://file']
  }
} as Global['import'];

describe('CommerceLayerContext', () => {
  const mockEuMarket = { id: 'market:id:qjANwhQrJg', name: 'EU Market', region: 'eu' as const };
  const mockUkMarket = { id: 'market:id:vjzmJhvEDo', name: 'UK Market', region: 'uk' as const };

  // Mock Commerce Layer SDK
  const mockCommerceLayerSDK = {
    accessToken: 'mock_access_token',
    organization: 'test_org'
  };

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('Initial Market Configuration', () => {
    const { result } = renderHook(() => useCommerceLayer(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <CommerceLayerProvider>{children}</CommerceLayerProvider>
      )
    });

    // Verify initial EU market configuration
    expect(result.current.currentMarket.id).toBe(mockEuMarket.id);
    expect(result.current.currentMarket.region).toBe('eu');
  });

  test('Market Switching', async () => {
    const { result } = renderHook(() => useCommerceLayer(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <CommerceLayerProvider>{children}</CommerceLayerProvider>
      )
    });

    // Switch to UK market
    await act(async () => {
      result.current.switchMarket(mockUkMarket);
    });

    // Verify market switched to UK
    expect(result.current.currentMarket.id).toBe(mockUkMarket.id);
    expect(result.current.currentMarket.region).toBe('uk');
  });

  test('Client Initialization', () => {
    const { result } = renderHook(() => useCommerceLayer(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <CommerceLayerProvider>{children}</CommerceLayerProvider>
      )
    });

    // Verify client initialization
    expect(result.current.client).toBeDefined();
  });

  test('Environment Configuration', () => {
    const requiredKeys = [
      'VITE_COMMERCE_LAYER_CLIENT_ID',
      'VITE_COMMERCE_LAYER_ORGANIZATION',
      'VITE_COMMERCE_LAYER_MARKET_ID_EU',
      'VITE_COMMERCE_LAYER_MARKET_ID_UK'
    ];

    // Validate environment variables
    requiredKeys.forEach(key => {
      expect(mockEnv).toHaveProperty(key);
      expect(mockEnv[key]).toBeTruthy();
    });
  });
});
