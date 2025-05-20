// netlify/functions/src/index.ts
import featuredProducts from './featured-products.js';
import commerceLayerAuth from './commerce-layer-auth.js';
import test from './test.js';

// Export handlers with their paths
export default {
  'featured-products': featuredProducts,
  'commerce-layer-auth': commerceLayerAuth,
  'test': test
};