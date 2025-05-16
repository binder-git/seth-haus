import { ProductsResponse } from '../services/commerce-layer-product-service';
import { ProductsQueryParams } from '../types/api/products';
interface UseProductsReturn {
    products: ProductsResponse['data'];
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}
export declare const useProducts: (params: ProductsQueryParams) => UseProductsReturn;
export {};
