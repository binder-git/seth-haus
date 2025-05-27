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
  
  // State management - SIMPLIFIED
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(300);
  
  // Get current category from URL params
  const currentCategory = searchParams.get('category') || 'all';

  // SIMPLIFIED: Extract price from shadow DOM without caching
  const extractPriceFromCard = (card: Element): number => {
    const priceElements = card.querySelectorAll('cl-price-amount[type="price"]');
    
    for (const priceElement of priceElements) {
      try {
        // Access shadow DOM content
        const shadowRoot = (priceElement as any).shadowRoot;
        if (shadowRoot) {
          const shadowText = shadowRoot.textContent || '';
          
          if (shadowText && shadowText.trim() !== '') {
            // Extract price from text like "€65,00"
            const priceMatch = shadowText.match(/[€£$]\s*(\d+(?:[,.]\d{2})?)/);
            if (priceMatch) {
              const priceStr = priceMatch[1].replace(',', '.');
              const price = parseFloat(priceStr);
              if (!isNaN(price) && price > 0) {
                return price;
              }
            }
          }
        }
        
        // Fallback: try innerText
        const innerText = (priceElement as any).innerText || '';
        if (innerText && innerText.trim() !== '') {
          const priceMatch = innerText.match(/[€£$]\s*(\d+(?:[,.]\d{2})?)/);
          if (priceMatch) {
            const priceStr = priceMatch[1].replace(',', '.');
            const price = parseFloat(priceStr);
            if (!isNaN(price) && price > 0) {
              return price;
            }
          }
        }
      } catch (error) {
        // Silent fail
      }
    }
    
    return 0;
  };

  // SIMPLIFIED: Direct filtering without requestAnimationFrame delays
  const applyPriceFilter = (maxPrice: number) => {
    const productCards = document.querySelectorAll('[data-product-card]');
    let hiddenCount = 0;
    let visibleCount = 0;
    
    productCards.forEach((card) => {
      const cardElement = card as HTMLElement;
      const cardPrice = extractPriceFromCard(card);
      
      // Show card if no price found OR price is within range
      if (cardPrice === 0 || cardPrice <= maxPrice) {
        cardElement.style.display = '';
        visibleCount++;
      } else {
        cardElement.style.display = 'none';
        hiddenCount++;
      }
    });
    
    console.log(`[Products] Filter: ${visibleCount} visible, ${hiddenCount} hidden`);
  };

  // SIMPLIFIED: Immediate response when slider changes
  const handleMaxPriceChange = (newMaxPrice: number) => {
    setMaxPriceFilter(newMaxPrice);
    // Apply filter immediately without delays
    setTimeout(() => applyPriceFilter(newMaxPrice), 100);
  };

  // Apply filter when products load - SHORTER DELAY
  useEffect(() => {
    if (!loading && allProducts.length > 0) {
      // Shorter delay to not interfere with Commerce Layer loading
      const timer = setTimeout(() => {
        applyPriceFilter(maxPriceFilter);
      }, 300); // Reduced from 1000ms to 300ms
      
      return () => clearTimeout(timer);
    }
  }, [loading, allProducts.length, maxPriceFilter]);

  // Get products for current category
  const categoryProducts = useMemo(() => {
    if (currentCategory === 'all') {
      return allProducts;
    }
    
    const filtered = allProducts.filter(product => {
      const productName = (product.attributes?.name || '').toLowerCase();
      const productDescription = (product.attributes?.description || '').toLowerCase();
      const productCode = (product.attributes?.code || '').toLowerCase();
      
      const tags = product.tags || [];
      const hasMatchingTag = tags.some(tag => tag.slug === currentCategory);
      
      const categoryKeywords = {
        'bike': ['bike', 'cycling', 'bicycle', 'wheel', 'pedal', 'chain'],
        'run': ['run', 'running', 'marathon', 'shoe', 'trainer'],
        'swim': ['swim', 'swimming', 'pool', 'goggle', 'suit'],
        'tri': ['tri', 'triathlon', 'transition']
      };
      
      const keywords = categoryKeywords[currentCategory as keyof typeof categoryKeywords] || [];
      const hasMatchingKeyword = keywords.some(keyword => 
        productName.includes(keyword) || 
        productDescription.includes(keyword) ||
        productCode.includes(keyword)
      );
      
      return hasMatchingTag || hasMatchingKeyword;
    });
    
    return filtered;
  }, [allProducts, currentCategory]);

  // Fetch ALL products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        market: market.id || 'market:id:qjANwhQrJg'
      });

      const apiUrl = `/api/product-listing?${params.toString()}`;

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
      setAllProducts(data.products || []);
      
    } catch (err) {
      console.error('[Products] Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Fetch products when component mounts or market changes
  useEffect(() => {
    fetchProducts();
  }, [market.id]);

  // Reset and reapply filter when category changes
  useEffect(() => {
    if (!loading && allProducts.length > 0) {
      // Reset all cards to visible first
      const productCards = document.querySelectorAll('[data-product-card]');
      productCards.forEach(card => {
        const cardElement = card as HTMLElement;
        cardElement.style.display = '';
      });
      
      // Reapply current filter with shorter delay
      setTimeout(() => {
        applyPriceFilter(maxPriceFilter);
      }, 300);
    }
  }, [currentCategory, loading, allProducts.length, maxPriceFilter]);

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
    navigate(`/products/${productCode}`);
  };

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
              <Button onClick={() => fetchProducts()}>
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
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Products</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Discover our range of triathlon gear and accessories
        </p>
      </div>

      {/* Mobile Layout: Stacked */}
      <div className="block md:hidden">
        {/* Mobile Filters */}
        <Card className="mb-6 relative z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4 space-y-4">
            {/* Category Filters */}
            <div>
              <Label className="text-sm font-medium mb-2 block text-gray-900 dark:text-white">Categories</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <Button
                    key={category.id}
                    variant={currentCategory === category.slug ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleCategoryChange(category.slug)}
                    className={`text-xs ${
                      currentCategory === category.slug 
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <Label className="text-sm font-medium mb-2 block text-gray-900 dark:text-white">
                Maximum Price: €{maxPriceFilter}
              </Label>
              <Slider
                value={[maxPriceFilter]}
                onValueChange={(value) => handleMaxPriceChange(value[0])}
                min={0}
                max={300}
                step={5}
                className="w-full [&_[role=slider]]:bg-white [&_[role=slider]]:dark:bg-gray-700 [&_[role=slider]]:border-gray-300 [&_[role=slider]]:dark:border-gray-600"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>€0</span>
                <span>€300</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                * Filters based on Commerce Layer shadow DOM prices
              </div>
            </div>

            {/* Reset Filters */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                handleCategoryChange('all');
                setMaxPriceFilter(300);
              }}
              className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Reset All Filters
            </Button>
          </CardContent>
        </Card>

        {/* Mobile Products Grid */}
        <div className="relative z-10">
          {/* Products Count */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {categoryProducts.length} product{categoryProducts.length !== 1 ? 's' : ''} found
              {currentCategory !== 'all' && (
                <span className="ml-1">
                  in {CATEGORIES.find(c => c.slug === currentCategory)?.name || currentCategory}
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Showing products up to €{maxPriceFilter}
            </p>
          </div>

          {/* Products Grid */}
          {categoryProducts.length === 0 ? (
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">No Products Found</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    No products available in the {CATEGORIES.find(c => c.slug === currentCategory)?.name || currentCategory} category.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => handleCategoryChange('all')}
                    className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    View All Products
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categoryProducts.map((product) => (
                <div key={product.id} data-product-card>
                  <ProductItemCard
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Layout: Sidebar + Content */}
      <div className="hidden md:flex gap-8">
        {/* Left Sidebar */}
        <div className="w-64 shrink-0 relative z-20">
          <Card className="sticky top-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6 space-y-6">
              {/* Category Filters */}
              <div>
                <Label className="text-sm font-medium mb-3 block text-gray-900 dark:text-white">Categories</Label>
                <div className="space-y-2">
                  {CATEGORIES.map((category) => (
                    <Button
                      key={category.id}
                      variant={currentCategory === category.slug ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => handleCategoryChange(category.slug)}
                      className={`w-full justify-start transition-all duration-200 ${
                        currentCategory === category.slug 
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                          : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700"></div>

              {/* Price Filter */}
              <div>
                <Label className="text-sm font-medium mb-3 block text-gray-900 dark:text-white">
                  Maximum Price
                </Label>
                <div className="space-y-4">
                  <div className="text-center text-sm text-gray-600 dark:text-gray-300">
                    Up to €{maxPriceFilter}
                  </div>
                  <Slider
                    value={[maxPriceFilter]}
                    onValueChange={(value) => handleMaxPriceChange(value[0])}
                    min={0}
                    max={300}
                    step={5}
                    className="w-full [&_[role=slider]]:bg-white [&_[role=slider]]:dark:bg-gray-700 [&_[role=slider]]:border-gray-300 [&_[role=slider]]:dark:border-gray-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>€0</span>
                    <span>€300</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    * Filters based on Commerce Layer shadow DOM prices
                  </div>
                  <div>
                    <Label htmlFor="max-price" className="text-xs text-gray-600 dark:text-gray-300">Max Price</Label>
                    <Input
                      id="max-price"
                      type="number"
                      value={maxPriceFilter}
                      onChange={(e) => {
                        const newMax = Math.min(300, Math.max(0, parseInt(e.target.value) || 0));
                        setMaxPriceFilter(newMax);
                      }}
                      className="h-8 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                    />
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
                    setMaxPriceFilter(300);
                  }}
                  className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Reset All Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 relative z-10">
          {/* Products Count and Market Info */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {categoryProducts.length} product{categoryProducts.length !== 1 ? 's' : ''} found
                {currentCategory !== 'all' && (
                  <span className="ml-1">
                    in {CATEGORIES.find(c => c.slug === currentCategory)?.name || currentCategory}
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Showing products up to €{maxPriceFilter}
              </p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Market: {market.name}
            </p>
          </div>

          {/* Products Grid */}
          {categoryProducts.length === 0 ? (
            <Card className="max-w-md mx-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">No Products Found</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    No products available in the {CATEGORIES.find(c => c.slug === currentCategory)?.name || currentCategory} category.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => handleCategoryChange('all')}
                    className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    View All Products
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryProducts.map((product) => (
                <div key={product.id} data-product-card>
                  <ProductItemCard
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
