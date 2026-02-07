// src/team/permissions.ts

/**
 * RBAC-compatible advisory permission scoping for workers.
 *
 * NOTE: This is an advisory layer only. MCP workers run in full-auto mode
 * and cannot be mechanically restricted. Permissions are injected into
 * prompts as instructions for the LLM to follow.
 */

import { relative, resolve } from 'node:path';

export interface WorkerPermissions {
  workerName: string;
  allowedPaths: string[];   // glob patterns relative to workingDirectory
  deniedPaths: string[];    // glob patterns that override allowed
  allowedCommands: string[]; // command prefixes (e.g., 'npm test', 'tsc')
  maxFileSize: number;      // max bytes per file write
}

/**
 * Simple glob matching for path patterns.
 * Supports: * (any segment), ** (any depth), exact match
 */
function matchGlob(pattern: string, path: string): boolean {
  // Convert glob to regex
  const regexStr = pattern
    .replace(/\*\*/g, '___DOUBLESTAR___')
    .replace(/\*/g, '[^/]*')
    .replace(/___DOUBLESTAR___/g, '.*')
    .replace(/\?/g, '[^/]');

  const regex = new RegExp(`^${regexStr}$`);
  return regex.test(path);
}

/**
 * Check if a worker is allowed to modify a given path.
 * Denied paths override allowed paths.
 */
export function isPathAllowed(
  permissions: WorkerPermissions,
  filePath: string,
  workingDirectory: string
): boolean {
  // Normalize to relative path
  const absPath = resolve(workingDirectory, filePath);
  const relPath = relative(workingDirectory, absPath);

  // If path escapes working directory, always deny
  if (relPath.startsWith('..')) return false;

  // Check denied paths first (they override)
  for (const pattern of permissions.deniedPaths) {
    if (matchGlob(pattern, relPath)) return false;
  }

  // If no allowed paths specified, allow all within workingDirectory
  if (permissions.allowedPaths.length === 0) return true;

  // Check allowed paths
  for (const pattern of permissions.allowedPaths) {
    if (matchGlob(pattern, relPath)) return true;
  }

  return false;
}

/**
 * Check if a worker is allowed to run a given command.
 * Empty allowedCommands means all commands are allowed.
 */
export function isCommandAllowed(
  permissions: WorkerPermissions,
  command: string
): boolean {
  if (permissions.allowedCommands.length === 0) return true;

  const trimmed = command.trim();
  return permissions.allowedCommands.some(prefix =>
    trimmed.startsWith(prefix)
  );
}

/**
 * Generate permission instructions for inclusion in worker prompt.
 */
export function formatPermissionInstructions(
  permissions: WorkerPermissions
): string {
  const lines: string[] = [];
  lines.push('PERMISSION CONSTRAINTS:');

  if (permissions.allowedPaths.length > 0) {
    lines.push(`- You may ONLY modify files matching: ${permissions.allowedPaths.join(', ')}`);
  }

  if (permissions.deniedPaths.length > 0) {
    lines.push(`- You must NOT modify files matching: ${permissions.deniedPaths.join(', ')}`);
  }

  if (permissions.allowedCommands.length > 0) {
    lines.push(`- You may ONLY run commands starting with: ${permissions.allowedCommands.join(', ')}`);
  }

  if (permissions.maxFileSize > 0 && permissions.maxFileSize < Infinity) {
    lines.push(`- Maximum file size: ${Math.round(permissions.maxFileSize / 1024)}KB per file`);
  }

  if (lines.length === 1) {
    lines.push('- No restrictions (full access within working directory)');
  }

  return lines.join('\n');
}

/**
 * Default permissions (allow all within working directory).
 */
export function getDefaultPermissions(workerName: string): WorkerPermissions {
  return {
    workerName,
    allowedPaths: [],     // empty = allow all
    deniedPaths: [],
    allowedCommands: [],  // empty = allow all
    maxFileSize: Infinity,
  };
}
