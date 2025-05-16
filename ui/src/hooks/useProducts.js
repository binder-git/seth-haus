import { useState, useEffect } from 'react';
import { fetchProducts } from '../services/commerce-layer-product-service';
export const useProducts = (params) => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchProducts(params);
            setProducts(data.data);
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch products'));
            console.error('Error fetching products:', err);
        }
        finally {
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
