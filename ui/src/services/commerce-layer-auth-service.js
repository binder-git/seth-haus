import axios from 'axios';
// Authentication service for Commerce Layer
export class CommerceLayerAuthService {
    // Obtain a new access token
    static async getAccessToken() {
        try {
            const response = await axios.post('/.netlify/functions/commerce-layer-auth', {}, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            // Add timestamp to track when token was acquired
            return {
                ...response.data,
                acquired_at: Date.now()
            };
        }
        catch (error) {
            console.error('Failed to obtain access token:', error);
            throw error;
        }
    }
    // Validate an existing token
    static async validateToken(accessToken) {
        try {
            const response = await axios.post('/.netlify/functions/validate-token', { access_token: accessToken }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('Token validation failed:', error);
            return {
                valid: false,
                error: error instanceof Error ? error.message : 'Unknown validation error'
            };
        }
    }
    // Store token securely in local storage
    static storeToken(token) {
        localStorage.setItem('commerce_layer_token', JSON.stringify({
            ...token,
            acquired_at: Date.now()
        }));
    }
    // Retrieve stored token
    static getStoredToken() {
        const storedToken = localStorage.getItem('commerce_layer_token');
        return storedToken ? JSON.parse(storedToken) : null;
    }
    // Check if stored token is still valid
    static isTokenValid(token) {
        if (!token)
            return false;
        const currentTime = Date.now();
        const acquiredTime = token.acquired_at || 0;
        const expirationTime = acquiredTime + (token.expires_in * 1000);
        return currentTime < expirationTime;
    }
    // Get a valid token, refreshing if necessary
    static async getValidToken() {
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
