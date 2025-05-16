import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react"; // Import useState
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Import Badge for availability
import { cn } from "utils/cn";
const ProductItemCardComponent = ({ product, className = "", onViewDetailsClick }) => {
    // Removed market store import (not needed for CL component)
    // Removed isAdding state and handleAddToCart function
    // Use a default placeholder if imageUrl is missing or invalid
    const imageUrl = product.image_url && product.image_url.startsWith('http')
        ? product.image_url
        : 'https://via.placeholder.com/300x300?text=No+Image'; // Placeholder adjusted slightly
    // Handle potential image loading errors
    const handleImageError = (e) => {
        const target = e.target;
        target.onerror = null; // Prevent infinite loop if placeholder also fails
        target.src = 'https://via.placeholder.com/300x300?text=Image+Error';
    };
    return (_jsxs(Card, { className: cn("overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 bg-card flex flex-col h-full", className), tabIndex: -1, children: [_jsx(CardHeader, { className: "p-0", children: _jsx("div", { className: "w-full overflow-hidden", children: _jsx("img", { src: imageUrl, alt: product.name || 'Product image', className: "w-full h-48 object-cover" // Fixed height for consistency
                        , onError: handleImageError, loading: "lazy" // Add lazy loading for performance
                     }) }) }), _jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg font-semibold tracking-tight truncate hover:text-primary transition-colors", title: product.name, children: product.name }) }), _jsxs(CardContent, { className: "flex flex-col flex-grow p-4", children: [_jsx("p", { className: "text-sm text-muted-foreground flex-grow mb-4 line-clamp-3", title: product.description || "", children: product.description || "No description available." }), _jsxs("div", { className: "flex justify-between items-center mt-auto mb-4", children: [" ", _jsx("p", { className: "text-lg font-bold", children: product.price?.formatted || "Price not available" }), _jsx(Badge, { variant: product.available ? "default" : "destructive", children: product.available ? "In Stock" : "Out of Stock" })] }), _jsxs("div", { className: "mt-auto space-y-2", children: [" ", onViewDetailsClick && (_jsx(Button, { variant: "outline", className: "w-full", onClick: (e) => {
                                    console.log("[ProductItemCard] 'View Details' button clicked."); // <<< ADD THIS LOG
                                    e.stopPropagation(); // Prevent potential interference
                                    onViewDetailsClick();
                                }, children: "View Details" })), product.code && product.available ? (_jsx("cl-add-to-cart", { code: product.code, "data-cart": true })) : (_jsx(Button, { disabled: true, className: "w-full", children: "Out of Stock" }))] })] })] }));
};
export const ProductItemCard = React.memo(ProductItemCardComponent);
