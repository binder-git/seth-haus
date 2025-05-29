import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AnalyticsService } from '@/utils/analytics';

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const getPageName = (pathname: string) => {
      if (pathname === '/') return 'home';
      if (pathname === '/products') return 'products';
      if (pathname.startsWith('/products/')) return 'product_detail';
      if (pathname === '/cart') return 'cart';
      if (pathname === '/checkout') return 'checkout';
      if (pathname === '/faq-page' || pathname === '/faqpage') return 'faq';
      return pathname.replace('/', '').replace('-', '_');
    };

    const pageName = getPageName(location.pathname);
    AnalyticsService.trackPageView(pageName, window.location.href);
  }, [location]);
};
