import { create } from "zustand";
import { useMemo } from 'react';
import { mapCommerceLayerProductToAppProduct } from "./commerce-layer-mapper";
import { toast } from "sonner";
import { netlifyBrain } from "@/brain/NetlifyBrain";
export const useProductStore = create((set, get) => ({
    products: [],
    isLoading: false,
    error: null,
    fetchProducts: async (market, category) => {
        const selectedMarket = market; // Use the provided market
        set({ isLoading: true, error: null });
        console.log(`[product-store] Fetching products via Netlify Function for market: ${selectedMarket.name} (${selectedMarket.region}), category: ${category || 'All'}`);
        try {
            // Fetch products using the Netlify Brain service
            const response = await netlifyBrain.get_commerce_layer_products({
                market: selectedMarket.name.toUpperCase(),
                category: category || undefined,
            });
            console.log('Netlify Function response:', response);
            // The response is in the format { data: { products: ProductResponse[], meta?: any } }
            const products = response?.data?.products;
            if (Array.isArray(products)) {
                console.log(`Received ${products.length} products for market ${selectedMarket.name} (${selectedMarket.region}), category: ${category || 'All'}`);
                // Store the raw product data
                set({
                    products,
                    isLoading: false,
                });
            }
            else {
                console.error(`Unexpected response format for market ${selectedMarket.name} (${selectedMarket.region}):`, response);
                const errorMsg = "Unexpected response format from server";
                set({ error: errorMsg, isLoading: false, products: [] });
                toast.error("Failed to fetch products: Unexpected response format");
            }
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to fetch products';
            console.error(`Error fetching products for market ${selectedMarket.name} (${selectedMarket.region}):`, errorMsg, error);
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
export const useAppProducts = (market) => {
    const { products: rawClProducts, isLoading, error: fetchError } = useProductStore();
    const [mappingError, setMappingError] = useState(null);
    const computation = useMemo(() => {
        if (!market || rawClProducts.length === 0) {
            return { data: [], error: null };
        }
        const newMappedProducts = [];
        let caughtError = null;
        for (const product of rawClProducts) {
            try {
                newMappedProducts.push(mapCommerceLayerProductToAppProduct(product, market));
            }
            catch (e) {
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
