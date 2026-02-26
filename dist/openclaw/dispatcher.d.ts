/**
 * OpenClaw Gateway Dispatcher
 *
 * Sends instruction payloads to OpenClaw gateways via HTTP.
 * All calls are non-blocking with timeouts. Failures are swallowed
 * to avoid blocking hooks.
 */
import type { OpenClawGatewayConfig, OpenClawPayload, OpenClawResult } from "./types.js";
/**
 * Interpolate template variables in an instruction string.
 *
 * Supported variables (from hook context):
 * - {{projectName}} - basename of project directory
 * - {{projectPath}} - full project directory path
 * - {{sessionId}} - session identifier
 * - {{toolName}} - tool name (pre/post-tool-use events)
 * - {{prompt}} - prompt text (keyword-detector event)
 * - {{contextSummary}} - context summary (session-end event)
 * - {{question}} - question text (ask-user-question event)
 * - {{timestamp}} - ISO timestamp
 * - {{event}} - hook event name
 *
 * Unresolved variables are left as-is (not replaced with empty string).
 */
export declare function interpolateInstruction(template: string, variables: Record<string, string | undefined>): string;
/**
 * Wake an OpenClaw gateway with the given payload.
 */
export declare function wakeGateway(gatewayName: string, gatewayConfig: OpenClawGatewayConfig, payload: OpenClawPayload): Promise<OpenClawResult>;
//# sourceMappingURL=dispatcher.d.ts.map