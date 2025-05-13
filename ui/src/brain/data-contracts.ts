/** CLCoreConfigResponse */
export interface CLCoreConfigResponse {
  /** Clientid */
  clientId: string;
  /** Baseurl */
  baseUrl: string;
  /** Marketidmap */
  marketIdMap: Record<string, string>;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HealthResponse */
export interface HealthResponse {
  /** Status */
  status: string;
}

/** ProductAttribute */
export interface ProductAttribute {
  /** Name */
  name: string;
  /** Value */
  value: string;
}

/** ProductDetailResponse */
export interface ProductDetailResponse {
  /** Id */
  id: string;
  /** Sku */
  sku: string;
  /** Name */
  name: string;
  /** Description */
  description?: string | null;
  price?: ProductPrice | null;
  /**
   * Images
   * @default []
   */
  images?: ProductImage[];
  /**
   * Available
   * @default true
   */
  available?: boolean;
}

/** ProductImage */
export interface ProductImage {
  /** Url */
  url: string;
  /** Alt */
  alt?: string | null;
}

/** ProductPrice */
export interface ProductPrice {
  /** Amount Cents */
  amount_cents: number;
  /** Amount Float */
  amount_float: number;
  /** Formatted */
  formatted: string;
  /** Currency Code */
  currency_code: string;
}

/** ProductResponse */
export interface ProductResponse {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Code */
  code: string;
  /** Description */
  description?: string | null;
  /** Image Url */
  image_url?: string | null;
  price?: ProductPrice | null;
  /**
   * Images
   * @default []
   */
  images?: ProductImage[];
  /**
   * Attributes
   * @default []
   */
  attributes?: ProductAttribute[];
  /** Category */
  category?: string | null;
  /**
   * Available
   * @default true
   */
  available?: boolean;
}

/** ProductsResponse */
export interface ProductsResponse {
  /** Products */
  products: ProductResponse[];
}

/** TokenRequest */
export interface TokenRequest {
  /** Market Id */
  market_id: string;
}

/** TokenResponse */
export interface TokenResponse {
  /** Access Token */
  access_token: string;
  /** Token Type */
  token_type: string;
  /** Expires In */
  expires_in: number;
  /** Scope */
  scope: string;
  /** Endpoint */
  endpoint: string;
  /** Organization */
  organization: string;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

/** CartOrder */
export interface CartOrder {
  /** Id */
  id: string;
  /**
   * Type
   * @default "orders"
   */
  type?: string;
  attributes: CartOrderAttributes;
  /** Relationships */
  relationships?: Record<string, any> | null;
}

/** CartOrderAttributes */
export interface CartOrderAttributes {
  /** Formatted Subtotal Amount */
  formatted_subtotal_amount: string;
  /** Formatted Discount Amount */
  formatted_discount_amount: string;
  /** Formatted Shipping Amount */
  formatted_shipping_amount: string;
  /** Formatted Total Tax Amount */
  formatted_total_tax_amount: string;
  /** Formatted Gift Card Amount */
  formatted_gift_card_amount: string;
  /** Formatted Total Amount With Taxes */
  formatted_total_amount_with_taxes: string;
}

/** CartResponse */
export interface CartResponse {
  order: CartOrder;
  /**
   * Line Items
   * @default []
   */
  line_items?: LineItem[];
}

/** CheckoutConfigResponse */
export interface CheckoutConfigResponse {
  /** Accesstoken */
  accessToken: string;
  /** Clendpoint */
  clEndpoint: string;
}

/** LineItem */
export interface LineItem {
  /** Id */
  id: string;
  /**
   * Type
   * @default "line_items"
   */
  type?: string;
  attributes: LineItemAttributes;
}

/** LineItemAttributes */
export interface LineItemAttributes {
  /** Sku Code */
  sku_code: string;
  /** Quantity */
  quantity: number;
  /** Name */
  name: string;
  /** Image Url */
  image_url?: string | null;
  /** Formatted Amount */
  formatted_amount: string;
}

/** UpdateItemRequest */
export interface UpdateItemRequest {
  /** Quantity */
  quantity: number;
}

export type CheckHealthData = HealthResponse;

export type GetClAccessToken2Data = TokenResponse;

export type GetClAccessToken2Error = HTTPValidationError;

export interface GetCommerceLayerProductsParams {
  /**
   * Market
   * The market (UK or EU)
   */
  market: string;
  /**
   * Category
   * The product category to filter by
   */
  category?: string | null;
}

export type GetCommerceLayerProductsData = ProductsResponse;

export type GetCommerceLayerProductsError = HTTPValidationError;

export interface GetFeaturedProductsParams {
  /**
   * Market
   * Specify the market (UK or EU)
   */
  market: string;
}

/** Response Get Featured Products */
export type GetFeaturedProductsData = ProductResponse[];

export type GetFeaturedProductsError = HTTPValidationError;

export interface GetProductDetailsParams {
  /**
   * Market
   * The market (UK or EU)
   */
  market: string;
  /**
   * Sku Code
   * The SKU code of the product
   */
  skuCode: string;
}

export type GetProductDetailsData = ProductDetailResponse;

export type GetProductDetailsError = HTTPValidationError;

export type GetCoreClConfigData = CLCoreConfigResponse;

/** Response Commerce Layer Health Check */
export type CommerceLayerHealthCheckData = Record<string, any>;
