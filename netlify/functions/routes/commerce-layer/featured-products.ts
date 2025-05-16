import { Handler } from '@netlify/functions';
import { CommerceLayerClient } from '@commercelayer/sdk';

const handler: Handler = async (event) => {
  console.log('[Featured Products] Route called:', {
    path: event.path,
    method: event.httpMethod,
    queryParams: event.queryStringParameters
  });

  // Extract market from query parameters
  const market = (event.queryStringParameters?.market || 'UK').toUpperCase();
  console.log('[Featured Products] Using market:', market);
  
  // Get environment variables
  const clientId = process.env.VITE_COMMERCE_LAYER_CLIENT_ID;
  const clientSecret = process.env.VITE_COMMERCE_LAYER_CLIENT_SECRET;
  const organization = process.env.VITE_COMMERCE_LAYER_ORGANIZATION;
  const skuListId = market === 'UK' 
    ? process.env.VITE_COMMERCE_LAYER_SKU_LIST_ID_UK 
    : process.env.VITE_COMMERCE_LAYER_SKU_LIST_ID_EU;

  console.log('[Featured Products] Environment variables:', {
    UK_SKU_LIST: process.env.VITE_COMMERCE_LAYER_SKU_LIST_ID_UK,
    EU_SKU_LIST: process.env.VITE_COMMERCE_LAYER_SKU_LIST_ID_EU,
    SELECTED_MARKET: market,
    SELECTED_SKU_LIST: skuListId
  });

  if (!clientId || !clientSecret || !organization || !skuListId) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing required environment variables' })
    };
  }

  try {
    console.log(`[Featured Products] Handling request for market: ${market}`);
    console.log(`[Featured Products] Using SKU List ID: ${skuListId}`);

    // Initialize Commerce Layer client
    // Get access token
    const tokenResponse = await fetch(`https://${organization}.commercelayer.io/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: `market:id:${market === 'UK' ? process.env.VITE_COMMERCE_LAYER_MARKET_ID_UK : process.env.VITE_COMMERCE_LAYER_MARKET_ID_EU}`,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
      console.error('[Featured Products] Failed to get access token:', tokenData);
      throw new Error('Failed to get access token');
    }
    console.log('[Featured Products] Successfully obtained access token');

    // Initialize Commerce Layer client
    const client = new CommerceLayerClient({
      organization,
      accessToken: tokenData.access_token,
      domain: 'commercelayer.io'
    });

    // Fetch featured SKUs from the SKU list
    console.log('[Featured Products] Fetching SKUs with filters:', {
      sku_list_id: skuListId,
      tags_array: ['featured']
    });

    const skus = await client.skus.list({
      filters: {
        sku_list_id: skuListId,
        tags_array: ['featured']
      },
      include: ['prices'],
      pageSize: 3 // Limit to 3 featured products
    });

    console.log('[Featured Products] SKUs response:', {
      count: skus.length,
      skus: skus.map(sku => ({ id: sku.id, code: sku.code, name: sku.name }))
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ products: skus })
    };
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch featured products' })
    };
  }
};

export { handler };
