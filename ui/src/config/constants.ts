export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const APP_BASE_PATH = import.meta.env.VITE_APP_BASE_PATH || '/';

export enum Mode {
  Development = 'development',
  Production = 'production',
  Test = 'test'
}
