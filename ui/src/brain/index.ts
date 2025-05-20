import { API_PATH } from '../constants/index';
import { Brain } from './Brain';
import { NetlifyBrain } from "./NetlifyBrain";
import type { RequestParams } from './http-client';

const isLocalhost = /localhost:\d{4}/i.test(window.location.origin);

const constructBaseUrl = (): string => {
  return `${window.location.origin}${API_PATH}`;
};

type BaseApiParams = Omit<RequestParams, "signal" | "baseUrl" | "cancelToken">;

function constructBaseApiParams(): BaseApiParams {
  return {
    headers: {
      "Content-Type": "application/json",
    },
  };
}

function constructClient() {
  const baseUrl = isLocalhost ? constructBaseUrl() : "https://seth-haus.netlify.app";
  return new Brain({
    baseUrl,
    baseApiParams: {
      ...constructBaseApiParams(),
      credentials: 'include',
    },
  });
}

const brain = constructClient();
const netlifyBrain = new NetlifyBrain();

export { netlifyBrain };
export default brain;
