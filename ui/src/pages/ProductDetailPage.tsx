import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useMarketStore } from "@/utils/market-store";
import { ProductItemCard } from "@/components/ProductItemCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ShoppingCart } from "lucide-react";

// Product interface matching Commerce Layer API response
interface Product {
  id: string;
  type: string;
  attributes: {
    code: string;
    name: string;
    description: string;
    image_url: string;
    price: string;
    currency_code: string;
    reference_origin: string;
    created_at: string;
    updated_at: string;
  };
  relationships?: {
    prices: { data: Array<{ id: string; type: string }> };
    tags: { data: Array<{ id: string; type: string }> };
  };
  tags?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

// API response interface
interface ProductDetailResponse {
  product: Product;
  included: any[];
}

interface ProductListingResponse {
  products: Product[];
  included: any[];
}

// Fun Buy Now Button Component
const FunBuyNowButton: React.FC = () => {
  const [isClicked, setIsClicked] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const messages = [
    "This ain't real. Nothing is for sale!",
    "Still not real! 😄",
    "Seriously, it's just a demo! 🤷‍♂️",
    "You're persistent! But still no sale 😂",
    "OK, you win. Here's a virtual high-five! 🙌"
  ];

  const handleClick = () => {
    setIsClicked(true);
    setClickCount(prev => Math.min(prev + 1, messages.length - 1));
    
    // Reset after 3 seconds
    setTimeout(() => {
      setIsClicked(false);
    }, 3000);
  };

  return (
    <Button 
      variant="outline" 
      className="w-full py-3 text-base transition-all duration-300"
      onClick={handleClick}
    >
      {isClicked ? messages[clickCount] : "Buy Now"}
    </Button>
  );
};

const ProductDetailPage: React.FC = () => {
  // State
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isRelatedLoading, setIsRelatedLoading] = useState(false);
  const [commerceLayerReady, setCommerceLayerReady] = useState(false);
  
  // Hooks - Updated to handle both URL patterns
  const { productCode: urlProductCode } = useParams<{ productCode: string }>();
  const [searchParams] = useSearchParams();
  const productCode = urlProductCode || searchParams.get('sku');
  const navigate = useNavigate();
  const { market } = useMarketStore();
  
  console.log("[ProductDetailPage] Component rendering...");
  console.log(`[ProductDetailPage] URL Params - Product Code: ${productCode}, Market: ${market.name}`);
  console.log(`[ProductDetailPage] URL Product Code: ${urlProductCode}, Query SKU: ${searchParams.get('sku')}`);

  // Check for Commerce Layer configuration
  useEffect(() => {
    const checkCommerceLayerConfig = () => {
      if ((window as any).commercelayerConfig) {
        console.log('[ProductDetailPage] Commerce Layer config found:', (window as any).commercelayerConfig);
        setCommerceLayerReady(true);
      } else {
        console.log('[ProductDetailPage] Commerce Layer config not ready, retrying...');
        setTimeout(checkCommerceLayerConfig, 100);
      }
    };

    checkCommerceLayerConfig();
  }, []);

