import { API_URL } from '../constants';
import { Brain } from './Brain';
import type { RequestParams } from './http-client';

type BaseApiParams = Omit<RequestParams, "signal" | "baseUrl" | "cancelToken">;

function constructBaseApiParams(): BaseApiParams {
  return {
    headers: {
      "Content-Type": "application/json",
    },
  };
}

// Simplified client construction using the universal API_URL
function createBrainClient() {
  return new Brain({
    baseUrl: API_URL, // Use the universal API_URL for your backend
    baseApiParams: {
      ...constructBaseApiParams(),
      credentials: 'include',
    },
  });
}

const brain = createBrainClient();

export default brain; // This is the single, primary client instance
