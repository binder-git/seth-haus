// /Users/seth/seth-haus/ui/src/components/ProductItemCard.tsx

import React from "react"; // Removed useState as it's no longer used for image error state
// Removed useMarketStore as it's not directly used in this component
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Removed Badge as 'In Stock/Out of Stock' badge is removed
import { cn } from "utils/cn";

// Updated ProductResponse type to reflect changes in featured-products.ts
// Make sure this matches the Product type in your Netlify function's response
export type ProductResponse = {
  id: string;
  code: string;
  name: string;
  description: string;
  image_url: string | null;
  price: string; // Formatted price string e.g., "£129.99"
  currency: string;
  // 'available' and 'quantity' are removed here
};

export interface Props {
  product: ProductResponse;
  className?: string;
  onViewDetailsClick?: () => void; // Optional handler for view details button
}

const ProductItemCardComponent = ({ product, className = "", onViewDetailsClick }: Props) => {

  // Safely extract product data with fallbacks for undefined values
  const productCode = product?.code || 'unknown';
  const productName = product?.name || 'Unknown Product';
  const productDescription = product?.description || 'No description available.';
  const productPrice = product?.price || 'Price not available';

  // Determine the image URL based on local assets and product.code
  const getImageUrl = (): string => {
    // Only use the product code if it's defined and not empty
    if (productCode && productCode !== 'unknown' && productCode.trim() !== '') {
      return `/migrated-assets/${productCode}.jpg`;
    }
    // If no valid product code, go straight to fallback
    return '/migrated-assets/no-image.jpg';
  };

  const imageUrl = getImageUrl();

  // A local fallback image in case a specific product image is missing.
  // Make sure you have a 'no-image.jpg' file in your 'public/migrated-assets' folder.
  const fallbackImageUrl = '/migrated-assets/no-image.jpg';

  // Handle image loading errors with infinite loop prevention
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    
    // Prevent infinite loops by checking if we're already showing the fallback
    if (target.src.includes('no-image.jpg')) {
      console.error(`Fallback image also failed to load for product '${productName}' (code: ${productCode}). Image path: ${target.src}`);
      target.onerror = null; // Prevent further error events
      return;
    }
    
    // Log the error for debugging
    console.log(`Image for product '${productName}' (code: ${productCode}) not found at '${target.src}'. Falling back to: '${fallbackImageUrl}'`);
    
    // Set fallback image and prevent further error events on this attempt
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

  return (
    <Card
      className={cn("overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 bg-card flex flex-col h-full", className)}
      tabIndex={-1}
    >
      <CardHeader
        className="p-0"
       >
        <div
          className="w-full overflow-hidden"
         >
          <img
            src={imageUrl}
            alt={productName}
            className="w-full h-48 object-cover"
            onError={handleImageError}
            loading="lazy"
          />
        </div>
      </CardHeader>
      <CardHeader >
        <CardTitle
          className="text-lg font-semibold tracking-tight truncate hover:text-primary transition-colors"
          title={productName}
        >
            {productName}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow p-4">
        <p className="text-sm text-muted-foreground flex-grow mb-4 line-clamp-3" title={productDescription}>
          {productDescription}
        </p>

        {/* --- Streamlined display: Only price and View Details button --- */}
        <div className="flex justify-between items-center mt-auto mb-4">
          <p className="text-lg font-bold">
            {productPrice}
          </p>
          {/* Removed the Badge here as it's not relevant without inventory data */}
        </div>

        <div className="mt-auto space-y-2">
            {onViewDetailsClick && (
              <Button
                variant="outline"
                className="w-full"
                onClick={(e) => {
                  console.log(`[ProductItemCard] 'View Details' button clicked for product: ${productName} (${productCode})`);
                   e.stopPropagation();
                   onViewDetailsClick();
                 }}
              >
                View Details
              </Button>
            )}
            {/* Removed the cl-add-to-cart and disabled "Out of Stock" button from here.
                Add to cart functionality will be on the Product Details Page via Drop-in.js. */}
        </div>
      </CardContent>
    </Card>
  );
};

export const ProductItemCard = React.memo(ProductItemCardComponent);
