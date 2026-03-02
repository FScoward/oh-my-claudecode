/**
 * Layout Stabilizer for tmux team sessions.
 *
 * Prevents layout thrashing during rapid worker spawn/kill cycles by:
 * 1. Debouncing layout recalculations (coalesces rapid requests into one)
 * 2. Serializing layout operations (mutex prevents concurrent tmux layout calls)
 * 3. Preserving leader pane focus after every layout update
 *
 * @see https://github.com/nicobailon/oh-my-claudecode/issues/1158
 */
export interface LayoutStabilizerOptions {
    /** tmux target in "session:window" form */
    sessionTarget: string;
    /** Pane ID of the leader pane (e.g. %0) — never killed, always re-focused */
    leaderPaneId: string;
    /** Minimum quiet period before applying layout (ms). Default: 150 */
    debounceMs?: number;
}
export declare class LayoutStabilizer {
    private pending;
    private running;
    private queuedWhileRunning;
    private disposed;
    private flushResolvers;
    readonly sessionTarget: string;
    readonly leaderPaneId: string;
    private readonly debounceMs;
    constructor(opts: LayoutStabilizerOptions);
    /**
     * Request a layout recalculation. Multiple rapid calls are coalesced
     * into a single layout operation after debounceMs of quiet.
     */
    requestLayout(): void;
    /**
     * Force an immediate layout recalculation, bypassing debounce.
     * Waits for any in-flight operation to complete first.
     * Use at the end of a watchdog tick to ensure layout is stable.
     */
    flush(): Promise<void>;
    /**
     * Cancel any pending layout operation and release resources.
     */
    dispose(): void;
    /** Visible for testing */
    get isPending(): boolean;
    /** Visible for testing */
    get isRunning(): boolean;
    private applyLayout;
}
//# sourceMappingURL=layout-stabilizer.d.ts.map