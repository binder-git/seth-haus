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
export declare class CommerceLayerAuthService {
    static getAccessToken(): Promise<TokenResponse>;
    static validateToken(accessToken: string): Promise<TokenValidationResponse>;
    static storeToken(token: TokenResponse): void;
    static getStoredToken(): TokenResponse | null;
    static isTokenValid(token: TokenResponse): boolean;
    static getValidToken(): Promise<string>;
}
export default CommerceLayerAuthService;
