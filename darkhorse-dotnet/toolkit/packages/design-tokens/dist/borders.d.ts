/**
 * Border design tokens for React Toolkit
 */
export declare const borders: {
    readonly width: {
        readonly 0: "0";
        readonly 1: "1px";
        readonly 2: "2px";
        readonly 4: "4px";
        readonly 8: "8px";
    };
    readonly radius: {
        readonly none: "0";
        readonly sm: "0.125rem";
        readonly base: "0.25rem";
        readonly md: "0.375rem";
        readonly lg: "0.5rem";
        readonly xl: "0.75rem";
        readonly '2xl': "1rem";
        readonly '3xl': "1.5rem";
        readonly full: "9999px";
    };
};
export type BorderWidthKey = keyof typeof borders.width;
export type BorderRadiusKey = keyof typeof borders.radius;
//# sourceMappingURL=borders.d.ts.map