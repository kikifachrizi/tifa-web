// Device Status API - Uses v_device_current_status view
// Provides real-time status of all robots including position, battery, and mode
// Uses PostgreSQL via pg package

import { query } from '@/lib/dbClient';
import type { DeviceStatus, ApiResult } from '@/lib/types/database';

/**
 * Get all devices with their current status
 * Uses the v_device_current_status view which joins position, battery, and state
 */
export async function getAllDeviceStatus(): Promise<ApiResult<DeviceStatus[]>> {
    try {
        const data = await query<DeviceStatus>(
            `SELECT device_id, device_code, device_name, last_x, last_y, last_yaw,
                    battery_percent, robot_mode, robot_activity, status_updated_at
             FROM v_device_current_status
             ORDER BY device_code ASC`
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
 * Get single device status by ID
 */
export async function getDeviceStatus(deviceId: number): Promise<ApiResult<DeviceStatus>> {
    try {
        const rows = await query<DeviceStatus>(
            `SELECT device_id, device_code, device_name, last_x, last_y, last_yaw,
                    battery_percent, robot_mode, robot_activity, status_updated_at
             FROM v_device_current_status
             WHERE device_id = $1`,
            [deviceId]
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
 * Get devices by mode (e.g., all MOVING robots)
 */
export async function getDevicesByMode(mode: string): Promise<ApiResult<DeviceStatus[]>> {
    try {
        const data = await query<DeviceStatus>(
            `SELECT device_id, device_code, device_name, last_x, last_y, last_yaw,
                    battery_percent, robot_mode, robot_activity, status_updated_at
             FROM v_device_current_status
             WHERE robot_mode = $1`,
            [mode]
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
 * Get devices with low battery (< 30%)
 */
export async function getLowBatteryDevices(): Promise<ApiResult<DeviceStatus[]>> {
    try {
        const data = await query<DeviceStatus>(
            `SELECT device_id, device_code, device_name, last_x, last_y, last_yaw,
                    battery_percent, robot_mode, robot_activity, status_updated_at
             FROM v_device_current_status
             WHERE battery_percent < 30`
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
