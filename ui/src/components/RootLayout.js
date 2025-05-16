import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from 'react-router-dom';
import { ThemeProvider } from './ThemeProvider';
import { AppProvider } from './AppProvider';
import { Head } from './Head';
import { DEFAULT_THEME } from '../constants';
export function RootLayout() {
    return (_jsx(ThemeProvider, { defaultTheme: DEFAULT_THEME, children: _jsxs(AppProvider, { children: [_jsx(Head, {}), _jsx(Outlet, {})] }) }));
}
