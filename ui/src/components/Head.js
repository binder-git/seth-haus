import { useEffect } from "react";
import fonts from "../fonts.json";
export const Head = () => {
    useEffect(() => {
        fonts.forEach((font) => {
            const link = document.createElement('link');
            link.href = font;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        });
    }, []);
    return null;
};
