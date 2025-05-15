export type Market = "UK" | "EU" | { name: string; id: string; countryCode?: string; currencyCode?: string; };

export type Category = "swim" | "bike" | "run" | "triathlon" | "uncategorized";

export type ProductBrand = "BlueSeventy" | "HUUB" | "Zone3" | "Orca" | "Cervelo" | "Canyon" | "Specialized" | "Trek" | "HOKA" | "Nike" | "Asics" | "ON" | "2XU" | "Castelli" | "Zoot" | "TYR" | "";

// Helper function to validate and default category
export const validateCategory = (category: string | null | undefined): Category => {
  const validCategories: Category[] = ["swim", "bike", "run", "triathlon"];
  return category && validCategories.includes(category as Category) ? category as Category : "uncategorized";
};

// Helper function to validate and default brand
export const validateBrand = (brand: string | null | undefined): ProductBrand => {
  const validBrands: ProductBrand[] = ["BlueSeventy", "HUUB", "Zone3", "Orca", "Cervelo", "Canyon", "Specialized", "Trek", "HOKA", "Nike", "Asics", "ON", "2XU", "Castelli", "Zoot", "TYR"];
  return brand && validBrands.includes(brand as ProductBrand) ? brand as ProductBrand : "";
};

export interface ProductPricing {
  price: number;
  currency: string;
  symbol: string;
  formatted: string; // Added for direct use by ProductItemCard
}

export interface Product {
  id: string;
  code: string; // Added SKU Code
  name: string;
  description: string;
  image: string; // Main display image, potentially a fallback or processed
  image_url?: string; // Raw image URL, preferred by ProductItemCard
  category: Category;
  brand: ProductBrand;
  available?: boolean; // Added for direct use by ProductItemCard
  featured?: boolean;
  new?: boolean;
  bestSeller?: boolean;
  rating?: number; // 1-5 star rating
  colors?: string[];
  sizes?: string[];
  pricing: {
    [market in Market['name']]?: ProductPricing;
  };
}

export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDelivery: string;
  markets: Market[];
}