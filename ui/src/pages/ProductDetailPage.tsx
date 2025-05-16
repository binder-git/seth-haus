import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import brain from "@/brain";
import type { 
  ProductDetailResponse, 
  ProductResponse,
  ProductPrice,
  ProductImage as ApiProductImage,
  ProductAttribute,
  ProductsResponse
} from "@/brain/data-contracts";
import type { Brain as BrainClient } from "@/brain/Brain";
import type { Category, ProductBrand } from "@/types/models/product";
import { useAppContext } from "@/components/AppProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
// Removed unused imports
import { toast } from "sonner";
import { ProductItemCard } from "@/components/ProductItemCard";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Extend the BrainClient type to include the get method
declare module "@/brain/Brain" {
  interface Brain<T = unknown> {
    /**
     * Make a GET request to the specified URL
     * @template T Expected response data type
     * @param url The URL to make the request to
     * @returns Promise with the response data
     */
    get: <T = unknown>(url: string) => Promise<{ data: T }>;
  }
}

// Local Types
interface ProductImage {
  url: string;
  alt?: string;
}

interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  inStock: boolean;
  attributes: Record<string, string>;
}

interface ProductDetails {
  id: string;
  sku: string;
  name: string;
  description?: string | null;
  price?: number | null;
  pricing?: ProductPrice | null;
  images: ProductImage[];
  variants: ProductVariant[];
  attributes: ProductAttribute[];
  available: boolean;
  category?: string | null;
  brand?: string;
  longDescription?: string;
  specifications?: Record<string, string>;
  relatedProducts?: any[];
}

