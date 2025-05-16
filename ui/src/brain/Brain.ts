import {
  CheckHealthData,
  CommerceLayerHealthCheckData,
  GetClAccessToken2Data,
  GetClAccessToken2Error,
  GetCommerceLayerProductsData,
  GetCommerceLayerProductsError,
  GetCommerceLayerProductsParams,
  GetCoreClConfigData,
  GetFeaturedProductsData,
  GetFeaturedProductsError,
  GetFeaturedProductsParams,
  GetProductDetailsData,
  GetProductDetailsError,
  GetProductDetailsParams,
  TokenRequest,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

import { API } from '@/config';

export class Brain<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  constructor(config?: { baseUrl?: string; baseApiParams?: RequestParams }) {
    super({
      baseUrl: config?.baseUrl || API.baseUrl,
      baseApiParams: { ...config?.baseApiParams, secure: true }
    });
  }
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   *
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  check_health = (params: RequestParams = {}) =>
    this.request<CheckHealthData, any>({
      path: `/_healthz`,
      method: "GET",
      ...params,
    });

  /**
   * @description Endpoint to securely fetch a Commerce Layer access token scoped to a specific market ID. Requires the Market ID (e.g., 'xYZ123AbCd') in the request body.
   *
   * @tags dbtn/module:commerce_layer_auth
   * @name get_cl_access_token2
   * @summary Get Cl Access Token2
   * @request POST:/routes/auth/cl-access-token2
   */
  get_cl_access_token2 = (data: TokenRequest, params: RequestParams = {}) =>
    this.request<GetClAccessToken2Data, GetClAccessToken2Error>({
      path: `/routes/auth/cl-access-token2`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get products from Commerce Layer based on market and category.
   *
   * @tags dbtn/module:commerce_layer
   * @name get_commerce_layer_products
   * @summary Get Commerce Layer Products
   * @request GET:/routes/commerce-layer/products
   */
  get_commerce_layer_products = (query: GetCommerceLayerProductsParams, params: RequestParams = {}) =>
    this.request<GetCommerceLayerProductsData, GetCommerceLayerProductsError>({
      path: `/routes/commerce-layer/products`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Fetches details for 3 random products from the specified market's SKU list.
   *
   * @tags dbtn/module:commerce_layer
   * @name get_featured_products
   * @summary Get Featured Products
   * @request GET:/.netlify/functions/featured-products
   */
  get_featured_products = async (query: GetFeaturedProductsParams, params: RequestParams = {}) => {
    const response = await fetch(
      `/.netlify/functions/featured-products?market=${query.market}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch featured products');
    }

    return response.json();
  };

  /**
   * @description Fetches detailed information for a single product SKU using a single API call.
   *
   * @tags dbtn/module:commerce_layer
   * @name get_product_details
   * @summary Get Product Details
   * @request GET:/routes/commerce-layer/products/{sku_code}
   */
  get_product_details = ({ skuCode, ...query }: GetProductDetailsParams, params: RequestParams = {}) =>
    this.request<GetProductDetailsData, GetProductDetailsError>({
      path: `/routes/commerce-layer/products/${skuCode}`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Provides core configuration: client ID, base API URL, and market ID mapping.
   *
   * @tags dbtn/module:commerce_layer
   * @name get_core_cl_config
   * @summary Get Core Cl Config
   * @request GET:/routes/commerce-layer/config
   */
  get_core_cl_config = (params: RequestParams = {}) =>
    this.request<GetCoreClConfigData, any>({
      path: `/routes/commerce-layer/config`,
      method: "GET",
      ...params,
    });

  /**
   * @description Check if essential Commerce Layer secrets are configured and attempts a token fetch for 'UK' market.
   *
   * @tags dbtn/module:commerce_layer
   * @name commerce_layer_health_check
   * @summary Commerce Layer Health Check
   * @request GET:/routes/commerce-layer/health
   */
  commerce_layer_health_check = (params: RequestParams = {}) =>
    this.request<CommerceLayerHealthCheckData, any>({
      path: `/.netlify/functions/health`,
      method: "GET",
      ...params,
    });
}
