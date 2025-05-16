import { GetCommerceLayerProductsParams } from "./data-contracts";
import { RequestParams } from "./http-client";
/**
 * A lightweight version of the Brain service that points to Netlify Functions
 */
export declare class NetlifyBrain {
    private baseUrl;
    private baseApiParams;
    constructor();
    /**
     * Get products from Commerce Layer via Netlify Function
     */
    get_commerce_layer_products(query: GetCommerceLayerProductsParams & {
        page?: number;
        perPage?: number;
    }, params?: RequestParams): Promise<{
        data: {
            products: any;
            meta: any;
        };
    }>;
    check_health(): Promise<{
        data: {
            status: string;
        };
    }>;
    get_cl_access_token2(): Promise<never>;
    get_featured_products(params: {
        market: string;
    }): Promise<{
        data: {
            products: any;
            meta: {
                total: any;
                page: number;
                per_page: any;
                total_pages: number;
            };
        };
    }>;
    get_product_details(): Promise<never>;
}
export declare const netlifyBrain: NetlifyBrain;
