// src/team/merge-coordinator.ts

/**
 * Merge coordinator for team worker branches.
 *
 * Provides conflict detection and branch merging for worker worktrees.
 * All merge operations use --no-ff for clear history.
 * Failed merges are always aborted to prevent leaving the repo dirty.
 */

import { execFileSync } from 'node:child_process';
import { listTeamWorktrees } from './git-worktree.js';

export interface MergeResult {
  workerName: string;
  branch: string;
  success: boolean;
  conflicts: string[];
  mergeCommit?: string;
}

/**
 * Check for merge conflicts between a worker branch and the base branch.
 * Does NOT actually merge -- uses git merge-tree for non-destructive check.
 * Returns list of conflicting file paths, empty if clean.
 */
export function checkMergeConflicts(
  workerBranch: string,
  baseBranch: string,
  repoRoot: string
): string[] {
  try {
    // Find merge base
    const mergeBase = execFileSync(
      'git', ['merge-base', baseBranch, workerBranch],
      { cwd: repoRoot, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
    ).trim();

    // Check for overlapping changes by comparing what changed in each branch
    const baseDiff = execFileSync(
      'git', ['diff', '--name-only', mergeBase, baseBranch],
      { cwd: repoRoot, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
    ).trim();
    const workerDiff = execFileSync(
      'git', ['diff', '--name-only', mergeBase, workerBranch],
      { cwd: repoRoot, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
    ).trim();

    if (!baseDiff || !workerDiff) {
      return []; // No changes in one or both branches
    }

    const baseFiles = new Set(baseDiff.split('\n').filter(f => f));
    const workerFiles = workerDiff.split('\n').filter(f => f);

    // Files changed in both branches are potential conflicts
    return workerFiles.filter(f => baseFiles.has(f));
  } catch {
    return []; // Can't determine conflicts, assume clean
  }
}

/**
 * Merge a worker's branch back to the base branch.
 * Uses --no-ff to preserve merge history.
 * On failure, always aborts to prevent leaving repo dirty.
 */
export function mergeWorkerBranch(
  workerBranch: string,
  baseBranch: string,
  repoRoot: string
): MergeResult {
  const workerName = workerBranch.split('/').pop() || workerBranch;

  try {
    // Ensure we're on the base branch
    execFileSync('git', ['checkout', baseBranch], {
      cwd: repoRoot, stdio: 'pipe'
    });

    // Attempt merge
    execFileSync('git', ['merge', '--no-ff', '-m', `Merge ${workerBranch} into ${baseBranch}`, workerBranch], {
      cwd: repoRoot, stdio: 'pipe'
    });

    // Get merge commit hash
    const mergeCommit = execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: repoRoot, encoding: 'utf-8', stdio: 'pipe'
    }).trim();

    return {
      workerName,
      branch: workerBranch,
      success: true,
      conflicts: [],
      mergeCommit,
    };
  } catch (err) {
    // Abort the failed merge
    try {
      execFileSync('git', ['merge', '--abort'], { cwd: repoRoot, stdio: 'pipe' });
    } catch { /* may not be in merge state */ }

    // Try to detect conflicting files
    const conflicts = checkMergeConflicts(workerBranch, baseBranch, repoRoot);

    return {
      workerName,
      branch: workerBranch,
      success: false,
      conflicts,
    };
  }
}

/**
 * Merge all completed worker branches for a team.
 * Processes worktrees in order.
 */
export function mergeAllWorkerBranches(
  teamName: string,
  repoRoot: string,
  baseBranch?: string
): MergeResult[] {
  const worktrees = listTeamWorktrees(teamName, repoRoot);
  if (worktrees.length === 0) return [];

  // Determine base branch
  const base = baseBranch || execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
    cwd: repoRoot, encoding: 'utf-8', stdio: 'pipe'
  }).trim();

  const results: MergeResult[] = [];

  for (const wt of worktrees) {
    const result = mergeWorkerBranch(wt.branch, base, repoRoot);
    results.push(result);

    // Stop on first failure to prevent cascading issues
    if (!result.success) break;
  }

  return results;
}
