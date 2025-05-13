export type Market = "UK" | "EU";

export type Category = "swim" | "bike" | "run" | "triathlon";

export type ProductBrand = "BlueSeventy" | "HUUB" | "Zone3" | "Orca" | "Cervelo" | "Canyon" | "Specialized" | "Trek" | "HOKA" | "Nike" | "Asics" | "ON" | "2XU" | "Castelli" | "Zoot" | "TYR";

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
    [market in Market]?: ProductPricing;
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