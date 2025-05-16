import React, { createContext, useContext, useState, useCallback, FC } from 'react';
import CommerceLayerAuthService from '../services/commerce-layer-auth-service';
import CommerceLayer from '@commercelayer/sdk';
import { z } from 'zod';
import type { Market, MarketName, MarketRegion, Markets } from 'types';

// Environment Variable Validation Schema
const CommerceLayerEnvSchema = z.object({
  COMMERCE_LAYER_CLIENT_ID: z.string().min(1, 'Commerce Layer Client ID is required'),
  COMMERCE_LAYER_ORGANIZATION: z.string().min(1, 'Commerce Layer Organization is required'),
  COMMERCE_LAYER_MARKET_ID_EU: z.string().min(1, 'EU Market ID is required'),
  COMMERCE_LAYER_MARKET_ID_UK: z.string().min(1, 'UK Market ID is required')
});

// Add type declarations to resolve lint errors
declare global {
  namespace JSX {
    interface IntrinsicElements {
      div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
      p: React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
      button: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
      main: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      section: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

type CommerceLayerClient = ReturnType<typeof CommerceLayer>;

// Markets type is imported from types

// Validate environment variables
const validateEnvVariables = (env?: unknown): Record<string, string> => {
  const requiredKeys = [
    'COMMERCE_LAYER_CLIENT_ID',
    'COMMERCE_LAYER_ORGANIZATION',
    'COMMERCE_LAYER_MARKET_ID_EU',
    'COMMERCE_LAYER_MARKET_ID_UK'
  ];

  const isValidEnv = (vars: unknown): vars is Record<string, string> => {
    if (typeof vars !== 'object' || vars === null) return false;

    const envObj = vars as Record<string, unknown>;
    return requiredKeys.every(key => 
      Object.prototype.hasOwnProperty.call(envObj, key) && 
      typeof envObj[key] === 'string'
    );
  };

  let envToValidate: Record<string, string>;

  if (env && typeof env === 'object' && env !== null) {
    const potentialEnv = env as Record<string, unknown>;
    if (isValidEnv(potentialEnv)) {
      envToValidate = potentialEnv;
    } else {
      throw new Error('Invalid environment variables');
    }
  } else {
    // Attempt to get environment from import.meta or process
    let importMetaEnv: Record<string, string> | undefined;
    let processEnv: Record<string, string> | undefined;

    // Safely check import.meta
    if (typeof globalThis !== 'undefined' && 'import' in globalThis) {
      const importMeta = (globalThis as any).import.meta;
      if (importMeta && 'env' in importMeta) {
        importMetaEnv = importMeta.env;
      }
    }

    // Use Vite's import.meta.env
    processEnv = import.meta.env;

    const candidateEnv = importMetaEnv || processEnv;

    if (!candidateEnv || !isValidEnv(candidateEnv)) {
      throw new Error('No valid environment variables found');
    }

    envToValidate = candidateEnv;
  }

  const envSchema = CommerceLayerEnvSchema;

  const result = envSchema.safeParse(envToValidate);

  if (!result.success) {
    throw new Error(`Invalid environment variables: ${result.error.message}`);
  }

  return result.data;
};

interface CommerceLayerContextType {
  client: CommerceLayerClient;
  currentMarket: Market;
  markets: Markets;
  switchMarket: (market: Market) => void;
}

// Environment configuration
const ENV: Record<string, string> = {
  COMMERCE_LAYER_CLIENT_ID: import.meta.env.COMMERCE_LAYER_CLIENT_ID || '',
  COMMERCE_LAYER_CLIENT_SECRET: import.meta.env.COMMERCE_LAYER_CLIENT_SECRET || '',
  COMMERCE_LAYER_ORGANIZATION: import.meta.env.COMMERCE_LAYER_ORGANIZATION || '',
  COMMERCE_LAYER_DOMAIN: import.meta.env.COMMERCE_LAYER_DOMAIN || 'commercelayer.io',
  COMMERCE_LAYER_EU_SCOPE: import.meta.env.COMMERCE_LAYER_EU_SCOPE || 'market:qjANwhQrJg',
  COMMERCE_LAYER_UK_SCOPE: import.meta.env.COMMERCE_LAYER_UK_SCOPE || 'market:vjzmJhvEDo',
  COMMERCE_LAYER_EU_SKU_LIST_ID: import.meta.env.COMMERCE_LAYER_EU_SKU_LIST_ID || 'JjEpIvwjey',
  COMMERCE_LAYER_UK_SKU_LIST_ID: import.meta.env.COMMERCE_LAYER_UK_SKU_LIST_ID || 'nVvZIAKxGn',
};

// Validate environment variables
const requiredVars = [
  'COMMERCE_LAYER_CLIENT_ID',
  'COMMERCE_LAYER_CLIENT_SECRET',
  'COMMERCE_LAYER_ORGANIZATION',
  'COMMERCE_LAYER_EU_SCOPE',
  'COMMERCE_LAYER_UK_SCOPE'
];

requiredVars.forEach(varName => {
  if (!ENV[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

// Helper function to get environment variables
const getEnvVar = (key: string): string => {
  // Directly use the key as we're using non-prefixed environment variables
  const fullKey = `COMMERCE_LAYER_${key}`;
  return import.meta.env[key] || ENV[fullKey] || '';
};

export const CommerceLayerContext = createContext<CommerceLayerContextType>({
  client: CommerceLayer({
    organization: ENV.COMMERCE_LAYER_ORGANIZATION,
    accessToken: 'test_token'
  }),
  currentMarket: { id: ENV.COMMERCE_LAYER_EU_SCOPE, name: 'EU' as const, region: 'eu' as const },
  markets: {
    eu: { id: ENV.COMMERCE_LAYER_EU_SCOPE, name: 'EU' as const, region: 'eu' as const },
    uk: { id: ENV.COMMERCE_LAYER_UK_SCOPE, name: 'UK' as const, region: 'uk' as const }
  },
  switchMarket: () => {}
});

export const CommerceLayerProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  // Validate and extract environment variables
  const envVars = validateEnvVariables(import.meta.env);

  // Configure markets
  const markets: Markets = {
    eu: {
      id: envVars.COMMERCE_LAYER_MARKET_ID_EU,
      name: 'EU' as const,
      region: 'eu' as const
    },
    uk: {
      id: envVars.COMMERCE_LAYER_MARKET_ID_UK,
      name: 'UK' as const,
      region: 'uk' as const
    }
  };
  const [currentMarket, setCurrentMarket] = useState<Market>(markets.eu);

  const client = CommerceLayer({
    organization: ENV.COMMERCE_LAYER_ORGANIZATION,
    accessToken: CommerceLayerAuthService.getStoredToken()?.access_token || 'test_token'
  });

  const switchMarket = useCallback((market: Market) => {
    setCurrentMarket(market);
  }, []);

  return (
    <CommerceLayerContext.Provider value={{
      client,
      currentMarket,
      markets,
      switchMarket
    }}>
      {children}
    </CommerceLayerContext.Provider>
  );
};

export { useCommerceLayer } from '../hooks/useCommerceLayer';
