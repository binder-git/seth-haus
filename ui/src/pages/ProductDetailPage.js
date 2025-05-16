import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import brain from "@/brain";
import { useAppContext } from "components/AppProvider"; // Import App context
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react"; // Removed Loader2, added ShoppingCart
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
// Removed: import { useCartStore } from "../utils/cart-store";
import { ProductItemCard } from "components/ProductItemCard"; // Import ProductItemCard
import { Link } from "react-router-dom"; // Import Link
// --- Commerce Layer API Types (Simplified) ---
const ProductDetailPage = () => {
    console.log("[ProductDetailPage] Component rendering..."); // Log start
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    // Get SKU and Market directly from URL
    const sku = searchParams.get("sku");
    const market = searchParams.get("market"); // Ensure this matches the param name in the Link
    console.log(`[ProductDetailPage] Received URL Params - SKU: ${sku}, Market: ${market}`);
    // Use market context later if needed, but log URL params first
    const { currentMarketId, baseUrl, configReady, market: contextMarket, clScriptReady, clReady } = useAppContext();
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    // Removed: accessToken, orderId, isAddingToCart state, cart store state
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [isRelatedLoading, setIsRelatedLoading] = useState(false);
    const [relatedError, setRelatedError] = useState(null);
    // 2. Fetch Product Details
    useEffect(() => {
        if (!sku || !market) {
            setError("Product SKU or Market information missing.");
            setIsLoading(false);
            return;
        }
        let isMounted = true;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
        const fetchProductDetails = async () => {
            if (!isMounted)
                return;
            setIsLoading(true);
            setError(null);
            setProduct(null);
            console.log(`[PDP] Fetching details for SKU: ${sku}, Market: ${market}`);
            try {
                const response = await brain.get_product_details({
                    market: market,
                    skuCode: sku
                });
                // The response should be { product: ProductResponse }
                const productData = 'product' in response ? response.product : response;
                if (productData) {
                    console.log("[PDP] Product data received from API:", productData);
                    if (isMounted) {
                        setProduct(productData); // Fix TypeScript error
                    }
                }
                else {
                    console.error("[PDP] API Error fetching product:", response);
                    let errorMessage = 'Failed to fetch product details';
                    // Handle different error response formats
                    if (typeof response === 'object' && response !== null) {
                        const errorData = response;
                        if (errorData.status === 404) {
                            errorMessage = `Product with SKU '${sku}' was not found in the ${market} market.`;
                        }
                        else if (errorData?.message || errorData?.detail) {
                            errorMessage = (errorData.message || errorData.detail);
                        }
                        else if (errorData.status) {
                            errorMessage += ` (Status: ${errorData.status})`;
                        }
                    }
                    throw new Error(errorMessage);
                }
            }
            catch (err) {
                if (isMounted) {
                    const errorMsg = err.name === 'AbortError'
                        ? 'Request timed out. Please try again.'
                        : err.message || 'An unknown error occurred while loading the product.';
                    console.error("[PDP] Error in fetchProductDetails:", err);
                    setError(errorMsg);
                }
            }
            finally {
                if (isMounted) {
                    clearTimeout(timeoutId);
                    setIsLoading(false);
                }
            }
        };
        fetchProductDetails();
        return () => {
            isMounted = false;
            controller.abort();
            clearTimeout(timeoutId);
        };
    }, [sku, market]); // Re-fetch if SKU or market changes
    // Function to fetch related products
    const fetchRelatedProducts = useCallback(async (category, market) => {
        if (!category)
            return;
        setIsRelatedLoading(true);
        setRelatedError(null);
        console.log(`[PDP] Fetching related products for category: ${category}, market: ${market}`);
        try {
            const response = await brain.get_commerce_layer_products({
                market: market,
                category: category
            });
            // Handle both response formats: { products } or { data: { products } }
            const products = ('products' in response ? response.products : response?.data?.products || []);
            // Filter out the current product and limit to 4 items
            const filteredProducts = products
                .filter((p) => p.code && p.code !== product?.sku)
                .slice(0, 4);
            console.log(`[PDP] Found ${filteredProducts.length} related products`);
            setRelatedProducts(filteredProducts);
        }
        catch (err) {
            const errorMsg = err.name === 'AbortError'
                ? 'Related products request timed out.'
                : err.message || 'Could not load related products.';
            console.error('[PDP] Error in fetchRelatedProducts:', err);
            setRelatedError(errorMsg);
        }
        finally {
            setIsRelatedLoading(false);
        }
    }, [product?.sku]);
    // Fetch related products when the product or market changes
    useEffect(() => {
        if (!product?.id || !market)
            return;
        let isMounted = true;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
        // Add a small delay to prevent rapid successive requests
        const delayTimer = setTimeout(() => {
            // Use the product's category if available, otherwise don't fetch related products
            if (product?.category && market) {
                fetchRelatedProducts(product.category, market);
            }
            else {
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
        return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs(Button, { variant: "outline", onClick: goBack, className: "mb-6 inline-flex items-center", disabled: true, children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Back"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12", children: [_jsx(Skeleton, { className: "aspect-square w-full rounded-lg bg-muted" }), _jsxs("div", { className: "space-y-4 py-4", children: [_jsx(Skeleton, { className: "h-8 w-3/4 bg-muted" }), _jsx(Skeleton, { className: "h-6 w-1/4 bg-muted" }), _jsx(Skeleton, { className: "h-6 w-1/4 bg-muted" }), _jsx(Skeleton, { className: "h-24 w-full bg-muted" }), _jsx(Skeleton, { className: "h-10 w-1/3 bg-muted" })] })] })] }));
    }
    if (error) {
        return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs(Button, { variant: "outline", onClick: goBack, className: "inline-flex items-center", children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Back"] }), _jsxs("div", { className: "flex flex-col items-center justify-center min-h-[60vh]", children: [_jsx("h2", { className: "text-2xl font-semibold text-destructive mb-4", children: "Error" }), _jsx("p", { className: "text-muted-foreground max-w-md", children: error })] })] }));
    }
    if (!product) {
        return (_jsxs("div", { className: "container mx-auto px-4 py-8 text-center", children: [_jsxs(Button, { variant: "outline", onClick: goBack, className: "inline-flex items-center", children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Back"] }), _jsxs("div", { className: "flex flex-col items-center justify-center min-h-[60vh]", children: [_jsx("h2", { className: "text-2xl font-semibold", children: "Product Not Found" }), _jsx("p", { className: "text-muted-foreground", children: "The requested product could not be found." })] })] }));
    }
    // --- Product Detail Layout ---
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs(Button, { variant: "outline", onClick: goBack, className: "mb-6 inline-flex items-center", children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Back"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12", children: [_jsx(Card, { className: "overflow-hidden rounded-lg shadow-none border-none", children: _jsx(CardContent, { className: "p-0", children: product.images && product.images.length > 0 ? (_jsx("img", { src: product.images[0].url, alt: product.images[0].alt || product.name, className: "w-full h-auto object-cover aspect-square rounded-lg", loading: "lazy" })) : (_jsx("div", { className: "aspect-square w-full bg-muted rounded-lg flex items-center justify-center", children: _jsx("span", { className: "text-muted-foreground", children: "No Image" }) })) }) }), _jsxs("div", { className: "py-4", children: [_jsx("h1", { className: "text-3xl md:text-4xl font-bold mb-2", children: product.name }), _jsxs("p", { className: "text-sm text-muted-foreground mb-4", children: ["SKU: ", product.sku] }), _jsxs("div", { className: "flex items-center mb-4", children: [_jsx("span", { className: "text-2xl font-semibold mr-4", children: product.price?.formatted || "Price unavailable" }), product.available ? (_jsx(Badge, { variant: "default", className: "bg-green-500 hover:bg-green-600 text-white", children: "In Stock" })) : (_jsx(Badge, { variant: "destructive", children: "Out of Stock" }))] }), _jsx("div", { className: "prose prose-sm max-w-none mb-6", children: _jsx("p", { children: product.description || "No description available." }) }), product.sku && product.available && configReady && clScriptReady && (_jsx("cl-add-to-cart", { code: product.sku, "data-cart": true, children: "Add to Cart" })), !product.available && (_jsx(Button, { size: "lg", className: "w-full", disabled: true, children: "Out of Stock" })), _jsx("p", { className: "text-xs text-muted-foreground mt-2", children: product.available ? "Shipping calculated at checkout." : "This item is currently unavailable." })] })] }), _jsx(Separator, { className: "my-12" }), _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-semibold mb-6 text-center", children: "You Might Also Like" }), isRelatedLoading && (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6", children: [...Array(4)].map((_, index) => (_jsxs("div", { className: "space-y-2", children: [_jsx(Skeleton, { className: "aspect-square w-full bg-muted" }), _jsx(Skeleton, { className: "h-5 w-3/4 bg-muted" }), _jsx(Skeleton, { className: "h-5 w-1/2 bg-muted" })] }, index))) })), relatedError && (_jsxs("p", { className: "text-center text-destructive", children: ["Error loading related products: ", relatedError] })), !isRelatedLoading && !relatedError && relatedProducts.length > 0 && (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6", children: relatedProducts.map((relatedProduct) => (_jsx(Link, { to: `/product-detail-page?sku=${relatedProduct.code}&market=${market}`, className: "block focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg", "aria-label": `View details for ${relatedProduct.name}`, children: _jsx(ProductItemCard, { product: relatedProduct }) }, relatedProduct.code || relatedProduct.id))) })), !isRelatedLoading && !relatedError && relatedProducts.length === 0 && (_jsx("p", { className: "text-center text-muted-foreground", children: "No related products found." }))] })] }));
};
export default ProductDetailPage;
