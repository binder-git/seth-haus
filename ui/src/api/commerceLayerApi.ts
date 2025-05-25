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
  // Define apiBasePath here so it's accessible throughout the class
  private apiBasePath: string;

  constructor(marketId: string = 'UK') {
    this.marketId = marketId;
    // Updated to use /api/ instead of /.netlify/functions/
    // In local dev, this will be "/api"
    // In production/build, this will use the redirect to /.netlify/functions/
    this.apiBasePath = '/api';
  }

  /**
   * Set the market for subsequent API calls
   */
  setMarket(marketId: string): void {
    this.marketId = marketId;
  }

  /**
   * Get featured products for the homepage
   * Calls the 'featured-products' Netlify function via /api/ redirect
   */
  async getFeaturedProducts(category?: string): Promise<{ products: Product[] }> {
    const params = new URLSearchParams({
      market: this.marketId, // ✅ FIXED: Removed .toLowerCase() to preserve case
      ...(category && { category })
    });

    try {
      // CRUCIAL CHANGE: Use /api/ path which redirects to /.netlify/functions/
      const url = new URL(`${this.apiBasePath}/featured-products?${params.toString()}`, window.location.origin);
      console.log(`[CommerceLayerApi] Fetching featured products from: ${url.toString()}`); // Use .toString() for clarity
      
      const response = await fetch(url.toString(), { // Fetch expects a string
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
      console.log(`[CommerceLayerApi] responseData.products length: ${responseData.products?.length || 0}`);
      
      // ✅ FIXED: Use responseData.products instead of responseData.data
      const transformedProducts = responseData.products?.map((product: any) => ({
        id: product.id,
        code: product.attributes?.code || '',
        name: product.attributes?.name || '',
        description: product.attributes?.description || '',
        image_url: product.attributes?.image_url || null,
        price: product.attributes?.price || 'N/A',
        currency: product.attributes?.currency_code || 'N/A'
      })) || [];
      
      return { products: transformedProducts };
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  }

  /**
   * Get products listing with filtering options
   * Calls the 'product-listing' Netlify function via /api/ redirect
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
    const params = new URLSearchParams({
      market: this.marketId, // ✅ FIXED: Removed .toLowerCase() to preserve case
      ...(options.category && { category: options.category }),
      ...(options.page && { page: options.page.toString() }),
      ...(options.pageSize && { pageSize: options.pageSize.toString() }),
      ...(options.sortBy && { sortBy: options.sortBy })
    });

    try {
      // CRUCIAL CHANGE: Use /api/ path which redirects to /.netlify/functions/
      const url = new URL(`${this.apiBasePath}/product-listing?${params.toString()}`, window.location.origin);
      console.log(`[CommerceLayerApi] Fetching product listing from: ${url.toString()}`);

      const response = await fetch(
        url.toString(), // Fetch expects a string
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

      const responseData = await response.json();
      console.log('[CommerceLayerApi] Raw product listing response:', responseData);

      // ✅ FIXED: Transform the correct structure from your function response
      const transformedProducts = responseData.products?.map((product: any) => ({
        id: product.id,
        code: product.attributes?.code || '',
        name: product.attributes?.name || '',
        description: product.attributes?.description || '',
        image_url: product.attributes?.image_url || null,
        price: product.attributes?.price || 'N/A',
        currency: product.attributes?.currency_code || 'N/A'
      })) || [];

      console.log('[CommerceLayerApi] Transformed products:', transformedProducts);

      return {
        products: transformedProducts,
        total: transformedProducts.length,
        page: 1,
        totalPages: 1
      };
    } catch (error) {
      console.error('Error fetching product listing:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const commerceLayerApi = new CommerceLayerApi();
export default CommerceLayerApi;
