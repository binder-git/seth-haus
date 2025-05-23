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
  // Actions
  fetchProducts: (market: Market, category?: string | null) => Promise<void>;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async (market: Market, category?: string | null) => {
    const selectedMarket = market;

    set({ isLoading: true, error: null });
    console.log(
      `[product-store] Fetching products for market: ${selectedMarket.name} (${selectedMarket.id}), category: ${category || 'All'}`,
    );

    try {
      // Set the market for the singleton instance
      commerceLayerApi.setMarket(selectedMarket.id);
      
      // Fetch products for the specific market
      const response = await commerceLayerApi.getProductsListing({
        market: selectedMarket.id,
        ...(category && { category })
      });
      
      console.log('Commerce Layer API response:', response);
      
      if (response && response.products) {
        console.log(`Received ${response.products.length} products for market ${selectedMarket.name} (${selectedMarket.id})`);
        // Store the raw product data
        set({
          products: response.products,
          isLoading: false,
        });
      } else {
        console.error(`Unexpected response format for market ${selectedMarket.name} (${selectedMarket.id}):`, response);
        const errorMsg = "Unexpected response format from server";
        set({ error: errorMsg, isLoading: false, products: [] });
        toast.error("Failed to fetch products: Unexpected response format");
      }
    } catch (error: any) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch products';
      console.error(`Error fetching products for market ${selectedMarket.name} (${selectedMarket.region}):`, errorMsg, error);
      set({ error: errorMsg, isLoading: false, products: [] });
      toast.error(errorMsg);
    }
  },
}));

export const useAppProducts = (market: Market | null) => {
  const { products: rawClProducts, isLoading, error: fetchError } = useProductStore();
  const [mappingError, setMappingError] = useState<Error | null>(null);

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
