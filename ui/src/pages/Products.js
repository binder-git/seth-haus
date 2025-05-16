import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo, useCallback, useTransition, } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAppProducts, useProductStore } from "utils/product-store";
import { useAppContext } from "components/AppProvider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card"; // Removed CardFooter import
import { Skeleton } from "@/components/ui/skeleton";
export default function Products() {
    const navigate = useNavigate();
    const { market, currentMarketId } = useAppContext();
    const { fetchProducts } = useProductStore();
    const { products, isLoading, error } = useAppProducts(market);
    const [searchParams, setSearchParams] = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const categoryParam = searchParams.get("category");
    const [priceRange, setPriceRange] = useState([0, 3000]);
    const [showNew, setShowNew] = useState(false);
    const [showBestSellers, setShowBestSellers] = useState(false);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(categoryParam);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [availableBrands, setAvailableBrands] = useState([]);
    const [currentMinPrice, setCurrentMinPrice] = useState(0);
    const [currentMaxPrice, setCurrentMaxPrice] = useState(3000);
    const [availableSizes, setAvailableSizes] = useState([]);
    const [availableColors, setAvailableColors] = useState([]);
    useEffect(() => {
        if (market && currentMarketId) {
            console.log(`Fetching products for market: ${market} (ID: ${currentMarketId}), category: ${categoryParam}`);
            fetchProducts(market, categoryParam);
        }
    }, [market, currentMarketId, categoryParam, fetchProducts]);
    useEffect(() => {
        if (categoryParam) {
            setSelectedCategory(categoryParam);
        }
        else {
            setSelectedCategory(null);
        }
    }, [categoryParam]);
    const derivedFilterOptions = useMemo(() => {
        if (isLoading || !market || products.length === 0) {
            return {
                calculatedBrands: [],
                calculatedMinPrice: 0,
                calculatedMaxPrice: 3000,
                calculatedSizes: [],
                calculatedColors: [],
            };
        }
        const brds = new Set();
        let minP = Infinity;
        let maxP = 0;
        const szs = new Set();
        const clrs = new Set();
        products.forEach((product) => {
            if (product.brand)
                brds.add(product.brand);
            product.sizes?.forEach(size => szs.add(size));
            product.colors?.forEach(color => clrs.add(color));
            const price = product.pricing.price;
            if (price !== undefined) {
                if (price < minP)
                    minP = price;
                if (price > maxP)
                    maxP = price;
            }
        });
        return {
            calculatedBrands: Array.from(brds),
            calculatedMinPrice: minP === Infinity ? 0 : Math.floor(minP),
            calculatedMaxPrice: maxP === 0 ? 3000 : Math.ceil(maxP),
            calculatedSizes: Array.from(szs),
            calculatedColors: Array.from(clrs),
        };
    }, [products, market, isLoading]);
    useEffect(() => {
        startTransition(() => {
            setAvailableBrands(derivedFilterOptions.calculatedBrands);
            setCurrentMinPrice(derivedFilterOptions.calculatedMinPrice);
            setCurrentMaxPrice(derivedFilterOptions.calculatedMaxPrice);
            setAvailableSizes(derivedFilterOptions.calculatedSizes);
            setAvailableColors(derivedFilterOptions.calculatedColors);
            setPriceRange([derivedFilterOptions.calculatedMinPrice, derivedFilterOptions.calculatedMaxPrice]);
        });
    }, [derivedFilterOptions, startTransition]);
    const memoizedDisplayProducts = useMemo(() => {
        if (isLoading || !market || products.length === 0) {
            return [];
        }
        let filtered = [...products];
        if (selectedCategory) {
            const lowerCaseSelectedCategory = selectedCategory.toLowerCase();
            filtered = filtered.filter((p) => p.category && p.category.toLowerCase() === lowerCaseSelectedCategory);
        }
        if (selectedBrands.length > 0) {
            filtered = filtered.filter((p) => p.brand && selectedBrands.includes(p.brand));
        }
        filtered = filtered.filter((p) => {
            const price = p.pricing?.price;
            if (price === undefined)
                return false;
            return price >= priceRange[0] && price <= priceRange[1];
        });
        if (showNew) {
            filtered = filtered.filter((p) => p.new);
        }
        if (showBestSellers) {
            filtered = filtered.filter((p) => p.bestSeller);
        }
        if (selectedSizes.length > 0) {
            filtered = filtered.filter((p) => p.sizes?.some((size) => selectedSizes.includes(size)));
        }
        if (selectedColors.length > 0) {
            filtered = filtered.filter((p) => p.colors?.some((color) => selectedColors.includes(color)));
        }
        return filtered;
    }, [
        products,
        market,
        isLoading,
        selectedCategory,
        selectedBrands,
        priceRange,
        showNew,
        showBestSellers,
        selectedSizes,
        selectedColors,
    ]);
    const handleSizeFilter = useCallback((size) => {
        startTransition(() => {
            setSelectedSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]);
        });
    }, [startTransition]);
    const handleColorFilter = useCallback((color) => {
        startTransition(() => {
            setSelectedColors((prev) => prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]);
        });
    }, [startTransition]);
    const handleBrandFilter = useCallback((brand) => {
        startTransition(() => {
            setSelectedBrands((prev) => prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]);
        });
    }, [startTransition]);
    const handleCategoryChange = useCallback((category) => {
        startTransition(() => {
            setSelectedCategory(category);
            if (category) {
                setSearchParams({ category });
            }
            else {
                setSearchParams({});
            }
        });
    }, [startTransition, setSearchParams]);
    const handleClearFilters = useCallback(() => {
        startTransition(() => {
            setSelectedBrands([]);
            setPriceRange([currentMinPrice, currentMaxPrice]);
            setShowNew(false);
            setShowBestSellers(false);
            setSelectedSizes([]);
            setSelectedColors([]);
        });
    }, [startTransition, currentMinPrice, currentMaxPrice]);
    const handleViewDetails = useCallback((productCode, productId) => {
        if (!market) {
            console.error("[Products] Market context is not available for navigation.");
            return;
        }
        // productId is available if needed for a different route structure in the future, using productCode (SKU) for now as per original logic.
        const targetUrl = `/product-detail-page?sku=${productCode}&market=${market}`;
        navigate(targetUrl);
    }, [navigate, market]);
    if (isLoading && products.length === 0) {
        return (_jsx("div", { className: "flex flex-col min-h-screen", children: _jsxs("main", { className: "flex-grow container mx-auto px-4 py-8", children: [_jsx(Skeleton, { className: "h-8 w-1/4 mb-6" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-8", children: [_jsxs("div", { className: "md:col-span-1 space-y-6", children: [_jsx(Skeleton, { className: "h-10 w-full" }), _jsx(Skeleton, { className: "h-32 w-full" }), _jsx(Skeleton, { className: "h-24 w-full" }), _jsx(Skeleton, { className: "h-24 w-full" })] }), _jsx("div", { className: "md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", children: [...Array(6)].map((_, i) => (_jsx(Card, { children: _jsxs(CardContent, { className: "p-4", children: [_jsx(Skeleton, { className: "h-48 w-full mb-4" }), _jsx(Skeleton, { className: "h-6 w-3/4 mb-2" }), _jsx(Skeleton, { className: "h-4 w-1/2" })] }) }, `skeleton-initial-${i}`))) })] })] }) }));
    }
    const currencySymbol = market?.name === "UK" ? "£" : "€";
    return (_jsx("div", { className: "flex flex-col min-h-screen", children: _jsxs("main", { className: "flex-grow container mx-auto px-4 py-8", children: [_jsx("h1", { className: "text-3xl font-bold mb-6 capitalize", children: selectedCategory ? `${selectedCategory} Gear` : "All Products" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-8", children: [_jsxs("aside", { className: "md:col-span-1 space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-3", children: "Categories" }), _jsx("div", { className: "space-y-2", children: ["All", "Swim", "Bike", "Run", "Triathlon"].map((cat) => (_jsx(Button, { variant: selectedCategory?.toLowerCase() === cat.toLowerCase() || (cat === "All" && !selectedCategory) ? "secondary" : "ghost", className: "w-full justify-start capitalize", onClick: () => handleCategoryChange(cat === "All" ? null : cat.toLowerCase()), disabled: isPending || isLoading, children: cat }, cat))) })] }), _jsx(Separator, {}), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-3", children: "Price Range" }), _jsx(Slider, { min: currentMinPrice, max: currentMaxPrice, step: 10, value: priceRange, onValueChange: (value) => startTransition(() => setPriceRange(value)), className: "mb-2", disabled: isPending || isLoading }), _jsxs("div", { className: "flex justify-between text-sm text-muted-foreground", children: [_jsxs("span", { children: [currencySymbol, priceRange[0]] }), _jsxs("span", { children: [currencySymbol, Math.ceil(currentMaxPrice / 100) * 100] })] })] }), _jsx(Separator, {}), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-3", children: "Features" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "show-new", checked: showNew, onCheckedChange: (checked) => startTransition(() => setShowNew(Boolean(checked))), disabled: isPending || isLoading }), _jsx("label", { htmlFor: "show-new", className: "text-sm font-medium", children: "New Arrivals" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "show-best", checked: showBestSellers, onCheckedChange: (checked) => startTransition(() => setShowBestSellers(Boolean(checked))), disabled: isPending || isLoading }), _jsx("label", { htmlFor: "show-best", className: "text-sm font-medium", children: "Best Sellers" })] })] })] }), _jsx(Separator, {}), availableSizes.length > 0 && (_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-3", children: "Sizes" }), _jsx("div", { className: "flex flex-wrap gap-2", children: availableSizes.map((size) => (_jsx(Button, { variant: selectedSizes.includes(size) ? "secondary" : "outline", size: "sm", onClick: () => handleSizeFilter(size), disabled: isPending || isLoading, children: size }, size))) })] })), _jsx(Separator, {}), availableColors.length > 0 && (_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-3", children: "Colors" }), _jsx("div", { className: "flex flex-wrap gap-2", children: availableColors.map((color) => (_jsx(Button, { variant: selectedColors.includes(color) ? "secondary" : "outline", size: "sm", className: "h-8 w-8 p-0 border-2", style: {
                                                    backgroundColor: color,
                                                    borderColor: selectedColors.includes(color) ? "hsl(var(--primary))" : color,
                                                }, onClick: () => handleColorFilter(color), disabled: isPending || isLoading, "aria-label": `Filter by color ${color}` }, color))) })] })), _jsx(Button, { variant: "outline", onClick: handleClearFilters, disabled: isPending || isLoading, children: "Clear Filters" })] }), _jsx("div", { className: "md:col-span-3", children: isPending ? (_jsx("div", { className: "flex justify-center items-center h-64", children: _jsx("p", { children: "Filtering products..." }) })) : !isPending && memoizedDisplayProducts.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", children: memoizedDisplayProducts.map((product) => {
                                    // handleViewDetails is now defined outside the map and memoized
                                    return (_jsx(Card, { className: "overflow-hidden flex flex-col group", children: _jsxs(CardContent, { className: "p-4 flex-grow", children: [_jsx("div", { className: "block mb-4 cursor-pointer", onClick: () => handleViewDetails(product.code, product.id), children: _jsx("img", { src: product.image_url || "/placeholder.svg", alt: product.name, className: "aspect-square w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105", loading: "lazy" }) }), _jsx("h2", { className: "text-lg font-semibold mb-1 truncate cursor-pointer hover:underline", onClick: () => handleViewDetails(product.code, product.id), children: product.name }), _jsx("p", { className: "text-sm text-muted-foreground mb-2", children: product.brand }), _jsx("p", { className: "text-sm text-muted-foreground mt-2 line-clamp-2", title: product.description, children: product.description }), _jsxs("div", { className: "flex justify-between items-center mt-4", children: [product.pricing.formatted ? (_jsx("p", { className: "text-lg font-bold", children: product.pricing.formatted })) : (_jsx("p", { className: "text-lg font-bold text-muted-foreground", children: "N/A" })), _jsx(Button, { variant: "default", size: "sm", onClick: () => handleViewDetails(product.code, product.id), children: "View" })] })] }) }, product.id));
                                }) })) : !isPending && !isLoading && memoizedDisplayProducts.length === 0 && products.length > 0 ? (_jsx("div", { className: "text-center py-12 text-muted-foreground", children: "No products found matching your criteria." })) : !isLoading && products.length === 0 && !isPending ? (_jsx("div", { className: "text-center py-12 text-muted-foreground", children: "No products available in this category or market currently." })) : null })] })] }) }));
}
