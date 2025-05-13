import os
import time
import json
import requests
import random # Added for random selection
from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Query, Path
import databutton as db

# Market ID mapping
market_id_map = {
    "UK": "vjzmJhvEDo",  # From CLConfigStore logs
    "EU": "qjANwhQrJg"   # From CLConfigStore logs
}

def get_cl_token(client_id: str, client_secret: str, endpoint: str, market_id: str) -> Dict[str, Any]:
    """Gets a Commerce Layer API token scoped to a specific market."""
    # Use the dedicated authentication endpoint, not the main API endpoint
    token_url = "https://auth.commercelayer.io/oauth/token" 
    payload = {
        "grant_type": "client_credentials",
        "client_id": client_id,
        "client_secret": client_secret,
        "scope": f"market:id:{market_id}", # Corrected scope format
    }
    try:
        response = requests.post(token_url, json=payload, timeout=10)
        response.raise_for_status()  # Raises HTTPError for bad responses (4XX or 5XX)
        token_data = response.json()
        print(f"Successfully obtained token for market {market_id}")
        return token_data
    except requests.exceptions.RequestException as e:
        print(f"Error obtaining Commerce Layer token for market {market_id}: {e}")
        # Raise a more specific exception to be caught by the endpoint handler
        raise HTTPException(status_code=503, detail=f"Failed to obtain Commerce Layer token: {e}") from e

router = APIRouter(prefix="/commerce-layer")