const ProductDetailPage: React.FC = () => {
  // State
  const [product, setProduct] = useState<Partial<ProductDetails> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductResponse[]>([]);
  const [isRelatedLoading, setIsRelatedLoading] = useState(false);
  const [relatedError, setRelatedError] = useState<string | null>(null);
  
  // Hooks
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentMarketId, baseUrl, configReady } = useAppContext();
  
  // Get SKU and market from URL
  const sku = searchParams.get('sku');
  const market = searchParams.get('market') || currentMarketId;
  
  console.log("[ProductDetailPage] Component rendering...");
  console.log(`[ProductDetailPage] URL Params - SKU: ${sku}, Market: ${market}`);
  
  // Type assertion for the brain instance
  const typedBrain = brain as unknown as BrainClient<unknown> & {
    get: <T = unknown>(url: string) => Promise<{ data: T }>;
  };

  // Fetch product details when component mounts or SKU/market changes
  useEffect(() => {
    if (!sku || !market) {
      setError("Product SKU or Market information missing.");
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const fetchProduct = async () => {
      if (!sku) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log(`[PDP] Fetching product with SKU: ${sku}`);
        const response = await typedBrain.get<ProductDetailResponse>(`/api/products/${sku}`);
        
        if (response?.data) {
          console.log("[PDP] Product data received from API:", response.data);
          if (isMounted) {
            const productData: ProductDetails = {
              ...response.data,
              price: response.data.price?.amount_cents || 0,
              pricing: response.data.price || null,
              images: (response.data.images || []).map((img: ApiProductImage) => ({
                url: img.url,
                alt: img.alt || response.data.name
              })),
              available: response.data.available || false,
              variants: [],
              attributes: (response.data as any).attributes || [] as ProductAttribute[]
            };
            
            setProduct(productData);
            
            // Fetch related products if category exists
            if (response.data.category) {
              fetchRelatedProducts(response.data.category, market);
            }
          }
        } else {
          throw new Error('No product data received from API');
        }
      } catch (err: any) {
        if (isMounted) {
          const errorMsg = err.name === 'AbortError' 
            ? 'Request timed out. Please try again.'
            : err.message || 'An unknown error occurred while loading the product.';
          
          console.error("[PDP] Error fetching product:", err);
          setError(errorMsg);
        }
      } finally {
        if (isMounted) {
          clearTimeout(timeoutId);
          setIsLoading(false);
        }
      }
    };

    fetchProduct();
    
    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [sku, market]);

  // Function to fetch related products
  const fetchRelatedProducts = useCallback(async (category: string, marketId: string) => {
    if (!category || !marketId) return;
    
    setIsRelatedLoading(true);
    setRelatedError(null);
    
    console.log(`[PDP] Fetching related products for category: ${category}, market: ${marketId}`);
    
    try {
      const response = await typedBrain.get<ProductsResponse>(`/api/products?category=${encodeURIComponent(category)}&market=${encodeURIComponent(marketId)}`);
      
      if (response?.data) {
        const products = Array.isArray(response.data) ? response.data : response.data.products || [];
        
        // Filter out the current product and limit to 4 items
        const filteredProducts = products
          .filter((p) => p.code && p.code !== sku)
          .slice(0, 4);
        
        console.log(`[PDP] Found ${filteredProducts.length} related products`);
        setRelatedProducts(filteredProducts);
      }
    } catch (err: any) {
      const errorMsg = err.name === 'AbortError'
        ? 'Related products request timed out.'
        : err.message || 'Failed to load related products.';
      
      console.error('[PDP] Error fetching related products:', err);
      setRelatedError(errorMsg);
    } finally {
      setIsRelatedLoading(false);
    }
  }, [sku]);

  // Fetch related products when the product or market changes
  useEffect(() => {
    if (!product?.id || !market) return;
    
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    // Add a small delay to prevent rapid successive requests
    const delayTimer = setTimeout(() => {
      // Use the product's category if available, otherwise don't fetch related products
      if (product?.category && market) {
        fetchRelatedProducts(product.category, market);
      } else {
        console.log('[PDP] No category available for related products');
        setRelatedProducts([]);
      }
    }, 300);
    
    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timeoutId);
      clearTimeout(delayTimer);
    };
  }, [product?.id, product?.category, market, fetchRelatedProducts]);

  // DEBUG: Listen for Commerce Layer cart updates
  // useEffect(() => {
  //   const handleCartUpdate = (event: Event) => {
  //     // Log the detail which often contains cart info
  //     console.log('[PDP - DEBUG] cl-cart-update event detected!', (event as CustomEvent).detail);
  //     toast.info("Debug: cl-cart-update event fired!"); // Also show a toast
  //   };

  //   // Listen for the event globally as it might bubble up
  //   document.addEventListener('cl-cart-update', handleCartUpdate);
  //   console.log('[PDP - DEBUG] Added cl-cart-update event listener.');

  //   // Cleanup listener on component unmount
  //   return () => {
  //     document.removeEventListener('cl-cart-update', handleCartUpdate);
  //     console.log('[PDP - DEBUG] Removed cl-cart-update event listener.');
  //   };
  // }, []); // Empty dependency array ensures this runs only once on mount/unmount


  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Removed cart store integration and handleAddToCart function

  // --- Render Logic ---
  if (isLoading || (!configReady && !error)) {
    // Show skeleton while loading product OR if config is not ready (and no error occurred yet)
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="outline" onClick={goBack} className="mb-6 inline-flex items-center" disabled>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <Skeleton className="aspect-square w-full rounded-lg bg-muted" />
          <div className="space-y-4 py-4">
            <Skeleton className="h-8 w-3/4 bg-muted" />
            <Skeleton className="h-6 w-1/4 bg-muted" />
            <Skeleton className="h-6 w-1/4 bg-muted" />
            <Skeleton className="h-24 w-full bg-muted" />
            <Skeleton className="h-10 w-1/3 bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Removed absolute positioning from Back button container */}
        <Button variant="outline" onClick={goBack} className="inline-flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h2 className="text-2xl font-semibold text-destructive mb-4">Error</h2>
          <p className="text-muted-foreground max-w-md">{error}</p>
        </div>
      </div>
    );
  }

  if (!product) {
     return (
        <div className="container mx-auto px-4 py-8 text-center">
            {/* Removed absolute positioning from Back button container */}
            <Button variant="outline" onClick={goBack} className="inline-flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
            </Button>
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <h2 className="text-2xl font-semibold">Product Not Found</h2>
                <p className="text-muted-foreground">The requested product could not be found.</p>
            </div>
        </div>
    );
  }

  // --- Product Detail Layout ---
  return (
    <div className="container mx-auto px-4 py-8">
       {/* Adjusted margin-top (mt-6) to position below the header */}
       <Button variant="outline" onClick={goBack} className="mb-6 inline-flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
       </Button>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Image Section */} 
            <Card className="overflow-hidden rounded-lg shadow-none border-none">
                <CardContent className="p-0">
                    {product.images && product.images.length > 0 ? (
                         <img 
                            src={product.images[0].url} 
                            alt={product.images[0].alt || product.name} 
                            className="w-full h-auto object-cover aspect-square rounded-lg"
                            loading="lazy"
                        />
                    ) : (
                         <div className="aspect-square w-full bg-muted rounded-lg flex items-center justify-center">
                            <span className="text-muted-foreground">No Image</span>
                         </div>
                    )}
                 </CardContent>
             </Card>
 
            {/* Details Section */} 
            <div className="py-4">
                 <h1 className="text-3xl md:text-4xl font-bold mb-2">{product.name}</h1>
                 <p className="text-sm text-muted-foreground mb-4">SKU: {product.sku}</p>
                 
                 <div className="flex items-center mb-4">
                    <div className="text-3xl font-bold">
            {product.pricing?.formatted || 'Price not available'}
          </div>           {product.available ? (
                         <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">In Stock</Badge>
                     ) : (
                         <Badge variant="destructive">Out of Stock</Badge>
                     )}
                 </div>
                 
                 <div className="prose prose-sm max-w-none mb-6">
                     <p>{product.description || "No description available."}</p>
                 </div>
                 
                 {/* Commerce Layer Add to Cart Component - Render only when script and config are ready and product is available */}
                 {product.sku && product.available && configReady && (
                    <div>
                      {product.available ? (
            <Button className="w-full py-6 text-lg">
              Add to Cart
              <ShoppingCart className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <Button variant="outline" className="w-full py-6 text-lg" disabled>
              Out of Stock
            </Button>
          )}
          
          {product.available && (
            <Button variant="outline" className="w-full py-6 text-lg">
              Buy Now
            </Button>
          )}
          
          {!product.available && (
            <Button variant="outline" className="w-full py-6 text-lg">
              Notify Me When Available
            </Button>
          )}
                    </div>
                 )}
                 {/* Informational text */}
                 <p className="text-xs text-muted-foreground mt-2">
                    {product.available ? "Shipping calculated at checkout." : "This item is currently unavailable."}
                 </p>
            </div>

       </div>
 
        {/* Related Products Placeholder */} 
        {/* Related Products Section */} 
       <Separator className="my-12" />
       <div>
         <h2 className="text-2xl font-semibold mb-6 text-center">You Might Also Like</h2>
         {isRelatedLoading && (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {[...Array(4)].map((_, index) => (
               <div key={index} className="space-y-2">
                 <Skeleton className="aspect-square w-full bg-muted" />
                 <Skeleton className="h-5 w-3/4 bg-muted" />
                 <Skeleton className="h-5 w-1/2 bg-muted" />
               </div>
             ))}
           </div>
         )}
         {relatedError && (
           <p className="text-center text-destructive">Error loading related products: {relatedError}</p>
         )}
         {!isRelatedLoading && !relatedError && relatedProducts.length > 0 && (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {relatedProducts.map((relatedProduct) => (
               <Link 
                 key={relatedProduct.code || relatedProduct.id} 
                 to={`/product-detail-page?sku=${relatedProduct.code}&market=${market}`} // Use correct lowercase path
                 className="block focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg"
                 aria-label={`View details for ${relatedProduct.name}`}
               >
                 <ProductItemCard 
                   product={relatedProduct} 
                 />
               </Link>
             ))}
           </div>
         )}
         {!isRelatedLoading && !relatedError && relatedProducts.length === 0 && (
           <p className="text-center text-muted-foreground">No related products found.</p>
         )}
       </div>
    </div>
  );
};

export default ProductDetailPage;

