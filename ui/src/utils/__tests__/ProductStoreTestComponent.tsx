import React, { useEffect } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useProductStore } from '../product-store';
import { Market } from '@/types';
import brain from 'brain';

const TestComponent: React.FC<{ market: Market; category?: string }> = ({ market, category }) => {
  const { products, isLoading, error, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts(market, category);
  }, [market, category, fetchProducts]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Products for {market.name}</h1>
      <div data-testid="products">
        {products.map((product) => (
          <div key={product.id} data-testid={`product-${product.code}`}>
            {product.name}
          </div>
        ))}
      </div>
    </div>
  );
};

describe('ProductStore Integration', () => {
  const mockMarket: Market = {
    name: 'UK',
    id: 'uk-1',
    region: 'uk',
    countryCode: 'GB',
    currencyCode: 'GBP',
  };

  it('should render products when loaded', async () => {
    const mockProducts = [
      { id: '1', name: 'Test Product', code: 'TP1', attributes: { name: 'Test Product' } }
    ];
    
    (brain.get_commerce_layer_products as jest.Mock).mockResolvedValueOnce({
      products: mockProducts
    });

    render(<TestComponent market={mockMarket} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });
  });
});
