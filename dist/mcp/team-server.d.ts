#!/usr/bin/env node
/**
 * Team MCP Server - tmux CLI worker runtime tools
 */
export declare function handleStatus(args: unknown): Promise<{
    content: Array<{
        type: 'text';
        text: string;
    }>;
}>;
export declare function handleWait(args: unknown): Promise<{
    content: Array<{
        type: 'text';
        text: string;
    }>;
}>;
export declare function handleCleanup(args: unknown): Promise<{
    content: Array<{
        type: 'text';
        text: string;
    }>;
}>;
//# sourceMappingURL=team-server.d.ts.map