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

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  image: string;
  image_url?: string;
  category: Category;
  brand: ProductBrand;
  available?: boolean;
  featured?: boolean;
  new?: boolean;
  bestSeller?: boolean;
  rating?: number;
  colors?: string[];
  sizes?: string[];
  pricing: ProductPricing;
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
