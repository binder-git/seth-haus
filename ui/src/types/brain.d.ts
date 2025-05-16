declare module 'brain' {
  import { Market } from '@/types';
  import { ProductResponse } from '../brain/data-contracts';

  export interface Brain {
    get_commerce_layer_products: (params: {
      market: string;
      category?: string | null;
    }) => Promise<{ products: ProductResponse[] } | { data: { products: ProductResponse[] } }>;
    
    get_product_details: (params: {
      market: string;
      productId: string;
    }) => Promise<{ product: ProductResponse }>;
    
    get_featured_products: (params: {
      market: string;
    }) => Promise<{ products: ProductResponse[] }>;
  }

  const brain: Brain;
  export default brain;
}
