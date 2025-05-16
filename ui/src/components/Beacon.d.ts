import React from 'react';
export interface BeaconProps {
    color?: string;
    size?: number;
    className?: string;
}
export declare const Beacon: React.FC<BeaconProps>;
export declare const MessageEmitter: React.FC<{
    children: React.ReactNode;
}>;
export default Beacon;
