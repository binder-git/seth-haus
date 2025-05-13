import React, { useState } from "react"; // Import useState
// Removed: import { useCartStore } from "utils/cart-store";
import { useMarketStore } from "utils/market-store";
import { Button } from "@/components/ui/button";
// Removed: import { toast } from "sonner"; // No longer needed for cart errors here
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Import Badge for availability
import { ProductResponse as CommerceLayerProduct } from "../brain/data-contracts"; // Use correct type from generated client
import { cn } from "utils/cn";

// --- TypeScript Declaration for Custom Element ---
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "cl-availability": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        "sku-code"?: string;
        // Add other cl-availability attributes if needed (e.g., for templates)
      };
      // Add cl-add-to-cart declaration if not already present globally
      "commercelayer-add-to-cart": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        "sku-code"?: string;
        quantity?: string; // Or number, check CL docs
      };
    }
  }
}
// --- End TypeScript Declaration ---

export interface Props {
  product: CommerceLayerProduct;
  className?: string;
  onViewDetailsClick?: () => void; // Add the new prop, optional to maintain backward compatibility
}

const ProductItemCardComponent = ({ product, className = "", onViewDetailsClick }: Props) => { // Destructure onViewDetailsClick
// Removed market store import (not needed for CL component)
// Removed isAdding state and handleAddToCart function

  // Use a default placeholder if imageUrl is missing or invalid
  const imageUrl = product.image_url && product.image_url.startsWith('http') 
                 ? product.image_url 
                 : 'https://via.placeholder.com/300x300?text=No+Image'; // Placeholder adjusted slightly

  // Handle potential image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.onerror = null; // Prevent infinite loop if placeholder also fails
    target.src = 'https://via.placeholder.com/300x300?text=Image+Error';
  };

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
            alt={product.name || 'Product image'}
            className="w-full h-48 object-cover" // Fixed height for consistency
            onError={handleImageError}
            loading="lazy" // Add lazy loading for performance
          />
        </div>
      </CardHeader>
      <CardHeader >
        <CardTitle 
          className="text-lg font-semibold tracking-tight truncate hover:text-primary transition-colors" 
          title={product.name}
        >
            {product.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow p-4"> 
        <p className="text-sm text-muted-foreground flex-grow mb-4 line-clamp-3" title={product.description || ""}>
          {product.description || "No description available."}
        </p>
        <div className="flex justify-between items-center mt-auto mb-4"> {/* Added margin-bottom */}
          <p className="text-lg font-bold">
            {product.price?.formatted || "Price not available"}
          </p>
          {/* Display availability using Badge based on backend data */}
          <Badge variant={product.available ? "success" : "destructive"}>
              {product.available ? "In Stock" : "Out of Stock"}
          </Badge>          
        </div>

        {/* Action Buttons Area */}
        <div className="mt-auto space-y-2"> {/* Use mt-auto to push to bottom */}
            {/* View Details Button - Only render if callback is provided */}
            {onViewDetailsClick && (
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={(e) => {
                  console.log("[ProductItemCard] 'View Details' button clicked."); // <<< ADD THIS LOG
                   e.stopPropagation(); // Prevent potential interference
                   onViewDetailsClick(); 
                 }}
              >
                View Details
              </Button>
            )}

            {/* Commerce Layer Add to Cart Component */}
          {product.code && product.available ? (
            <commercelayer-add-to-cart sku-code={product.code} quantity="1">
            </commercelayer-add-to-cart>
          ) : (
            <Button disabled className="w-full">
              Out of Stock
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const ProductItemCard = React.memo(ProductItemCardComponent);

