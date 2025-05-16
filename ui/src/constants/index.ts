// App constants
export const APP_NAME = 'Seth\'s Triathlon Haus';
export const APP_DESCRIPTION = 'Premium triathlon gear and accessories';
export const APP_KEYWORDS = ['triathlon', 'gear', 'accessories', 'bikes', 'running', 'swimming'];
export const APP_ID = 'seth-haus';
export const APP_BASE_PATH = '/';

// API constants
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const API_PATH = '/api';
export const WS_API_URL = import.meta.env.VITE_WS_API_URL || 'ws://localhost:3000';

// Commerce Layer constants
export const CL_CLIENT_ID = import.meta.env.VITE_CL_CLIENT_ID;
export const CL_ENDPOINT = import.meta.env.VITE_CL_ENDPOINT;
export const CL_ORGANIZATION = 'seth-s-triathlon-haus';

// Environment
export type Mode = 'development' | 'production' | 'test';
export const mode = (import.meta.env.MODE || 'development') as Mode;

// Theme constants
export const DEFAULT_THEME = 'system' as const;
export const AVAILABLE_THEMES = ['light', 'dark', 'system'] as const;
