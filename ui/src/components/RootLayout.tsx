import { Outlet } from 'react-router-dom';
import { ThemeProvider } from './ThemeProvider';
import { AppProvider } from './AppProvider';
import { Head } from './Head';
import { DEFAULT_THEME } from '../constants';

export function RootLayout() {
  return (
    <ThemeProvider defaultTheme={DEFAULT_THEME}>
      <AppProvider>
        <Head />
        <Outlet />
      </AppProvider>
    </ThemeProvider>
  );
}
