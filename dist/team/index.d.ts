/**
 * MCP Team Bridge Module - Barrel Export
 *
 * Provides all public APIs for the team bridge functionality.
 */
export type { BridgeConfig, TaskFile, TaskFileUpdate, InboxMessage, OutboxMessage, ShutdownSignal, DrainSignal, McpWorkerMember, HeartbeatData, InboxCursor, ConfigProbeResult, TaskModeMap, TaskFailureSidecar, } from './types.js';
export { readTask, updateTask, findNextTask, areBlockersResolved, writeTaskFailure, readTaskFailure, listTaskIds, } from './task-file-ops.js';
export { validateTmux, sanitizeName, sessionName, createSession, killSession, isSessionAlive, listActiveSessions, spawnBridgeInSession, } from './tmux-session.js';
export { appendOutbox, rotateOutboxIfNeeded, rotateInboxIfNeeded, readNewInboxMessages, readAllInboxMessages, clearInbox, writeShutdownSignal, checkShutdownSignal, deleteShutdownSignal, writeDrainSignal, checkDrainSignal, deleteDrainSignal, cleanupWorkerFiles, } from './inbox-outbox.js';
export { registerMcpWorker, unregisterMcpWorker, isMcpWorker, listMcpWorkers, getRegistrationStrategy, readProbeResult, writeProbeResult, } from './team-registration.js';
export { writeHeartbeat, readHeartbeat, listHeartbeats, isWorkerAlive, deleteHeartbeat, cleanupTeamHeartbeats, } from './heartbeat.js';
export { readNewOutboxMessages, readAllTeamOutboxMessages, resetOutboxCursor, } from './outbox-reader.js';
export type { OutboxCursor } from './outbox-reader.js';
export { getTeamStatus } from './team-status.js';
export type { WorkerStatus, TeamStatus } from './team-status.js';
export { runBridge, sanitizePromptContent } from './mcp-team-bridge.js';
export { validateConfigPath } from './bridge-entry.js';
export { logAuditEvent, readAuditLog, rotateAuditLog } from './audit-log.js';
export type { AuditEventType, AuditEvent } from './audit-log.js';
export { getWorkerHealthReports, checkWorkerHealth, } from './worker-health.js';
export type { WorkerHealthReport } from './worker-health.js';
export { shouldRestart, recordRestart, readRestartState, clearRestartState, synthesizeBridgeConfig, } from './worker-restart.js';
export type { RestartPolicy, RestartState } from './worker-restart.js';
//# sourceMappingURL=index.d.ts.map