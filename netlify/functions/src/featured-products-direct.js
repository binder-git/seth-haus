import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from root .env file
const envPath = path.resolve(process.cwd(), '../../.env');
console.log(`[Debug] Loading environment variables from: ${envPath}`);

const { parsed: envVars, error } = dotenv.config({ path: envPath });

if (error) {
    console.error('[Error] Failed to load .env file:', error);
} else {
    console.log('[Debug] Successfully loaded .env file');
}

// Debug log all environment variables (careful with sensitive data in production)
console.log('[Debug] Process environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    COMMERCE_LAYER_ORGANIZATION: process.env.COMMERCE_LAYER_ORGANIZATION ? '***' : 'not set',
    COMMERCE_LAYER_CLIENT_ID: process.env.COMMERCE_LAYER_CLIENT_ID ? '***' : 'not set',
    COMMERCE_LAYER_CLIENT_SECRET: process.env.COMMERCE_LAYER_CLIENT_SECRET ? '***' : 'not set',
    COMMERCE_LAYER_EU_SCOPE: process.env.COMMERCE_LAYER_EU_SCOPE ? '***' : 'not set',
    COMMERCE_LAYER_UK_SCOPE: process.env.COMMERCE_LAYER_UK_SCOPE ? '***' : 'not set',
    COMMERCE_LAYER_EU_SKU_LIST_ID: process.env.COMMERCE_LAYER_EU_SKU_LIST_ID || 'not set',
    COMMERCE_LAYER_UK_SKU_LIST_ID: process.env.COMMERCE_LAYER_UK_SKU_LIST_ID || 'not set'
});

// CORS headers
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': 'http://localhost:5173',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin, Access-Control-Request-Headers, Access-Control-Request-Method'
};

/**
 * Create a CORS response
 */
const createCorsResponse = (statusCode, body = null) => {
    return {
        statusCode,
        headers: {
            ...CORS_HEADERS,
            'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : ''
    };
};

/**
 * Handle OPTIONS request (CORS preflight)
 */
const handleOptions = () => {
    return createCorsResponse(204);
};

async function getAccessToken(market) {
    // Log all relevant environment variables (with sensitive data redacted)
    console.log('[getAccessToken] Environment variables:', {
        NODE_ENV: process.env.NODE_ENV,
        COMMERCE_LAYER_ORGANIZATION: process.env.COMMERCE_LAYER_ORGANIZATION ? '***' : 'not set',
        COMMERCE_LAYER_CLIENT_ID: process.env.COMMERCE_LAYER_CLIENT_ID ? '***' : 'not set',
        COMMERCE_LAYER_CLIENT_SECRET: process.env.COMMERCE_LAYER_CLIENT_SECRET ? '***' : 'not set',
        COMMERCE_LAYER_EU_SCOPE: process.env.COMMERCE_LAYER_EU_SCOPE ? '***' : 'not set',
        COMMERCE_LAYER_UK_SCOPE: process.env.COMMERCE_LAYER_UK_SCOPE ? '***' : 'not set'
    });

    const clientId = process.env.COMMERCE_LAYER_CLIENT_ID;
    const clientSecret = process.env.COMMERCE_LAYER_CLIENT_SECRET;
    const organization = process.env.COMMERCE_LAYER_ORGANIZATION;
    
    if (!clientId || !clientSecret || !organization) {
        const missing = [];
        if (!clientId) missing.push('COMMERCE_LAYER_CLIENT_ID');
        if (!clientSecret) missing.push('COMMERCE_LAYER_CLIENT_SECRET');
        if (!organization) missing.push('COMMERCE_LAYER_ORGANIZATION');
        throw new Error(`Missing required Commerce Layer credentials: ${missing.join(', ')}`);
    }
    
    // Determine the scope based on the market
    let scope;
    if (market === 'eu') {
        scope = process.env.COMMERCE_LAYER_EU_SCOPE || `market:id:${process.env.COMMERCE_LAYER_EU_SCOPE_ID}`;
    } else if (market === 'uk') {
        scope = process.env.COMMERCE_LAYER_UK_SCOPE || `market:id:${process.env.COMMERCE_LAYER_UK_SCOPE_ID}`;
    } else {
        throw new Error('Invalid market specified. Must be "eu" or "uk"');
    }
    
    if (!scope) {
        throw new Error(`Missing scope for market: ${market}`);
    }

    try {
        console.log(`[getAccessToken] Requesting token for market: ${market}`);
        
        const authUrl = 'https://auth.commercelayer.io/oauth/token';
        
        // Log the first few characters of client ID and secret (for debugging)
        console.log(`[getAccessToken] Client ID: ${clientId ? `${clientId.substring(0, 4)}...` : 'not set'}`);
        console.log(`[getAccessToken] Client Secret: ${clientSecret ? '***' : 'not set'}`);
        console.log(`[getAccessToken] Scope: ${scope}`);
        
        // Create the request body as a string to match the curl command
        const requestBody = new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret,
            scope: scope
        }).toString();
        
        // Log the request details (without sensitive data)
        console.log('[getAccessToken] Request details:', {
            url: authUrl,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: {
                grant_type: 'client_credentials',
                client_id: `${clientId.substring(0, 4)}...`,
                client_secret: '***',
                scope: scope
            }
        });
        
        // Make the request with form-encoded body
        const response = await fetch(authUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: requestBody
        });
        
        const responseText = await response.text();
        console.log(`[getAccessToken] Response status: ${response.status} ${response.statusText}`);
        console.log(`[getAccessToken] Response body:`, responseText);
        
        if (!response.ok) {
            console.error('[getAccessToken] Authentication failed. Please verify:');
            console.error('1. Client ID and Secret are correct in your .env file');
            console.error('2. The credentials have the correct permissions for the requested scope');
            console.error('3. The organization slug is correct');
            throw new Error(`Failed to get access token: ${response.status} ${response.statusText} - ${responseText}`);
        }
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error(`[getAccessToken] Failed to parse JSON response:`, e);
            throw new Error(`Failed to parse token response: ${e.message}`);
        }
        
        if (!data.access_token) {
            console.error('[getAccessToken] No access_token in response:', data);
            throw new Error('No access token in response');
        }
        
        console.log('[getAccessToken] Successfully obtained access token');
        return data.access_token;
    } catch (error) {
        console.error('[getAccessToken] Error details:', {
            message: error.message,
            stack: error.stack,
            response: error.response
        });
        throw error;
    }
}