  // Fetch product details
  const fetchProduct = async (code: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Use the same product-listing function but filter for specific product
      const params = new URLSearchParams({
        market: market.id || 'market:id:vjzmJhvEDo'
      });

      const apiUrl = `/api/product-listing?${params.toString()}`;
      console.log('[ProductDetailPage] Fetching from:', apiUrl);

      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch product: ${response.statusText}`);
      }

      const data: ProductListingResponse = await response.json();
      console.log('[ProductDetailPage] API response:', data);

      // Find the specific product by code
      const foundProduct = data.products?.find(p => 
        p.attributes?.code?.toLowerCase() === code.toLowerCase()
      );

      if (foundProduct) {
        setProduct(foundProduct);
        
        // Fetch related products (same category or random selection)
        const otherProducts = data.products?.filter(p => 
          p.attributes?.code?.toLowerCase() !== code.toLowerCase()
        ).slice(0, 4) || [];
        
        setRelatedProducts(otherProducts);
      } else {
        throw new Error('Product not found');
      }
    } catch (err) {
      console.error('[ProductDetailPage] Error fetching product:', err);
      setError(err instanceof Error ? err.message : 'Failed to load product');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch product when component mounts or productCode/market changes
  useEffect(() => {
    if (!productCode || !market.id) {
      setError("Product code or market information missing.");
      setIsLoading(false);
      return;
    }

    fetchProduct(productCode);
  }, [productCode, market.id]);

  const goBack = () => {
    navigate(-1);
  };

  // Get image URL with fallback
  const getImageUrl = (product: Product): string => {
    if (product.attributes?.image_url) {
      return product.attributes.image_url;
    }
    if (product.attributes?.code) {
      return `/migrated-assets/${product.attributes.code}.jpg`;
    }
    return '/migrated-assets/no-image.jpg';
  };

  // Handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    if (!target.src.includes('no-image.jpg')) {
      target.src = '/migrated-assets/no-image.jpg';
    }
  };

  // Custom Related Product Card (without cl-price until Commerce Layer is ready)
  const RelatedProductCard: React.FC<{ product: Product; onClick: () => void }> = ({ product, onClick }) => {
    const imageUrl = getImageUrl(product);
    
    return (
      <Card className="overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 bg-card flex flex-col h-full cursor-pointer" onClick={onClick}>
        <CardContent className="p-3">
          <div className="w-full overflow-hidden relative group rounded-md mb-3">
            <img
              src={imageUrl}
              alt={product.attributes?.name || 'Product image'}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105 rounded-md"
              onError={handleImageError}
              loading="lazy"
            />
          </div>
          
          <h3 className="text-lg font-semibold tracking-tight truncate hover:text-primary transition-colors mb-2">
            {product.attributes?.name || 'Unknown Product'}
          </h3>
          
          <p className="text-sm text-muted-foreground flex-grow mb-4 line-clamp-3">
            {product.attributes?.description || 'No description available.'}
          </p>

          <div className="flex justify-between items-center mt-auto">
            {commerceLayerReady ? (
              <cl-price code={product.attributes?.code || ''}>
                <cl-price-amount type="price" class="text-lg font-bold"></cl-price-amount>
                <cl-price-amount type="compare-at" class="text-sm text-muted-foreground line-through"></cl-price-amount>
              </cl-price>
            ) : (
              <div className="text-lg font-bold text-muted-foreground">
                Loading price...
              </div>
            )}
            
            <Button variant="default" size="sm" className="ml-3 shrink-0">
              View
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Loading state
  if (isLoading) {
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

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="outline" onClick={goBack} className="mb-6 inline-flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h2 className="text-2xl font-semibold text-destructive mb-4">Error</h2>
          <p className="text-muted-foreground max-w-md text-center">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => productCode && fetchProduct(productCode)}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Button variant="outline" onClick={goBack} className="mb-6 inline-flex items-center">
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

  // Main product detail layout
  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" onClick={goBack} className="mb-6 inline-flex items-center">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Image Section */}
        <Card className="overflow-hidden rounded-lg shadow-none border-none">
          <CardContent className="p-0">
            <img 
              src={getImageUrl(product)} 
              alt={product.attributes?.name || 'Product image'} 
              className="w-full h-auto object-cover aspect-square rounded-lg"
              loading="lazy"
              onError={handleImageError}
            />
          </CardContent>
        </Card>

        {/* Details Section */}
        <div className="py-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {product.attributes?.name || 'Unknown Product'}
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            SKU: {product.attributes?.code || 'N/A'}
          </p>
          
          <div className="flex items-center gap-4 mb-4">
            {/* Commerce Layer Price Component with readiness check */}
            {commerceLayerReady ? (
              <cl-price code={product.attributes?.code || ''}>
                <cl-price-amount type="price" class="text-3xl font-bold"></cl-price-amount>
                <cl-price-amount type="compare-at" class="text-lg text-muted-foreground line-through ml-2"></cl-price-amount>
              </cl-price>
            ) : (
              <div className="text-3xl font-bold text-muted-foreground">
                Loading price...
              </div>
            )}
            
            <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">
              In Stock
            </Badge>
          </div>
          
          <div className="prose prose-sm max-w-none mb-6">
            <p>{product.attributes?.description || "No description available."}</p>
          </div>
          
          {/* Action Buttons - Updated with shorter height and fun Buy Now */}
          <div className="space-y-3 max-w-md">
            {commerceLayerReady ? (
              <cl-add-to-cart 
                code={product.attributes?.code || ''}
                class="block w-full"
              >
                <button 
                  className="w-full py-3 text-base bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-medium transition-colors flex items-center justify-center"
                  onClick={(e) => {
                    console.log('[ProductDetailPage] Add to cart button clicked!');
                    console.log('[ProductDetailPage] Event:', e);
                    console.log('[ProductDetailPage] Product code:', product.attributes?.code);
                    console.log('[ProductDetailPage] Commerce Layer ready:', commerceLayerReady);
                  }}
                  type="button"
                >
                  Add to Cart
                  <ShoppingCart className="ml-2 h-4 w-4" />
                </button>
              </cl-add-to-cart>
            ) : (
              <Button className="w-full py-3 text-base" disabled>
                Loading...
              </Button>
            )}
            
            <FunBuyNowButton />
          </div>
          
          <p className="text-xs text-muted-foreground mt-4">
            Shipping calculated at checkout.
          </p>
        </div>
      </div>

      {/* Related Products Section */}
      <Separator className="my-12" />
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-center">You Might Also Like</h2>
        
        {relatedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <RelatedProductCard
                key={relatedProduct.id}
                product={relatedProduct}
                onClick={() => navigate(`/products/${relatedProduct.attributes?.code}`)}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No related products found.</p>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
