import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const ProdErrorPage = ({ text, canRefresh }) => {
    return (_jsxs("div", { style: {
            display: "flex",
            flexFlow: "column",
            gap: "20px",
            padding: "20px",
        }, children: [text, _jsx("div", { style: {
                    display: "flex",
                    gap: "10px",
                }, children: canRefresh && (_jsx("button", { style: {
                        color: "blue",
                        width: "fit-content",
                    }, type: "button", onClick: () => {
                        window.location.reload();
                    }, children: "Reload page" })) })] }));
};
