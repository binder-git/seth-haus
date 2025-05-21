import { MARKETS } from '@/config/constants';

// Frontend's expected Product interface
export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  image_url: string | null;
  price: string;
  currency: string;
}

class CommerceLayerApi {
  private marketId: string;

  constructor(marketId: string = 'UK') {
    this.marketId = marketId;
  }

  /**
   * Set the market for subsequent API calls
   */
  setMarket(marketId: string): void {
    this.marketId = marketId;
  }

  /**
   * Get featured products for the homepage
   * Calls the 'featured-products' Netlify function
   */
  async getFeaturedProducts(category?: string): Promise<{ products: Product[] }> {
    // Use a fixed URL for local function development, as netlify dev won't proxy.
    // This assumes your function server runs on http://localhost:9999
    const baseUrl = import.meta.env.DEV ? 'http://localhost:9999/.netlify/functions' : '';
    
    const params = new URLSearchParams({
      market: this.marketId.toLowerCase(),
      ...(category && { category })
    });

    try {
      // The full path including /.netlify/functions/ is needed when NOT proxied by netlify dev
      const url = `${baseUrl}/featured-products?${params.toString()}`;
      console.log(`[CommerceLayerApi] Fetching featured products from: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`[CommerceLayerApi] API response not OK: ${response.status} ${response.statusText}`, errorData);
        throw new Error(errorData.message || `Failed to fetch products: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('[CommerceLayerApi] Raw responseData from Netlify function:', responseData);
      // Keep looking for 'data' key based on past consistent behavior
      console.log(`[CommerceLayerApi] responseData.data length: ${responseData.data?.length || 0}`);
      
      return { products: responseData.data || [] }; // Still expecting 'data'
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  }

  /**
   * Get products listing with filtering options
   * Calls the 'product-listing' Netlify function
   */
  async getProductsListing(options: {
    category?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
  } = {}): Promise<{ 
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    // Use a fixed URL for local function development
    const baseUrl = import.meta.env.DEV ? 'http://localhost:9999/.netlify/functions' : '';
    
    const params = new URLSearchParams({
      market: this.marketId.toLowerCase(),
      ...(options.category && { category: options.category }),
      ...(options.page && { page: options.page.toString() }),
      ...(options.pageSize && { pageSize: options.pageSize.toString() }),
      ...(options.sortBy && { sortBy: options.sortBy })
    });

    try {
      const url = `${baseUrl}/product-listing?${params.toString()}`;
      console.log(`[CommerceLayerApi] Fetching product listing from: ${url}`);

      const response = await fetch(
        url,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch product listing: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching product listing:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const commerceLayerApi = new CommerceLayerApi();
export default CommerceLayerApi;