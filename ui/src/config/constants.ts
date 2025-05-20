// Application-wide constants and configuration

// Environment variables are loaded via Vite's import.meta.env
// These are set in the Vite configuration
export const COMMERCE_LAYER_CONFIG = {
  organization: import.meta.env.COMMERCE_LAYER_ORGANIZATION || 'seth-s-triathlon-haus',
  domain: import.meta.env.COMMERCE_LAYER_DOMAIN || 'commercelayer.io',
  clientId: import.meta.env.COMMERCE_LAYER_CLIENT_ID || '',
  clientSecret: import.meta.env.COMMERCE_LAYER_CLIENT_SECRET || ''
};

export const API_CONFIG = {
  // Base URL for API requests
  baseUrl: `https://${COMMERCE_LAYER_CONFIG.organization}.${COMMERCE_LAYER_CONFIG.domain}/api`,
  // Auth URL for token requests (using the global auth endpoint)
  authUrl: 'https://auth.commercelayer.io/oauth/token'
};

// Market configurations
export const MARKETS = {
  UK: {
    name: 'UK',
    region: 'uk',
    id: 'vjzmJhvEDo',
    scope: 'market:id:vjzmJhvEDo',
    currency: 'GBP',
    countryCode: 'GB',
    skuListId: 'nVvZIAKxGn',
    currencyCode: 'GBP'
  },
  EU: {
    name: 'EU',
    region: 'eu',
    id: 'qjANwhQrJg',
    scope: 'market:id:qjANwhQrJg',
    currency: 'EUR',
    countryCode: 'EU',
    skuListId: 'JjEpIvwjey',
    currencyCode: 'EUR'
  }
} as const;
