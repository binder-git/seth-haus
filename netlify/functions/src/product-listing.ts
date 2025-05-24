import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import fetch from 'node-fetch';

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

// Interfaces for Commerce Layer JSON:API structure

// Attributes for a Price resource
interface PriceAttributes {
    amount_float: number;
    currency_code: string;
    formatted_amount: string;
    compare_at_amount_float: number | null;
    formatted_compare_at_amount: string | null;
}

// Attributes for a Tag resource
interface TagAttributes {
    name: string;
}

// Basic resource identifier for relationships
interface RelationshipData<T extends string> {
    id: string;
    type: T;
}

// Relationships object for a resource
interface Relationships {
    prices?: { data: RelationshipData<'prices'>[] };
    tags?: { data: RelationshipData<'tags'>[] };
}

// Attributes for an SKU resource
interface SkuAttributes {
    code: string;
    name: string;
    description: string;
    image_url: string;
    reference: string;
    reference_origin: string;
    created_at: string;
    updated_at: string;
    metadata?: Record<string, any>;
    tags?: string[];
}

// Full JSON:API resource for an SKU
interface SkuResource {
    id: string;
    type: 'skus';
    attributes: SkuAttributes;
    relationships?: Relationships;
}

// Commerce Layer API response structure for fetching SKUs
interface CommerceLayerSkuApiResponse {
    data: SkuResource[];
    included?: (PriceResource | TagResource)[];
}

// Concrete types for included resources
interface PriceResource extends RelationshipData<'prices'> {
    attributes: PriceAttributes;
}

interface TagResource extends RelationshipData<'tags'> {
    attributes: TagAttributes;
}

// Interface for the transformed product object returned by the function
interface TransformedProduct {
    id: string;
    type: 'skus';
    attributes: {
        code: string;
        name: string;
        description: string;
        image_url: string;
        price: string;
        currency_code: string;
        compare_at_amount: string | null;
        formatted_compare_at_amount: string | null;
        reference_origin: string;
        created_at: string;
        updated_at: string;
    };
    relationships: {
        prices: { data: RelationshipData<'prices'>[] };
        tags: { data: RelationshipData<'tags'>[] };
    };
    tags?: { id: string; name: string; slug: string }[];
    category?: string;
}

// Interface for the final response body sent to the frontend
interface ProductListingResponseBody {
    products: TransformedProduct[];
    included: (PriceResource | TagResource)[];
}

// CORS headers that will be applied to ALL responses
const CORS_HEADERS: { [header: string]: string } = {
    'Access-Control-Allow-Origin': 'http://localhost:5173',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
};

/**
 * Create a CORS response helper.
 * Ensures CORS headers are always present.
 */
const createCorsResponse = (statusCode: number, body: object | null = null): { statusCode: number; headers: { [header: string]: string }; body: string } => {
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
const handleOptions = (): { statusCode: number; headers: { [header: string]: string }; body: string } => {
    return createCorsResponse(204);
};

// Custom error interface for network errors with a 'response' property
interface HttpError extends Error {
    response?: {
        status?: number;
        data?: any;
        statusText?: string;
    };
}

/**
 * Parse and normalize market ID to handle Commerce Layer full market IDs
 */
const parseMarketId = (marketParam: string): string => {
    const normalized = marketParam.toLowerCase();
    
    // Handle Commerce Layer full market IDs
    if (normalized.includes('vjzmjhvedo') || normalized === 'uk') {
        return 'uk';
    }
    
    if (normalized.includes('eu') || normalized === 'europe') {
        return 'eu';
    }
    
    // Log unrecognized markets for debugging
    console.warn(`[parseMarketId] Unrecognized market ID: ${marketParam}, defaulting to UK`);
    return 'uk';
};

async function getAccessToken(market: string): Promise<string> {
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
        scope = process.env.COMMERCE_LAYER_EU_SCOPE;
    } else if (market === 'uk') {
        scope = process.env.COMMERCE_LAYER_UK_SCOPE;
    } else {
        throw new Error('Invalid market specified. Must be "eu" or "uk"');
    }

    if (!scope) {
        throw new Error(`Missing scope for market: ${market}`);
    }

    try {
        console.log(`[getAccessToken] Requesting token for market: ${market}`);

        const authUrl = 'https://auth.commercelayer.io/oauth/token';

        console.log(`[getAccessToken] Client ID: ${clientId ? `${clientId.substring(0, 4)}...` : 'not set'}`);
        console.log(`[getAccessToken] Client Secret: ${clientSecret ? '***' : 'not set'}`);
        console.log(`[getAccessToken] Scope: ${scope}`);

        const requestBody = new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret,
            scope: scope
        }).toString();

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
        } catch (e: unknown) {
            console.error(`[getAccessToken] Failed to parse JSON response:`, e);
            if (e instanceof Error) {
                throw new Error(`Failed to parse token response: ${e.message}`);
            }
            throw new Error(`Failed to parse token response: ${String(e)}`);
        }

        if (!data.access_token) {
            console.error('[getAccessToken] No access_token in response:', data);
            throw new Error('No access token in response');
        }

        console.log('[getAccessToken] Successfully obtained access token');
        return data.access_token;
    } catch (error: unknown) {
        console.error('[getAccessToken] Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error message',
            stack: error instanceof Error ? error.stack : 'No stack available',
            response: (error as HttpError).response
        });
        throw error;
    }
}

