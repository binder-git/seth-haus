export declare enum Mode {
    Development = "development",
    Production = "production",
    Test = "test"
}
export declare const APP: {
    readonly title: string;
    readonly id: string;
    readonly mode: Mode;
    readonly basePath: string;
    readonly assets: {
        readonly faviconLight: string;
        readonly faviconDark: string;
    };
};
