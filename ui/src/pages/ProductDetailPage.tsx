import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import brain from "brain";
import { ProductDetailResponse } from "types"; // Generated type
import { useAppContext } from "components/AppProvider"; // Import App context
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react"; // Removed Loader2, added ShoppingCart
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner"; // Import toast
// Removed: import { useCartStore } from "../utils/cart-store";
import { ProductItemCard } from "components/ProductItemCard"; // Import ProductItemCard
import { ProductResponse as CommerceLayerProduct } from "types"; // Import the type for product list items
import { Link } from "react-router-dom"; // Import Link

// --- Commerce Layer API Types (Simplified) ---

const ProductDetailPage: React.FC = () => {
  console.log("[ProductDetailPage] Component rendering..."); // Log start
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get SKU and Market directly from URL
  const sku = searchParams.get("sku");
  const market = searchParams.get("market"); // Ensure this matches the param name in the Link
  console.log(`[ProductDetailPage] Received URL Params - SKU: ${sku}, Market: ${market}`);

  // Use market context later if needed, but log URL params first
  const { currentMarketId, baseUrl, configReady, market: contextMarket, clScriptReady, clReady } = useAppContext();

  const [product, setProduct] = useState<ProductDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Removed: accessToken, orderId, isAddingToCart state, cart store state
  const [relatedProducts, setRelatedProducts] = useState<CommerceLayerProduct[]>([]);
  const [isRelatedLoading, setIsRelatedLoading] = useState(false);
  const [relatedError, setRelatedError] = useState<string | null>(null);

  // 2. Fetch Product Details
  useEffect(() => {
    if (!sku || !market) {
      setError("Product SKU or Market information missing.");
      setIsLoading(false);
      return;
    }

    const fetchProductDetails = async () => {
      setIsLoading(true);
      setError(null);
      setProduct(null);
      console.log(`[PDP] Fetching details for SKU: ${sku}, Market: ${market}`);
      try {
        // Pass market explicitly (even though context has it, API expects it)
        const response = await brain.get_product_details({ skuCode: sku, market: market });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("[PDP] API Error fetching product:", errorData);
          if (response.status === 404) {
            throw new Error(`Product with SKU '${sku}' was not found in the ${market} market.`);
          } else {
            throw new Error(errorData?.detail || `Failed to fetch product details (Status: ${response.status})`);
          }
        }

        const data: ProductDetailResponse = await response.json();
        console.log("[PDP] Product data received from API:", data); // Log the received data
        setProduct(data);
      } catch (err: any) {
        console.error("[PDP] Error fetching product details:", err);
        setError(err.message || "An unknown error occurred while loading the product.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [sku, market]); // Re-fetch if SKU or market changes

  // Effect to fetch related products when main product loads
  useEffect(() => {
    if (product && market) {
      const fetchRelatedProducts = async () => {
        setIsRelatedLoading(true);
        setRelatedError(null);
        setRelatedProducts([]);
        console.log(`[PDP] Fetching related products for market: ${market}`);
        try {
          // Fetch products from the same market (no specific category for now)
          const response = await brain.get_commerce_layer_products({ market: market });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData?.detail || "Failed to fetch related products");
          }
          const data = await response.json();
          // Filter out the current product and limit to 4
          const filteredProducts = data.products
            .filter((p: CommerceLayerProduct) => p.code !== product.sku)
            .slice(0, 4);
          setRelatedProducts(filteredProducts);
          console.log(`[PDP] Found ${filteredProducts.length} related products.`);
        } catch (err: any) {
          console.error("[PDP] Error fetching related products:", err);
          setRelatedError(err.message || "Could not load related products.");
        } finally {
          setIsRelatedLoading(false);
        }
      };
      fetchRelatedProducts();
    }
  }, [product, market]); // Trigger when product or market changes

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
                    <span className="text-2xl font-semibold mr-4">{product.price?.formatted || "Price unavailable"}</span>
                     {product.available ? (
                         <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">In Stock</Badge>
                     ) : (
                         <Badge variant="destructive">Out of Stock</Badge>
                     )}
                 </div>
                 
                 <div className="prose prose-sm max-w-none mb-6">
                     <p>{product.description || "No description available."}</p>
                 </div>
                 
                 {/* Commerce Layer Add to Cart Component - Render only when script and config are ready and product is available */}
                 {product.sku && product.available && configReady && clScriptReady && (
                    <cl-add-to-cart code={product.sku} data-cart>
                        {/* Default/fallback content while component loads */}
                        Add to Cart
                    </cl-add-to-cart>
                 )}
                 {!product.available && (
                     <Button size="lg" className="w-full" disabled>Out of Stock</Button>
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
                 <ProductItemCard product={relatedProduct} />
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

