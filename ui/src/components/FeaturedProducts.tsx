import React, { useState, useEffect, useMemo } from "react"; // Added useMemo
import { Link } from "react-router-dom";
import { useMarketStore } from "../utils/market-store"; // Use Zustand store
import { Brain } from "../brain/Brain";
import { ProductResponse } from "../brain/data-contracts";
import { ProductItemCard } from "components/ProductItemCard"; // Import the standard product card
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const FeaturedProductsComponent: React.FC<{ className?: string }> = ({ className }) => {
  const { market } = useMarketStore();

  const marketName = (typeof market === 'object' && market !== null ? market.name : market || 'UK') as 'UK' | 'EU';

  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("[FeaturedProducts] useEffect triggered. Current market:", market); // Log market in effect
    const fetchFeaturedProducts = async () => {
      // Add guard to ensure market is valid before fetching
      // Check the actual market value from the store
      if (!market) {
        console.warn("Market not selected or invalid, skipping featured product fetch.");
        setProducts([]); // Ensure products are cleared if market is invalid
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      try {
        // Fetch featured products for the current market
        const brainClient = new Brain();
        const response = await brainClient.get_featured_products({ market: marketName });
        if (!response) {
          throw new Error('Failed to fetch featured products');
        }
        const data = response.data;
        console.log("[FeaturedProducts] API Response data:", data); // Log fetched data
        // Ensure data is an array before setting
        setProducts(Array.isArray(data) ? data : []); 
      } catch (err) {
        console.error('[FeaturedProducts] Error fetching featured products:', err);
        setError(err instanceof Error ? err.message : 'Failed to load featured products. Please try again later.');
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, [market]); // Re-fetch when market changes

  const memoizedSkeletons = useMemo(() => {
    return Array.from({ length: 3 }).map((_, index) => ( // Render 3 skeletons
      <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
        <Skeleton className="h-48 w-full" />
        <div className="p-4 space-y-2">
          <Skeleton className="h-4 w-1/4" /> 
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="flex justify-between items-center pt-2">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-8 w-1/4" />
          </div>
        </div>
      </div>
    ));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array, skeletons are static

  return (
    <section className={`py-16 bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
            {/* Update subtitle based on market from store */}
            <p className="text-muted-foreground">
              Top picks for your {market === "UK" ? "United Kingdom" : "European"} training needs
            </p>
          </div>
          <Link 
            to="/products" 
            className="inline-flex items-center text-primary hover:text-primary/80 transition-colors font-medium"
          >
            View all products
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> 
          {/* Adjusted grid to lg:grid-cols-3 for 3 items */}
          {isLoading ? (
            memoizedSkeletons
          ) : error ? (
            <div className="col-span-1 md:col-span-2 lg:col-span-3"> {/* Span across columns */}
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          ) : products.length > 0 ? (
            products.map((product) => (
              // Wrap ProductItemCard with Link
              <Link
                key={product.id} 
                to={`/product-detail-page?sku=${product.code}&market=${marketName}`}
                className="block focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg"
                aria-label={`View details for ${product.name}`}
              >
                <ProductItemCard product={product} /> 
              </Link>
            ))
          ) : (
             <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center text-muted-foreground">
               No featured products available for this market right now.
             </div>
          )}
        </div>
      </div>
    </section>
  );
};

import { Market } from 'types';

interface FeaturedProductsProps {
  selectedMarket?: Market;
}

const FeaturedProducts = ({ selectedMarket }: FeaturedProductsProps) => {
  return <FeaturedProductsComponent className={selectedMarket?.name} />;
};

export default React.memo(FeaturedProducts);
