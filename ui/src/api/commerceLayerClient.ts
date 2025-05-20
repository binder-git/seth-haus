import axios from 'axios';
import { COMMERCE_LAYER_CONFIG, API_CONFIG, MARKETS } from '@/config/constants';

// Type definitions for Commerce Layer API responses
interface CommerceLayerSku {
  id: string;
  type: string;
  code: string;
  name: string;
  description: string | null;
  image_url: string | null;
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

interface CommerceLayerResponse<T> {
  data: T[];
  included?: any[];
  meta?: {
    page_count: number;
    record_count: number;
  };
}

interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  image_url: string | null;
  price: string;
  currency: string;
}

const API_BASE_URL = API_CONFIG.baseUrl;

// Cache for access tokens by market
const tokenCache: Record<string, { token: string; expiresAt: number }> = {};

/**
 * Get an access token for the specified market
 */
async function getAccessToken(marketId: string = 'UK'): Promise<string> {
  const market = Object.values(MARKETS).find(m => m.id === marketId || m.name === marketId);
  if (!market) {
    throw new Error(`Market not found: ${marketId}`);
  }

  const cacheKey = market.id;
  const cachedToken = tokenCache[cacheKey];
  
  // Return cached token if it's still valid (with 5 minute buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 300000) {
    return cachedToken.token;
  }

  // Get client credentials from centralized configuration
  const clientId = window.__COMMERCE_LAYER_CLIENT_ID__;
  const clientSecret = window.__COMMERCE_LAYER_CLIENT_SECRET__;

  if (!clientId || !clientSecret) {
    throw new Error('Missing Commerce Layer client credentials. Make sure to set window.__COMMERCE_LAYER_CLIENT_ID__ and window.__COMMERCE_LAYER_CLIENT_SECRET__');
  }

  try {
    const response = await axios.post(
      API_CONFIG.authUrl,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: market.scope
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
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
 * Make an authenticated request to the Commerce Layer API
 */
async function apiRequest<T>(path: string, marketId: string = 'UK', params: Record<string, any> = {}): Promise<CommerceLayerResponse<T>> {
  try {
    const token = await getAccessToken(marketId);
    const response = await axios.get<CommerceLayerResponse<T>>(`${API_BASE_URL}${path}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json'
      },
      params
    });
    
    return response.data;
  } catch (error) {
    console.error('Commerce Layer API request failed:', error);
    throw error;
  }
}

/**
 * Get featured products for a market
 */
export async function getFeaturedProducts(marketId: string = 'UK') {
  try {
    // First, get the SKU list ID for the market
    const market = Object.values(MARKETS).find(m => m.id === marketId || m.name === marketId);
    if (!market) {
      throw new Error(`Market not found: ${marketId}`);
    }

    // Get products from the SKU list
    const response = await apiRequest<CommerceLayerSku>(
      `/skus`,
      marketId,
      {
        'filter[market_id_eq]': market.id,
        'include': 'prices,images',
        'page[size]': 10
      }
    );

    // Transform the response to match the expected format
    const products: Product[] = response.data.map((sku: CommerceLayerSku) => {
      const price = sku.prices?.[0]?.formatted_amount || 'N/A';
      const currency = sku.prices?.[0]?.currency_code || 'USD';
      const imageUrl = sku.images?.[0]?.url || null;
      
      return {
        id: sku.id,
        code: sku.code,
        name: sku.name,
        description: sku.description || '',
        image_url: imageUrl,
        price: price,
        currency: currency
      };
    });

    return { products };
  } catch (error) {
    console.error('Error fetching featured products:', error);
    throw error;
  }
}
