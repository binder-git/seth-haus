import { Outlet } from 'react-router-dom';
import { ThemeProvider } from './ThemeProvider';
import { AppProvider } from './AppProvider';
import { Head } from './Head';
import { DEFAULT_THEME } from '../constants/index';
import { DebugRouter } from './DebugRouter';

export function RootLayout() {
  return (
    <ThemeProvider defaultTheme={DEFAULT_THEME}>
      <AppProvider>
        <DebugRouter />
        <Head />
        <Outlet />
      </AppProvider>
    </ThemeProvider>
  );
}
