import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { ProductItemCard } from "components/ProductItemCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useProductStore } from "@/utils/product-store";
// ✅ FIXED: Import the correct types from your existing type definitions
import { MarketConfig } from "@/types/models/market";

interface MemoizedSkeletonProps {
  count?: number;
}

interface FeaturedProductsComponentProps {
  className?: string;
  selectedMarket?: MarketConfig;
}

interface FeaturedProductsProps {
  className?: string;
}

// Memoized skeleton component to prevent recreation on each render
const MemoizedSkeleton = React.memo<MemoizedSkeletonProps>(({ count = 3 }) => {
    return Array.from({ length: count }).map((_, index) => (
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
});

const FeaturedProductsComponent = React.memo<FeaturedProductsComponentProps>(({ className, selectedMarket }) => {
    // Memoize market name to prevent recalculation
    const marketName = useMemo(() => selectedMarket?.name || 'UK', [selectedMarket?.name]);
    
    // Use the product store
    const { products, isLoading, error, fetchProducts } = useProductStore();
    
    // Log market changes only when they actually change
    useEffect(() => {
        console.log('[FeaturedProducts] Market changed:', {
            market: selectedMarket,
            name: marketName,
            type: typeof marketName
        });
        
        // ✅ FIXED: Use the imported MarketConfig type directly
        if (selectedMarket) {
            fetchProducts(selectedMarket);
        }
    }, [marketName, selectedMarket, fetchProducts]);
    
    // Memoize the filtered products and limit to first 3
    const filteredProducts = useMemo(() => {
        return products ? products.slice(0, 3) : [];
    }, [products]);
    
    // Memoize the skeletons to prevent recreation on each render
    const memoizedSkeletons = useMemo(() => <MemoizedSkeleton count={3} />, []);
    
    return (
        <section className={`py-16 bg-gray-50 ${className || ''}`}>
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
                        <p className="text-muted-foreground">
                            Top picks for your {marketName === 'UK' ? 'United Kingdom' : 'European'} training needs
                        </p>
                    </div>
                    <Link 
                        to="/products" 
                        className="inline-flex items-center text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                        View all products
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-5 w-5 ml-1" 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                        >
                            <path 
                                fillRule="evenodd" 
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                                clipRule="evenodd" 
                            />
                        </svg>
                    </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        memoizedSkeletons
                    ) : error ? (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3">
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <Link
                                key={product.id}
                                to={`/product-detail-page?sku=${product.code}&market=${marketName}`}
                                className="block focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg"
                                aria-label={`View details for ${product.name}`}
                            >
                                <ProductItemCard 
                                    product={product} 
                                    marketId={selectedMarket?.id}
                                />
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
});

// Main component that connects to the context
const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ className }) => {
    const { selectedMarket } = useOutletContext<{ selectedMarket: MarketConfig }>();
    return (
        <FeaturedProductsComponent 
            selectedMarket={selectedMarket}
            className={className}
        />
    );
};

FeaturedProducts.displayName = 'FeaturedProducts';

export default React.memo(FeaturedProducts);
