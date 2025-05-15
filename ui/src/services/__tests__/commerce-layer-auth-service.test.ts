import CommerceLayerAuthService from '../commerce-layer-auth-service';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CommerceLayerAuthService', () => {
  // Clear localStorage and reset mocks before each test
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('getAccessToken', () => {
    it('should successfully retrieve an access token', async () => {
      const mockTokenResponse = {
        access_token: 'test_access_token',
        expires_in: 3600,
        token_type: 'bearer',
        scope: 'market:all'
      };

      mockedAxios.post.mockResolvedValue({ data: mockTokenResponse });

      const token = await CommerceLayerAuthService.getAccessToken();
      
      expect(token).toEqual(mockTokenResponse);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/.netlify/functions/commerce-layer-auth',
        {},
        { headers: { 'Content-Type': 'application/json' } }
      );
    });

    it('should throw an error when token retrieval fails', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      await expect(CommerceLayerAuthService.getAccessToken()).rejects.toThrow('Network error');
    });
  });

  describe('validateToken', () => {
    it('should validate a valid token', async () => {
      const mockValidationResponse = {
        valid: true,
        user: {
          id: 'user123',
          email: 'test@example.com',
          scope: 'market:all'
        }
      };

      mockedAxios.post.mockResolvedValue({ data: mockValidationResponse });

      const result = await CommerceLayerAuthService.validateToken('valid_token');
      
      expect(result).toEqual(mockValidationResponse);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/.netlify/functions/validate-token',
        { access_token: 'valid_token' },
        { headers: { 'Content-Type': 'application/json' } }
      );
    });

    it('should handle token validation failure', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Invalid token'));

      const result = await CommerceLayerAuthService.validateToken('invalid_token');
      
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('Token Storage and Validation', () => {
    it('should store and retrieve a token', () => {
      const testToken = {
        access_token: 'test_token',
        expires_in: 3600,
        token_type: 'bearer',
        scope: 'market:all'
      };

      CommerceLayerAuthService.storeToken(testToken);
      const storedToken = CommerceLayerAuthService.getStoredToken();

      expect(storedToken).toMatchObject(testToken);
      expect(storedToken?.acquired_at).toBeDefined();
    });

    it('should correctly determine token validity', () => {
      const validToken = {
        access_token: 'valid_token',
        expires_in: 3600,
        token_type: 'bearer',
        scope: 'market:all',
        acquired_at: Date.now()
      };

      const expiredToken = {
        access_token: 'expired_token',
        expires_in: 1, // Very short expiration
        token_type: 'bearer',
        scope: 'market:all',
        acquired_at: Date.now() - 2000 // Past expiration
      };

      expect(CommerceLayerAuthService.isTokenValid(validToken)).toBe(true);
      expect(CommerceLayerAuthService.isTokenValid(expiredToken)).toBe(false);
      expect(CommerceLayerAuthService.isTokenValid(null as any)).toBe(false);
    });

    it('should get a valid token, refreshing if necessary', async () => {
      // Mock stored expired token
      const expiredToken = {
        access_token: 'old_token',
        expires_in: 1, // Very short expiration
        token_type: 'bearer',
        scope: 'market:all',
        acquired_at: Date.now() - 2000 // Past expiration
      };
      localStorage.setItem('commerce_layer_token', JSON.stringify(expiredToken));

      // Mock new token retrieval
      const newTokenResponse = {
        access_token: 'new_token',
        expires_in: 3600,
        token_type: 'bearer',
        scope: 'market:all'
      };
      mockedAxios.post.mockResolvedValue({ data: newTokenResponse });

      const token = await CommerceLayerAuthService.getValidToken();

      expect(token).toBe('new_token');
      expect(mockedAxios.post).toHaveBeenCalled();
    });
  });
});
