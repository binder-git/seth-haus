import { useState, useEffect } from 'react';
import { fetchProducts, ProductsResponse } from '../services/commerce-layer-product-service';
import { ProductsQueryParams } from '../types/api/products';

interface UseProductsReturn {
  products: ProductsResponse['data'];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useProducts = (params: ProductsQueryParams): UseProductsReturn => {
  const [products, setProducts] = useState<ProductsResponse['data']>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchProducts(params);
      setProducts(data.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch products'));
      console.error('Error fetching products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.market, params.category, params.page, params.perPage]);

  return {
    products,
    isLoading,
    error,
    refetch: fetchData,
  };
};
