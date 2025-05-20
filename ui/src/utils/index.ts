import { Market, Product, ProductPricing } from '@/types';

interface CommerceLayerSku {
  id: string;
  type: string;
  code: string;
  name: string;
  description?: string;
  image_url?: string;
  prices?: {
    amount_cents: number;
    currency_code: string;
    compare_at_amount_cents?: number;
  }[];
  images?: Array<{
    id: string;
    type: string;
    link: string;
  }>;
  reference?: string;
  reference_origin?: string;
  created_at: string;
  updated_at: string;
  attributes?: {
    category?: string;
    brand?: string;
    in_stock?: boolean;
  };
}

export function mapCommerceLayerSkuToProduct(sku: CommerceLayerSku, market: Market): Product | null {
  if (!sku) return null;

  // Get the first price available (we'll filter by market in the API call)
  const priceInfo = sku.prices?.[0];
  
  // Get the first image URL if available
  const imageUrl = sku.images?.[0]?.link || sku.image_url || '';
  
  // Create pricing object
  const pricing: ProductPricing = {
    price: priceInfo ? priceInfo.amount_cents / 100 : 0,
    currency: priceInfo?.currency_code || 'USD',
    symbol: priceInfo?.currency_code === 'EUR' ? '€' : '£',
    formatted: priceInfo 
      ? `${priceInfo.amount_cents / 100} ${priceInfo.currency_code}`
      : '0.00 USD'
  };

  return {
    id: sku.id,
    code: sku.code,
    name: sku.name,
    description: sku.description || '',
    price: pricing.price,
    currency: pricing.currency,
    imageUrl,
    image_url: imageUrl, // For backward compatibility
    category: sku.attributes?.category as any || 'uncategorized',
    brand: sku.attributes?.brand as any || '',
    sku: sku.code,
    inStock: sku.attributes?.in_stock ?? true,
    pricing,
    // Add default values for required fields
    images: [imageUrl],
    longDescription: sku.description || '',
    specifications: {},
    variants: []
  };
}
