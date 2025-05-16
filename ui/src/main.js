import { jsx as _jsx } from "react/jsx-runtime";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppWrapper } from './AppWrapper.tsx';
import './index.css';
createRoot(document.getElementById('root')).render(_jsx(StrictMode, { children: _jsx(AppWrapper, {}) }));
