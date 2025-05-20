import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
// Import Commerce Layer SDK and types
import type { Sku, Price } from '@commercelayer/sdk';

// Type for the CommerceLayer module
type CommerceLayerModule = {
  CommerceLayer: (config: {
    organization: string;
    accessToken: string;
    domain: string;
    userAgent?: string;
  }) => any; // Replace 'any' with the actual client type if available
};

// Lazy load the SDK
let _commerceLayer: CommerceLayerModule | null = null;

async function getCommerceLayer() {
  if (!_commerceLayer) {
    _commerceLayer = await import('@commercelayer/sdk');
  }
  return _commerceLayer;
}

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

// Commerce Layer SDK types
type CommerceLayerPrice = Price & {
  price_list?: {
    id: string;
    type: string;
  };
};

// Extend the base Sku type with additional relations
interface SkuWithRelations extends Omit<Sku, 'prices'> {
  prices?: CommerceLayerPrice[]
  images?: Array<{
    id: string
    url: string
  }>
}

// Define local type for the transformed product
type Product = {
  id: string;
  code: string;
  name: string;
  description: string;
  image_url: string | null;
  price: string;
  currency: string;
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
    // For example: 'market:id:qjANwhQrJg' for EU market
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
      throw new Error(`Failed to get access token: ${response.status} ${response.statusText}\n${responseText}`);
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
    const organization = process.env.COMMERCE_LAYER_ORGANIZATION;
    if (!organization) {
      throw new Error('Missing required environment variable: COMMERCE_LAYER_ORGANIZATION');
    }
    
    // Set SKU list ID based on market
    let skuListId;
    if (market === 'UK') {
      skuListId = process.env.COMMERCE_LAYER_UK_SKU_LIST_ID;
    } else {
      // Default to EU market
      skuListId = process.env.COMMERCE_LAYER_EU_SKU_LIST_ID;
    }

    console.log('[Featured Products] Configuration:', {
      market,
      organization: organization ? '***' : 'MISSING',
      skuListId: skuListId ? '***' : 'MISSING'
    });

    if (!skuListId) {
      throw new Error(`Missing required environment variable: COMMERCE_LAYER_${market}_SKU_LIST_ID`);
    }
    
    // Get Commerce Layer module
    const commerceLayerModule = await getCommerceLayer();
    
    if (!commerceLayerModule) {
      throw new Error('Failed to load Commerce Layer SDK');
    }
    
    // Initialize Commerce Layer client
    const client = commerceLayerModule.CommerceLayer({
      organization,
      accessToken,
      domain: 'commercelayer.io',
      userAgent: 'seth-haus/1.0.0',
    });
    
    console.log(`[Commerce Layer] Initialized client for organization: ${organization}`);

    console.log(`[Commerce Layer] Fetching SKUs for SKU list: ${skuListId}`);

    try {
      // Get SKUs with their prices
      const skus = await client.skus.list({
        include: ['prices', 'prices.price_list'],
        filters: {
          sku_list_id_eq: skuListId
        },
        pageSize: 25
      });

      console.log(`[Commerce Layer] Successfully fetched ${skus.length} SKUs`);
      
      // Type assertion to handle the extended Sku type with relations
      const products = (skus as unknown as SkuWithRelations[]).map((sku): Product => {
        const priceInfo = sku.prices?.[0];
        const imageUrl = sku.images?.[0]?.url || null;
        
        return {
          id: sku.id,
          code: sku.code,
          name: sku.name || 'Unnamed Product',
          description: sku.description || '',
          image_url: imageUrl,
          price: priceInfo?.formatted_amount || 'Price not available',
          currency: priceInfo?.currency_code || ''
        };
      });
      
      console.log(`[Featured Products] Found ${products.length} products`);

      // Return the products
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, OPTIONS'
        },
        body: JSON.stringify({
          data: products,
          meta: {
            market,
            count: products.length,
            timestamp: new Date().toISOString()
          }
        })
      };
    } catch (error) {
      console.error('[Commerce Layer] Error fetching SKUs:', error);
      throw error;
    }
  } catch (error: any) {
    let errorMessage = 'Unknown error';
    let errorDetails: any = {};
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = {
        name: error.name,
        stack: error.stack,
        ...(error as any).response?.data && { responseData: (error as any).response.data },
        ...(error as any).config && { requestConfig: {
          url: (error as any).config?.url,
          method: (error as any).config?.method,
          headers: (error as any).config?.headers,
          data: (error as any).config?.data
        }}
      };
    } else if (typeof error === 'object' && error !== null) {
      errorMessage = JSON.stringify(error);
    } else {
      errorMessage = String(error);
    }
    
    console.error('[Featured Products] Error Details:', {
      message: errorMessage,
      ...errorDetails,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        COMMERCE_LAYER_ORGANIZATION: process.env.COMMERCE_LAYER_ORGANIZATION ? '***' : 'MISSING',
        COMMERCE_LAYER_EU_SCOPE: process.env.COMMERCE_LAYER_EU_SCOPE ? '***' : 'MISSING',
        COMMERCE_LAYER_UK_SCOPE: process.env.COMMERCE_LAYER_UK_SCOPE ? '***' : 'MISSING',
        COMMERCE_LAYER_EU_SKU_LIST_ID: process.env.COMMERCE_LAYER_EU_SKU_LIST_ID || 'MISSING',
        COMMERCE_LAYER_UK_SKU_LIST_ID: process.env.COMMERCE_LAYER_UK_SKU_LIST_ID || 'MISSING'
      }
    });
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: 'Failed to fetch featured products',
        details: process.env.NODE_ENV === 'development' ? {
          error: errorMessage,
          ...errorDetails
        } : undefined
      }, null, 2)
    };
  }
};

// Wrapper for Netlify Functions that returns a proper Response object
export default async function handler(event: HandlerEvent, context: any = {}) {
  console.log('[Handler] Received event:', {
    httpMethod: event.httpMethod,
    path: event.path,
    queryStringParameters: event.queryStringParameters,
    headers: event.headers
  });

  try {
    const response = await featuredProductsHandler(event);
    console.log('[Handler] Sending response:', {
      statusCode: response.statusCode,
      headers: response.headers
    });
    
    // Return a proper Response object
    return new Response(response.body, {
      status: response.statusCode,
      headers: {
        ...response.headers,
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('[Handler] Error:', errorMessage, '\nStack:', errorStack);
    
    // Return a proper Response object for errors
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      ...(process.env.NODE_ENV === 'development' && {
        details: errorMessage,
        stack: errorStack
      })
    }, null, 2), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      }
    });
  }
}
