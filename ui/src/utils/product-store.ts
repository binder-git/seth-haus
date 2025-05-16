import React, { useMemo } from "react";
import brain from "brain";
import { create } from "zustand";
import { Market, Product } from '@/types';
import { ProductResponse } from "../brain/data-contracts";
import { useMarketStore } from "./market-store"; // Adjust if market store is elsewhere
import { mapCommerceLayerProductToAppProduct } from "./commerce-layer-mapper"; // Corrected import path
import { toast } from "sonner";

interface ProductState {
  products: ProductResponse[]; // Store raw CL products
  isLoading: boolean;
  error: string | null;
  // Actions
  fetchProducts: (market: Market, category?: string | null) => Promise<void>; // Market is now required
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async (market: Market, category?: string | null) => { // Market is now required
    // Removed fallback: const selectedMarket = market || useMarketStore.getState().market;
    const selectedMarket = market; // Use the provided market

    // Caching logic removed - fetch should be triggered by component based on market/category

    set({ isLoading: true, error: null });
    console.log(
      `[product-store] Fetching Commerce Layer products for market: ${selectedMarket.name} (${selectedMarket.region}), category: ${category || 'All'}`,
    );

    try {
      // Fetch products from the Commerce Layer API endpoint
      const response = await brain.get_commerce_layer_products({
          market: selectedMarket.name.toUpperCase(),
          category: category, // Pass category to API
      });
      const data = response.data;

      if (data?.products) {
        console.log(`Received ${data.products.length} Commerce Layer products for market ${selectedMarket.name} (${selectedMarket.region}), category: ${category || 'All'}`);
        // Store the raw Commerce Layer product data
        set({
          products: data.products as ProductResponse[],
          isLoading: false,
        });
      } else {
        console.error(`Error fetching products for market ${selectedMarket.name} (${selectedMarket.region}), category: ${category || 'All'}`);
        set({ error: "Failed to fetch products", isLoading: false, products: [] });
        toast.error("Failed to fetch products");
      }
    } catch (error: any) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch products';
      console.error(`Catch error fetching products for market ${selectedMarket.name} (${selectedMarket.region}), category: ${category || 'All'}:`, errorMsg);
      set({ error: errorMsg, isLoading: false, products: [] });
      toast.error(errorMsg);
    }
  },
}));

// Listener setup removed - Component (Products.tsx) is now responsible for triggering fetches
// const initializeProductStoreListeners = () => {
//   // Subscribe to market changes
//   useMarketStore.subscribe(({ selectedMarket }, { selectedMarket: prevMarket }) => {
//     // Refetch products only if the market actually changes
//     if (selectedMarket !== prevMarket) {
//         console.log(`Market changed from ${prevMarket} to ${selectedMarket}. Component should handle refetch.`);
//         // Triggering fetch from here is removed
//     }
//   });
// };
// // Call initializer
// initializeProductStoreListeners();

// Helper hook to get mapped products for use in the app
import { useState, useEffect } from 'react'; // Added for mapping error state


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
        newMappedProducts.push(mapCommerceLayerProductToAppProduct(product, market));
      } catch (e: any) {
        console.error(`[useAppProducts] Error mapping product with code ${product.code || 'unknown'}:`, product, e);
        caughtError = e instanceof Error ? e : new Error(String(e));
        // Stop mapping on first error and return partial data with error
        // Or, to return all mappable products, push an error placeholder or skip, then return newMappedProducts
        return { data: newMappedProducts, error: caughtError }; // Return what's mapped so far + error
      }
    }
    return { data: newMappedProducts, error: null };
  }, [rawClProducts, market]);

  useEffect(() => {
    setMappingError(computation.error);
  }, [computation.error]);

  const mappedProducts = computation.data;
  const combinedError = fetchError || mappingError;

  return {
    products: mappedProducts,
    isLoading,
    error: combinedError,
  };
};
