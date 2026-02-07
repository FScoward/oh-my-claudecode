// src/team/task-file-ops.ts
/**
 * Task File Operations for MCP Team Bridge
 *
 * Read/write/scan task JSON files with atomic writes (temp + rename).
 * Tasks live at ~/.claude/tasks/{teamName}/{id}.json
 */
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { sanitizeName } from './tmux-session.js';
import { atomicWriteJson, validateResolvedPath } from './fs-utils.js';
/** Validate task ID to prevent path traversal */
function sanitizeTaskId(taskId) {
    if (!/^[A-Za-z0-9._-]+$/.test(taskId)) {
        throw new Error(`Invalid task ID: "${taskId}" contains unsafe characters`);
    }
    return taskId;
}
/** Paths helper */
function tasksDir(teamName) {
    const result = join(homedir(), '.claude', 'tasks', sanitizeName(teamName));
    validateResolvedPath(result, join(homedir(), '.claude', 'tasks'));
    return result;
}
function taskPath(teamName, taskId) {
    return join(tasksDir(teamName), `${sanitizeTaskId(taskId)}.json`);
}
function failureSidecarPath(teamName, taskId) {
    return join(tasksDir(teamName), `${sanitizeTaskId(taskId)}.failure.json`);
}
/** Read a single task file. Returns null if not found or malformed. */
export function readTask(teamName, taskId) {
    const filePath = taskPath(teamName, taskId);
    if (!existsSync(filePath))
        return null;
    try {
        const raw = readFileSync(filePath, 'utf-8');
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}
/**
 * Atomic update: reads full task JSON, patches specified fields, writes back.
 * Preserves unknown fields to avoid data loss.
 */
export function updateTask(teamName, taskId, updates) {
    const filePath = taskPath(teamName, taskId);
    let task;
    try {
        const raw = readFileSync(filePath, 'utf-8');
        task = JSON.parse(raw);
    }
    catch {
        throw new Error(`Task file not found or malformed: ${taskId}`);
    }
    // Merge updates into existing task (preserving unknown fields)
    for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
            task[key] = value;
        }
    }
    atomicWriteJson(filePath, task);
}
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
export async function findNextTask(teamName, workerName) {
    const dir = tasksDir(teamName);
    if (!existsSync(dir))
        return null;
    const taskIds = listTaskIds(teamName);
    for (const id of taskIds) {
        const task = readTask(teamName, id);
        if (!task)
            continue;
        if (task.status !== 'pending')
            continue;
        if (task.owner !== workerName)
            continue;
        if (!areBlockersResolved(teamName, task.blockedBy))
            continue;
        // Write claim marker
        updateTask(teamName, id, {
            claimedBy: workerName,
            claimedAt: Date.now(),
            claimPid: process.pid,
        });
        // Wait for other workers to also attempt claims
        await new Promise(resolve => setTimeout(resolve, 50));
        // Re-read and verify claim still belongs to us
        const freshTask = readTask(teamName, id);
        if (!freshTask ||
            freshTask.status !== 'pending' ||
            freshTask.claimedBy !== workerName ||
            freshTask.claimPid !== process.pid) {
            continue;
        }
        return freshTask;
    }
    return null;
}
/** Check if all blocker task IDs have status 'completed' */
export function areBlockersResolved(teamName, blockedBy) {
    if (!blockedBy || blockedBy.length === 0)
        return true;
    for (const blockerId of blockedBy) {
        const blocker = readTask(teamName, blockerId);
        if (!blocker || blocker.status !== 'completed')
            return false;
    }
    return true;
}
/**
 * Write failure sidecar for a task.
 * If sidecar already exists, increments retryCount.
 */
export function writeTaskFailure(teamName, taskId, error) {
    const filePath = failureSidecarPath(teamName, taskId);
    const existing = readTaskFailure(teamName, taskId);
    const sidecar = {
        taskId,
        lastError: error,
        retryCount: existing ? existing.retryCount + 1 : 1,
        lastFailedAt: new Date().toISOString(),
    };
    atomicWriteJson(filePath, sidecar);
}
/** Read failure sidecar if it exists */
export function readTaskFailure(teamName, taskId) {
    const filePath = failureSidecarPath(teamName, taskId);
    if (!existsSync(filePath))
        return null;
    try {
        const raw = readFileSync(filePath, 'utf-8');
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}
/** Default maximum retries before a task is permanently failed */
export const DEFAULT_MAX_TASK_RETRIES = 5;
/** Check if a task has exhausted its retry budget */
export function isTaskRetryExhausted(teamName, taskId, maxRetries = DEFAULT_MAX_TASK_RETRIES) {
    const failure = readTaskFailure(teamName, taskId);
    if (!failure)
        return false;
    return failure.retryCount >= maxRetries;
}
/** List all task IDs in a team directory, sorted ascending */
export function listTaskIds(teamName) {
    const dir = tasksDir(teamName);
    if (!existsSync(dir))
        return [];
    try {
        return readdirSync(dir)
            .filter(f => f.endsWith('.json') && !f.includes('.tmp.') && !f.includes('.failure.'))
            .map(f => f.replace('.json', ''))
            .sort((a, b) => {
            const numA = parseInt(a, 10);
            const numB = parseInt(b, 10);
            if (!isNaN(numA) && !isNaN(numB))
                return numA - numB;
            return a.localeCompare(b);
        });
    }
    catch {
        return [];
    }
}
//# sourceMappingURL=task-file-ops.js.map