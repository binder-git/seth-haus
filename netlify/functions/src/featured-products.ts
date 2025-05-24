// /Users/seth/seth-haus/netlify/functions/src/featured-products.ts

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Import custom types from your local types.ts file
import type {
  HandlerResponse,
  HandlerEvent,
  HandlerContext,
  Price,
  CLSKU
} from './types.js';

// Load environment variables from .env file
const currentFileUrl = import.meta.url;
const currentDir = dirname(fileURLToPath(currentFileUrl));
dotenv.config({ path: resolve(currentDir, '../../../.env') });

// Define the SkuResource interface to match Commerce Layer API structure
interface SkuResource {
  id: string;
  type: 'skus';
  code: string;
  name: string;
  description: string;
  image_url?: string;
  relationships?: {
    prices?: {
      data: Array<{ id: string; type: 'prices' }>;
    };
    images?: {
      data: Array<{ id: string; type: 'images' }>;
    };
  };
}

// Extend the base CLSKU type with additional relations
interface SkuWithRelations extends Omit<CLSKU, 'prices'> {
  prices?: Price[];
  images?: Array<{
    id: string;
    url: string;
  }>;
}

interface PriceResource {
  id: string;
  type: 'prices';
  attributes: {
    formatted_amount: string;
    currency_code: string;
    amount_float: number;
  };
}

interface ImageResource {
  id: string;
  type: 'images';
  attributes: {
    url: string;
    filename: string;
  };
}

interface CommerceLayerSkuApiResponse {
  data: SkuResource[];
  included?: (PriceResource | ImageResource)[];
}

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

// Helper function to fetch products from Commerce Layer
async function fetchProducts(organization: string, accessToken: string, skuListId: string): Promise<Product[]> {
  try {
    // First, fetch SKU list items to get the SKU IDs
    const skuListItemsUrl = `https://${organization}.commercelayer.io/api/sku_list_items?filter[sku_list_id_eq]=${skuListId}&include=sku&page[size]=25`;
    
    console.log(`[fetchProducts] Fetching SKU list items from: ${skuListItemsUrl}`);
    
    const skuListResponse = await fetch(skuListItemsUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json'
      }
    });

    if (!skuListResponse.ok) {
      const errorText = await skuListResponse.text();
      throw new Error(`Failed to fetch SKU list items: ${skuListResponse.status} ${skuListResponse.statusText} - ${errorText}`);
    }

    const skuListData = await skuListResponse.json();
    
    // Extract SKU IDs from the SKU list items
    const skuIds = skuListData.data.map((item: any) => item.relationships.sku.data.id);
    
    if (skuIds.length === 0) {
      console.log('[fetchProducts] No SKUs found in the SKU list');
      return [];
    }

    console.log(`[fetchProducts] Found ${skuIds.length} SKUs in list`);

    // Now fetch the actual SKUs with their prices and images
    const apiUrl = `https://${organization}.commercelayer.io/api/skus?filter[id_in]=${skuIds.join(',')}&include=prices,images&page[size]=25&sort=-created_at`;
    
    console.log(`[fetchProducts] Fetching SKUs from: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json() as CommerceLayerSkuApiResponse;

    console.log(`[fetchProducts] Successfully fetched ${data.data.length} products`);

    // Transform the API response to our Product type
    return data.data.map((sku) => {
      // Find price from included resources with proper typing
      const priceRelationship = sku.relationships?.prices?.data?.[0];
      const price = data.included?.find((item): item is PriceResource => 
        item.type === 'prices' && item.id === priceRelationship?.id
      );
      
      // Find image from included resources with proper typing
      const imageRelationship = sku.relationships?.images?.data?.[0];
      const image = data.included?.find((item): item is ImageResource => 
        item.type === 'images' && item.id === imageRelationship?.id
      );

      return {
        id: String(sku.id),
        code: String(sku.code ?? ''),
        name: String(sku.name ?? ''),
        description: String(sku.description ?? ''),
        image_url: image?.attributes?.url || null,
        price: price?.attributes?.formatted_amount || 'N/A',
        currency: price?.attributes?.currency_code || 'N/A'
      };
    });
  } catch (error) {
    console.error('[fetchProducts] Error fetching products:', error);
    throw error;
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
      throw new Error('Missing COMMERCE_LAYER_ORGANIZATION environment variable');
    }

    // Get the appropriate SKU list ID based on market
    const skuListId = market === 'UK'
      ? process.env.COMMERCE_LAYER_UK_SKU_LIST_ID
      : process.env.COMMERCE_LAYER_EU_SKU_LIST_ID;

    if (!skuListId) {
      throw new Error(`Missing SKU list ID for market: ${market}`);
    }

    // Fetch products from Commerce Layer
    const products = await fetchProducts(organization, accessToken, skuListId);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify(products)
    };
  } catch (error) {
    console.error('[Featured Products] Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      })
    };
  }
};

// Export the handler for Netlify Functions
export { featuredProductsHandler as handler };
