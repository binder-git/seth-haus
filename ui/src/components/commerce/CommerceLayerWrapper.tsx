import React, { useEffect, useRef } from 'react';
import { useCommerceLayerConfig } from '../../utils/commerceLayerConfig';

interface CommerceLayerWrapperProps {
  sku: string;
  children?: React.ReactNode;
  className?: string;
  [key: string]: any; // Allow any other props
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
    
    // Set required attributes for Commerce Layer
    wrapper.setAttribute('data-organization', config.organization);
    wrapper.setAttribute('data-domain', config.domain);
    wrapper.setAttribute('data-sku', sku);

    // Set any additional props as data attributes
    Object.entries(props).forEach(([key, value]) => {
      if (value !== undefined) {
        wrapper.setAttribute(`data-${key}`, String(value));
      }
    });
  }, [config, sku, props]);

  if (loading) return <div className="commerce-layer-loading">Loading commerce configuration...</div>;
  if (error) return <div className="commerce-layer-error">Error: {error}</div>;
  if (!config?.organization || !config.domain) {
    return <div className="commerce-layer-error">Missing required Commerce Layer configuration</div>;
  }

  return (
    <div ref={wrapperRef} className={`commerce-layer-wrapper ${className}`}>
      {children}
    </div>
  );
};

export default CommerceLayerWrapper;
