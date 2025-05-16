import { Handler } from '@netlify/functions';
import { CommerceLayerClient } from '@commercelayer/sdk';
import fetch from 'node-fetch';

const handler: Handler = async (event) => {
  // Extract market and category from query parameters
  const market = (event.queryStringParameters?.market || 'UK').toUpperCase();
  const category = event.queryStringParameters?.category;
  
  // Get environment variables
  const clientId = process.env.VITE_COMMERCE_LAYER_CLIENT_ID;
  const clientSecret = process.env.VITE_COMMERCE_LAYER_CLIENT_SECRET;
  const organization = process.env.VITE_COMMERCE_LAYER_ORGANIZATION;
  const skuListId = market === 'UK' 
    ? process.env.VITE_COMMERCE_LAYER_SKU_LIST_ID_UK 
    : process.env.VITE_COMMERCE_LAYER_SKU_LIST_ID_EU;

  if (!clientId || !clientSecret || !organization || !skuListId) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing required environment variables' })
    };
  }

  try {
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
      throw new Error('Failed to get access token');
    }

    // Initialize Commerce Layer client
    const client = new CommerceLayerClient({
      organization,
      accessToken: tokenData.access_token,
      domain: 'commercelayer.io'
    });

    // Prepare filter
    const filters: any = {
      sku_list_id: skuListId
    };

    // Add category filter if provided
    if (category) {
      filters.categories_tags_array = category;
    }

    // Fetch SKUs from the SKU list with optional category filter
    const skus = await client.skus.list({
      filters,
      include: ['prices']
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        products: skus
      })
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch products' })
    };
  }
};

export { handler };
