import type { TaskFile, TaskFileUpdate, TaskFailureSidecar } from './types.js';
/** Read a single task file. Returns null if not found or malformed. */
export declare function readTask(teamName: string, taskId: string): TaskFile | null;
/**
 * Atomic update: reads full task JSON, patches specified fields, writes back.
 * Preserves unknown fields to avoid data loss.
 */
export declare function updateTask(teamName: string, taskId: string, updates: TaskFileUpdate): void;
/**
 * Find next executable task for this worker.
 * Returns first task where:
 *   - owner === workerName
 *   - status === 'pending'
 *   - all blockedBy tasks have status 'completed'
 * Sorted by ID ascending.
 *
 * TOCTOU mitigation (best-effort, not true flock()):
 * 1. Write claim marker {claimedBy, claimedAt, claimPid} via updateTask
 * 2. Wait 50ms for other workers to also write their claims
 * 3. Re-read task and verify claimedBy + claimPid still match this worker
 * 4. If mismatch, another worker won the race — skip to next task
 */
export declare function findNextTask(teamName: string, workerName: string): Promise<TaskFile | null>;
/** Check if all blocker task IDs have status 'completed' */
export declare function areBlockersResolved(teamName: string, blockedBy: string[]): boolean;
/**
 * Write failure sidecar for a task.
 * If sidecar already exists, increments retryCount.
 */
export declare function writeTaskFailure(teamName: string, taskId: string, error: string): void;
/** Read failure sidecar if it exists */
export declare function readTaskFailure(teamName: string, taskId: string): TaskFailureSidecar | null;
/** Default maximum retries before a task is permanently failed */
export declare const DEFAULT_MAX_TASK_RETRIES = 5;
/** Check if a task has exhausted its retry budget */
export declare function isTaskRetryExhausted(teamName: string, taskId: string, maxRetries?: number): boolean;
/** List all task IDs in a team directory, sorted ascending */
export declare function listTaskIds(teamName: string): string[];
//# sourceMappingURL=task-file-ops.d.ts.map