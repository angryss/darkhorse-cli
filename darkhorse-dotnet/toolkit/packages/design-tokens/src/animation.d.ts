/**
 * Animation and transition design tokens for React Toolkit
 */
export declare const animation: {
    readonly duration: {
        readonly fast: "150ms";
        readonly base: "200ms";
        readonly slow: "300ms";
        readonly slower: "500ms";
    };
    readonly easing: {
        readonly linear: "linear";
        readonly easeIn: "cubic-bezier(0.4, 0, 1, 1)";
        readonly easeOut: "cubic-bezier(0, 0, 0.2, 1)";
        readonly easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)";
    };
};
export type AnimationDurationKey = keyof typeof animation.duration;
export type AnimationEasingKey = keyof typeof animation.easing;
//# sourceMappingURL=animation.d.ts.map