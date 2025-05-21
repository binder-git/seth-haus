import React, { useEffect, useRef } from 'react';
import { useCommerceLayerConfig } from '../utils/commerceLayerConfig'; // Corrected path

interface CommerceLayerWrapperProps {
  sku: string;
  children?: React.ReactNode;
  className?: string;
  [key: string]: any; // Allow any other props as data attributes
}

export const CommerceLayerWrapper: React.FC<CommerceLayerWrapperProps> = ({
  sku,
  children,
  className = '',
  ...props
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { config, loading, error } = useCommerceLayerConfig();

  useEffect(() => {
    if (!wrapperRef.current || !config?.organization || !config.domain) return;

    const wrapper = wrapperRef.current;

    // Set required attributes for Commerce Layer Drop-in elements
    wrapper.setAttribute('data-organization', config.organization);
    wrapper.setAttribute('data-domain', config.domain);
    wrapper.setAttribute('data-sku', sku);

    // Set any additional props as data attributes (e.g., data-price-list-id)
    Object.entries(props).forEach(([key, value]) => {
      if (value !== undefined) {
        wrapper.setAttribute(`data-${key}`, String(value));
      }
    });
  }, [config, sku, props]); // Depend on config, sku, and props for re-evaluation

  if (loading) return <div className={`commerce-layer-loading ${className}`}>Loading Commerce Layer content...</div>;
  if (error) return <div className={`commerce-layer-error ${className}`}>Error: {error}</div>;
  if (!config?.organization || !config.domain) {
    return <div className={`commerce-layer-error ${className}`}>Missing required Commerce Layer configuration</div>;
  }

  return (
    <div ref={wrapperRef} className={`commerce-layer-wrapper ${className}`}>
      {children}
    </div>
  );
};

export default CommerceLayerWrapper;
