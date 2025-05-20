import { Market, Product } from '@/types';
import { ProductResponse } from '../brain/data-contracts';
interface ProductState {
    products: ProductResponse[];
    isLoading: boolean;
    error: string | null;
    fetchProducts: (market: Market, category?: string | null) => Promise<void>;
}
export declare const useProductStore: import("zustand").UseBoundStore<import("zustand").StoreApi<ProductState>>;
export declare const useAppProducts: (market: Market | null) => {
    products: Product[];
    isLoading: boolean;
    error: string | Error | null;
};
export {};
