import { create } from "zustand";
import { useMemo, useState, useEffect } from 'react';
import { Market, Product } from '@/types';
import { commerceLayerApi } from '@/api/commerceLayerApi';
import { toast } from "sonner";
import { mapCommerceLayerSkuToProduct } from './';

interface ProductState {
  products: any[]; // Store raw CL products
  isLoading: boolean;
  error: string | null;
  currentMarketId: string | null; // Track current market
  // Actions
  fetchProducts: (market: Market, category?: string | null) => Promise<void>;
  clearProducts: () => void; // Add clear function
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: false,
  error: null,
  currentMarketId: null,

  fetchProducts: async (market: Market, category?: string | null) => {
    const selectedMarket = market;
    const marketId = selectedMarket.id || selectedMarket.scope;

    set({ isLoading: true, error: null, currentMarketId: marketId });
    console.log(
      `[product-store] Fetching products for market: ${selectedMarket.name} (${marketId}), category: ${category || 'All'}`,
    );

    try {
      // Set the market for the singleton instance
      commerceLayerApi.setMarket(marketId);
      
      // Fetch products for the specific market (remove market from options)
      const response = await commerceLayerApi.getProductsListing({
        ...(category && { category })
      });
      
      console.log('Commerce Layer API response:', response);
      
      if (response && response.products) {
        console.log(`Received ${response.products.length} products for market ${selectedMarket.name} (${marketId})`);
        // Store the raw product data
        set({
          products: response.products,
          isLoading: false,
          currentMarketId: marketId
        });
      } else {
        console.error(`Unexpected response format for market ${selectedMarket.name} (${marketId}):`, response);
        const errorMsg = "Unexpected response format from server";
        set({ error: errorMsg, isLoading: false, products: [], currentMarketId: marketId });
        toast.error("Failed to fetch products: Unexpected response format");
      }
    } catch (error: any) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch products';
      console.error(`Error fetching products for market ${selectedMarket.name}:`, errorMsg, error);
      set({ error: errorMsg, isLoading: false, products: [], currentMarketId: marketId });
      toast.error(errorMsg);
    }
  },

  clearProducts: () => {
    set({ products: [], error: null, currentMarketId: null });
  }
}));

export const useAppProducts = (market: Market | null) => {
  const { 
    products: rawClProducts, 
    isLoading, 
    error: fetchError, 
    fetchProducts,
    currentMarketId 
  } = useProductStore();
  const [mappingError, setMappingError] = useState<Error | null>(null);

  // Auto-fetch products when market changes
  useEffect(() => {
    if (!market) return;
    
    const marketId = market.id || market.scope;
    
    // Only fetch if market has changed or no products loaded
    if (currentMarketId !== marketId || rawClProducts.length === 0) {
      console.log('[useAppProducts] Market changed or no products, fetching...', {
        currentMarketId,
        newMarketId: marketId,
        hasProducts: rawClProducts.length > 0
      });
      fetchProducts(market);
    }
  }, [market, fetchProducts, currentMarketId, rawClProducts.length]);

  const computation = useMemo(() => {
    if (!market || rawClProducts.length === 0) {
      return { data: [], error: null };
    }
    
    const newMappedProducts: Product[] = [];
    let caughtError: Error | null = null;
    
    for (const product of rawClProducts) {
      try {
        const mappedProduct = mapCommerceLayerSkuToProduct(product, market);
        if (mappedProduct) {
          newMappedProducts.push(mappedProduct);
        }
      } catch (e: any) {
        console.error(`[useAppProducts] Error mapping product with code ${product.code || 'unknown'}:`, product, e);
        caughtError = e instanceof Error ? e : new Error(String(e));
        // Continue with other products even if one fails
      }
    }
    
    return { 
      data: newMappedProducts, 
      error: caughtError 
    };
  }, [rawClProducts, market]);

  useEffect(() => {
    setMappingError(computation.error || null);
  }, [computation.error]);

  const mappedProducts = computation.data;
  const combinedError = fetchError || mappingError?.message || null;

  return {
    products: mappedProducts,
    isLoading,
    error: combinedError,
  };
};
