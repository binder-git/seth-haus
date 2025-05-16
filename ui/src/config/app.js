// Application Configuration
export var Mode;
(function (Mode) {
    Mode["Development"] = "development";
    Mode["Production"] = "production";
    Mode["Test"] = "test";
})(Mode || (Mode = {}));
export const APP = {
    title: import.meta.env.APP_TITLE || "Seth's Triathlon Haus",
    id: import.meta.env.APP_ID || "seths-triathlon-haus",
    mode: import.meta.env.MODE,
    basePath: import.meta.env.BASE_URL || '/',
    assets: {
        faviconLight: import.meta.env.APP_FAVICON_LIGHT || "/favicon.ico",
        faviconDark: import.meta.env.APP_FAVICON_DARK || "/favicon.ico"
    }
};