# Models
class CommerceLayerToken(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    scope: str
    created_at: int

class ProductPrice(BaseModel):
    amount_cents: int
    amount_float: float
    formatted: str
    currency_code: str

class ProductImage(BaseModel):
    url: str
    alt: Optional[str] = None

class ProductAttribute(BaseModel):
    name: str
    value: str

class ProductResponse(BaseModel):
    id: str
    name: str
    code: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    price: Optional[ProductPrice] = None
    images: List[ProductImage] = []
    attributes: List[ProductAttribute] = []
    category: Optional[str] = None
    available: bool = True

class ProductsResponse(BaseModel):
    products: List[ProductResponse]

# --- New Models for Product Detail ---
class ProductDetailResponse(BaseModel):
    id: str
    sku: str # Use 'sku' for consistency with request
    name: str
    description: Optional[str] = None
    price: Optional[ProductPrice] = None
    images: List[ProductImage] = []
    available: bool = True

class CLCoreConfigResponse(BaseModel):
    clientId: str # Added for Drop-in JS
    baseUrl: str
    marketIdMap: Dict[str, str]

# Cache for access tokens
token_cache: Dict[str, CommerceLayerToken] = {}

def get_token_for_market(market: str) -> str:
    """Gets an access token from Commerce Layer scoped to a specific market."""
    # Check if we have a valid token in cache
    if market in token_cache:
        token_data = token_cache[market]
        current_time = int(time.time())
        token_expiry = token_data.created_at + token_data.expires_in - 300
        if current_time < token_expiry:
            return token_data.access_token

    client_id = db.secrets.get("COMMERCE_LAYER_CLIENT_ID")
    client_secret = db.secrets.get("COMMERCE_LAYER_CLIENT_SECRET")
    endpoint = db.secrets.get("COMMERCE_LAYER_ENDPOINT")

    if not client_id or not client_secret or not endpoint:
        raise HTTPException(status_code=500, detail="Commerce Layer credentials not configured")

    # Get the appropriate Market ID for the scope
    market_id_for_scope = None
    if market == "UK":
        market_id_for_scope = "vjzmJhvEDo" # Hardcoded GB Market ID provided by user
    elif market == "EU":
        market_id_for_scope = "qjANwhQrJg" # Hardcoded EU Market ID provided by user
    else:
        raise HTTPException(status_code=400, detail=f"Invalid market: {market}")

    # *** FIXED CHECK HERE ***
    if not market_id_for_scope:
        # This case should technically not be reachable due to the check above,
        # but keep it for robustness. Message improved.
        raise HTTPException(status_code=500, detail=f"Internal error: Market ID for scope could not be determined for market {market}")

    auth_url = "https://auth.commercelayer.io/oauth/token"
    payload = {
        "grant_type": "client_credentials",
        "client_id": client_id,
        "client_secret": client_secret,
        "scope": f"market:id:{market_id_for_scope}" # Use market-specific scope
    }

    try:
        print(f"Requesting token for market {market} with scope: market:id:{market_id_for_scope}") # Log scope being used
        response = requests.post(auth_url, json=payload)
        response.raise_for_status()
        token_data = response.json()

        # Ensure 'created_at' exists, default if necessary (though CL usually provides it)
        if 'created_at' not in token_data:
            token_data['created_at'] = int(time.time())

        token_obj = CommerceLayerToken(**token_data) # Simplified Pydantic parsing
        token_cache[market] = token_obj
        print(f"Successfully obtained token for market {market}, scope: {token_obj.scope}") # Log success

        return token_obj.access_token
    except requests.exceptions.RequestException as e:
        print(f"Error authenticating with Commerce Layer: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
             print(f"Commerce Layer Auth Error Status: {e.response.status_code}")
             print(f"Commerce Layer Auth Error Response: {e.response.text}")
        raise HTTPException(status_code=500, detail="Failed to authenticate with Commerce Layer") from e

# Pass market_request down to potentially use category later if needed, but filtering happens after
# Pass market_request down to potentially use category later if needed, but filtering happens after
# Corrected SYNCHRONOUS get_products_for_market function v4
def get_products_for_market(market: str, category_filter: str | None = None) -> List[ProductResponse]:
    """
    Fetches SKUs from a specific market's SKU list in Commerce Layer,
    extracts relevant product information (assuming category/brand are in SKU metadata),
    and filters them by category if provided.
    """
    print(f"[MYA-34 LOG] Received request for market: {market}, category: {category_filter}")
    endpoint = db.secrets.get("COMMERCE_LAYER_ENDPOINT")
    if not endpoint:
        raise HTTPException(status_code=500, detail="Commerce Layer endpoint is not configured.")

    token = get_token_for_market(market)
    if not token:
        raise HTTPException(status_code=500, detail=f"Could not retrieve token for market {market}.")

    headers = {
        "Accept": "application/vnd.api+json",
        "Authorization": f"Bearer {token}",
    }

    sku_list_id = None
    if market == "UK":
        sku_list_id = db.secrets.get("COMMERCE_LAYER_UK_SKU_LIST_ID")
    elif market == "EU":
        sku_list_id = db.secrets.get("COMMERCE_LAYER_EU_SKU_LIST_ID")
    
    if not sku_list_id:
        print(f"[MYA-34 LOG ERROR] Could not find SKU List ID for market: {market}. Check COMMERCE_LAYER_UK_SKU_LIST_ID and COMMERCE_LAYER_EU_SKU_LIST_ID secrets.")
        raise HTTPException(status_code=400, detail=f"Invalid or unsupported market: {market}. No SKU list configured.")

    print(f"[MYA-34 LOG] Using SKU List ID: {sku_list_id} for market: {market}")
    print(f"[MYA-34 LOG] Making request to Commerce Layer: {endpoint}/api/skus with market-scoped token for market: {market} using SKU list: {sku_list_id}")

    params = {
        "page[size]": 25,
        "include": "prices,stock_items",
        "filter[q][sku_list_id_eq]": sku_list_id,
    }

    apply_category_filter = True
    if not category_filter:  # Catches None or empty string ""
        apply_category_filter = False
    elif isinstance(category_filter, str) and category_filter.lower() in ["all", "null"]:
        apply_category_filter = False

    if apply_category_filter:
        tag_filter_value = category_filter.lower()
        params["filter[q][tags_name_eq]"] = tag_filter_value
        print(f"[MYA-34 LOG] Applying Commerce Layer category filter: filter[q][tags_name_eq]={tag_filter_value}")
    else:
        print(f"[MYA-34 LOG] No category filter applied (category_filter was '{category_filter}'). Fetching all from SKU list.")

    # Fetch data from Commerce Layer
    try:
        response = requests.get(f"{endpoint}/api/skus", headers=headers, params=params)
        print(f"[MYA-34 LOG] Commerce Layer Response Status: {response.status_code} for SKU List ID: {sku_list_id}")
        response.raise_for_status()
        data = response.json()
        
        # Log raw data count from Commerce Layer
        raw_item_count = len(data.get("data", []))
        print(f"[MYA-34 LOG] Commerce Layer returned {raw_item_count} raw items (SKUs) for SKU List ID: {sku_list_id} and category: '{category_filter if category_filter else 'All'}'.")
        if raw_item_count == 0:
            print(f"[MYA-34 LOG WARNING] Commerce Layer returned 0 items. Check SKU List '{sku_list_id}' in Commerce Layer dashboard for market '{market}' and category filter '{category_filter}'. Ensure products exist and are active.")

    except requests.exceptions.RequestException as e:
        error_detail = f"Failed to fetch products from Commerce Layer: {e}"
        if e.response is not None:
            print(f"[MYA-34 LOG ERROR] Commerce Layer Error Response Status: {e.response.status_code}")
            try:
                 error_body = e.response.json()
                 print(f"[MYA-34 LOG ERROR] Commerce Layer Error Response Text: {json.dumps(error_body)}")
                 error_detail = f"Failed to fetch products from Commerce Layer: {json.dumps(error_body)}"
            except json.JSONDecodeError:
                 print(f"[MYA-34 LOG ERROR] Commerce Layer Error Response Text (non-JSON): {e.response.text}")
                 error_detail = f"Failed to fetch products from Commerce Layer: {e.response.text}"
        print(f"[MYA-34 LOG ERROR] HTTP Error fetching products from Commerce Layer: {e}")
        raise HTTPException(status_code=400, detail=error_detail) from e
    except Exception as e:
        print(f"[MYA-34 LOG ERROR] Unexpected error during Commerce Layer request: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred during the Commerce Layer request.") from e

    products = []
    try:
        included_data_map = { (inc.get("type"), inc.get("id")): inc for inc in data.get("included", []) }

        for item in data.get("data", []):
            if item.get("type") != "skus":
                continue

            sku_id = item.get("id")
            attributes = item.get("attributes", {})
            relationships = item.get("relationships", {})
            sku_code_for_log = attributes.get('code', 'N/A')

            print(f"[MYA-34 LOG] Processing SKU: {sku_code_for_log} (ID: {sku_id})")

            category = category_filter
            
            images = []
            if attributes.get("image_url"):
                images.append(ProductImage(url=attributes.get("image_url")))

            sku_metadata = attributes.get("metadata", {})
            product_attrs = [
                ProductAttribute(name=key, value=str(value))
                for key, value in sku_metadata.items()
                if key not in ["category", "brand"] and value is not None
            ]
            
            # Get price information
            price = None
            price_relationship_data = relationships.get("prices", {}).get("data", [])
            if price_relationship_data:
                price_id = price_relationship_data[0].get("id")
                price_inc = included_data_map.get(("prices", price_id))
                if price_inc:
                    price_attrs = price_inc.get("attributes", {})
                    print(f"[MYA-34 LOG] SKU: {sku_code_for_log} - Found price attributes: {price_attrs}")
                    price = ProductPrice(
                        amount_cents=price_attrs.get("amount_cents", 0),
                        amount_float=price_attrs.get("amount_float", 0.0),
                        formatted=price_attrs.get("formatted_amount", "N/A_FORMATTED"), # Default if missing
                        currency_code=price_attrs.get("currency_code", "")
                    )
                    if not price_attrs.get("formatted_amount"):
                        print(f"[MYA-34 LOG WARNING] SKU: {sku_code_for_log} - 'formatted_amount' is missing in price_attrs. Price will show as N/A_FORMATTED.")
                else:
                    print(f"[MYA-34 LOG WARNING] SKU: {sku_code_for_log} - Price relationship found (ID: {price_id}), but no corresponding 'price' item in 'included' data.")
            else:
                print(f"[MYA-34 LOG WARNING] SKU: {sku_code_for_log} - No price relationship data found in 'relationships.prices'.")

            total_quantity = 0
            stock_items_relationship = relationships.get("stock_items", {}).get("data", [])
            for stock_item_ref in stock_items_relationship:
                stock_item_id = stock_item_ref.get("id")
                stock_item_inc = included_data_map.get(("stock_items", stock_item_id))
                if stock_item_inc:
                    stock_item_attrs = stock_item_inc.get("attributes", {})
                    total_quantity += stock_item_attrs.get("quantity", 0)
            
            is_available = total_quantity > 0
            print(f"[MYA-34 LOG] SKU: {sku_code_for_log} - Stock Items Found={len(stock_items_relationship)}, Total Qty={total_quantity}, Available={is_available}")

            product = ProductResponse(
                id=sku_id,
                name=attributes.get("name", ""),
                code=attributes.get("code", ""),
                description=attributes.get("description", ""),
                image_url=attributes.get("image_url"),
                price=price,
                images=images,
                attributes=product_attrs,
                category=category,
                available=is_available
            )
            products.append(product)

    except Exception as e:
        print(f"[MYA-34 LOG ERROR] Unexpected error processing products for market {market}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred while processing products: {e}") from e
        
    print(f"[MYA-34 LOG] Processed {len(products)} products for market {market} with category filter '{category_filter}'. Returning to endpoint.")
    return products


@router.get("/products", response_model=ProductsResponse)
def get_commerce_layer_products(market: str = Query(..., description="The market (UK or EU)"), category: Optional[str] = Query(None, description="The product category to filter by")):
    """Get products from Commerce Layer based on market and category."""
    try:
        # Pass market and category_filter explicitly
        print(f"Endpoint called with market='{market}', category='{category}'")
        products = get_products_for_market(market, category)
        print(f"Endpoint returning {len(products)} products.")
        return ProductsResponse(products=products)
    except HTTPException as e:
        # Re-raise HTTPExceptions directly
        print(f"Endpoint re-raising HTTPException: {e.status_code} - {e.detail}")
        raise e
    except Exception as e:
        # Catch any other unexpected errors from get_products_for_market
        print(f"Error in get_commerce_layer_products endpoint: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {e}") from e


# --- Helper to get all SKU codes from a list ---
def _get_all_sku_codes_from_list(token: str, endpoint: str, sku_list_id: str) -> List[str]:
    """Fetches all SKU codes associated with a given Commerce Layer SKU List ID."""
    headers = {
        "Accept": "application/vnd.api+json",
        "Authorization": f"Bearer {token}",
    }
    # Assuming we don't need pagination for featured products list for now (limit 25)
    url = f"{endpoint}/api/sku_lists/{sku_list_id}/skus?page[size]=25&fields[skus]=code"
    print(f"Fetching SKU codes from list: {url}")
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        sku_codes = [
            item["attributes"]["code"]
            for item in data.get("data", [])
            if item.get("type") == "skus" and item.get("attributes", {}).get("code")
        ]
        # --- ADDED LOGGING ---
        if not sku_codes:
            print(f"[WARNING] _get_all_sku_codes_from_list: No SKU codes found in response for list {sku_list_id}. Raw response data: {data}")
        else:
             print(f"_get_all_sku_codes_from_list: Found {len(sku_codes)} SKU codes in list {sku_list_id}: {sku_codes}")
        # --- END LOGGING ---
        return sku_codes
    except requests.exceptions.RequestException as e:
        # Log error but don't necessarily stop the whole process, maybe return empty list?
        # For now, re-raise as HTTPException to signal failure clearly
        print(f"Error fetching SKU codes from list {sku_list_id}: {e}")
        handle_cl_error(e, "_get_all_sku_codes_from_list") # Use existing error handler
        return [] # Should not be reached if handle_cl_error raises
    except Exception as e:
        print(f"Unexpected error processing SKU codes from list {sku_list_id}: {e}")
        handle_unexpected_error(e, "_get_all_sku_codes_from_list") # Use existing error handler
        return [] # Should not be reached if handle_unexpected_error raises


# --- Endpoint for Featured Products ---
@router.get("/featured-products", response_model=List[ProductResponse])
def get_featured_products(market: str = Query(..., description="Specify the market (UK or EU)")) -> List[ProductResponse]:
    """Fetches details for 3 random products from the specified market's SKU list."""
    print(f"Starting get_featured_products for market: {market}")
    endpoint = db.secrets.get("COMMERCE_LAYER_ENDPOINT")
    if not endpoint:
        raise HTTPException(status_code=500, detail="Commerce Layer endpoint is not configured.")

    # 1. Get token
    try:
        token = get_token_for_market(market)
    except HTTPException as e:
        print(f"Failed to get token in get_featured_products: {e.detail}")
        raise e # Re-raise

    # 2. Get SKU List ID
    sku_list_id = None
    if market.upper() == "UK":
        sku_list_id = db.secrets.get("COMMERCE_LAYER_UK_SKU_LIST_ID")
    elif market.upper() == "EU":
        sku_list_id = db.secrets.get("COMMERCE_LAYER_EU_SKU_LIST_ID")
    
    if not sku_list_id:
        raise HTTPException(status_code=400, detail=f"SKU list ID not configured for market: {market}")

    # 3. Get all SKU codes from the list
    print(f"get_featured_products: Attempting to fetch all SKU codes for list {sku_list_id}")
    all_sku_codes = _get_all_sku_codes_from_list(token, endpoint, sku_list_id)
    if not all_sku_codes:
        print(f"get_featured_products: No SKU codes found for list {sku_list_id}. Returning empty featured products.")
        return []
    print(f"get_featured_products: Found {len(all_sku_codes)} total SKU codes.")

    # 4. Select random codes (max 3)
    num_to_select = min(len(all_sku_codes), 3)
    selected_codes = random.sample(all_sku_codes, num_to_select)
    print(f"get_featured_products: Randomly selected {num_to_select} SKU codes: {selected_codes}")

    # 5. Fetch details for selected codes
    headers = {
        "Accept": "application/vnd.api+json",
        "Authorization": f"Bearer {token}",
    }
    params = {
        "page[size]": num_to_select,
        "include": "prices,stock_items",
        "filter[q][code_in]": ",".join(selected_codes),
        "filter[q][sku_list_id_eq]": sku_list_id, # Ensure they are still in the list
    }
    
    try:
        url = f"{endpoint}/api/skus"
        print(f"get_featured_products: Fetching details for selected SKUs: {url} with params: {params}") # Log URL and params
        response = requests.get(url, headers=headers, params=params, timeout=15)
        print(f"get_featured_products: CL API response status for details: {response.status_code}") # Log status code
        response.raise_for_status()
        data = response.json()
        # --- ADDED LOGGING ---
        if not data.get("data"):
            print(f"[WARNING] get_featured_products: CL API returned no data for selected SKUs {selected_codes}. Raw response: {data}")
        else:
            print(f"get_featured_products: CL API returned {len(data.get('data',[]))} items for selected SKUs.")
        # --- END LOGGING --- 

    except requests.exceptions.RequestException as e:
        print(f"Error fetching details for selected SKUs: {e}")
        handle_cl_error(e, "get_featured_products_details")
        return [] # Should not be reached
    except Exception as e:
        print(f"Unexpected error fetching details for selected SKUs: {e}")
        handle_unexpected_error(e, "get_featured_products_details")
        return [] # Should not be reached

    # 6. Process response (reuse logic similar to get_products_for_market)
    products = []
    try:
        included_data_map = { (inc.get("type"), inc.get("id")): inc for inc in data.get("included", []) }

        for item in data.get("data", []):
            if item.get("type") != "skus":
                continue
            
            sku_id = item.get("id")
            attributes = item.get("attributes", {})
            relationships = item.get("relationships", {})
            
            # Extract images
            images = []
            if attributes.get("image_url"):
                images.append(ProductImage(url=attributes.get("image_url")))

            # Extract metadata attributes (simplified)
            sku_metadata = attributes.get("metadata", {})
            product_attrs = [
                ProductAttribute(name=key, value=str(value))
                for key, value in sku_metadata.items() if value is not None
            ]

            # Get price
            price = None
            price_relationship_data = relationships.get("prices", {}).get("data", [])
            if price_relationship_data:
                price_id = price_relationship_data[0].get("id")
                price_inc = included_data_map.get(("prices", price_id))
                if price_inc and price_inc.get("attributes"):
                    price_attrs = price_inc["attributes"]
                    price = ProductPrice(
                        amount_cents=price_attrs.get("amount_cents", 0),
                        amount_float=price_attrs.get("amount_float", 0.0),
                        formatted=price_attrs.get("formatted_amount", ""),
                        currency_code=price_attrs.get("currency_code", "")
                    )

            # Calculate availability 
            total_quantity = 0
            stock_items_relationship = relationships.get("stock_items", {}).get("data", [])
            for stock_item_ref in stock_items_relationship:
                stock_item_id = stock_item_ref.get("id")
                stock_item_inc = included_data_map.get(("stock_items", stock_item_id))
                if stock_item_inc and stock_item_inc.get("attributes"):
                    total_quantity += stock_item_inc["attributes"].get("quantity", 0)
            is_available = total_quantity > 0

            product = ProductResponse(
                id=sku_id,
                name=attributes.get("name", ""),
                code=attributes.get("code", ""),
                description=attributes.get("description", ""),
                image_url=attributes.get("image_url"),
                price=price,
                images=images,
                attributes=product_attrs,
                category=None, # Category isn't relevant for featured products directly
                available=is_available
            )
            products.append(product)
        
        print(f"Successfully processed {len(products)} featured products for market {market}")
        return products

    except Exception as e:
        print(f"Unexpected error processing featured products response: {e}")
        handle_unexpected_error(e, "get_featured_products_processing")
        return [] # Should not be reached


@router.get("/products/{sku_code}", response_model=ProductDetailResponse)
def get_product_details(sku_code: str = Path(..., description="The SKU code of the product"), market: str = Query(..., description="The market (UK or EU)")):
    """Fetches detailed information for a single product SKU using a single API call."""
    print(f"Starting get_product_details for SKU: {sku_code}, Market: {market}")
    
    client_id = db.secrets.get("COMMERCE_LAYER_CLIENT_ID")
    client_secret = db.secrets.get("COMMERCE_LAYER_CLIENT_SECRET")
    endpoint = db.secrets.get("COMMERCE_LAYER_ENDPOINT")
    sku_list_id_uk = db.secrets.get("COMMERCE_LAYER_UK_SKU_LIST_ID")
    sku_list_id_eu = db.secrets.get("COMMERCE_LAYER_EU_SKU_LIST_ID")

    if not all([client_id, client_secret, endpoint, sku_list_id_uk, sku_list_id_eu]):
        raise HTTPException(status_code=500, detail="Commerce Layer secrets not configured.")

    sku_list_id = sku_list_id_uk if market == "UK" else sku_list_id_eu
    market_id_for_token = market_id_map.get(market) # Renamed to avoid confusion with 'market_id' used as a general variable

    if not market_id_for_token:
        raise HTTPException(status_code=400, detail=f"Invalid market specified: {market}")

    try:
        # Pass the base URL (stored in the 'endpoint' secret) to get_cl_token
        token_data = get_cl_token(client_id, client_secret, endpoint, market_id_for_token)
        access_token = token_data.get("access_token")
    except HTTPException as token_http_err: # Catch specific error from get_cl_token
         print(f"Failed to get CL token: {token_http_err.detail}")
         raise token_http_err # Re-raise the existing HTTPException
    except Exception as token_err:
        print(f"Unexpected error getting CL token: {token_err}")
        raise HTTPException(status_code=500, detail="Unexpected error obtaining Commerce Layer token.") from token_err

    if not access_token:
        raise HTTPException(status_code=500, detail="Failed to get Commerce Layer token (empty token).")

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
    }

    # --- Single API Call to /skus --- 
    sku_url = (
        f"{endpoint}/api/skus"
        f"?filter[q][code_eq]={sku_code}" # Use sku_code from path
        f"&filter[q][sku_list_id_eq]={sku_list_id}"
        f"&include=prices,stock_items"
    )
    print(f"Querying SKU URL: {sku_url}")

    try:
        response_sku = requests.get(sku_url, headers=headers, timeout=15)
        print(f"SKU Response Status: {response_sku.status_code}")
        response_sku.raise_for_status() 
        sku_data_full = response_sku.json()
        print(f"[DEBUG] Raw SKU Response: {json.dumps(sku_data_full, indent=2)}")

        if not sku_data_full.get('data') or len(sku_data_full['data']) == 0:
            print(f"SKU '{sku_code}' not found in market '{market}' (sku_list: {sku_list_id}).") # Use sku_code and market from params
            raise HTTPException(status_code=404, detail=f"SKU '{sku_code}' not found for market '{market}'.")

        # --- Process SKU Data --- 
        sku_item = sku_data_full['data'][0]
        sku_id = sku_item['id']
        sku_attributes = sku_item.get('attributes', {})
        product_sku_code_from_cl = sku_attributes.get('code') # Keep CL's response separate from input
        product_name = sku_attributes.get('name')
        product_description = sku_attributes.get('description')

        print(f"[DEBUG] SKU code from CL response: '{product_sku_code_from_cl}' (requested: '{sku_code}')")

        included_data = {item['type'] + '-' + item['id']: item for item in sku_data_full.get('included', [])}

        # Extract Price
        product_price = None
        price_refs = sku_item.get('relationships', {}).get('prices', {}).get('data', [])
        if price_refs:
            price_id = price_refs[0]['id']
            price_data = included_data.get(f"prices-{price_id}")
            if price_data and price_data.get('attributes'):
                price_attrs = price_data['attributes']
                product_price = ProductPrice(
                    amount_cents=int(price_attrs.get('amount_float', 0) * 100),
                    amount_float=price_attrs.get('amount_float', 0),
                    formatted=price_attrs.get('formatted_amount', ''),
                    currency_code=price_attrs.get('currency_code', '')
                )
                print(f"Found Price: {product_price.formatted}")

        # Calculate Availability
        is_available = False
        stock_refs = sku_item.get('relationships', {}).get('stock_items', {}).get('data', [])
        total_quantity = 0
        for stock_ref in stock_refs:
            stock_id = stock_ref['id']
            stock_data = included_data.get(f"stock_items-{stock_id}")
            if stock_data and stock_data.get('attributes', {}).get('quantity') is not None:
                total_quantity += stock_data['attributes']['quantity']
        is_available = total_quantity > 0
        print(f"Availability Check: Total Quantity={total_quantity}, Available={is_available}")

        # Extract Image URL directly from attributes
        product_images = []
        image_url = sku_attributes.get('image_url')
        if image_url:
            print(f"Found image_url attribute: {image_url}")
            product_images.append(ProductImage(
                url=image_url,
                alt=sku_attributes.get('name', 'Product image')
            ))
        else:
            print("Warning: No image_url attribute found for this SKU.")

        if not sku_id or not product_sku_code_from_cl: # Check CL's response
            raise HTTPException(status_code=500, detail="Failed to retrieve essential SKU identifiers from Commerce Layer.")

        response_payload = ProductDetailResponse(
            id=sku_id,
            sku=product_sku_code_from_cl, # Use SKU from CL response
            name=product_name,
            description=product_description,
            price=product_price,
            images=product_images,
            available=is_available
        )

        print(f"get_product_details completed successfully for SKU: {sku_code}. Returning response.")
        return response_payload

    except requests.exceptions.HTTPError as http_err:
        status_code = http_err.response.status_code
        print(f"HTTP Error from Commerce Layer: Status={status_code}, Response={http_err.response.text}")
        # Try to parse CL error details
        detail_message = f"Commerce Layer API error ({status_code})"
        try:
            error_json = http_err.response.json()
            if 'errors' in error_json and len(error_json['errors']) > 0:
                 cl_error = error_json['errors'][0]
                 detail_message = cl_error.get('detail', detail_message)
                 # Include more info for debugging 400 errors if available
                 if status_code == 400:
                     meta = cl_error.get('meta')
                     if meta:
                         detail_message += f" | Meta: {json.dumps(meta)}" 
                     title = cl_error.get('title')
                     if title:
                          detail_message += f" | Title: {title}"
        except json.JSONDecodeError:
            pass # Keep generic message if response isn't JSON
        
        raise HTTPException(status_code=status_code, detail=detail_message) from http_err

    except requests.exceptions.RequestException as req_err:
        print(f"Network error connecting to Commerce Layer: {req_err}")
        raise HTTPException(status_code=504, detail=f"Network error connecting to Commerce Layer: {req_err}") from req_err

    except Exception as e:
        print(f"Unexpected error in get_product_details for SKU {sku_code}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred processing product details: {e}") from e


# --- Helper functions for Error Handling ---

def handle_cl_error(e: requests.exceptions.RequestException, context: str):
    """Handles Commerce Layer RequestExceptions."""
    print(f"[ERROR {context}] Commerce Layer API request failed: {type(e).__name__} - {str(e)}")
    status_code = 503 # Default to Service Unavailable
    detail_msg = f"Service Unavailable: Failed to connect to Commerce Layer. ({str(e)})"
    
    if hasattr(e, 'response') and e.response is not None:
        status_code = e.response.status_code
        print(f"[ERROR {context}] CL API Error Status: {status_code}, Response: {e.response.text[:500]}...")
        detail_msg = f"Commerce Layer API error (Status {status_code})"
        try:
            error_json = e.response.json()
            errors = error_json.get('errors', [])
            if errors:
                 # Combine details from multiple errors if present
                detail_msg = "; ".join([err.get('detail', 'Unknown CL error') for err in errors])
            else:
                 detail_msg = e.response.text # Fallback if no structured error
            print(f"[ERROR {context}] CL API Error Detail: {detail_msg}")
        except json.JSONDecodeError: # More specific exception
            print(f"[ERROR {context}] Failed to parse CL error response as JSON: {e.response.text[:100]}...")
            detail_msg = e.response.text # Fallback to raw text

    raise HTTPException(status_code=status_code, detail=f"Commerce Layer error: {detail_msg}") from e


def handle_unexpected_error(e: Exception, context: str):
    """Handles generic Exceptions, excluding HTTPException which should be re-raised."""
    if isinstance(e, HTTPException):
        raise e # Re-raise HTTPException directly

    print(f"[ERROR {context}] Unexpected error: {type(e).__name__} - {str(e)}")
    import traceback
    traceback.print_exc() # Print full traceback to logs
    raise HTTPException(status_code=500, detail=f"An internal error occurred: {str(e)}") from e


@router.get("/config", response_model=CLCoreConfigResponse)
def get_core_cl_config():
    """Provides core configuration: client ID, base API URL, and market ID mapping."""
    client_id = db.secrets.get("COMMERCE_LAYER_CLIENT_ID")
    endpoint = db.secrets.get("COMMERCE_LAYER_ENDPOINT")
    
    if not client_id:
        print("[ERROR] COMMERCE_LAYER_CLIENT_ID secret is not set.")
        raise HTTPException(status_code=500, detail="Commerce Layer Client ID is not configured.")
        
    if not endpoint:
        print("[ERROR] COMMERCE_LAYER_ENDPOINT secret is not set.")
        raise HTTPException(status_code=500, detail="Commerce Layer base URL is not configured.")

    # Use the existing market_id_map defined at the top of the file
    if not market_id_map:
         print("[ERROR] market_id_map is not defined or empty.")
         # This should ideally not happen if the map is defined globally
         raise HTTPException(status_code=500, detail="Internal configuration error: Market ID map missing.")

    print(f"Providing Core CL Config - ClientID: {client_id}, BaseURL: {endpoint}, MarketMap: {market_id_map}")
    return CLCoreConfigResponse(clientId=client_id, baseUrl=endpoint, marketIdMap=market_id_map)


@router.get("/health")
def commerce_layer_health_check() -> Dict[str, Any]:
    """Check if essential Commerce Layer secrets are configured and attempts a token fetch for 'UK' market."""
    required_secrets = [
        "COMMERCE_LAYER_CLIENT_ID",
        "COMMERCE_LAYER_CLIENT_SECRET",
        "COMMERCE_LAYER_ENDPOINT",
        "COMMERCE_LAYER_UK_SKU_LIST_ID" # Added as it's used by featured_products and product_details
    ]
    
    missing_secrets = [secret for secret in required_secrets if not db.secrets.get(secret)]
    
    if missing_secrets:
        print(f"[HEALTH CHECK] Missing secrets: {', '.join(missing_secrets)}")
        raise HTTPException(
            status_code=503, 
            detail=f"Service Unavailable: Missing critical Commerce Layer configuration: {', '.join(missing_secrets)}"
        )

    # Attempt a token fetch for a default market (e.g., UK) to test connectivity
    try:
        client_id = db.secrets.get("COMMERCE_LAYER_CLIENT_ID")
        client_secret = db.secrets.get("COMMERCE_LAYER_CLIENT_SECRET")
        endpoint = db.secrets.get("COMMERCE_LAYER_ENDPOINT")
        # Use the market ID from the map or a hardcoded default for health check
        uk_market_id = market_id_map.get("UK", "vjzmJhvEDo") # Fallback if map somehow not populated

        get_cl_token(client_id, client_secret, endpoint, uk_market_id)
        print("[HEALTH CHECK] Successfully fetched test token for UK market.")
        return {"status": "healthy", "message": "Commerce Layer configuration and connectivity appear OK."}
    except HTTPException as e:
        # Intercept HTTPException from get_cl_token to provide a health-check specific error
        print(f"[HEALTH CHECK] Failed to fetch test token: {e.detail}")
        # Return 503 to indicate the service is unavailable due to this downstream issue
        raise HTTPException(
            status_code=503, 
            detail=f"Service Unavailable: Failed to connect or authenticate with Commerce Layer during health check: {e.detail}"
        ) from e # Add from e here
    except Exception as e:
        print(f"[HEALTH CHECK] Unexpected error during token fetch: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Internal Server Error: Unexpected issue during Commerce Layer health check: {str(e)}"
        ) from e # Add from e here and remove the duplicated try block below
        endpoint = db.secrets.get("COMMERCE_LAYER_ENDPOINT")
        uk_sku_list_id = db.secrets.get("COMMERCE_LAYER_UK_SKU_LIST_ID")
        eu_sku_list_id = db.secrets.get("COMMERCE_LAYER_EU_SKU_LIST_ID")

        required_secrets = {
            "COMMERCE_LAYER_CLIENT_ID": client_id,
            "COMMERCE_LAYER_ENDPOINT": endpoint,
            "COMMERCE_LAYER_UK_SKU_LIST_ID": uk_sku_list_id,
            "COMMERCE_LAYER_EU_SKU_LIST_ID": eu_sku_list_id
        }
        missing = [key for key, value in required_secrets.items() if not value]

        if missing:
            return {"status": "error", "message": f"Missing credentials: {', '.join(missing)}"}

        # Try to get a token for the UK market as a basic auth check
        print("Health Check: Attempting to get UK market token...")
        token = get_token_for_market("UK") # This will raise HTTPException on failure now
        print("Health Check: Successfully obtained UK market token.")
        # Optionally, try a basic API call like fetching one SKU to confirm token validity
        # For now, just obtaining the token is our health check pass criteria
        return {"status": "ok", "message": "Commerce Layer integration appears healthy (token obtained)."}

    except HTTPException as http_exc:
         print(f"Health Check Failed (HTTPException): {http_exc.status_code} - {http_exc.detail}")
         # Provide a more specific message based on the detail if possible
         if "authenticate" in http_exc.detail:
              return {"status": "error", "message": f"Authentication failed: {http_exc.detail}"}
         else:
              return {"status": "error", "message": f"API Call Failed during health check: {http_exc.detail}"}
    except Exception as e:
        print(f"Health Check Failed (Unexpected Exception): {str(e)}")
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": f"An unexpected error occurred during health check: {str(e)}"}

# End of file
