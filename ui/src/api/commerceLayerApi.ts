import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { COMMERCE_LAYER_CONFIG, MARKETS, API_CONFIG } from '@/config/constants';

// Environment variables are loaded via import.meta.env in Vite

// Type definitions for Commerce Layer API responses
interface CommerceLayerSku {
  id: string;
  type: string;
  code: string;
  name: string;
  description: string | null;
  image_url: string | null;
  relationships?: {
    tags?: {
      data: Array<{
        id: string;
        type: string;
      }>;
    };
    prices?: {
      data: Array<{
        id: string;
        type: string;
      }>;
    };
    images?: {
      data: Array<{
        id: string;
        type: string;
      }>;
    };
  };
  prices?: Array<{
    id: string;
    type: string;
    currency_code: string;
    formatted_amount: string;
    amount_cents: number;
  }>;
  images?: Array<{
    id: string;
    type: string;
    url: string;
  }>;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  image_url: string | null;
  price: string;
  currency: string;
}

// Cache for access tokens by market
const tokenCache: Record<string, { token: string; expiresAt: number }> = {};

class CommerceLayerApi {
  private client: AxiosInstance;
  private marketId: string;

  constructor(marketId: string = 'UK') {
    this.marketId = marketId;
    
    this.client = axios.create({
      baseURL: API_CONFIG.baseUrl,
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      },
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use(
      async (config) => {
        // Skip for auth requests to avoid infinite loops
        if (config.url?.includes('oauth/token')) {
          return config;
        }

        const token = await this.getAccessToken();
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get an access token for the current market
   */
  private async getAccessToken(): Promise<string> {
    const market = Object.values(MARKETS).find(m => m.id === this.marketId || m.name === this.marketId);
    if (!market) {
      throw new Error(`Market not found: ${this.marketId}`);
    }

    const cacheKey = market.id;
    const cachedToken = tokenCache[cacheKey];
    
    // Return cached token if it's still valid (with 5 minute buffer)
    if (cachedToken && cachedToken.expiresAt > Date.now() + 300000) {
      return cachedToken.token;
    }

    // Get client credentials from environment variables
    const clientId = import.meta.env.VITE_COMMERCE_LAYER_CLIENT_ID || '';
    const clientSecret = import.meta.env.VITE_COMMERCE_LAYER_CLIENT_SECRET || '';

    if (!clientId || !clientSecret) {
      throw new Error('Missing Commerce Layer client credentials. Make sure to set VITE_COMMERCE_LAYER_CLIENT_ID and VITE_COMMERCE_LAYER_CLIENT_SECRET environment variables.');
    }

    try {
      // Use the OAuth token endpoint from config with proper headers and body
      const response = await axios.post(
        API_CONFIG.authUrl,
        {
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
          scope: market.scope // Include the market scope in the token request
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      const { access_token, expires_in } = response.data;
      
      // Cache the token
      tokenCache[cacheKey] = {
        token: access_token,
        expiresAt: Date.now() + (expires_in * 1000)
      };

      return access_token;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw new Error('Failed to authenticate with Commerce Layer');
    }
  }

  /**
   * Get featured products for the current market
   * @param category Optional category to filter products by tag
   */
  async getFeaturedProducts(category?: string): Promise<{ products: Product[] }> {
    try {
      type MarketType = {
        id: string;
        name: string;
        skuListId?: string;
        currencyCode?: string;
        [key: string]: any;
      };

      const market = Object.values(MARKETS).find(m => m.id === this.marketId || m.name === this.marketId) as MarketType | undefined;
      if (!market) {
        throw new Error(`Market not found: ${this.marketId}`);
      }

      // Determine the base URL based on the environment
      const isDev = import.meta.env.DEV;
      const baseUrl = isDev ? 'http://localhost:9999' : '';
      
      // Build the query parameters
      const params = new URLSearchParams({
        market: market.name.toLowerCase(),
        ...(category && { category })
      });
      
      // Call our Netlify function to fetch products
      const response = await fetch(`${baseUrl}/.netlify/functions/featured-products-direct?${params.toString()}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch products: ${response.statusText}`);
      }

      const responseData = await response.json();
      
      // Extract products from the response
      const productsData = responseData.products || [];
      const included = responseData.included || [];
      
      if (!Array.isArray(productsData)) {
        throw new Error('Invalid response format: products data is not an array');
      }

      // Create a map of included resources for easy lookup
      const includedMap = included.reduce((acc: any, item: any) => {
        if (!acc[item.type]) {
          acc[item.type] = {};
        }
        acc[item.type][item.id] = item.attributes;
        return acc;
      }, {});

      // Map the products to the expected format
      const products = productsData.map((product: any) => ({
        id: product.id,
        type: product.type || 'skus',
        attributes: {
          code: product.attributes?.code || '',
          name: product.attributes?.name || 'Unnamed Product',
          description: product.attributes?.description || '',
          image_url: product.attributes?.image_url || null,
          price: product.attributes?.price || '0',
          currency_code: product.attributes?.currency_code || 'USD',
        },
        relationships: product.relationships || {}
      }));

      // Return the response in the format expected by product-store.js
      return {
        data: products,
        included: included
      };
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  }

  /**
   * Update the market for subsequent API calls
   */
  setMarket(marketId: string): void {
    this.marketId = marketId;
  }
}

// Export the class
export { CommerceLayerApi };

// Create and export a singleton instance
export const commerceLayerApi = new CommerceLayerApi();

// Also export as default
export default CommerceLayerApi;
