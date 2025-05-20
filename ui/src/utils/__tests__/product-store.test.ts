import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { act } from '@testing-library/react';
import type { Market, MarketName, MarketRegion } from '@/types/models';
import type { Category } from '@/types/models/product';

// Mock the commerceLayerApi module
const mockSetMarket = jest.fn();
const mockGetFeaturedProducts = jest.fn();

// Mock the sonner toast
const mockToastError = jest.fn();

// Mock the modules
jest.mock('@/api/commerceLayerApi', () => ({
  commerceLayerApi: {
    setMarket: mockSetMarket,
    getFeaturedProducts: mockGetFeaturedProducts
  }
}));

// Mock the sonner toast module
const mockToast = {
  error: mockToastError
};

jest.mock('sonner', () => ({
  toast: mockToast
}));

// Import the actual store after setting up mocks
import { useProductStore } from '../product-store';

describe('Product Store', () => {
  // Create a mock market with required properties
  const createMockMarket = (overrides: Partial<Market> = {}): Market => ({
    id: 'market-1',
    name: 'UK' as MarketName,
    region: 'uk' as MarketRegion,
    countryCode: 'GB',
    currencyCode: 'GBP',
    scope: 'market:id:test-market',
    skuListId: 'test-sku-list',
    ...overrides,
  });

  // Sample market for testing
  const mockMarket = createMockMarket();

  // Sample product for testing
  const mockProduct = {
    id: 'prod-1',
    type: 'products',
    attributes: {
      name: 'Test Product',
      description: 'A test product',
      price: '19.99',
      currency: 'USD',
      image_url: 'https://example.com/image.jpg',
      category: 'test'
    }
  };

  // Helper function to mock successful API response
  const mockSuccessfulResponse = (products: any[] = []) => {
    (mockGetFeaturedProducts as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({ products })
    );
  };

  // Helper function to mock failed API response
  const mockFailedResponse = (error: Error) => {
    (mockGetFeaturedProducts as jest.Mock).mockImplementationOnce(() => 
      Promise.reject(error)
    );
  };

  beforeEach(() => {
    // Reset the store before each test
    useProductStore.setState({
      products: [],
      isLoading: false,
      error: null,
    });
    
    // Clear all mocks
    jest.clearAllMocks();
    
    // Setup default mock implementation
    (mockGetFeaturedProducts as jest.Mock).mockImplementation(() => 
      Promise.resolve({ products: [] })
    );
    (mockSetMarket as jest.Mock).mockImplementation(() => 
      Promise.resolve(undefined)
    );
    mockToastError.mockClear();
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('fetchProducts', () => {
    it('should set loading state when fetching products', async () => {
      // Arrange
      mockSuccessfulResponse();
      
      // Act
      const promise = useProductStore.getState().fetchProducts(mockMarket);
      
      // Assert
      expect(useProductStore.getState().isLoading).toBe(true);
      
      // Wait for the promise to resolve
      await act(async () => {
        await promise;
      });
      
      expect(useProductStore.getState().isLoading).toBe(false);
    });

    it('should fetch products for a market', async () => {
      // Arrange
      mockSuccessfulResponse([mockProduct]);

      // Act
      await act(async () => {
        await useProductStore.getState().fetchProducts(mockMarket);
      });

      // Assert
      const state = useProductStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.products).toEqual([mockProduct]);
      expect(mockSetMarket).toHaveBeenCalledWith(mockMarket.id);
      expect(mockGetFeaturedProducts).toHaveBeenCalled();
    });

    it('should handle error during product fetch', async () => {
      // Arrange
      const errorMessage = 'Failed to fetch products';
      const error = new Error(errorMessage);
      mockFailedResponse(error);

      // Mock console.error to avoid test output pollution
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Act
      await act(async () => {
        await useProductStore.getState().fetchProducts(mockMarket);
      });

      // Assert
      const state = useProductStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.products).toEqual([]);
      expect(state.error).toBe(errorMessage);
      expect(mockToastError).toHaveBeenCalledWith('Failed to fetch products');

      // Cleanup
      consoleErrorSpy.mockRestore();
    });

    it('should handle empty products array', async () => {
      // Arrange
      mockSuccessfulResponse([]);

      // Act
      await act(async () => {
        await useProductStore.getState().fetchProducts(mockMarket);
      });

      // Assert
      const state = useProductStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.products).toEqual([]);
    });

    it('should handle unexpected response format', async () => {
      // Arrange - Mock an unexpected response format
      (mockGetFeaturedProducts as jest.Mock).mockImplementationOnce(() => 
        Promise.resolve({ data: [] })
      );
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Act
      await act(async () => {
        await useProductStore.getState().fetchProducts(mockMarket);
      });

      // Assert
      const state = useProductStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.products).toEqual([]);
      expect(state.error).toBe('Unexpected response format from server');
      expect(mockToastError).toHaveBeenCalledWith('Failed to fetch products: Unexpected response format');

      // Cleanup
      consoleErrorSpy.mockRestore();
    });

    it('should call getFeaturedProducts without category', async () => {
      // Arrange
      const category = 'bike' as Category;
      mockSuccessfulResponse();

      // Act
      await act(async () => {
        await useProductStore.getState().fetchProducts(mockMarket, category);
      });

      // Assert
      expect(mockSetMarket).toHaveBeenCalledWith(mockMarket.id);
      expect(mockGetFeaturedProducts).toHaveBeenCalled();
      
      // Verify getFeaturedProducts was called with no arguments
      const callArgs = (mockGetFeaturedProducts as jest.Mock).mock.calls[0];
      expect(callArgs).toHaveLength(0);
    });
  });
});
