import { Brain } from './Brain';
import { API } from '@/config';

export class NetlifyBrain extends Brain {
  constructor() {
    super({
      baseUrl: '/.netlify/functions',
      baseApiParams: {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'same-origin',
      },
    });
  }
}
