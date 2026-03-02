/**
 * Smoke tests for team worker infrastructure.
 *
 * Covers:
 *   - Worker Bootstrap (issue #1141): generateWorkerOverlay, composeInitialInbox,
 *     appendToInbox, ensureWorkerStateDir
 *   - Shell PATH Resolution (issues #1128, #1153): resolveShellPath, resolvedEnv,
 *     _resetShellPathCache
 *   - Tmux Session (issues #1144, #1148, #1151): buildWorkerStartCommand,
 *     getDefaultShell, isUnixLikeOnWindows
 *   - Worker Adapter Edge Cases (issue #1123): omxTaskToTaskFile, taskFileToOmxTask,
 *     omcStatusToOmx, teamConfigToOmx, omxMailboxToInboxMarkdown
 */
export {};
//# sourceMappingURL=smoke-team-worker.test.d.ts.map