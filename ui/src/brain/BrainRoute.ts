import {
  CheckHealthData,
  CommerceLayerHealthCheckData,
  GetClAccessToken2Data,
  GetCommerceLayerProductsData,
  GetCoreClConfigData,
  GetFeaturedProductsData,
  GetProductDetailsData,
  TokenRequest,
} from "./data-contracts";

export namespace Brain {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  export namespace check_health {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckHealthData;
  }

  /**
   * @description Endpoint to securely fetch a Commerce Layer access token scoped to a specific market ID. Requires the Market ID (e.g., 'xYZ123AbCd') in the request body.
   * @tags dbtn/module:commerce_layer_auth
   * @name get_cl_access_token2
   * @summary Get Cl Access Token2
   * @request POST:/routes/auth/cl-access-token2
   */
  export namespace get_cl_access_token2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = TokenRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GetClAccessToken2Data;
  }

  /**
   * @description Get products from Commerce Layer based on market and category.
   * @tags dbtn/module:commerce_layer
   * @name get_commerce_layer_products
   * @summary Get Commerce Layer Products
   * @request GET:/routes/commerce-layer/products
   */
  export namespace get_commerce_layer_products {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetCommerceLayerProductsData;
  }

  /**
   * @description Fetches details for 3 random products from the specified market's SKU list.
   * @tags dbtn/module:commerce_layer
   * @name get_featured_products
   * @summary Get Featured Products
   * @request GET:/.netlify/functions/featured-products
   */
  export namespace get_featured_products {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Market
       * Specify the market (UK or EU)
       */
      market: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetFeaturedProductsData;
  }

  /**
   * @description Fetches detailed information for a single product SKU using a single API call.
   * @tags dbtn/module:commerce_layer
   * @name get_product_details
   * @summary Get Product Details
   * @request GET:/routes/commerce-layer/products/{sku_code}
   */
  export namespace get_product_details {
    export type RequestParams = {
      /**
       * Sku Code
       * The SKU code of the product
       */
      skuCode: string;
    };
    export type RequestQuery = {
      /**
       * Market
       * The market (UK or EU)
       */
      market: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetProductDetailsData;
  }

  /**
   * @description Provides core configuration: client ID, base API URL, and market ID mapping.
   * @tags dbtn/module:commerce_layer
   * @name get_core_cl_config
   * @summary Get Core Cl Config
   * @request GET:/routes/commerce-layer/config
   */
  export namespace get_core_cl_config {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetCoreClConfigData;
  }

  /**
   * @description Check if essential Commerce Layer secrets are configured and attempts a token fetch for 'UK' market.
   * @tags dbtn/module:commerce_layer
   * @name commerce_layer_health_check
   * @summary Commerce Layer Health Check
   * @request GET:/routes/commerce-layer/health
   */
  export namespace commerce_layer_health_check {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CommerceLayerHealthCheckData;
  }
}
