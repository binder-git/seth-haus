import { Market, MarketName } from '@/types';
import { ProductResponse, ProductPrice, ProductImage, ProductAttribute } from "../brain/data-contracts";
export type CommerceLayerProduct = ProductResponse;
export type { ProductPrice, ProductImage, ProductAttribute };
export interface ProductsResponse {
    products: CommerceLayerProduct[];
    detail?: any;
}
export declare let productCache: {
    [key in MarketName]?: CommerceLayerProduct[];
};
export declare const getCommerceLayerProducts: (market: Market) => Promise<CommerceLayerProduct[]>;
export declare const clearProductCache: (market?: Market) => void;
export declare const extractCategories: (products: CommerceLayerProduct[]) => string[];
export declare const extractProductAttributes: (products: CommerceLayerProduct[], attributeName: string) => string[];
export declare const getProductAttribute: (product: CommerceLayerProduct, attributeName: string) => string | undefined;
