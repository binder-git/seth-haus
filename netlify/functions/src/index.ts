// Re-export all functions for Netlify
import { handler as featuredProducts } from './featured-products';
import { handler as commerceLayerAuth } from './commerce-layer-auth';

export { featuredProducts, commerceLayerAuth };
