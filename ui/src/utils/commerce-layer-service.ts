import brain from "brain";
import { Market } from "./types";
import { ProductResponse, ProductPrice, ProductImage, ProductAttribute } from "../brain/data-contracts";

// Alias for better readability
export type CommerceLayerProduct = ProductResponse;
export { ProductPrice, ProductImage, ProductAttribute };

// This interface matches the response from the backend API
export interface ProductsResponse {
  products: CommerceLayerProduct[];
}

// Cache for products to avoid unnecessary requests
let productCache: { [key in Market]?: CommerceLayerProduct[] } = {};

// Function to get products from Commerce Layer or mock API fallback
export const getCommerceLayerProducts = async (market: Market): Promise<CommerceLayerProduct[]> => {
  try {
    // Check if we have cached products for this market
    if (productCache[market]) {
      return productCache[market]!;
    }

    // First try Commerce Layer API
    try {
      const response = await brain.get_products({
        market
      });

      if (response.ok) {
        const data: ProductsResponse = await response.json();
        // Cache the products
        productCache[market] = data.products;
        console.log(`Fetched ${data.products.length} products from Commerce Layer`);
        return data.products;
      }
    } catch (e) {
      console.warn("Commerce Layer API failed, falling back to mock data", e);
    }
    
    // If Commerce Layer fails, use mock API as fallback
    const mockResponse = await brain.mock_products_get_products({
      market
    });

    if (!mockResponse.ok) {
      throw new Error(`Failed to fetch mock products: ${mockResponse.statusText}`);
    }

    const mockData: ProductsResponse = await mockResponse.json();
    
    // Cache the products
    productCache[market] = mockData.products;
    console.log(`Fetched ${mockData.products.length} products from mock API`);
    
    return mockData.products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

// Function to clear cache (useful when switching markets)
export const clearProductCache = (market?: Market) => {
  if (market) {
    delete productCache[market];
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
    product.attributes.forEach(attr => {
      if (attr.name.toLowerCase() === attributeName.toLowerCase()) {
        values.add(attr.value);
      }
    });
  });
  
  return Array.from(values);
};

// Function to get a specific attribute value for a product
export const getProductAttribute = (
  product: CommerceLayerProduct, 
  attributeName: string
): string | undefined => {
  const attribute = product.attributes.find(
    attr => attr.name.toLowerCase() === attributeName.toLowerCase()
  );
  
  return attribute?.value;
};

