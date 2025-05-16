import { Product } from '../types/api/products';
import { ProductsResponse } from '../types/api/products';
export type { ProductsResponse };
interface FetchProductsParams {
    market: string;
    category?: string;
    page?: number;
    perPage?: number;
}
export declare const fetchProducts: ({ market, category, page, perPage, }: FetchProductsParams) => Promise<ProductsResponse>;
export declare const fetchProductByCode: (code: string) => Promise<Product>;
