// Maps API - Abstraction layer for map operations
// Matches m_map table from tifa_dump.sql
// Uses PostgreSQL via pg package

import { query } from '@/lib/dbClient';
import type { Map, ApiResult } from '@/lib/types/database';

/**
 * Get all maps
 */
export async function getAllMaps(): Promise<ApiResult<Map[]>> {
    try {
        const data = await query<Map>(
            `SELECT map_id, map_name, description, map_floor, file_group_id, 
                    created_by, created_at, updated_at
             FROM m_map
             ORDER BY map_name ASC`
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
 * Get single map by ID
 */
export async function getMapById(mapId: number): Promise<ApiResult<Map>> {
    try {
        const rows = await query<Map>(
            `SELECT map_id, map_name, description, map_floor, file_group_id, 
                    created_by, created_at, updated_at
             FROM m_map
             WHERE map_id = $1`,
            [mapId]
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
 * Get maps by floor
 */
export async function getMapsByFloor(floor: string): Promise<ApiResult<Map[]>> {
    try {
        const data = await query<Map>(
            `SELECT map_id, map_name, description, map_floor, file_group_id, 
                    created_by, created_at, updated_at
             FROM m_map
             WHERE map_floor = $1
             ORDER BY map_name ASC`,
            [floor]
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
 * Count total maps
 */
export async function getMapCount(): Promise<ApiResult<number>> {
    try {
        const rows = await query<{ count: string }>(
            `SELECT COUNT(*) as count FROM m_map`
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
