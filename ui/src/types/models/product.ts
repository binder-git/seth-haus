export type Category = "swim" | "bike" | "run" | "triathlon" | "uncategorized";

export type ProductBrand = 
  | "BlueSeventy" | "HUUB" | "Zone3" | "Orca" 
  | "Cervelo" | "Canyon" | "Specialized" | "Trek" 
  | "HOKA" | "Nike" | "Asics" | "ON" 
  | "2XU" | "Castelli" | "Zoot" | "TYR" 
  | "";

export interface ProductPricing {
  price: number;
  currency: string;
  symbol: string;
  formatted: string;
}

// Base product interface
interface BaseProduct {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  image_url?: string; // For backward compatibility
  category: Category;
  brand: ProductBrand;
  sku: string;
  inStock: boolean;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  variants?: ProductVariant[];
  featured?: boolean;
  onSale?: boolean;
  bestSeller?: boolean;
  new?: boolean; // For new product flag
  colors?: string[];
  sizes?: string[];
  pricing: ProductPricing;
  // Additional properties for compatibility
  images?: string[];
  longDescription?: string;
  specifications?: Record<string, string>;
}

export interface Product extends BaseProduct {
  // Additional properties specific to the base product
}

export interface ProductResponse {
  data: Product[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProductDetailResponse {
  data: Product & {
    // Additional properties for detailed product view
    longDescription?: string;
    specifications?: Record<string, string>;
    images?: string[];
    relatedProducts?: BaseProduct[];
  };
  included?: any[]; // For included relationships if using JSON:API
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  inStock: boolean;
  attributes: Record<string, string>; // e.g., { size: 'M', color: 'Red' }
}

// Helper functions
export const validateCategory = (category: string | null | undefined): Category => {
  const validCategories: Category[] = ["swim", "bike", "run", "triathlon"];
  return category && validCategories.includes(category as Category) 
    ? category as Category 
    : "uncategorized";
};

export const validateBrand = (brand: string | null | undefined): ProductBrand => {
  const validBrands: ProductBrand[] = [
    "BlueSeventy", "HUUB", "Zone3", "Orca", 
    "Cervelo", "Canyon", "Specialized", "Trek",
    "HOKA", "Nike", "Asics", "ON",
    "2XU", "Castelli", "Zoot", "TYR"
  ];
  return brand && validBrands.includes(brand as ProductBrand) 
    ? brand as ProductBrand 
    : "";
};
