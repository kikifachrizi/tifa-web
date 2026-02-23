// Commands API - Abstraction layer for command log operations
// Uses PostgreSQL via pg package

import { query } from '@/lib/dbClient';
import type { CommandLog, ActivityData, ApiResult } from '@/lib/types/database';

/**
 * Get command logs with optional device filter
 */
export async function getCommandLogs(limit: number = 5, deviceId?: number): Promise<ApiResult<CommandLog[]>> {
    try {
        let sql = `
            SELECT h_command_log_id, device_id, command_code, command_payload, 
                   status, status_message, created_at
            FROM h_command_log
        `;
        const params: (string | number)[] = [];

        if (deviceId !== undefined) {
            sql += ` WHERE device_id = $1`;
            params.push(deviceId);
            sql += ` ORDER BY created_at DESC LIMIT $2`;
            params.push(limit);
        } else {
            sql += ` ORDER BY created_at DESC LIMIT $1`;
            params.push(limit);
        }

        const data = await query<CommandLog>(sql, params);

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
 * Count error commands (non-success status)
 */
export async function getErrorCount(): Promise<ApiResult<number>> {
    try {
        const rows = await query<{ count: string }>(
            `SELECT COUNT(*) as count 
             FROM h_command_log 
             WHERE status != 'success'`
        );

        return {
            data: parseInt(rows[0]?.count ?? '0', 10),
            error: null,
        };
    } catch (err: unknown) {
        const error = err as Error;
        return {
            data: 0,
            error: error.message ?? 'Database error',
        };
    }
}

/**
 * Get activity data (hourly command counts) for last 24 hours
 */
export async function getActivityData(deviceId: number): Promise<ApiResult<ActivityData[]>> {
    try {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const commandData = await query<{ created_at: string }>(
            `SELECT created_at
             FROM h_command_log
             WHERE device_id = $1 AND created_at >= $2`,
            [deviceId, yesterday.toISOString()]
        );

        // Aggregate by hour
        const hourlyCounts: ActivityData[] = new Array(24).fill(0).map((_, i) => ({
            hour: i,
            count: 0,
        }));

        commandData.forEach((log) => {
            const date = new Date(log.created_at);
            const hour = date.getHours();
            hourlyCounts[hour].count++;
        });

        return {
            data: hourlyCounts,
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
