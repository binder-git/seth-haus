import databutton as db
import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from urllib.parse import urlparse
import logging

# Configure logger
logger = logging.getLogger(__name__)

router = APIRouter()

# --- Configuration ---
CLIENT_ID = db.secrets.get("COMMERCE_LAYER_CLIENT_ID")
CLIENT_SECRET = db.secrets.get("COMMERCE_LAYER_CLIENT_SECRET")
ENDPOINT = db.secrets.get("COMMERCE_LAYER_ENDPOINT") # Added
ORGANIZATION = db.secrets.get("COMMERCE_LAYER_ORGANIZATION_SLUG") # Added
# Use the central Commerce Layer authentication endpoint
TOKEN_URL = "https://auth.commercelayer.io/oauth/token"

# --- Pydantic Models ---
class TokenRequest(BaseModel):
    market_id: str # The CL Market ID (e.g., 'xYZ123AbCd')

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    scope: str
    endpoint: str # Added
    organization: str # Added

# --- Helper Function ---
def _get_cl_token(market_id: str) -> TokenResponse:
    """Fetches an access token from Commerce Layer for a specific market ID."""
    # Updated check to include Endpoint and Organization
    if not all([CLIENT_ID, CLIENT_SECRET, TOKEN_URL, ENDPOINT, ORGANIZATION]):
        logger.error("Commerce Layer auth secrets (ID, Secret, Endpoint, Org Slug) or token URL are missing.")
        raise HTTPException(status_code=500, detail="Server configuration error: CL auth secrets missing.")

    # Scope format: market:id:<market_id>
    scope = f"market:id:{market_id}"
    logger.info(f"Requesting CL token for scope: {scope}")

    payload = {
        'grant_type': 'client_credentials',
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'scope': scope
    }
    headers = {'Content-Type': 'application/json', 'Accept': 'application/json'} # Added Accept header

    try:
        # ADD THIS LOGGING LINE
        logger.info(f"Attempting to POST to CL Token URL: {TOKEN_URL}")
        response = requests.post(TOKEN_URL, json=payload, headers=headers)
        response.raise_for_status()  # Raises HTTPError for bad responses (4XX, 5XX)

        token_data = response.json()
        logger.info(f"Successfully obtained CL token for scope: {scope}")
        # Validate response structure
        if not all(k in token_data for k in ['access_token', 'token_type', 'expires_in', 'scope']):
            logger.error(f"Unexpected token response structure: {token_data}")
            raise HTTPException(status_code=500, detail="Received unexpected token response format from Commerce Layer.")

                # Add endpoint and organization before returning
        token_data['endpoint'] = ENDPOINT
        # Derive slug from endpoint URL as the ORGANIZATION secret seems incorrect
        try:
            parsed_url = urlparse(ENDPOINT)
            # Extract the first part of the netloc (e.g., 'seth-s-triathlon-haus' from 'seth-s-triathlon-haus.commercelayer.io')
            slug = parsed_url.netloc.split('.')[0]
            if slug:
                token_data['organization'] = slug
                logger.info(f"Derived organization slug '{slug}' from endpoint.")
            else:
                logger.warning("Could not derive slug from endpoint, falling back to ORGANIZATION secret.")
                token_data['organization'] = ORGANIZATION # Fallback
        except Exception as parse_error:
            logger.error(f"Error parsing endpoint URL to derive slug: {parse_error}, falling back to ORGANIZATION secret.")
            token_data['organization'] = ORGANIZATION # Fallback

        return TokenResponse(**token_data)

    except requests.exceptions.RequestException as e:
        logger.error(f"Error requesting CL token: {e}")
        error_detail = "Failed to fetch Commerce Layer token."
        try:
            if e.response is not None:
                error_detail = f"CL token request failed: {e.response.status_code} - {e.response.text}"
        except Exception:
            pass # Ignore if we can't parse the error response
        # Use 'raise from e' for better traceback as suggested by linter previously
        raise HTTPException(status_code=502, detail=error_detail) from e

# --- API Endpoint ---
# Renamed endpoint path and function name
@router.post("/auth/cl-access-token2", response_model=TokenResponse)
def get_cl_access_token2(request: TokenRequest):
    """
    Endpoint to securely fetch a Commerce Layer access token scoped to a specific market ID.
    Requires the Market ID (e.g., 'xYZ123AbCd') in the request body.
    """
    logger.info(f"Received token request for market_id: {request.market_id}")
    if not request.market_id:
        raise HTTPException(status_code=400, detail="market_id is required.")

    return _get_cl_token(market_id=request.market_id)


