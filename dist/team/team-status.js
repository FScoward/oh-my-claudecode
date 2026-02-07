// src/team/team-status.ts
/**
 * Team Status Aggregator for MCP Team Bridge
 *
 * Provides a unified view of team state by combining worker registration,
 * heartbeat data, task progress, and outbox messages.
 */
import { listMcpWorkers } from './team-registration.js';
import { readHeartbeat, isWorkerAlive } from './heartbeat.js';
import { readNewOutboxMessages } from './outbox-reader.js';
import { listTaskIds, readTask } from './task-file-ops.js';
export function getTeamStatus(teamName, workingDirectory, heartbeatMaxAgeMs = 30000) {
    // Get all workers
    const mcpWorkers = listMcpWorkers(teamName, workingDirectory);
    // Get all tasks for the team
    const taskIds = listTaskIds(teamName);
    const tasks = [];
    for (const id of taskIds) {
        const task = readTask(teamName, id);
        if (task)
            tasks.push(task);
    }
    // Build per-worker status
    const workers = mcpWorkers.map(w => {
        const heartbeat = readHeartbeat(workingDirectory, teamName, w.name);
        const alive = isWorkerAlive(workingDirectory, teamName, w.name, heartbeatMaxAgeMs);
        const recentMessages = readNewOutboxMessages(teamName, w.name);
        // Compute per-worker task stats
        const workerTasks = tasks.filter(t => t.owner === w.name);
        const taskStats = {
            completed: workerTasks.filter(t => t.status === 'completed').length,
            failed: 0, // Tasks don't have 'failed' status in TaskFile
            pending: workerTasks.filter(t => t.status === 'pending').length,
            inProgress: workerTasks.filter(t => t.status === 'in_progress').length,
        };
        const currentTask = workerTasks.find(t => t.status === 'in_progress') || null;
        const provider = w.agentType.replace('mcp-', '');
        return {
            workerName: w.name,
            provider,
            heartbeat,
            isAlive: alive,
            currentTask,
            recentMessages,
            taskStats,
        };
    });
    // Build team summary
    const taskSummary = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        failed: 0,
        pending: tasks.filter(t => t.status === 'pending').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
    };
    return {
        teamName,
        workers,
        taskSummary,
        lastUpdated: new Date().toISOString(),
    };
}
//# sourceMappingURL=team-status.js.map