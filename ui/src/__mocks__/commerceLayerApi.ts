// Manual mock for commerceLayerApi
const mockCommerceLayerApi = {
  setMarket: jest.fn(),
  getFeaturedProducts: jest.fn().mockResolvedValue({
    products: []
  }),
  // Add other methods as needed
};

export { mockCommerceLayerApi as commerceLayerApi };

export default mockCommerceLayerApi;
