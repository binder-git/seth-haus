/**
 * A lightweight version of the Brain service that points to Netlify Functions
 */
export class NetlifyBrain {
    baseUrl;
    baseApiParams;
    constructor() {
        this.baseUrl = ''; // Relative URL - will be handled by Netlify proxy
        this.baseApiParams = {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        };
    }
    /**
     * Get products from Commerce Layer via Netlify Function
     */
    async get_commerce_layer_products(query, params = {}) {
        try {
            const { market, category, page = 1, perPage = 25 } = query;
            // Build query parameters
            const queryParams = new URLSearchParams({
                market: market || 'UK',
                ...(category && category.toLowerCase() !== 'all' && { category }),
                page: page.toString(),
                perPage: perPage.toString()
            });
            const response = await fetch(`/.netlify/functions/products?${queryParams.toString()}`, {
                ...this.baseApiParams,
                ...params,
            });
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || 'Failed to fetch products');
            }
            const responseData = await response.json();
            // Map the response to match the expected format
            const products = Array.isArray(responseData.data) ? responseData.data : [];
            return {
                data: {
                    products,
                    meta: responseData.meta || {
                        total: responseData.total || products.length,
                        page: responseData.page || 1,
                        per_page: responseData.per_page || products.length,
                        total_pages: responseData.total_pages || 1
                    }
                }
            };
        }
        catch (error) {
            console.error('Error in get_commerce_layer_products:', error);
            throw error;
        }
    }
    // Add other methods as needed, or keep them as stubs
    check_health() {
        return Promise.resolve({ data: { status: 'ok' } });
    }
    get_cl_access_token2() {
        return Promise.reject(new Error('Not implemented'));
    }
    async get_featured_products(params) {
        try {
            console.log('[NetlifyBrain] Fetching featured products for market:', params.market);
            // Use the direct path to the function
            const url = `/.netlify/functions/featured-products?market=${params.market}`;
            console.log('[NetlifyBrain] Request URL:', url);
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            if (!response.ok) {
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    console.error('[NetlifyBrain] Error response:', errorData);
                    errorMessage = errorData.message || errorMessage;
                }
                catch (e) {
                    console.error('[NetlifyBrain] Failed to parse error response:', e);
                }
                throw new Error(`Failed to fetch featured products: ${errorMessage}`);
            }
            const data = await response.json();
            console.log('[NetlifyBrain] Received featured products data:', data);
            // Map the response to match the expected format
            const products = Array.isArray(data.products) ? data.products : [];
            console.log(`[NetlifyBrain] Found ${products.length} featured products`);
            return {
                data: {
                    products,
                    meta: {
                        total: products.length,
                        page: 1,
                        per_page: products.length,
                        total_pages: 1
                    }
                }
            };
        }
        catch (error) {
            console.error('Error in get_featured_products:', error);
            throw error;
        }
    }
    get_product_details() {
        return Promise.reject(new Error('Not implemented'));
    }
}
// Create a singleton instance
export const netlifyBrain = new NetlifyBrain();
