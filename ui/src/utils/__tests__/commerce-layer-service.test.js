import { getCommerceLayerProducts, extractCategories, extractProductAttributes, getProductAttribute, clearProductCache, productCache } from '../commerce-layer-service';
// Mock the Brain module to return a mock implementation
const mockBrainInstance = {
    get_commerce_layer_products: jest.fn(),
};
jest.mock('../../brain/Brain', () => {
    return {
        __esModule: true,
        Brain: jest.fn(() => mockBrainInstance)
    };
});
describe('Commerce Layer Service', () => {
    const mockProducts = [
        {
            code: 'WETSUIT-001',
            id: '1',
            name: 'Triathlon Wetsuit',
            category: 'Swimwear',
            attributes: [
                { name: 'Brand', value: 'Zone3' },
                { name: 'Color', value: 'Black' },
                { name: 'Size', value: 'M' }
            ],
            price: {
                amount_cents: 29999,
                amount_float: 299.99,
                formatted: '€299.99',
                currency_code: 'EUR'
            },
            description: 'High-performance triathlon wetsuit',
            available: true
        },
        {
            code: 'JERSEY-001',
            id: '2',
            name: 'Cycling Jersey',
            category: 'Cycling',
            attributes: [
                { name: 'Brand', value: 'Castelli' },
                { name: 'Color', value: 'Blue' },
                { name: 'Size', value: 'L' }
            ],
            price: {
                amount_cents: 12999,
                amount_float: 129.99,
                formatted: '€129.99',
                currency_code: 'EUR'
            },
            description: 'Professional cycling jersey',
            available: true
        }
    ];
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });
    describe('getCommerceLayerProducts', () => {
        it('should fetch products from Commerce Layer API', async () => {
            // Mock successful Commerce Layer API response
            mockBrainInstance.get_commerce_layer_products.mockResolvedValue({
                data: { products: mockProducts }
            });
            const products = await getCommerceLayerProducts({ name: 'EU', region: 'eu', id: 'eu-market', countryCode: 'EU', currencyCode: 'EUR' });
            expect(products).toEqual(mockProducts);
            expect(mockBrainInstance.get_commerce_layer_products).toHaveBeenCalledWith({ market: 'EU' });
        });
        it('should return empty array if API fails', async () => {
            // Simulate Commerce Layer API failure
            mockBrainInstance.get_commerce_layer_products.mockRejectedValue(new Error('API Error'));
            const products = await getCommerceLayerProducts({ name: 'UK', region: 'uk', id: 'uk-market', countryCode: 'GB', currencyCode: 'GBP' });
            expect(products).toEqual([]);
        });
    });
    describe('clearProductCache', () => {
        beforeEach(() => {
            // Reset cache before each test
            Object.keys(productCache || {}).forEach(key => delete productCache[key]);
        });
        it('should clear cache for a specific market', async () => {
            // First, populate the cache
            mockBrainInstance.get_commerce_layer_products.mockResolvedValue({
                data: { products: mockProducts }
            });
            await getCommerceLayerProducts({ name: 'EU', region: 'eu', id: 'eu-market', countryCode: 'EU', currencyCode: 'EUR' });
            expect(productCache['EU']).toEqual(mockProducts);
            // Clear cache for specific market
            clearProductCache({ name: 'EU', region: 'eu', id: 'eu-market', countryCode: 'EU', currencyCode: 'EUR' });
            expect(productCache['EU']).toBeUndefined();
        });
        it('should clear entire cache when no market specified', async () => {
            // Populate cache for multiple markets
            mockBrainInstance.get_commerce_layer_products.mockResolvedValue({
                data: { products: mockProducts }
            });
            await getCommerceLayerProducts({ name: 'EU', region: 'eu', id: 'eu-market', countryCode: 'EU', currencyCode: 'EUR' });
            await getCommerceLayerProducts({ name: 'UK', region: 'uk', id: 'uk-market', countryCode: 'GB', currencyCode: 'GBP' });
            expect(productCache['EU']).toEqual(mockProducts);
            expect(productCache['UK']).toEqual(mockProducts);
            // Clear entire cache
            clearProductCache();
            // Clear entire cache
            clearProductCache();
            expect(Object.keys(productCache).length).toBe(0);
        });
    });
    describe('Product Attribute Utilities', () => {
        it('should extract categories from products', () => {
            const categories = extractCategories(mockProducts);
            expect(categories).toEqual(['Swimwear', 'Cycling']);
        });
        it('should extract specific product attributes', () => {
            const brands = extractProductAttributes(mockProducts, 'Brand');
            const colors = extractProductAttributes(mockProducts, 'Color');
            expect(brands).toEqual(['Zone3', 'Castelli']);
            expect(colors).toEqual(['Black', 'Blue']);
        });
        it('should get specific product attribute', () => {
            const product = mockProducts[0];
            const brand = getProductAttribute(product, 'Brand');
            const color = getProductAttribute(product, 'Color');
            const nonexistentAttr = getProductAttribute(product, 'Material');
            expect(brand).toBe('Zone3');
            expect(color).toBe('Black');
            expect(nonexistentAttr).toBeUndefined();
        });
    });
});
