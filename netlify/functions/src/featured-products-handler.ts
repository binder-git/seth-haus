import { Handler } from '@netlify/functions';
import { CommerceLayerClient } from '@commercelayer/sdk';

// Debug log all environment variables at startup
console.log('[Featured Products] Initializing with environment variables:', {
  NODE_ENV: process.env.NODE_ENV,
  AWS_LAMBDA_FUNCTION_NAME: process.env.AWS_LAMBDA_FUNCTION_NAME,
  COMMERCE_LAYER_ORGANIZATION: process.env.COMMERCE_LAYER_ORGANIZATION ? '***' : 'MISSING',
  COMMERCE_LAYER_EU_SCOPE: process.env.COMMERCE_LAYER_EU_SCOPE ? '***' : 'MISSING',
  COMMERCE_LAYER_UK_SCOPE: process.env.COMMERCE_LAYER_UK_SCOPE ? '***' : 'MISSING',
  COMMERCE_LAYER_EU_SKU_LIST_ID: process.env.COMMERCE_LAYER_EU_SKU_LIST_ID || 'MISSING',
  COMMERCE_LAYER_UK_SKU_LIST_ID: process.env.COMMERCE_LAYER_UK_SKU_LIST_ID || 'MISSING',
  ALL_ENV_KEYS: Object.keys(process.env).filter(key => 
    key.startsWith('COMMERCE_LAYER_') || 
    key === 'NODE_ENV' ||
    key === 'AWS_LAMBDA_FUNCTION_NAME'
  )
});

const handler: Handler = async (event) => {
  try {
    console.log('[Featured Products] Route called:', {
      path: event.path,
      method: event.httpMethod,
      queryParams: event.queryStringParameters,
      headers: event.headers
    });

    // Extract market from query parameters
    const market = (event.queryStringParameters?.market || 'UK').toUpperCase();
    console.log('[Featured Products] Using market:', market);
    
    // Get environment variables
    const clientId = process.env.COMMERCE_LAYER_CLIENT_ID;
    const clientSecret = process.env.COMMERCE_LAYER_CLIENT_SECRET;
    const organization = process.env.COMMERCE_LAYER_ORGANIZATION;
    const domain = 'commercelayer.io';
    
    const scope = market === 'UK' 
      ? process.env.COMMERCE_LAYER_UK_SCOPE 
      : process.env.COMMERCE_LAYER_EU_SCOPE;
    
    const skuListId = market === 'UK' 
      ? process.env.COMMERCE_LAYER_UK_SKU_LIST_ID 
      : process.env.COMMERCE_LAYER_EU_SKU_LIST_ID;

    console.log('[Featured Products] Environment variables:', {
      CLIENT_ID: clientId ? '***' : 'MISSING',
      CLIENT_SECRET: clientSecret ? '***' : 'MISSING',
      ORGANIZATION: organization || 'MISSING',
      DOMAIN: domain,
      SCOPE: scope || 'MISSING',
      SKU_LIST_ID: skuListId || 'MISSING',
      MARKET: market
    });

    if (!clientId || !clientSecret || !organization || !scope || !skuListId) {
      const errorMessage = 'Missing required environment variables';
      console.error('[Featured Products] Error:', errorMessage);
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        },
        body: JSON.stringify({
          status: 'error',
          message: errorMessage,
          details: {
            clientId: !!clientId,
            clientSecret: !!clientSecret,
            organization: !!organization,
            scope: !!scope,
            skuListId: !!skuListId
          }
        })
      };
    }

    // Get access token
    const tokenUrl = `https://${domain}/oauth/token`;
    const tokenRequestBody = {
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: scope
    };

    console.log('[Featured Products] Token request details:', {
      url: tokenUrl,
      client_id: clientId,
      client_secret: clientSecret ? '***' : 'undefined',
      scope: scope,
      organization: organization
    });
    
    try {
      // First, get the access token
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(tokenRequestBody)
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('[Featured Products] Failed to get access token:', {
          status: tokenResponse.status,
          statusText: tokenResponse.statusText,
          error: errorText,
          headers: Object.fromEntries(tokenResponse.headers.entries())
        });
        throw new Error(`Failed to get access token: ${tokenResponse.status} ${tokenResponse.statusText}`);
      }
      
      const tokenData = await tokenResponse.json();
      console.log('[Featured Products] Successfully obtained access token');
      
      // Initialize Commerce Layer client
      const client = new CommerceLayerClient({
        organization,
        accessToken: tokenData.access_token,
        domain
      });

      // Fetch featured SKUs from the SKU list
      console.log('[Featured Products] Fetching SKUs with filters:', {
        sku_list_id: skuListId,
        tags_array: ['featured']
      });

      // Fetch featured SKUs from the SKU list
      const skus = await client.skus.list({
        filters: {
          sku_list_id_eq: skuListId
        },
        include: ['prices', 'images'],
        pageSize: 10
      });

      // Process the SKUs to get the required fields
      const featuredProducts = skus.map((sku) => {
        // Get the first price if available
        const priceInfo = Array.isArray(sku.prices) && sku.prices.length > 0 
          ? sku.prices[0] 
          : null;
        
        return {
          id: sku.id,
          code: sku.code,
          name: sku.name || 'Unnamed Product',
          description: sku.description || '',
          image_url: sku.image_url || null,
          price: priceInfo?.formatted_amount || 'N/A',
          currency: priceInfo?.currency_code || 'USD'
        };
      });

      console.log('[Featured Products] Found featured products:', featuredProducts.length);

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        },
        body: JSON.stringify({
          status: 'success',
          data: featuredProducts
        })
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Featured Products] Error:', errorMessage);
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        },
        body: JSON.stringify({
          status: 'error',
          message: 'Failed to fetch featured products',
          error: errorMessage
        })
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Unexpected error in handler:', errorMessage);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: JSON.stringify({ 
        status: 'error',
        message: 'Internal server error',
        error: errorMessage
      })
    };
  }
};

// Export the handler using ES modules
export { handler };
