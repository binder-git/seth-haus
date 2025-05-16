/**
 * Type declarations for Commerce Layer SDK
 * @see https://github.com/commercelayer/commercelayer-sdk
 */
declare module '@commercelayer/sdk' {
  export interface CommerceLayerClient {
    accessToken: string;
    organization: string;
  }

  export default function CommerceLayer(config: {
    organization: string;
    accessToken: string;
  }): CommerceLayerClient;
}
