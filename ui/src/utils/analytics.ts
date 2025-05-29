// Analytics utility for GTM and GA4 tracking
export interface TrackingEvent {
    event: string;
    event_category?: string;
    event_action?: string;
    event_label?: string;
    value?: number;
    page_title?: string;
    page_location?: string;
    user_id?: string;
    custom_parameters?: Record<string, any>;
  }
  
  export class AnalyticsService {
    private static isInitialized = false;
  
    static initialize() {
      if (typeof window !== 'undefined' && !this.isInitialized) {
        window.dataLayer = window.dataLayer || [];
        this.isInitialized = true;
        console.log('[Analytics] GTM DataLayer initialized');
      }
    }
  
    static trackEvent(eventData: TrackingEvent) {
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          ...eventData,
          timestamp: new Date().toISOString(),
        });
        console.log('[Analytics] Event tracked:', eventData);
      }
    }
  
    static trackPageView(pageName: string, pageUrl?: string) {
      this.trackEvent({
        event: 'page_view',
        page_title: pageName,
        page_location: pageUrl || window.location.href,
      });
    }
  
    static trackClick(elementType: string, elementName: string, additionalData?: Record<string, any>) {
      this.trackEvent({
        event: 'click',
        event_category: 'engagement',
        event_action: 'click',
        event_label: `${elementType}_${elementName}`,
        ...additionalData,
      });
    }
  
    static trackNavigation(fromPage: string, toPage: string) {
      this.trackEvent({
        event: 'navigation',
        event_category: 'navigation',
        event_action: 'page_change',
        event_label: `${fromPage}_to_${toPage}`,
      });
    }
  
    static trackEcommerce(action: string, productData?: any) {
      this.trackEvent({
        event: 'ecommerce',
        event_category: 'ecommerce',
        event_action: action,
        ...productData,
      });
    }
  }
  
  // Extend Window interface for TypeScript
  declare global {
    interface Window {
      dataLayer: any[];
    }
  }
  