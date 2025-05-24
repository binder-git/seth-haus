// ui/src/pages/Products.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMarketStore } from '@/utils/market-store';
import { ProductItemCard } from '@/components/ProductItemCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle } from 'lucide-react';

// Product interface matching the actual Commerce Layer API response structure
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

// API response interface from product-listing function
interface ProductListingResponse {
  products: Product[];
  included: any[];
}

// Category mapping for filtering
const CATEGORIES = [
  { id: 'all', name: 'All Products', slug: 'all' },
  { id: 'bike', name: 'Bike', slug: 'bike' },
  { id: 'run', name: 'Run', slug: 'run' },
  { id: 'swim', name: 'Swim', slug: 'swim' },
  { id: 'tri', name: 'Triathlon', slug: 'tri' }
];

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { market } = useMarketStore();
  
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [maxPrice, setMaxPrice] = useState<number>(500);
  
  // Get current category from URL params
  const currentCategory = searchParams.get('category') || 'all';

  // Extract numeric price from Commerce Layer formatted price
  const extractPrice = (formattedPrice: string): number => {
    if (!formattedPrice || formattedPrice === 'N/A') return 0;
    // Remove currency symbols and convert to number
    const numericPrice = formattedPrice.replace(/[£$€,\s]/g, '');
    return parseFloat(numericPrice) || 0;
  };

  // Calculate price range from products
  const calculatePriceRange = (products: Product[]): [number, number] => {
    if (products.length === 0) return [0, 500];
    
    const prices = products.map(product => {
      // Extract price from Commerce Layer format
      const priceStr = product.attributes?.price || '0';
      return extractPrice(priceStr);
    }).filter(price => price > 0);
    
    if (prices.length === 0) return [0, 500];
    
    const min = Math.floor(Math.min(...prices));
    const max = Math.ceil(Math.max(...prices));
    return [min, max];
  };

  // Fetch products from product-listing Netlify function
  const fetchProducts = async (category?: string) => {
    try {
      setLoading(true);
      setError(null);

      // Build API URL with market and optional category filter
      const params = new URLSearchParams({
        market: market.id || 'market:id:vjzmJhvEDo'
      });

      // Add category filter if not 'all'
      if (category && category !== 'all') {
        params.append('tag', category);
      }

      const apiUrl = `/.netlify/functions/product-listing?${params.toString()}`;
      console.log('[Products] Fetching from:', apiUrl);

      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch products: ${response.statusText}`);
      }

      const data: ProductListingResponse = await response.json();
      console.log('[Products] API response:', data);
      console.log('[Products] Products received:', data.products?.length || 0);

      setProducts(data.products || []);
    } catch (err) {
      console.error('[Products] Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Fetch products when component mounts or category changes
  useEffect(() => {
    const loadProducts = async () => {
      await fetchProducts(currentCategory);
    };
    
    loadProducts();
  }, [currentCategory, market.id]);

  // Update price range when products change
  useEffect(() => {
    if (products.length > 0) {
      const [min, max] = calculatePriceRange(products);
      setMaxPrice(max);
      if (priceRange[0] === 0 && priceRange[1] === 500) {
        setPriceRange([min, max]);
      }
    }
  }, [products]);

  // Handle category filter changes
  const handleCategoryChange = (categorySlug: string) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (categorySlug === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', categorySlug);
    }
    
    setSearchParams(newParams);
  };

  // Handle product view details
  const handleViewDetails = (productCode: string, productId: string) => {
    console.log('[Products] View details clicked:', { productCode, productId });
    navigate(`/products/${productCode}`);
  };

  // Memoized filtered products with price filtering
  const memoizedDisplayProducts = useMemo(() => {
    return products.filter(product => {
      const price = extractPrice(product.attributes?.price || '0');
      return price >= priceRange[0] && price <= priceRange[1];
    });
  }, [products, priceRange]);

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Products</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => fetchProducts(currentCategory)}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Products</h1>
        <p className="text-muted-foreground">
          Discover our range of triathlon gear and accessories
        </p>
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex gap-8">
        {/* Left Sidebar - Filters */}
        <div className="w-64 shrink-0">
          <Card className="sticky top-4">
            <CardContent className="p-6 space-y-6">
              {/* Category Filters */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Categories</Label>
                <div className="space-y-2">
                  {CATEGORIES.map((category) => (
                    <Button
                      key={category.id}
                      variant={currentCategory === category.slug ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => handleCategoryChange(category.slug)}
                      className="w-full justify-start transition-all duration-200"
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-border"></div>

              {/* Price Range Filter */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Price Range
                </Label>
                <div className="space-y-4">
                  <div className="text-center text-sm text-muted-foreground">
                    £{priceRange[0]} - £{priceRange[1]}
                  </div>
                  <Slider
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    min={0}
                    max={maxPrice}
                    step={10}
                    className="w-full"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="min-price" className="text-xs text-muted-foreground">Min</Label>
                      <Input
                        id="min-price"
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => {
                          const newMin = Math.max(0, parseInt(e.target.value) || 0);
                          setPriceRange([newMin, priceRange[1]]);
                        }}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-price" className="text-xs text-muted-foreground">Max</Label>
                      <Input
                        id="max-price"
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => {
                          const newMax = Math.min(maxPrice, parseInt(e.target.value) || maxPrice);
                          setPriceRange([priceRange[0], newMax]);
                        }}
                        className="h-8"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Reset Filters */}
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    handleCategoryChange('all');
                    setPriceRange([0, maxPrice]);
                  }}
                  className="w-full"
                >
                  Reset All Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* Products Count and Market Info */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">
                {memoizedDisplayProducts.length} product{memoizedDisplayProducts.length !== 1 ? 's' : ''} found
                {currentCategory !== 'all' && (
                  <span className="ml-1">
                    in {CATEGORIES.find(c => c.slug === currentCategory)?.name || currentCategory}
                  </span>
                )}
              </p>
              {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                <p className="text-xs text-muted-foreground">
                  Price range: £{priceRange[0]} - £{priceRange[1]}
                </p>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Market: {market.name}
            </p>
          </div>

          {/* Products Grid */}
          {memoizedDisplayProducts.length === 0 ? (
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {currentCategory !== 'all' 
                      ? `No products found in the ${CATEGORIES.find(c => c.slug === currentCategory)?.name || currentCategory} category.`
                      : 'No products match your current filters.'
                    }
                  </p>
                  <div className="space-y-2">
                    {currentCategory !== 'all' && (
                      <Button 
                        variant="outline" 
                        onClick={() => handleCategoryChange('all')}
                      >
                        View All Products
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      onClick={() => setPriceRange([0, maxPrice])}
                    >
                      Reset Price Filter
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {memoizedDisplayProducts.map((product) => (
                <ProductItemCard
                  key={product.id}
                  product={{
                    id: product.id,
                    code: product.attributes?.code || '',
                    name: product.attributes?.name || '',
                    description: product.attributes?.description || '',
                    image_url: product.attributes?.image_url || null
                  }}
                  onViewDetailsClick={() => handleViewDetails(
                    product.attributes?.code || '', 
                    product.id
                  )}
                  className="h-full"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
