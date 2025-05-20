"use strict";

// Debug log all environment variables at startup
console.log('[Featured Products Simple] Initializing with environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    AWS_LAMBDA_FUNCTION_NAME: process.env.AWS_LAMBDA_FUNCTION_NAME,
    COMMERCE_LAYER_ORGANIZATION: process.env.COMMERCE_LAYER_ORGANIZATION ? '***' : 'MISSING',
    COMMERCE_LAYER_EU_SCOPE: process.env.COMMERCE_LAYER_EU_SCOPE ? '***' : 'MISSING',
    COMMERCE_LAYER_UK_SCOPE: process.env.COMMERCE_LAYER_UK_SCOPE ? '***' : 'MISSING',
    COMMERCE_LAYER_EU_SKU_LIST_ID: process.env.COMMERCE_LAYER_EU_SKU_LIST_ID || 'MISSING',
    COMMERCE_LAYER_UK_SKU_LIST_ID: process.env.COMMERCE_LAYER_UK_SKU_LIST_ID || 'MISSING'
});

async function getAccessToken(market) {
    const clientId = process.env.COMMERCE_LAYER_CLIENT_ID;
    const clientSecret = process.env.COMMERCE_LAYER_CLIENT_SECRET;
    const scope = market === 'UK' 
        ? process.env.COMMERCE_LAYER_UK_SCOPE 
        : process.env.COMMERCE_LAYER_EU_SCOPE;

    console.log('[Featured Products Simple] Getting access token for scope:', scope);

    const response = await fetch('https://auth.commercelayer.io/oauth/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret,
            scope: scope
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get access token: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.access_token;
}

async function getSkus(accessToken, skuListId) {
    const organization = process.env.COMMERCE_LAYER_ORGANIZATION;
    const url = new URL(`https://${organization}.commercelayer.io/api/skus`);
    
    // Add query parameters
    url.searchParams.append('filter[sku_list_id_eq]', skuListId);
    url.searchParams.append('include', 'prices,images');
    url.searchParams.append('page[size]', '25');

    console.log(`[Featured Products Simple] Fetching SKUs from: ${url.toString()}`);

    const response = await fetch(url.toString(), {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json'
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch SKUs: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
}

exports.handler = async (event) => {
    try {
        console.log('[Featured Products Simple] Route called:', {
            path: event.path,
            method: event.httpMethod,
            queryParams: event.queryStringParameters,
            headers: event.headers
        });

        // Extract market from query parameters, default to 'UK'
        const market = (event.queryStringParameters?.market || 'UK').toUpperCase();
        console.log('[Featured Products Simple] Using market:', market);

        // Get SKU list ID based on market
        const skuListId = market === 'UK'
            ? process.env.COMMERCE_LAYER_UK_SKU_LIST_ID
            : process.env.COMMERCE_LAYER_EU_SKU_LIST_ID;

        if (!skuListId) {
            throw new Error(`Missing SKU list ID for market: ${market}`);
        }

        // Get access token
        const accessToken = await getAccessToken(market);
        
        // Fetch SKUs
        const skusData = await getSkus(accessToken, skuListId);
        
        // Transform the response to match the expected format
        const products = skusData.data.map(sku => ({
            id: sku.id,
            type: sku.type,
            attributes: {
                code: sku.attributes.code,
                name: sku.attributes.name,
                description: sku.attributes.description || '',
                image_url: sku.attributes.image_url || null,
                price: sku.attributes.price,
                currency: sku.attributes.currency_code
            },
            relationships: sku.relationships
        }));

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, OPTIONS'
            },
            body: JSON.stringify({ products })
        };
    } catch (error) {
        console.error('[Featured Products Simple] Error:', error);
        
        return {
            statusCode: error.statusCode || 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, OPTIONS'
            },
            body: JSON.stringify({
                error: 'Failed to fetch products',
                message: error.message,
                ...(process.env.NODE_ENV === 'development' && {
                    stack: error.stack
                })
            })
        };
    }
};