async function getSkus(accessToken, skuListId, tag = null, includeTags = true) {
    const organization = process.env.COMMERCE_LAYER_ORGANIZATION;
    
    try {
        // Build the SKUs URL with proper filtering
        const skusUrl = new URL(`https://${organization}.commercelayer.io/api/skus`);
        
        // Filter by SKU list ID using the SKU list relationship
        skusUrl.searchParams.append('filter[sku_list_id_eq]', skuListId);
        
        // Add tag filter if provided
        if (tag) {
            skusUrl.searchParams.append('filter[tags_cont_any]', tag);
        }
        
        // Set up includes - only include prices and tags
        const includes = ['prices', 'tags'];
        skusUrl.searchParams.append('include', includes.join(','));
        console.log(`[Debug] Include parameters: ${includes.join(',')}`);
        
        // Define fields for each resource type
        const fields = {
            skus: [
                'id', 'code', 'name', 'description', 'reference', 
                'reference_origin', 'created_at', 'updated_at', 
                'image_url', 'metadata', 'tags'
            ],
            prices: [
                'id', 'amount_float', 'currency_code', 'formatted_amount',
                'compare_at_amount_float', 'formatted_compare_at_amount'
            ],
            tags: [
                'id', 'name', 'metadata', 'created_at', 'updated_at'
            ]
        };
        
        // Add sparse fieldsets
        Object.entries(fields).forEach(([type, fieldList]) => {
            skusUrl.searchParams.append(`fields[${type}]`, fieldList.join(','));
        });
        
        // Set page size and sorting
        skusUrl.searchParams.append('page[size]', '25');
        skusUrl.searchParams.append('sort', '-created_at'); // Sort by newest first
        
        console.log(`[Featured Products] Fetching SKUs from: ${skusUrl.toString()}`);
        
        const response = await fetch(skusUrl.toString(), {
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
    } catch (error) {
        console.error('[Featured Products] Error in getSkus:', error);
        throw error;
    }
}

export const handler = async (event) => {
    console.log('[Featured Products Direct] Handler called:', {
        path: event.path,
        method: event.httpMethod,
        query: event.queryStringParameters,
        headers: JSON.stringify(event.headers, null, 2)
    });

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        console.log('[Handler] Handling OPTIONS preflight request');
        return handleOptions();
    }
    
    // Ensure we only handle GET requests
    if (event.httpMethod !== 'GET') {
        console.log(`[Handler] Method not allowed: ${event.httpMethod}`);
        return createCorsResponse(405, {
            status: 'error',
            message: 'Method not allowed. Only GET and OPTIONS are supported.'
        });
    }

    try {
        // Get market from query parameters
        const market = event.queryStringParameters?.market?.toLowerCase();
        if (!market) {
            throw new Error('Market parameter is required');
        }

        // Get SKU list ID based on market
        const skuListId = market === 'uk' 
            ? process.env.COMMERCE_LAYER_UK_SKU_LIST_ID 
            : process.env.COMMERCE_LAYER_EU_SKU_LIST_ID;

        if (!skuListId) {
            throw new Error(`No SKU list ID configured for market: ${market}`);
        }

        // Get category from query parameters if provided
        const category = event.queryStringParameters?.category?.toLowerCase();
        
        // Get access token for the market
        const accessToken = await getAccessToken(market);
        
        // Fetch SKUs with optional category filter and include tags
        const skusData = await getSkus(accessToken, skuListId, category, true);
        
        console.log(`[Featured Products Direct] Fetched ${skusData.data.length} products for market ${market}` + 
                   (category ? `, filtered by tag: ${category}` : ''));
        
        // Get tags from included data if available
        const tagsMap = new Map();
        if (skusData.included) {
            skusData.included.forEach(item => {
                if (item.type === 'tags') {
                    tagsMap.set(item.id, item.attributes.name);
                }
            });
        }
        
        // Transform the response to include tags and local images
        const products = skusData.data.map(sku => {
            // Generate local image path based on SKU code or reference
            // Format: /migrated-assets/{sku-code}.jpg
            const skuCode = sku.attributes.code || sku.attributes.reference || sku.id;
            const imageUrl = `/migrated-assets/${skuCode}.jpg`;
            
            // Extract price information
            let price = 0;
            let currency = 'USD';
            let compareAtPrice = null;
            
            if (sku.relationships?.prices?.data?.length > 0) {
                const priceId = sku.relationships.prices.data[0].id;
                const priceObj = skusData.included?.find(
                    item => item.type === 'prices' && item.id === priceId
                );
                
                if (priceObj) {
                    price = priceObj.attributes.amount_float || 0;
                    currency = priceObj.attributes.currency_code || 'USD';
                    
                    // Get compare at price if available
                    if (priceObj.attributes.compare_at_amount_float) {
                        compareAtPrice = priceObj.attributes.compare_at_amount_float;
                    }
                }
            }
            
            // Get tags with proper names
            const tags = sku.relationships?.tags?.data?.map(tagRef => ({
                id: tagRef.id,
                name: tagsMap.get(tagRef.id) || tagRef.id,
                slug: (tagsMap.get(tagRef.id) || tagRef.id).toLowerCase().replace(/\s+/g, '-')
            })) || [];
            
            // For backward compatibility, include the first tag as category
            const category = (() => {
                const firstTag = tags[0];
                return firstTag ? firstTag.slug : '';
            })();
            
            return {
                id: sku.id,
                type: sku.type,
                code: sku.attributes.code || sku.id,
                reference: sku.attributes.reference || '',
                name: sku.attributes.name || 'Unnamed Product',
                description: sku.attributes.description || '',
                image_url: imageUrl,
                price: price,
                compare_at_price: compareAtPrice,
                currency: currency,
                tags: tags,
                category: category,
                // Include additional metadata
                metadata: {
                    origin: sku.attributes.reference_origin || 'commercelayer',
                    created_at: sku.attributes.created_at,
                    updated_at: sku.attributes.updated_at
                }
            };
        });

        // Transform the products to match the frontend's expected format
        const formattedProducts = products.map(product => ({
            id: product.id,
            type: 'skus',
            attributes: {
                code: product.code,
                name: product.name,
                description: product.description,
                image_url: product.image_url,
                price: product.price.toString(), // Ensure price is a string
                currency_code: product.currency,
                compare_at_amount: product.compare_at_price ? product.compare_at_price.toString() : null,
                reference_origin: 'commercelayer',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            relationships: {
                prices: {
                    data: [{
                        id: `price-${product.id}`,
                        type: 'prices'
                    }]
                },
                tags: {
                    data: (product.tags || []).map((tag, index) => ({
                        id: `tag-${product.id}-${index}`,
                        type: 'tags'
                    }))
                }
            }
        }));
        
        // Create included data for prices and tags
        const included = [];
        
        formattedProducts.forEach(product => {
            // Add price to included
            included.push({
                id: `price-${product.id}`,
                type: 'prices',
                attributes: {
                    amount_float: parseFloat(product.attributes.price) || 0,
                    currency_code: product.attributes.currency_code || 'USD',
                    formatted_amount: `$${parseFloat(product.attributes.price || 0).toFixed(2)}`,
                    compare_at_amount_float: product.attributes.compare_at_amount ? 
                        parseFloat(product.attributes.compare_at_amount) : null,
                    formatted_compare_at_amount: product.attributes.compare_at_amount ? 
                        `$${parseFloat(product.attributes.compare_at_amount).toFixed(2)}` : null
                }
            });
            
            // Add tags to included
            (product.relationships?.tags?.data || []).forEach((tag, index) => {
                included.push({
                    id: tag.id,
                    type: 'tags',
                    attributes: {
                        name: product.tags[index]?.name || `tag-${index}`
                    }
                });
            });
        });
        
        console.log(`[Featured Products Direct] Returning ${formattedProducts.length} products`);
        
        // Return the response in the format expected by the frontend
        return createCorsResponse(200, {
            products: formattedProducts,
            included: included
        });
    } catch (error) {
        console.error('[Featured Products Direct] Error:', error);
        return createCorsResponse(error.response?.status || 500, {
            status: 'error',
            message: 'Failed to fetch products',
            error: error.message,
            ...(process.env.NODE_ENV === 'development' && {
                stack: error.stack,
                details: error.response ? {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data
                } : undefined
            })
        });
    }
};

export default handler;
