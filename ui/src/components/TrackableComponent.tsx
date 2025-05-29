import React from 'react';
import { AnalyticsService } from '@/utils/analytics';

interface TrackableComponentProps {
  children: React.ReactNode;
  eventName: string;
  eventCategory?: string;
  eventAction?: string;
  eventLabel?: string;
  additionalData?: Record<string, any>;
  triggerOn?: 'click' | 'view' | 'hover';
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const TrackableComponent: React.FC<TrackableComponentProps> = ({
  children,
  eventName,
  eventCategory = 'engagement',
  eventAction = 'click',
  eventLabel,
  additionalData = {},
  triggerOn = 'click',
  className = '',
  as: Component = 'div',
  ...props
}) => {
  const handleTracking = () => {
    AnalyticsService.trackEvent({
      event: eventName,
      event_category: eventCategory,
      event_action: eventAction,
      event_label: eventLabel,
      ...additionalData,
    });
  };

  const eventHandlers = {
    onClick: triggerOn === 'click' ? handleTracking : undefined,
    onMouseEnter: triggerOn === 'hover' ? handleTracking : undefined,
  };

  // For view tracking, use intersection observer
  React.useEffect(() => {
    if (triggerOn === 'view') {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              handleTracking();
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );

      const element = document.querySelector(`[data-track="${eventName}"]`);
      if (element) {
        observer.observe(element);
      }

      return () => observer.disconnect();
    }
  }, [triggerOn, eventName]);

  return (
    <Component
      className={className}
      data-track={eventName}
      data-gtm={eventLabel || eventName}
      {...eventHandlers}
      {...props}
    >
      {children}
    </Component>
  );
};
