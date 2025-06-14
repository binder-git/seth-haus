// Re-export all types from data contracts
export * from './api/data-contracts';

// Export market types
export type {
  Market,
  MarketConfig,
  MarketName,
  MarketRegion,
  Markets
} from './models/market';

// Export product types
export type {
  Product,
  ProductResponse,
  ProductDetailResponse,
  ProductVariant,
  Category,
  ProductBrand,
  ProductPricing
} from './models/product';

export {
  validateCategory,
  validateBrand
} from './models/product';

// Export shipping types
export * from './models/shipping';
