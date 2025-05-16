import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext } from 'react';
import { netlifyBrain } from '@/brain/NetlifyBrain';
const NetlifyBrainContext = createContext(null);
export const NetlifyBrainProvider = ({ children }) => {
    return (_jsx(NetlifyBrainContext.Provider, { value: netlifyBrain, children: children }));
};
export const useNetlifyBrain = () => {
    const context = useContext(NetlifyBrainContext);
    if (!context) {
        throw new Error('useNetlifyBrain must be used within a NetlifyBrainProvider');
    }
    return context;
};
