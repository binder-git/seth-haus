import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useTransition,
} from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAppProducts, useProductStore } from "utils/product-store";
import { useAppContext } from "components/AppProvider";
import { Category, ProductBrand, Market, Product } from "utils/types";
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

  const categoryParam = searchParams.get("category") as Category | null;

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000]);
  const [showNew, setShowNew] = useState<boolean>(false);
  const [showBestSellers, setShowBestSellers] = useState<boolean>(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    categoryParam
  );
  const [selectedBrands, setSelectedBrands] = useState<ProductBrand[]>([]);

  const [availableBrands, setAvailableBrands] = useState<ProductBrand[]>([]);
  const [currentMinPrice, setCurrentMinPrice] = useState<number>(0);
  const [currentMaxPrice, setCurrentMaxPrice] = useState<number>(3000);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);

  useEffect(() => {
    if (market && currentMarketId) {
      console.log(`Fetching products for market: ${market} (ID: ${currentMarketId}), category: ${categoryParam}`);
      fetchProducts(market, categoryParam);
    }
  }, [market, currentMarketId, categoryParam, fetchProducts]);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
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
    const brds = new Set<ProductBrand>();
    let minP = Infinity;
    let maxP = 0;
    const szs = new Set<string>();
    const clrs = new Set<string>();
    products.forEach((product) => {
      if (product.brand) brds.add(product.brand);
      product.sizes?.forEach(size => szs.add(size));
      product.colors?.forEach(color => clrs.add(color));
      const price = product.pricing[market]?.price;
      if (price !== undefined) {
        if (price < minP) minP = price;
        if (price > maxP) maxP = price;
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
      filtered = filtered.filter((p) =>
        p.category && p.category.toLowerCase() === lowerCaseSelectedCategory
      );
    }
    if (selectedBrands.length > 0) {
      filtered = filtered.filter((p) => p.brand && selectedBrands.includes(p.brand));
    }
    filtered = filtered.filter((p) => {
      const marketPriceData = p.pricing?.[market];
      if (!marketPriceData || marketPriceData.price === undefined) return false;
      return (
        marketPriceData.price >= priceRange[0] && marketPriceData.price <= priceRange[1]
      );
    });
    if (showNew) {
      filtered = filtered.filter((p) => p.new);
    }
    if (showBestSellers) {
      filtered = filtered.filter((p) => p.bestSeller);
    }
    if (selectedSizes.length > 0) {
      filtered = filtered.filter((p) =>
        p.sizes?.some((size) => selectedSizes.includes(size))
      );
    }
    if (selectedColors.length > 0) {
      filtered = filtered.filter((p) =>
        p.colors?.some((color) => selectedColors.includes(color))
      );
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

  const handleSizeToggle = useCallback((size: string) => {
    startTransition(() => {
      setSelectedSizes((prev) =>
        prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
      );
    });
  }, [startTransition]);

  const handleColorToggle = useCallback((color: string) => {
    startTransition(() => {
      setSelectedColors((prev) =>
        prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
      );
    });
  }, [startTransition]);

  const handleBrandToggle = useCallback((brand: ProductBrand) => {
    startTransition(() => {
      setSelectedBrands((prev) =>
        prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
      );
    });
  }, [startTransition]);

  const handleCategoryChange = useCallback((category: Category | null) => {
    startTransition(() => {
      setSelectedCategory(category);
      if (category) {
        setSearchParams({ category });
      } else {
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

  const handleViewDetails = useCallback((productCode: string, productId: string) => {
    if (!market) {
      console.error("[Products] Market context is not available for navigation.");
      return;
    }
    // productId is available if needed for a different route structure in the future, using productCode (SKU) for now as per original logic.
    const targetUrl = `/product-detail-page?sku=${productCode}&market=${market}`;
    navigate(targetUrl);
  }, [navigate, market]);


  if (isLoading && products.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-1/4 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1 space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={`skeleton-initial-${i}`}>
                  <CardContent className="p-4">
                    <Skeleton className="h-48 w-full mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                  {/* CardFooter was here, removed as it had a Skeleton for a button that is not part of this initial skeleton */}
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }



  const currencySymbol = market === "UK" ? "£" : "€";



  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 capitalize">
          {selectedCategory ? `${selectedCategory} Gear` : "All Products"}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <aside className="md:col-span-1 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Categories</h3>
              <div className="space-y-2">
                {["All", "Swim", "Bike", "Run", "Triathlon"].map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory?.toLowerCase() === cat.toLowerCase() || (cat === "All" && !selectedCategory) ? "secondary" : "ghost"}
                    className="w-full justify-start capitalize"
                    onClick={() => handleCategoryChange(cat === "All" ? null : cat.toLowerCase() as Category)}
                    disabled={isPending || isLoading}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-3">Price Range</h3>
              <Slider
                min={currentMinPrice}
                max={currentMaxPrice}
                step={10}
                value={priceRange}
                onValueChange={(value) => startTransition(() => setPriceRange(value as [number, number]))}
                className="mb-2"
                disabled={isPending || isLoading}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{currencySymbol}{priceRange[0]}</span>
                <span>{currencySymbol}{Math.ceil(currentMaxPrice / 100) * 100}</span>
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-3">Features</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="show-new" checked={showNew} onCheckedChange={(checked) => startTransition(() => setShowNew(Boolean(checked)))} disabled={isPending || isLoading} />
                  <label htmlFor="show-new" className="text-sm font-medium">New Arrivals</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="show-best" checked={showBestSellers} onCheckedChange={(checked) => startTransition(() => setShowBestSellers(Boolean(checked)))} disabled={isPending || isLoading}/>
                  <label htmlFor="show-best" className="text-sm font-medium">Best Sellers</label>
                </div>
              </div>
            </div>
            <Separator />
            {availableSizes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Sizes</h3>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSizes.includes(size) ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => handleSizeToggle(size)}
                      disabled={isPending || isLoading}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}
             <Separator />
            {availableColors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Colors</h3>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color) => (
                    <Button
                      key={color}
                      variant={selectedColors.includes(color) ? "secondary" : "outline"}
                      size="sm"
                      className="h-8 w-8 p-0 border-2"
                      style={{
                        backgroundColor: color,
                        borderColor: selectedColors.includes(color) ? "hsl(var(--primary))" : color,
                      }}
                      onClick={() => handleColorToggle(color)}
                      disabled={isPending || isLoading}
                      aria-label={`Filter by color ${color}`}
                    />
                  ))}
                </div>
              </div>
            )}
            <Button variant="outline" onClick={handleClearFilters} disabled={isPending || isLoading}>Clear Filters</Button>
          </aside>

          <div className="md:col-span-3">
            {isPending ? (
                 <div className="flex justify-center items-center h-64">
                   <p>Filtering products...</p>
                 </div>
            ) : !isPending && memoizedDisplayProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {memoizedDisplayProducts.map((product) => {
                  // handleViewDetails is now defined outside the map and memoized
                  return (
                    <Card key={product.id} className="overflow-hidden flex flex-col group">
                      <CardContent className="p-4 flex-grow">
                        <div className="block mb-4 cursor-pointer" onClick={() => handleViewDetails(product.code, product.id)}>
                          <img
                            src={product.image_url || "/placeholder.svg"} 
                            alt={product.name}
                            className="aspect-square w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                            loading="lazy"
                          />
                        </div>
                        <h2 className="text-lg font-semibold mb-1 truncate cursor-pointer hover:underline" onClick={() => handleViewDetails(product.code, product.id)}>
                          {product.name}
                        </h2>
                        <p className="text-sm text-muted-foreground mb-2">{product.brand}</p>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2" title={product.description}>
                          {product.description}
                        </p>
                        <div className="flex justify-between items-center mt-4">
                          {product.pricing[market]?.formatted ? (
                            <p className="text-lg font-bold">
                              {product.pricing[market]?.formatted}
                            </p>
                          ) : (
                            <p className="text-lg font-bold text-muted-foreground">N/A</p>
                          )}
                          <Button variant="default" size="sm" onClick={() => handleViewDetails(product.code, product.id)}>
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : !isPending && !isLoading && memoizedDisplayProducts.length === 0 && products.length > 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No products found matching your criteria.
              </div>
            ) : !isLoading && products.length === 0 && !isPending ? (
              <div className="text-center py-12 text-muted-foreground">
                 No products available in this category or market currently.
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
