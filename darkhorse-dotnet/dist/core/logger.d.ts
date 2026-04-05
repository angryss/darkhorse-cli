export declare function setVerbose(v: boolean): void;
export declare const logger: {
    info: (msg: string, ...args: unknown[]) => void;
    success: (msg: string, ...args: unknown[]) => void;
    warn: (msg: string, ...args: unknown[]) => void;
    error: (msg: string, ...args: unknown[]) => void;
    step: (msg: string, ...args: unknown[]) => void;
    debug: (msg: string, ...args: unknown[]) => void;
    /** Log a blank line for spacing. */
    blank: () => void;
    /** Log a header for a major phase. */
    header: (msg: string) => void;
};
//# sourceMappingURL=logger.d.ts.map