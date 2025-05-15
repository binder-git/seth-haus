import { Market, Product, ProductPricing, validateCategory, validateBrand } from "./types";
import { CommerceLayerProduct, ProductImage, ProductAttribute } from "./commerce-layer-service";

// Map Commerce Layer product to our app's product format
export const mapCommerceLayerProductToAppProduct = (
  clProduct: CommerceLayerProduct,
  currentMarket: Market
): Product => {
  // Extract attributes from the product safely
  const getAttributeValue = (name: string): string | undefined => {
    return clProduct.attributes && clProduct.attributes.length > 0 
      ? clProduct.attributes.find(attr => attr.name === name)?.value
      : undefined;
  };

  // Get pricing information
  const pricing: { [key in Market]?: ProductPricing } = {};
  
  if (clProduct.price) {
    // Create pricing object for the current market
    pricing[currentMarket] = {
      price: clProduct.price.amount_float ?? 0,
      currency: clProduct.price.currency_code ?? 'EUR',
      symbol: clProduct.price.currency_code === 'GBP' ? '£' : '€',
      formatted: clProduct.price.formatted ?? '', // Use the formatted string from CL
    };
  }

  // Map product fields with null checks
  return {
    id: clProduct.id ?? '',
    code: clProduct.code ?? '', // Added mapping for SKU code
    name: clProduct.name ?? 'Unnamed Product',
    description: clProduct.description ?? '',
    image: clProduct.image_url || (clProduct.images?.[0]?.url ?? ''), // Keep existing image logic as a fallback or primary display
    image_url: clProduct.image_url ?? '', // Ensure image_url is populated for ProductItemCard
    category: validateCategory(clProduct.category),
    brand: validateBrand(getAttributeValue('brand')),
    available: clProduct.available ?? true, // Default to true if undefined, for safety
    rating: parseFloat(getAttributeValue('rating') ?? '0'),
    new: getAttributeValue('new') === 'true',
    bestSeller: getAttributeValue('best_seller') === 'true',
    featured: getAttributeValue('featured') === 'true',
    colors: [], // These would need to be extracted from variants or other attributes
    sizes: [], // These would need to be extracted from variants or other attributes
    pricing
  };
};

// Helper function to group products by category
export const groupProductsByCategory = (products: Product[]): { [category: string]: Product[] } => {
  return products.reduce<{ [category: string]: Product[] }>((acc, product) => {
    const category = product.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {});
};

// Helper function to filter products
export const filterProducts = (
  products: Product[],
  filters: {
    categories?: string[];
    brands?: string[];
    priceRange?: [number, number];
    search?: string;
    onlyNew?: boolean;
    onlyFeatured?: boolean;
    onlyBestSeller?: boolean;
  }
): Product[] => {
  return products.filter(product => {
    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(product.category)) {
        return false;
      }
    }

    // Brand filter
    if (filters.brands && filters.brands.length > 0) {
      if (!filters.brands.includes(product.brand)) {
        return false;
      }
    }

    // Price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      // Check if the product has pricing for any market
      const hasValidPrice = Object.values(product.pricing).some(pricing => {
        return pricing.price >= min && pricing.price <= max;
      });
      if (!hasValidPrice) {
        return false;
      }
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const nameMatches = product.name.toLowerCase().includes(searchLower);
      const descMatches = product.description.toLowerCase().includes(searchLower);
      const brandMatches = product.brand.toLowerCase().includes(searchLower);
      
      if (!(nameMatches || descMatches || brandMatches)) {
        return false;
      }
    }

    // New products filter
    if (filters.onlyNew && !product.new) {
      return false;
    }

    // Featured products filter
    if (filters.onlyFeatured && !product.featured) {
      return false;
    }

    // Best sellers filter
    if (filters.onlyBestSeller && !product.bestSeller) {
      return false;
    }

    return true;
  });
};
