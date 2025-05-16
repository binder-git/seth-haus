import React from 'react';

export interface BeaconProps {
  color?: string;
  size?: number;
  className?: string;
}

export const Beacon: React.FC<BeaconProps> = ({ color = 'red', size = 8, className = '' }) => {
  return (
    <div
      className={`absolute rounded-full ${className}`}
      style={{
        backgroundColor: color,
        width: size,
        height: size,
      }}
    />
  );
};

export const MessageEmitter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export default Beacon;
