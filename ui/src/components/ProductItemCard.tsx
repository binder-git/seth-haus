// /Users/seth/seth-haus/ui/src/components/ProductItemCard.tsx

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye } from "lucide-react";
import { cn } from "utils/cn";

// Simplified ProductResponse type - no need for manual price handling
export type ProductResponse = {
  id: string;
  code: string; // This is the SKU code that cl-price will use
  name: string;
  description: string;
  image_url: string | null;
  // Remove manual price and currency - cl-price handles this
};

export interface Props {
  product: ProductResponse;
  className?: string;
  onViewDetailsClick?: () => void;
}

const ProductItemCardComponent = ({ product, className = "", onViewDetailsClick }: Props) => {

  // Safely extract product data with fallbacks for undefined values
  const productCode = product?.code || 'unknown';
  const productName = product?.name || 'Unknown Product';
  const productDescription = product?.description || 'No description available.';

  // Determine the image URL based on local assets and product.code
  const getImageUrl = (): string => {
    if (productCode && productCode !== 'unknown' && productCode.trim() !== '') {
      return `/migrated-assets/${productCode}.jpg`;
    }
    return '/migrated-assets/no-image.jpg';
  };

  const imageUrl = getImageUrl();
  const fallbackImageUrl = '/migrated-assets/no-image.jpg';

  // Handle image loading errors with infinite loop prevention
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    
    if (target.src.includes('no-image.jpg')) {
      console.error(`Fallback image also failed to load for product '${productName}' (code: ${productCode}). Image path: ${target.src}`);
      target.onerror = null;
      return;
    }
    
    console.log(`Image for product '${productName}' (code: ${productCode}) not found at '${target.src}'. Falling back to: '${fallbackImageUrl}'`);
    target.onerror = null;
    target.src = fallbackImageUrl;
  };

  // Debug logging for undefined product data
  if (!product || !product.code || !product.name) {
    console.warn('[ProductItemCard] Product data is incomplete:', {
      hasProduct: !!product,
      code: product?.code,
      name: product?.name,
      fullProduct: product
    });
  }

  // Debug Commerce Layer Drop-in
  React.useEffect(() => {
    console.log(`[ProductItemCard] Initializing cl-price for SKU: ${productCode}`);
    console.log('[ProductItemCard] Commerce Layer config:', (window as any).commercelayerConfig);
  }, [productCode]);

  return (
    <Card
      className={cn("overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 bg-card flex flex-col h-full", className)}
      tabIndex={-1}
    >
      <CardHeader className="p-3">
        <div className="w-full overflow-hidden relative group rounded-md">
          <img
            src={imageUrl}
            alt={productName}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105 rounded-md"
            onError={handleImageError}
            loading="lazy"
          />
          {/* Overlay View button on image hover */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center rounded-md">
            <Button
              variant="secondary"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={(e) => {
                console.log(`[ProductItemCard] Quick view clicked for product: ${productName} (${productCode})`);
                e.stopPropagation();
                onViewDetailsClick?.();
              }}
            >
              <Eye className="h-4 w-4 mr-1" />
              Quick View
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardHeader className="px-3 pt-0 pb-2">
        <CardTitle
          className="text-lg font-semibold tracking-tight truncate hover:text-primary transition-colors"
          title={productName}
        >
          {productName}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex flex-col flex-grow px-3 pb-3">
        <p className="text-sm text-muted-foreground flex-grow mb-4 line-clamp-3" title={productDescription}>
          {productDescription}
        </p>

        {/* Price and Button Layout - Side by side */}
        <div className="flex justify-between items-center mt-auto">
          {/* Use v1 clayer-price syntax */}
{/* Use explicit cl-price with proper attributes */}
{/* Use correct v2 cl-price syntax with nested elements */}
<div className="flex flex-col flex-grow">
  <cl-price code={productCode}>
    <cl-price-amount type="price" class="text-lg font-bold text-primary"></cl-price-amount>
    <cl-price-amount type="compare-at" class="text-sm text-muted-foreground line-through"></cl-price-amount>
  </cl-price>
  
  {/* Debug info for development */}
  {process.env.NODE_ENV === 'development' && (
    <span className="text-xs text-muted-foreground mt-1">
      SKU: {productCode}
    </span>
  )}
</div>




          {/* View Product Button - Positioned to the right */}
          <Button
            variant="default"
            size="sm"
            className="ml-3 shrink-0"
            onClick={(e) => {
              console.log(`[ProductItemCard] 'View Product' button clicked for product: ${productName} (${productCode})`);
              e.stopPropagation();
              onViewDetailsClick?.();
            }}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const ProductItemCard = React.memo(ProductItemCardComponent);
