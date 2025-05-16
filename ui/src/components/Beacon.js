import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
export const Beacon = ({ color = 'red', size = 8, className = '' }) => {
    return (_jsx("div", { className: `absolute rounded-full ${className}`, style: {
            backgroundColor: color,
            width: size,
            height: size,
        } }));
};
export const MessageEmitter = ({ children }) => {
    return _jsx(_Fragment, { children: children });
};
export default Beacon;
