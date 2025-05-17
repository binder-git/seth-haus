// Import required modules
import { CommerceLayerClient, type Sku, type Price as CLPrice } from '@commercelayer/sdk';

// Import shared types
import type {
  HandlerResponse,
  HandlerEvent,
  HandlerContext
} from './types';

// Define types for the Commerce Layer relationships
type CLImage = {
  id: string;
  url: string;
};

type CLPriceWithList = CLPrice & {
  price_list?: { id: string };
};

// Extend the Sku type to include relationships
type SkuWithRelations = Sku & {
  prices?: CLPriceWithList[];
  images?: CLImage[];
};

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

// Using global fetch in Node.js 18+

// Debug log all environment variables at startup
console.log('[Featured Products] Initializing with environment variables:', {
  NODE_ENV: process.env.NODE_ENV,
  COMMERCE_LAYER_ORGANIZATION: process.env.COMMERCE_LAYER_ORGANIZATION ? '***' : 'MISSING',
  COMMERCE_LAYER_EU_SCOPE: process.env.COMMERCE_LAYER_EU_SCOPE ? '***' : 'MISSING',
  COMMERCE_LAYER_UK_SCOPE: process.env.COMMERCE_LAYER_UK_SCOPE ? '***' : 'MISSING',
  COMMERCE_LAYER_EU_SKU_LIST_ID: process.env.COMMERCE_LAYER_EU_SKU_LIST_ID || 'MISSING',
  COMMERCE_LAYER_UK_SKU_LIST_ID: process.env.COMMERCE_LAYER_UK_SKU_LIST_ID || 'MISSING'
});

// Helper function to get access token from the commerce-layer-auth function
async function getAccessToken(): Promise<string> {
  try {
    // Use environment variable for local development URL, fallback to relative path in production
    const baseUrl = process.env.NETLIFY_DEV 
      ? process.env.NETLIFY_DEV_URL || 'http://localhost:9999'
      : '';
      
    const authUrl = `${baseUrl}/.netlify/functions/commerce-layer-auth`;
    console.log(`[Featured Products] Fetching access token from: ${authUrl}`);
    
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get access token: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('[Featured Products] Error getting access token:', error);
    throw new Error('Failed to authenticate with Commerce Layer');
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

    // Extract market from query parameters
    const market = (event.queryStringParameters?.market || 'UK').toUpperCase();
    
    // Get environment variables
    const organization = process.env.COMMERCE_LAYER_ORGANIZATION;
    const domain = 'commercelayer.io';
    
    // Set SKU list ID based on market
    let skuListId;
    if (market === 'UK') {
      skuListId = process.env.COMMERCE_LAYER_UK_SKU_LIST_ID || '';
    } else {
      // Default to EU market
      skuListId = process.env.COMMERCE_LAYER_EU_SKU_LIST_ID || '';
    }

    console.log('[Featured Products] Configuration:', {
      market,
      organization,
      skuListId: skuListId || 'undefined'
    });

    if (!organization || !skuListId) {
      throw new Error('Missing required environment variables');
    }

    // Get access token from the auth function
    const accessToken = await getAccessToken();
    
    // Initialize Commerce Layer client
    const client = new CommerceLayerClient({
      organization: organization,
      accessToken: accessToken
    });

    console.log('[Featured Products] Successfully obtained access token');

    // Get SKUs with their prices and images
    const skus = await client.skus.list({
      include: ['prices', 'images', 'prices.price_list'],
      filters: {
        sku_list_id_eq: skuListId
      },
      pageSize: 50
    }) as unknown as SkuWithRelations[];

    // Transform the SKUs into the expected format
    const products = skus.map((sku: SkuWithRelations): Product => {
      // Access relationships safely with type assertions
      const typedSku = sku as SkuWithRelations;
      const priceInfo = typedSku.prices?.[0] as CLPriceWithList | undefined;
      const imageUrl = (typedSku.images?.[0] as CLImage | undefined)?.url || null;
      const priceAmount = priceInfo?.formatted_amount || 'Price not available';
      const currencyCode = priceInfo?.currency_code || '';

      return {
        id: sku.id,
        code: sku.code,
        name: sku.name || 'Unnamed Product',
        description: sku.description || '',
        image_url: imageUrl,
        price: priceAmount,
        currency: currencyCode
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
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error';
    console.error('[Featured Products] Error:', errorMessage);
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
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      })
    };
  }
};

// Export the handler using ES Modules
export { featuredProductsHandler as handler };
