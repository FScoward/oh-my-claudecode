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

export type AuditEventType =
  | 'bridge_start'
  | 'bridge_shutdown'
  | 'task_claimed'
  | 'task_started'
  | 'task_completed'
  | 'task_failed'
  | 'task_permanently_failed'
  | 'worker_quarantined'
  | 'worker_idle'
  | 'inbox_rotated'
  | 'outbox_rotated'
  | 'cli_spawned'
  | 'cli_timeout'
  | 'cli_error'
  | 'shutdown_received'
  | 'shutdown_ack';

export interface AuditEvent {
  timestamp: string;
  eventType: AuditEventType;
  teamName: string;
  workerName: string;
  taskId?: string;
  details?: Record<string, unknown>;
}

const DEFAULT_MAX_LOG_SIZE = 5 * 1024 * 1024; // 5MB

function getLogPath(workingDirectory: string, teamName: string): string {
  return join(workingDirectory, '.omc', 'logs', `team-bridge-${teamName}.jsonl`);
}

/**
 * Append an audit event to the team's audit log.
 * Append-only JSONL format with 0o600 permissions.
 */
export function logAuditEvent(
  workingDirectory: string,
  event: AuditEvent
): void {
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
export function readAuditLog(
  workingDirectory: string,
  teamName: string,
  filter?: {
    eventType?: AuditEventType;
    workerName?: string;
    since?: string;
  }
): AuditEvent[] {
  const logPath = getLogPath(workingDirectory, teamName);
  if (!existsSync(logPath)) return [];

  const content = readFileSync(logPath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());

  let events: AuditEvent[] = [];
  for (const line of lines) {
    try {
      events.push(JSON.parse(line));
    } catch { /* skip malformed */ }
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
export function rotateAuditLog(
  workingDirectory: string,
  teamName: string,
  maxSizeBytes: number = DEFAULT_MAX_LOG_SIZE
): void {
  const logPath = getLogPath(workingDirectory, teamName);
  if (!existsSync(logPath)) return;

  const stat = statSync(logPath);
  if (stat.size <= maxSizeBytes) return;

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
