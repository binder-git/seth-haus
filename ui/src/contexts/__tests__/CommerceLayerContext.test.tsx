import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import * as CommerceLayerSDK from '@commercelayer/sdk';
import { CommerceLayerProvider, useCommerceLayer } from '../CommerceLayerContext';

// Mock environment variables
const mockEnv = {
  // Commerce Layer
  COMMERCE_LAYER_CLIENT_ID: 'test_client_id',
  COMMERCE_LAYER_ORGANIZATION: 'test_org',
  COMMERCE_LAYER_MARKET_ID_EU: 'market:id:qjANwhQrJg',
  COMMERCE_LAYER_MARKET_ID_UK: 'market:id:vjzmJhvEDo',
  COMMERCE_LAYER_DOMAIN: 'test-org.commercelayer.io',
  COMMERCE_LAYER_EU_SCOPE: 'market:qjANwhQrJg',
  COMMERCE_LAYER_UK_SCOPE: 'market:vjzmJhvEDo',
  COMMERCE_LAYER_EU_SKU_LIST_ID: 'test_eu_sku_list',
  COMMERCE_LAYER_UK_SKU_LIST_ID: 'test_uk_sku_list',
  // App
  APP_TITLE: 'Test App',
  APP_ID: 'test-app',
  // API
  API_URL: 'http://localhost:3000',
  WS_API_URL: 'ws://localhost:3000'
};

// Mock Commerce Layer SDK
jest.mock('@commercelayer/sdk', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    accessToken: 'test_token',
    organization: 'test_org'
  }))
}));

// Mock environment variables for Vite
const mockProcess = {
  env: mockEnv
} as unknown as NodeJS.Process;

global.process = mockProcess;

// Mock import.meta for Vite
(global as any).import = {
  meta: {
    env: mockEnv,
    MODE: 'test',
    DEV: true,
    PROD: false
  }
};

describe('CommerceLayerContext', () => {
  const mockEuMarket = { id: 'market:id:qjANwhQrJg', name: 'EU', region: 'eu' as const, countryCode: 'EU', currencyCode: 'EUR' };
  const mockUkMarket = { id: 'market:id:vjzmJhvEDo', name: 'UK', region: 'uk' as const, countryCode: 'GB', currencyCode: 'GBP' };

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
    const requiredVars = [
      'COMMERCE_LAYER_CLIENT_ID',
      'COMMERCE_LAYER_ORGANIZATION',
      'COMMERCE_LAYER_MARKET_ID_EU',
      'COMMERCE_LAYER_MARKET_ID_UK',
      'COMMERCE_LAYER_DOMAIN',
      'COMMERCE_LAYER_EU_SCOPE',
      'COMMERCE_LAYER_UK_SCOPE',
      'COMMERCE_LAYER_EU_SKU_LIST_ID',
      'COMMERCE_LAYER_UK_SKU_LIST_ID',
      'APP_TITLE',
      'APP_ID',
      'API_URL',
      'WS_API_URL'
    ];

    requiredVars.forEach(varName => {
      expect(mockEnv[varName as keyof typeof mockEnv]).toBeDefined();
      expect(mockEnv[varName as keyof typeof mockEnv]).not.toBe('');
    });
  });
});
