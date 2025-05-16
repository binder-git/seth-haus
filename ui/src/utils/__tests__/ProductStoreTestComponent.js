import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useProductStore } from '../product-store';
import brain from 'brain';
const TestComponent = ({ market, category }) => {
    const { products, isLoading, error, fetchProducts } = useProductStore();
    useEffect(() => {
        fetchProducts(market, category);
    }, [market, category, fetchProducts]);
    if (isLoading)
        return _jsx("div", { children: "Loading..." });
    if (error)
        return _jsxs("div", { children: ["Error: ", error] });
    return (_jsxs("div", { children: [_jsxs("h1", { children: ["Products for ", market.name] }), _jsx("div", { "data-testid": "products", children: products.map((product) => (_jsx("div", { "data-testid": `product-${product.code}`, children: product.name }, product.id))) })] }));
};
describe('ProductStore Integration', () => {
    const mockMarket = {
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
        brain.get_commerce_layer_products.mockResolvedValueOnce({
            products: mockProducts
        });
        render(_jsx(TestComponent, { market: mockMarket }));
        await waitFor(() => {
            expect(screen.getByText('Test Product')).toBeInTheDocument();
        });
    });
});
