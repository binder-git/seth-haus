import axios from 'axios';

// Define interfaces for token-related data
export interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  acquired_at?: number;
}

export interface TokenValidationResponse {
  valid: boolean;
  user?: {
    id: string;
    email?: string;
    scope?: string;
  };
  error?: string;
}

// Authentication service for Commerce Layer
export class CommerceLayerAuthService {
  // Obtain a new access token
  static async getAccessToken(): Promise<TokenResponse> {
    try {
      const response = await axios.post<TokenResponse>(
        '/api/commerce-layer-auth',
        {},
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      // Add timestamp to track when token was acquired
      return {
        ...response.data,
        acquired_at: Date.now()
      };
    } catch (error) {
      console.error('Failed to obtain access token:', error);
      throw error;
    }
  }

  // Validate an existing token
  static async validateToken(accessToken: string): Promise<TokenValidationResponse> {
    try {
      const response = await axios.post<TokenValidationResponse>(
        '/api/validate-token',
        { access_token: accessToken },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Token validation failed:', error);
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown validation error'
      };
    }
  }

  // Store token securely in local storage
  static storeToken(token: TokenResponse): void {
    localStorage.setItem('commerce_layer_token', JSON.stringify({
      ...token,
      acquired_at: Date.now()
    }));
  }

  // Retrieve stored token
  static getStoredToken(): TokenResponse | null {
    const storedToken = localStorage.getItem('commerce_layer_token');
    return storedToken ? JSON.parse(storedToken) : null;
  }

  // Check if stored token is still valid
  static isTokenValid(token: TokenResponse): boolean {
    if (!token) return false;
    
    const currentTime = Date.now();
    const acquiredTime = token.acquired_at || 0;
    const expirationTime = acquiredTime + (token.expires_in * 1000);

    return currentTime < expirationTime;
  }

  // Get a valid token, refreshing if necessary
  static async getValidToken(): Promise<string> {
    const storedToken = this.getStoredToken();
    
    if (!storedToken || !this.isTokenValid(storedToken)) {
      // If no valid token, get a new one
      const newToken = await this.getAccessToken();
      this.storeToken(newToken);
      return newToken.access_token;
    }

    return storedToken.access_token;
  }
}

// Export as default for easier importing
export default CommerceLayerAuthService;
