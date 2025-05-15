export interface CLCoreConfigResponse {
  clientId: string;
  baseUrl: string;
  marketIdMap: Record<string, string>;
  organization: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  created_at: number;
  owner_id: string;
  owner_type: string;
  detail?: string;
}