async function getSkus(accessToken: string, skuListId: string, tag: string | null = null, includeTags: boolean = true): Promise<CommerceLayerSkuApiResponse> {
    const organization = process.env.COMMERCE_LAYER_ORGANIZATION;

    if (!organization) {
        throw new Error('COMMERCE_LAYER_ORGANIZATION environment variable is not set.');
    }

    try {
        // Fetch SKUs directly (no tag filtering - it's not supported by Commerce Layer API)
        const skusUrl = new URL(`https://${organization}.commercelayer.io/api/skus`);
        
        // REMOVED: Tag filtering is not supported by Commerce Layer API
        // The filter[tags_name_cont] is not allowed according to the API documentation
        
        // Set up includes
        const includes = ['prices', 'tags'];
        skusUrl.searchParams.append('include', includes.join(','));

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
        skusUrl.searchParams.append('sort', '-created_at');

        console.log(`[getSkus] Fetching SKUs from: ${skusUrl.toString()}`);

        const response = await fetch(skusUrl.toString(), {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/vnd.api+json',
                'Content-Type': 'application/vnd.api+json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            const httpError: HttpError = new Error(`Failed to fetch SKUs: ${response.status} ${response.statusText}`);
            httpError.response = { status: response.status, statusText: response.statusText, data: errorText };
            throw httpError;
        }

        const result = await response.json() as CommerceLayerSkuApiResponse;
        
        // CLIENT-SIDE tag filtering if a tag is provided
        if (tag && result.data) {
            console.log(`[getSkus] Applying client-side tag filtering for: ${tag}`);
            const originalCount = result.data.length;
            
            result.data = result.data.filter(sku => {
                // Find tags associated with this SKU
                const skuTagIds = sku.relationships?.tags?.data?.map(tagRef => tagRef.id) || [];
                const skuTags = result.included?.filter(item => 
                    item.type === 'tags' && skuTagIds.includes(item.id)
                ) as TagResource[] || [];
                
                // Check if any tag name contains the search term
                return skuTags.some(tagItem => 
                    tagItem.attributes?.name?.toLowerCase().includes(tag.toLowerCase())
                );
            });
            
            console.log(`[getSkus] Filtered from ${originalCount} to ${result.data.length} SKUs based on tag: ${tag}`);
        }

        return result;
    } catch (error: unknown) {
        console.error('[getSkus] Error in getSkus:', error);
        throw error;
    }
}

/**
 * Netlify function handler for product listing.
 * This is the main entry point that Netlify will call.
 */
export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
    // Handle OPTIONS request for CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return handleOptions();
    }

    try {
        const marketParam = event.queryStringParameters?.market;
        const tag = event.queryStringParameters?.tag; // Optional tag parameter

        if (!marketParam) {
            console.error('[product-listing] Missing market query parameter');
            return createCorsResponse(400, { message: 'Missing market query parameter' });
        }

        console.log(`[product-listing] Received request for market: ${marketParam}, tag: ${tag || 'none'}`);

        // Parse and normalize the market ID
        const market = parseMarketId(marketParam);
        console.log(`[product-listing] Normalized market from '${marketParam}' to '${market}'`);

        let skuListId: string | undefined;
        // Determine the SKU list ID based on the normalized market
        if (market === 'uk') {
            skuListId = process.env.COMMERCE_LAYER_UK_SKU_LIST_ID;
        } else if (market === 'eu') {
            skuListId = process.env.COMMERCE_LAYER_EU_SKU_LIST_ID;
        }

        if (!skuListId) {
            console.error(`[product-listing] No SKU list ID found for market: ${market} (original: ${marketParam})`);
            return createCorsResponse(500, { message: `No SKU list ID configured for market: ${market}` });
        }

        const accessToken = await getAccessToken(market);
        const skuResponse = await getSkus(accessToken, skuListId, tag);

        // Debug: Log the raw SKU data to understand the structure
        console.log('[product-listing] Raw SKU data (first item):', JSON.stringify(skuResponse.data[0], null, 2));
        if (skuResponse.data[0]) {
            console.log('[product-listing] First SKU attributes:', skuResponse.data[0].attributes);
            console.log('[product-listing] First SKU code:', skuResponse.data[0].attributes?.code);
            console.log('[product-listing] First SKU name:', skuResponse.data[0].attributes?.name);
        }

        // Transform SKUs for the frontend
        const transformedProducts: TransformedProduct[] = skuResponse.data.map(sku => {
            // Find the primary price
            const priceRelationship = sku.relationships?.prices?.data?.[0];
            const priceResource = priceRelationship
                ? skuResponse.included?.find(item => item.id === priceRelationship.id && item.type === 'prices') as PriceResource
                : undefined;

            // Handle both possible data structures for SKU attributes
            const code = sku.attributes?.code || '';
            const name = sku.attributes?.name || '';
            const description = sku.attributes?.description || '';
            const image_url = sku.attributes?.image_url || '';
            const reference_origin = sku.attributes?.reference_origin || '';
            const created_at = sku.attributes?.created_at || '';
            const updated_at = sku.attributes?.updated_at || '';

            console.log(`[product-listing] Processing SKU: ${code} - ${name}`);

            const transformedProduct: TransformedProduct = {
                id: sku.id,
                type: 'skus',
                attributes: {
                    code: code,
                    name: name,
                    description: description,
                    image_url: image_url,
                    price: priceResource?.attributes.formatted_amount || 'N/A',
                    currency_code: priceResource?.attributes.currency_code || 'N/A',
                    compare_at_amount: priceResource?.attributes.compare_at_amount_float?.toString() || null,
                    formatted_compare_at_amount: priceResource?.attributes.formatted_compare_at_amount || null,
                    reference_origin: reference_origin,
                    created_at: created_at,
                    updated_at: updated_at,
                },
                relationships: {
                    prices: sku.relationships?.prices || { data: [] },
                    tags: sku.relationships?.tags || { data: [] },
                },
                // Add tags here if you want them transformed and directly on the product object
                tags: sku.relationships?.tags?.data.map(tagData => {
                    const tagResource = skuResponse.included?.find(item => item.id === tagData.id && item.type === 'tags') as TagResource;
                    return tagResource ? { id: tagResource.id, name: tagResource.attributes.name, slug: tagResource.id } : undefined;
                }).filter(Boolean) as { id: string; name: string; slug: string }[] || [],
            };
            return transformedProduct;
        });

        console.log(`[product-listing] Successfully fetched and transformed ${transformedProducts.length} products.`);
        console.log('[product-listing] First transformed product:', JSON.stringify(transformedProducts[0], null, 2));
        
        return createCorsResponse(200, { products: transformedProducts, included: skuResponse.included || [] });

    } catch (error: unknown) {
        console.error('[product-listing] Error in handler:', error);
        let errorMessage = 'An unexpected error occurred.';
        let statusCode = 500;

        if (error instanceof Error) {
            errorMessage = error.message;
            const httpError = error as HttpError;
            if (httpError.response?.status) {
                statusCode = httpError.response.status;
                if (statusCode >= 400 && statusCode < 500 && httpError.response.data) {
                    try {
                        errorMessage = JSON.parse(httpError.response.data).errors?.map((err: any) => err.detail).join(', ') || errorMessage;
                    } catch (e) {
                        errorMessage = httpError.response.data;
                    }
                }
            }
        }
        return createCorsResponse(statusCode, { message: `Function error: ${errorMessage}` });
    }
};
