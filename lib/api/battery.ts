// Battery API - Abstraction layer for battery operations
// Matches h_battery table from tifa_dump.sql

import { query } from '@/lib/dbClient';
import type { BatteryRow, BatteryBuckets, ApiResult } from '@/lib/types/database';


/**
 * Get battery history for a specific device
 */
export async function getBatteryHistory(
    deviceId: number,
    limit: number = 50
): Promise<ApiResult<BatteryRow[]>> {
    try {
        const rows = await query<BatteryRow>(
            `SELECT h_battery_id,
                    device_id,
                    battery_percent,
                    voltage,
                    recorded_at,
                    raw_payload
             FROM h_battery
             WHERE device_id = $1
             ORDER BY recorded_at DESC
             LIMIT $2`,
            [deviceId, limit]
        );

        return { data: rows, error: null };
    } catch (err: unknown) {
        const error = err as Error;
        return { data: null, error: error.message ?? 'Database error' };
    }
}

/**
 * Get latest battery readings across all devices
 */
export async function getLatestBatteries(
    limit: number = 200
): Promise<ApiResult<BatteryRow[]>> {
    try {
        const rows = await query<BatteryRow>(
            `SELECT h_battery_id,
                    device_id,
                    battery_percent,
                    voltage,
                    recorded_at,
                    raw_payload
             FROM h_battery
             ORDER BY recorded_at DESC
             LIMIT $1`,
            [limit]
        );

        return { data: rows, error: null };
    } catch (err: unknown) {
        const error = err as Error;
        return { data: null, error: error.message ?? 'Database error' };
    }
}

/**
 * Get latest battery for a specific device
 */
export async function getLatestBattery(
    deviceId: number
): Promise<ApiResult<BatteryRow>> {
    try {
        const rows = await query<BatteryRow>(
            `SELECT h_battery_id,
                    device_id,
                    battery_percent,
                    voltage,
                    recorded_at,
                    raw_payload
             FROM h_battery
             WHERE device_id = $1
             ORDER BY recorded_at DESC
             LIMIT 1`,
            [deviceId]
        );

        const row = rows[0] ?? null;
        return { data: row, error: null };
    } catch (err: unknown) {
        const error = err as Error;
        return { data: null, error: error.message ?? 'Database error' };
    }
}

/**
 * Calculate battery statistics (average and buckets)
 */
export async function getBatteryStats(): Promise<ApiResult<{ avgBattery: number | null; buckets: BatteryBuckets }>> {
    const { data: batteryData, error } = await getLatestBatteries(200);

    if (error || !batteryData) {
        return {
            data: { avgBattery: null, buckets: { critical: 0, warning: 0, healthy: 0 } },
            error,
        };
    }

    if (batteryData.length === 0) {
        return {
            data: { avgBattery: null, buckets: { critical: 0, warning: 0, healthy: 0 } },
            error: null,
        };
    }

    const sum = batteryData.reduce(
        (acc, cur) => acc + Number(cur.battery_percent ?? 0),
        0
    );
    const avgBattery = Math.round(sum / batteryData.length);

    const buckets: BatteryBuckets = { critical: 0, warning: 0, healthy: 0 };
    batteryData.forEach((item) => {
        const value = Number(item.battery_percent ?? 0);
        if (value <= 30) buckets.critical += 1;
        else if (value <= 60) buckets.warning += 1;
        else buckets.healthy += 1;
    });

    return {
        data: { avgBattery, buckets },
        error: null,
    };
}
