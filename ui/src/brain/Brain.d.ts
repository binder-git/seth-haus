import { CommerceLayerHealthCheckData, GetCommerceLayerProductsParams, GetFeaturedProductsParams, GetProductDetailsParams, TokenRequest } from './data-contracts';
import { HttpClient, RequestParams } from './http-client';
export declare class Brain<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
    constructor(config?: {
        baseUrl?: string;
        baseApiParams?: RequestParams;
    });
    /**
     * @description Check health of application. Returns 200 when OK, 500 when not.
     *
     * @name check_health
     * @summary Check Health
     * @request GET:/_healthz
     */
    check_health: (params?: RequestParams) => Promise<import("./http-client").HttpResponse<import("./data-contracts").HealthResponse, any>>;
    /**
     * @description Endpoint to securely fetch a Commerce Layer access token scoped to a specific market ID. Requires the Market ID (e.g., 'xYZ123AbCd') in the request body.
     *
     * @tags dbtn/module:commerce_layer_auth
     * @name get_cl_access_token2
     * @summary Get Cl Access Token2
     * @request POST:/routes/auth/cl-access-token2
     */
    get_cl_access_token2: (data: TokenRequest, params?: RequestParams) => Promise<import("./http-client").HttpResponse<import("./data-contracts").TokenResponse, import("./data-contracts").HTTPValidationError>>;
    /**
     * @description Get products from Commerce Layer based on market and category.
     *
     * @tags dbtn/module:commerce_layer
     * @name get_commerce_layer_products
     * @summary Get Commerce Layer Products
     * @request GET:/routes/commerce-layer/products
     */
    get_commerce_layer_products: (query: GetCommerceLayerProductsParams, params?: RequestParams) => Promise<import("./http-client").HttpResponse<import("./data-contracts").ProductsResponse, import("./data-contracts").HTTPValidationError>>;
    /**
     * @description Fetches details for 3 random products from the specified market's SKU list.
     *
     * @tags dbtn/module:commerce_layer
     * @name get_featured_products
     * @summary Get Featured Products
     * @request GET:/api/featured-products
     */
    get_featured_products: (query: GetFeaturedProductsParams, params?: RequestParams) => Promise<any>;
    /**
     * @description Fetches detailed information for a single product SKU using a single API call.
     *
     * @tags dbtn/module:commerce_layer
     * @name get_product_details
     * @summary Get Product Details
     * @request GET:/routes/commerce-layer/products/{sku_code}
     */
    get_product_details: ({ skuCode, ...query }: GetProductDetailsParams, params?: RequestParams) => Promise<import("./http-client").HttpResponse<import("./data-contracts").ProductDetailResponse, import("./data-contracts").HTTPValidationError>>;
    /**
     * @description Provides core configuration: client ID, base API URL, and market ID mapping.
     *
     * @tags dbtn/module:commerce_layer
     * @name get_core_cl_config
     * @summary Get Core Cl Config
     * @request GET:/routes/commerce-layer/config
     */
    get_core_cl_config: (params?: RequestParams) => Promise<import("./http-client").HttpResponse<import("./data-contracts").CLCoreConfigResponse, any>>;
    /**
     * @description Check if essential Commerce Layer secrets are configured and attempts a token fetch for 'UK' market.
     *
     * @tags dbtn/module:commerce_layer
     * @name commerce_layer_health_check
     * @summary Commerce Layer Health Check
     * @request GET:/routes/commerce-layer/health
     */
    commerce_layer_health_check: (params?: RequestParams) => Promise<import("./http-client").HttpResponse<CommerceLayerHealthCheckData, any>>;
}
