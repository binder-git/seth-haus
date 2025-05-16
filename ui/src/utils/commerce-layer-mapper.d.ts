import { Market, Product } from '@/types';
import { CommerceLayerProduct } from "./commerce-layer-service";
export declare const mapCommerceLayerProductToAppProduct: (clProduct: CommerceLayerProduct, currentMarket: Market) => Product;
export declare const groupProductsByCategory: (products: Product[]) => {
    [category: string]: Product[];
};
export declare const filterProducts: (products: Product[], filters: {
    categories?: string[];
    brands?: string[];
    priceRange?: [number, number];
    search?: string;
    onlyNew?: boolean;
    onlyFeatured?: boolean;
    onlyBestSeller?: boolean;
}) => Product[];
