import { Brain } from "../brain/Brain";
import { Market, MarketName } from '@/types';
import { ProductResponse, ProductPrice, ProductImage, ProductAttribute } from "../brain/data-contracts";

// Alias for better readability
export type CommerceLayerProduct = ProductResponse;
export type { ProductPrice, ProductImage, ProductAttribute };

// This interface matches the response from the backend API
export interface ProductsResponse {
  products: CommerceLayerProduct[];
  detail?: any; // Optional detail field
}

// Cache for products to avoid unnecessary requests
export let productCache: { [key in MarketName]?: CommerceLayerProduct[] } = {};

// Function to get products from Commerce Layer or mock API fallback
export const getCommerceLayerProducts = async (market: Market): Promise<CommerceLayerProduct[]> => {
  const marketName = market.name;
  try {
    // Check if we have cached products for this market
    if (productCache[marketName]) {
      return productCache[marketName]!;
    }

    // First try Commerce Layer API
    try {
      const brainInstance = new Brain();
      const response = await brainInstance.get_commerce_layer_products({
        market: market.name
      });

      // Assuming the response has a 'data' property with 'products'
      const products = response.data.products;
      // Cache the products
      productCache[marketName] = products;
      console.log(`Fetched ${products.length} products from Commerce Layer`);
      return products;
    } catch (e) {
      console.warn("Commerce Layer API failed, falling back to mock data", e);
    }
    
    // If Commerce Layer fails, return empty array
    return [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

// Function to clear cache (useful when switching markets)
export const clearProductCache = (market?: Market) => {
  const marketName = market?.name;
  if (marketName) {
    delete productCache[marketName];
  } else {
    productCache = {};
  }
};

// Function to extract categories from products
export const extractCategories = (products: CommerceLayerProduct[]): string[] => {
  const categories = new Set<string>();
  
  products.forEach(product => {
    if (product.category) {
      categories.add(product.category);
    }
  });
  
  return Array.from(categories);
};

// Function to extract attributes (like brand, color, size) from products
export const extractProductAttributes = (
  products: CommerceLayerProduct[], 
  attributeName: string
): string[] => {
  const values = new Set<string>();
  
  products.forEach(product => {
    // Add null check for attributes
    if (product.attributes) {
      product.attributes.forEach(attr => {
        if (attr.name.toLowerCase() === attributeName.toLowerCase()) {
          values.add(attr.value);
        }
      });
    }
  });
  
  return Array.from(values);
};

// Function to get a specific attribute value for a product
export const getProductAttribute = (
  product: CommerceLayerProduct, 
  attributeName: string
): string | undefined => {
  // Add null check for attributes
  if (!product.attributes) return undefined;

  const attribute = product.attributes.find(
    attr => attr.name.toLowerCase() === attributeName.toLowerCase()
  );
  
  return attribute?.value;
};

