import json
import os

def handler(event, context):
    # In Netlify, environment variables are set in the Netlify UI
    # and accessed via os.environ.get().
    # These correspond to the secrets you had in Databutton.
    
    # Fetch values from environment variables (these will be set in Netlify's UI)
    cl_client_id = os.environ.get("COMMERCE_LAYER_CLIENT_ID")
    cl_endpoint = os.environ.get("COMMERCE_LAYER_ENDPOINT")
    cl_slug = os.environ.get("COMMERCE_LAYER_ORGANIZATION_SLUG")
    cl_eu_market_id = os.environ.get("COMMERCE_LAYER_EU_SKU_LIST_ID") # Assuming SKU List ID is Market ID
    cl_uk_market_id = os.environ.get("COMMERCE_LAYER_UK_SKU_LIST_ID") # Assuming SKU List ID is Market ID

    config_data = {
        "clientId": cl_client_id,
        "endpoint": cl_endpoint,
        "slug": cl_slug,
        "euMarketId": cl_eu_market_id,
        "ukMarketId": cl_uk_market_id,
        # Add any other static config values this endpoint used to provide
    }

    # Ensure all expected config values are present; otherwise, it's an internal error.
    # You might want more robust error handling or logging here in a real scenario.
    if not all([cl_client_id, cl_endpoint, cl_slug, cl_eu_market_id, cl_uk_market_id]):
        error_message = "Server configuration error: Missing one or more Commerce Layer environment variables."
        print(f"[ERROR] get_core_cl_config: {error_message}") # Logs to Netlify Function logs
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": error_message, "detail": "Internal Server Error"})
        }

    print(f"[INFO] get_core_cl_config: Successfully retrieved CL config data.") # Optional logging

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            # CORS headers might be needed if you were calling this directly from a
            # browser on a different domain than the function URL itself without a proxy.
            # Since we use Netlify's proxy (rewrite from /api/*), these might not be strictly
            # necessary for same-origin calls, but good to be aware of.
            # "Access-Control-Allow-Origin": "*", # Or your specific frontend domain
            # "Access-Control-Allow-Headers": "Content-Type",
            # "Access-Control-Allow-Methods": "GET, OPTIONS"
        },
        "body": json.dumps(config_data)
    }
