// /Users/seth/seth-haus/netlify/functions/featured-products.ts

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
// Keep these types for the structure of the API response, even without the SDK
import type { Sku, Price } from '@commercelayer/sdk';

// Load environment variables from .env file
const currentFileUrl = import.meta.url;
const currentDir = dirname(fileURLToPath(currentFileUrl));
dotenv.config({ path: resolve(currentDir, '../../../.env') });

// Import shared types
import type {
  HandlerResponse,
  HandlerEvent,
  HandlerContext
} from './types.js';

// Commerce Layer SDK types (used for structure reference, not for SDK calls)
type CommerceLayerPrice = Price & {
  price_list?: {
    id: string;
    type: string;
  };
};

// Extend the base Sku type with additional relations (removed inventory for listing page)
interface SkuWithRelations extends Omit<Sku, 'prices'> {
  prices?: CommerceLayerPrice[];
  images?: Array<{
    id: string;
    url: string;
  }>;
  // No need for inventory relationships here as we are not including them in the API call for listings
}

// Define local type for the transformed product (Removed 'available' and 'quantity')
type Product = {
  id: string;
  code: string;
  name: string;
  description: string;
  image_url: string | null;
  price: string;
  currency: string;
  // 'available' and 'quantity' are removed as they are not fetched by this function anymore
};

// Debug log all environment variables at startup
console.log('[Featured Products] Initializing with environment variables:', {
  NODE_ENV: process.env.NODE_ENV,
  COMMERCE_LAYER_ORGANIZATION: process.env.COMMERCE_LAYER_ORGANIZATION ? '***' : 'MISSING',
  COMMERCE_LAYER_EU_SCOPE: process.env.COMMERCE_LAYER_EU_SCOPE ? '***' : 'MISSING',
  COMMERCE_LAYER_UK_SCOPE: process.env.COMMERCE_LAYER_UK_SCOPE ? '***' : 'MISSING',
  COMMERCE_LAYER_EU_SKU_LIST_ID: process.env.COMMERCE_LAYER_EU_SKU_LIST_ID || 'MISSING',
  COMMERCE_LAYER_UK_SKU_LIST_ID: process.env.COMMERCE_LAYER_UK_SKU_LIST_ID || 'MISSING'
});

// Helper function to get access token from Commerce Layer
const getAccessToken = async (market: string = 'UK'): Promise<string> => {
  try {
    const clientId = process.env.COMMERCE_LAYER_CLIENT_ID;
    const clientSecret = process.env.COMMERCE_LAYER_CLIENT_SECRET;
    const organization = process.env.COMMERCE_LAYER_ORGANIZATION;

    // Determine scope based on market
    let scope;
    if (market.toUpperCase() === 'UK') {
      scope = process.env.COMMERCE_LAYER_UK_SCOPE;
    } else {
      // Default to EU scope
      scope = process.env.COMMERCE_LAYER_EU_SCOPE;
    }

    if (!clientId || !clientSecret || !organization || !scope) {
      const missing = [];
      if (!clientId) missing.push('COMMERCE_LAYER_CLIENT_ID');
      if (!clientSecret) missing.push('COMMERCE_LAYER_CLIENT_SECRET');
      if (!organization) missing.push('COMMERCE_LAYER_ORGANIZATION');
      if (!scope) missing.push(`COMMERCE_LAYER_${market.toUpperCase()}_SCOPE`);
      throw new Error(`Missing required Commerce Layer credentials: ${missing.join(', ')}`);
    }

    // Commerce Layer's authentication endpoint
    const authUrl = 'https://auth.commercelayer.io/oauth/token';

    // The scope is already in the correct format in the environment variables
    const formattedScope = scope;

    console.log('[Commerce Layer Auth] Using scope:', formattedScope);

    console.log(`[Commerce Layer Auth] Authenticating with Commerce Layer at: ${authUrl}`, {
      clientId: clientId ? '***' : 'MISSING',
      organization,
      scope: formattedScope,
      market
    });

    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: formattedScope
      })
    });

    const responseText = await response.text();
    // Convert headers to a plain object for logging
    const headersObj: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headersObj[key] = value;
    });

    console.log(`[Commerce Layer Auth] Auth response status: ${response.status}`, {
      statusText: response.statusText,
      headers: headersObj,
      body: responseText
    });

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.status} <span class="math-inline">\{response\.statusText\}\\n</span>{responseText}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
      console.log('[Commerce Layer Auth] Successfully parsed auth response');
    } catch (e) {
      console.error('[Commerce Layer Auth] Failed to parse auth response:', e);
      throw new Error(`Failed to parse auth response: ${responseText}`);
    }

    if (!data.access_token) {
      console.error('[Commerce Layer Auth] No access token in response:', data);
      throw new Error('No access token in response');
    }

    console.log('[Commerce Layer Auth] Successfully obtained access token');
    return data.access_token;
  } catch (error) {
    console.error('[Commerce Layer Auth] Error getting access token:', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        COMMERCE_LAYER_ORGANIZATION: process.env.COMMERCE_LAYER_ORGANIZATION ? '***' : 'MISSING',
        COMMERCE_LAYER_EU_SCOPE: process.env.COMMERCE_LAYER_EU_SCOPE ? '***' : 'MISSING',
        COMMERCE_LAYER_UK_SCOPE: process.env.COMMERCE_LAYER_UK_SCOPE ? '***' : 'MISSING'
      }
    });
    throw new Error(`Failed to authenticate with Commerce Layer: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Main handler function
const featuredProductsHandler = async (
  event: HandlerEvent
): Promise<HandlerResponse> => {
  try {
    console.log('[Featured Products] Route called:', {
      path: event.path,
      method: event.httpMethod,
      queryParams: event.queryStringParameters,
      headers: event.headers
    });

    // Get the market from query parameters, default to 'UK'
    const market = (event.queryStringParameters?.market || 'UK').toUpperCase();

    // Get access token
    const accessToken = await getAccessToken(market);

    // Get organization from environment
    const organization = process.env.COMMERCE_LAYER_ORGAN