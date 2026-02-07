// src/team/audit-log.ts
/**
 * Structured audit logging for MCP Team Bridge.
 *
 * All events are logged to append-only JSONL files with 0o600 permissions.
 * Automatic rotation when log exceeds size threshold.
 */
import { join } from 'node:path';
import { existsSync, readFileSync, statSync, renameSync, writeFileSync, chmodSync } from 'node:fs';
import { appendFileWithMode, ensureDirWithMode, validateResolvedPath } from './fs-utils.js';
const DEFAULT_MAX_LOG_SIZE = 5 * 1024 * 1024; // 5MB
function getLogPath(workingDirectory, teamName) {
    return join(workingDirectory, '.omc', 'logs', `team-bridge-${teamName}.jsonl`);
}
/**
 * Append an audit event to the team's audit log.
 * Append-only JSONL format with 0o600 permissions.
 */
export function logAuditEvent(workingDirectory, event) {
    const logPath = getLogPath(workingDirectory, event.teamName);
    const dir = join(workingDirectory, '.omc', 'logs');
    validateResolvedPath(logPath, workingDirectory);
    ensureDirWithMode(dir);
    const line = JSON.stringify(event) + '\n';
    appendFileWithMode(logPath, line);
}
/**
 * Read audit events with optional filtering.
 */
export function readAuditLog(workingDirectory, teamName, filter) {
    const logPath = getLogPath(workingDirectory, teamName);
    if (!existsSync(logPath))
        return [];
    const content = readFileSync(logPath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim());
    let events = [];
    for (const line of lines) {
        try {
            events.push(JSON.parse(line));
        }
        catch { /* skip malformed */ }
    }
    if (filter) {
        if (filter.eventType) {
            events = events.filter(e => e.eventType === filter.eventType);
        }
        if (filter.workerName) {
            events = events.filter(e => e.workerName === filter.workerName);
        }
        if (filter.since) {
            const since = filter.since;
            events = events.filter(e => e.timestamp >= since);
        }
    }
    return events;
}
/**
 * Rotate audit log if it exceeds maxSizeBytes.
 * Keeps the most recent half of entries.
 */
export function rotateAuditLog(workingDirectory, teamName, maxSizeBytes = DEFAULT_MAX_LOG_SIZE) {
    const logPath = getLogPath(workingDirectory, teamName);
    if (!existsSync(logPath))
        return;
    const stat = statSync(logPath);
    if (stat.size <= maxSizeBytes)
        return;
    const content = readFileSync(logPath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim());
    // Keep the most recent half
    const keepFrom = Math.floor(lines.length / 2);
    const rotated = lines.slice(keepFrom).join('\n') + '\n';
    // Atomic write: write to temp, then rename
    const tmpPath = logPath + '.tmp';
    writeFileSync(tmpPath, rotated);
    chmodSync(tmpPath, 0o600);
    renameSync(tmpPath, logPath);
}
//# sourceMappingURL=audit-log.js.map