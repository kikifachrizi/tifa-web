// Robot API - Abstraction layer for robot/device operations
// Uses PostgreSQL via pg package

import { query } from '@/lib/dbClient';
import type { Robot, DeviceInfo, CreateRobotInput, UpdateRobotInput, ApiResult } from '@/lib/types/database';

// Whitelist of device codes that are considered part of the robot fleet.
// Only these devices will appear on the Armada Robot / Daftar Robot page.
// TIFA-001 = TFUI1 + TFRB1, TIFA-002 = RB002 + UI_TIFA_002
const ALLOWED_DEVICE_CODES = ['TFUI1', 'TFRB1', 'RB002', 'UI_TIFA_002'];

// Helper: generate IN clause placeholders starting from a given param index
// e.g. buildInClause(1, 4) => { clause: "$1, $2, $3, $4", nextIndex: 5 }
function buildInClause(startIndex: number, count: number) {
    const placeholders = Array.from({ length: count }, (_, i) => `$${startIndex + i}`).join(', ');
    return { clause: placeholders, nextIndex: startIndex + count };
}

/**
 * Get all robots with optional search filter
 */
export async function getRobots(search?: string): Promise<ApiResult<Robot[]>> {
    try {
        const { clause, nextIndex } = buildInClause(1, ALLOWED_DEVICE_CODES.length);
        const params: (string | number)[] = [...ALLOWED_DEVICE_CODES];

        let sql = `
            SELECT device_id, device_name, device_code, company_id, active_map_id, 
                   robot_local_ip, robot_local_ssid, created_at, updated_at
            FROM m_device
            WHERE device_code IN (${clause})
        `;

        if (search?.trim()) {
            sql += ` AND (device_name ILIKE $${nextIndex} OR device_code ILIKE $${nextIndex})`;
            params.push(`%${search.trim()}%`);
        }

        sql += ` ORDER BY created_at DESC`;

        const data = await query<Robot>(sql, params);

        // Override device_name for TFUI1 for UI display
        const transformedData = data.map(robot => ({
            ...robot,
            device_name: robot.device_code === 'TFUI1' ? 'TIFA' : robot.device_name
        }));

        return {
            data: transformedData,
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
 * Get single robot by ID
 */
export async function getRobotById(id: number): Promise<ApiResult<DeviceInfo>> {
    try {
        const rows = await query<DeviceInfo>(
            `SELECT device_id, device_name, device_code, company_id, active_map_id, 
                    robot_local_ip, robot_local_ssid
             FROM m_device
             WHERE device_id = $1`,
            [id]
        );

        const device = rows[0] ?? null;

        // Override device_name for TFUI1 for UI display
        if (device && device.device_code === 'TFUI1') {
            device.device_name = 'TIFA';
        }

        return {
            data: device,
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
 * Get recent robots (limited)
 */
export async function getRecentRobots(limit: number = 5): Promise<ApiResult<Robot[]>> {
    try {
        const { clause, nextIndex } = buildInClause(1, ALLOWED_DEVICE_CODES.length);

        const data = await query<Robot>(
            `SELECT device_id, device_name, device_code, robot_local_ip, robot_local_ssid, 
                    company_id, active_map_id, created_at, updated_at
             FROM m_device
             WHERE device_code IN (${clause})
             ORDER BY created_at DESC
             LIMIT $${nextIndex}`,
            [...ALLOWED_DEVICE_CODES, limit]
        );

        // Override device_name for TFUI1 for UI display
        const transformedData = data.map(robot => ({
            ...robot,
            device_name: robot.device_code === 'TFUI1' ? 'TIFA' : robot.device_name
        }));

        return {
            data: transformedData,
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
 * Create a new robot
 */
export async function createRobot(input: CreateRobotInput): Promise<ApiResult<{ device_id: number }>> {
    try {
        const rows = await query<{ device_id: number }>(
            `INSERT INTO m_device (device_name, device_code, robot_local_ip, robot_local_ssid)
             VALUES ($1, $2, $3, $4)
             RETURNING device_id`,
            [
                input.device_name,
                input.device_code,
                input.robot_local_ip || null,
                input.robot_local_ssid || null,
            ]
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
 * Update an existing robot
 */
export async function updateRobot(id: number, input: UpdateRobotInput): Promise<ApiResult<null>> {
    try {
        await query(
            `UPDATE m_device 
             SET device_name = COALESCE($1, device_name),
                 device_code = COALESCE($2, device_code),
                 robot_local_ip = COALESCE($3, robot_local_ip),
                 robot_local_ssid = COALESCE($4, robot_local_ssid),
                 updated_at = NOW()
             WHERE device_id = $5`,
            [
                input.device_name,
                input.device_code,
                input.robot_local_ip,
                input.robot_local_ssid,
                id,
            ]
        );

        return {
            data: null,
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
 * Delete a robot
 */
export async function deleteRobot(id: number): Promise<ApiResult<null>> {
    try {
        await query(
            `DELETE FROM m_device WHERE device_id = $1`,
            [id]
        );

        return {
            data: null,
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
 * Count total robots (only whitelisted fleet)
 */
export async function getRobotCount(): Promise<ApiResult<number>> {
    try {
        const { clause } = buildInClause(1, ALLOWED_DEVICE_CODES.length);

        const rows = await query<{ count: string }>(
            `SELECT COUNT(*) as count FROM m_device WHERE device_code IN (${clause})`,
            [...ALLOWED_DEVICE_CODES]
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
