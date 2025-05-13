import React, { useState, useEffect, useMemo } from "react"; // Added useMemo
import { Link } from "react-router-dom";
import { useMarketStore } from "../utils/market-store"; // Use Zustand store
import brain from "brain"; // Import brain client
import { ProductResponse } from "types"; // Import response type
import { ProductItemCard } from "components/ProductItemCard"; // Import the standard product card
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton for loading
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // For errors
import { AlertTriangle } from "lucide-react"; // Error icon

// Remove Props interface and selectedMarket prop
const FeaturedProductsComponent = ({ className = "" }: { className?: string }) => {
  // Get market directly using the correct property name
  const market = useMarketStore((state) => state.market);
  console.log("[FeaturedProducts] Initial market from store:", market); // Log initial market
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("[FeaturedProducts] useEffect triggered. Current market:", market); // Log market in effect
    const fetchFeaturedProducts = async () => {
      // Add guard to ensure market is valid before fetching
      // Check the actual market value from the store
      if (!market || (market !== 'UK' && market !== 'EU')) {
        console.warn("Market not selected or invalid, skipping featured product fetch.");
        setProducts([]); // Ensure products are cleared if market is invalid
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      try {
        // Fetch featured products for the current market
        const response = await brain.get_featured_products({ market });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: ProductResponse[] = await response.json();
        console.log("[FeaturedProducts] API Response data:", data); // Log fetched data
        // Ensure data is an array before setting
        setProducts(Array.isArray(data) ? data : []); 
      } catch (err) {
        console.error("Failed to fetch featured products:", err);
        setError("Failed to load featured products. Please try again later.");
        setProducts([]); // Clear products on error
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
                to={`/product-detail-page?sku=${product.code}&market=${market}`}
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

export const FeaturedProducts = React.memo(FeaturedProductsComponent);
