// Goals API - Abstraction layer for goal operations
// Matches m_goal and t_goal_queue tables from tifa_dump.sql
// Uses PostgreSQL via pg package

import { query } from '@/lib/dbClient';
import type { Goal, GoalQueue, ApiResult } from '@/lib/types/database';

/**
 * Get all goals for a specific map
 */
export async function getGoalsByMap(mapId: number): Promise<ApiResult<Goal[]>> {
    try {
        const data = await query<Goal>(
            `SELECT goal_id, map_id, goal_code, goal_name, goal_type, x, y, yaw, metadata, created_at
             FROM m_goal
             WHERE map_id = $1
             ORDER BY goal_name ASC`,
            [mapId]
        );

        return {
            data,
            error: null,
        };
    } catch (err: unknown) {
        const error = err as Error;
        return {
            data: null,
            error: error.message ?? 'Database error',
        };
    }
}

/**
 * Get single goal by ID
 */
export async function getGoalById(goalId: number): Promise<ApiResult<Goal>> {
    try {
        const rows = await query<Goal>(
            `SELECT goal_id, map_id, goal_code, goal_name, goal_type, x, y, yaw, metadata, created_at
             FROM m_goal
             WHERE goal_id = $1`,
            [goalId]
        );

        return {
            data: rows[0] ?? null,
            error: null,
        };
    } catch (err: unknown) {
        const error = err as Error;
        return {
            data: null,
            error: error.message ?? 'Database error',
        };
    }
}

/**
 * Get goal queue for a device
 */
export async function getGoalQueue(deviceId: number): Promise<ApiResult<GoalQueue[]>> {
    try {
        const data = await query<GoalQueue>(
            `SELECT goal_queue_id, queue_code, map_id, device_id, requested_by, priority,
                    retry_count, status, fail_reason, created_at, started_at, finished_at, payload
             FROM t_goal_queue
             WHERE device_id = $1
             ORDER BY priority ASC, created_at ASC`,
            [deviceId]
        );

        return {
            data,
            error: null,
        };
    } catch (err: unknown) {
        const error = err as Error;
        return {
            data: null,
            error: error.message ?? 'Database error',
        };
    }
}

/**
 * Get active goal queues (QUEUED or IN_PROGRESS)
 */
export async function getActiveGoalQueues(): Promise<ApiResult<GoalQueue[]>> {
    try {
        const data = await query<GoalQueue>(
            `SELECT goal_queue_id, queue_code, map_id, device_id, requested_by, priority,
                    retry_count, status, fail_reason, created_at, started_at, finished_at, payload
             FROM t_goal_queue
             WHERE status IN ('QUEUED', 'IN_PROGRESS')
             ORDER BY priority ASC`
        );

        return {
            data,
            error: null,
        };
    } catch (err: unknown) {
        const error = err as Error;
        return {
            data: null,
            error: error.message ?? 'Database error',
        };
    }
}

/**
 * Count goals by type
 */
export async function countGoalsByType(): Promise<ApiResult<Record<string, number>>> {
    try {
        const data = await query<{ goal_type: string }>(
            `SELECT goal_type FROM m_goal`
        );

        const counts: Record<string, number> = {
            TABLE: 0,
            CHARGE: 0,
            HOME: 0,
            CUSTOM: 0,
        };

        data.forEach((item) => {
            if (item.goal_type && item.goal_type in counts) {
                counts[item.goal_type]++;
            }
        });

        return {
            data: counts,
            error: null,
        };
    } catch (err: unknown) {
        const error = err as Error;
        return {
            data: null,
            error: error.message ?? 'Database error',
        };
    }
}
