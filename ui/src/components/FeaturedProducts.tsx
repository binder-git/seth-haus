import React, { useState, useEffect, useMemo } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { commerceLayerApi } from "@/api/commerceLayerApi";

interface AppContextType {
  selectedMarket?: {
    id: string;
    name: string;
    region: string;
    countryCode: string;
    currencyCode: string;
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

interface ProductItemCardProps {
  product: Product;
}

const ProductItemCard: React.FC<ProductItemCardProps> = ({ product }) => {
  const { 
    id,
    code,
    name, 
    description, 
    image_url, 
    price,
    currency
  } = product;
  
  const numericPrice = parseFloat(price.replace(/[^0-9.-]+/g, '')) || 0;
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {image_url ? (
        <img 
          src={image_url} 
          alt={name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = 'https://via.placeholder.com/300x200?text=No+Image';
          }}
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400">No image</span>
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{name}</h3>
        <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
          {description}
        </p>
        <div className="flex justify-between items-center mt-4">
          <span className="font-bold">
            {new Intl.NumberFormat(currency === 'GBP' ? 'en-GB' : 'de-DE', {
              style: 'currency',
              currency: currency || 'GBP',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }).format(numericPrice)}
          </span>
          <button 
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              console.log('Add to cart clicked for product:', code);
              // Add to cart logic here
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

const FeaturedProducts: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { selectedMarket } = useOutletContext<AppContextType>();
  const marketRegion = selectedMarket?.region?.toLowerCase() || 'uk';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    console.log('[FeaturedProducts] useEffect triggered. Current market:', {
      region: marketRegion,
      id: selectedMarket?.id
    }); 
    
    const fetchProducts = async () => {
      if (!marketRegion) {
        console.warn("Market region not selected or invalid, skipping featured product fetch.");
        setProducts([]);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log(`[FeaturedProducts] Fetching products for market region: ${marketRegion}`);
        
        // Set the market for the API client
        commerceLayerApi.setMarket(marketRegion.toUpperCase());
        
        // Fetch products using the commerceLayerApi
        const response = await commerceLayerApi.getFeaturedProducts();
        
        if (!response || !response.products) {
          throw new Error('Invalid response from server');
        }
        
        console.log('[FeaturedProducts] API Response:', response);
        
        const products = response.products || [];
        
        console.log(`[FeaturedProducts] Found ${products.length} products in response`);
        setProducts(products);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[FeaturedProducts] Error fetching featured products:`, error);
        setError(`Failed to load featured products: ${errorMsg}`);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [marketRegion, selectedMarket?.id]);

  const memoizedSkeletons = useMemo(() => 
    Array.from({ length: 3 }).map((_, index) => (
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
    )),
    []
  );

  return (
    <section className={`py-16 bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
            <p className="text-muted-foreground">
              Top picks for your {marketRegion === "uk" ? "United Kingdom" : "European"} training needs
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
          ) : products.length > 0 ? (
            products.slice(0, 3).map((product) => (
              <Link
                key={product.id} 
                to={`/product-detail-page?sku=${product.code}&market=${marketRegion}`}
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

export default React.memo(FeaturedProducts);
