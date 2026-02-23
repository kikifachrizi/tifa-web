// Client-side API wrapper functions
// These functions call the Next.js API routes instead of accessing the database directly
// Safe to use in client components ("use client")

import type {
    Robot,
    DeviceInfo,
    DashboardStats,
    CommandLog,
    DeviceStatus,
    BatteryRow,
    BatteryBuckets,
    Position,
    RobotState,
    RobotMode,
    Goal,
    GoalQueue,
    Map,
    ActivityData,
    AuthUser,
    SignInResult,
    SignUpResult,
    CreateRobotInput,
    UpdateRobotInput,
    ApiResult,
    ActivityLog,
    RobotSummary,
    SystemNotification,
    SentimentType
} from '@/lib/types/database';


const BASE_URL = '/api';

// ============================================
// ROBOT OPERATIONS
// ============================================

export async function getRobots(search?: string): Promise<ApiResult<Robot[]>> {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    const res = await fetch(`${BASE_URL}/robots?${params}`);
    return res.json();
}

export async function getRobotById(id: number): Promise<ApiResult<DeviceInfo>> {
    const res = await fetch(`${BASE_URL}/robots/${id}`);
    return res.json();
}

export async function getRecentRobots(limit: number = 5): Promise<ApiResult<Robot[]>> {
    const res = await fetch(`${BASE_URL}/robots?action=recent&limit=${limit}`);
    return res.json();
}

export async function getRobotCount(): Promise<ApiResult<number>> {
    const res = await fetch(`${BASE_URL}/robots?action=count`);
    return res.json();
}

export async function createRobot(input: CreateRobotInput): Promise<ApiResult<{ device_id: number }>> {
    const res = await fetch(`${BASE_URL}/robots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });
    return res.json();
}

export async function updateRobot(id: number, input: UpdateRobotInput): Promise<ApiResult<null>> {
    const res = await fetch(`${BASE_URL}/robots/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });
    return res.json();
}

export async function deleteRobot(id: number): Promise<ApiResult<null>> {
    const res = await fetch(`${BASE_URL}/robots/${id}`, {
        method: 'DELETE',
    });
    return res.json();
}

// ============================================
// DASHBOARD OPERATIONS
// ============================================

export async function getDashboardStats(): Promise<ApiResult<DashboardStats>> {
    const res = await fetch(`${BASE_URL}/dashboard`);
    return res.json();
}

// ============================================
// NOTIFICATION OPERATIONS
// ============================================

export async function getNotifications(filter?: string): Promise<ApiResult<CommandLog[]>> {
    const params = new URLSearchParams();
    if (filter) params.set('filter', filter);
    const res = await fetch(`${BASE_URL}/notifications?${params}`);
    return res.json();
}

// ============================================
// DEVICE STATUS OPERATIONS
// ============================================

export async function getAllDeviceStatus(): Promise<ApiResult<DeviceStatus[]>> {
    const res = await fetch(`${BASE_URL}/device-status`);
    return res.json();
}

export async function getDeviceStatus(deviceId: number): Promise<ApiResult<DeviceStatus>> {
    const res = await fetch(`${BASE_URL}/device-status/${deviceId}`);
    return res.json();
}

export async function getDevicesByMode(mode: string): Promise<ApiResult<DeviceStatus[]>> {
    const res = await fetch(`${BASE_URL}/device-status?action=by-mode&mode=${mode}`);
    return res.json();
}

export async function getLowBatteryDevices(): Promise<ApiResult<DeviceStatus[]>> {
    const res = await fetch(`${BASE_URL}/device-status?action=low-battery`);
    return res.json();
}

// ============================================
// BATTERY OPERATIONS
// ============================================

export async function getBatteryHistory(deviceId: number, limit: number = 50): Promise<ApiResult<BatteryRow[]>> {
    const res = await fetch(`${BASE_URL}/battery?action=history&deviceId=${deviceId}&limit=${limit}`);
    return res.json();
}

export async function getLatestBatteries(limit: number = 200): Promise<ApiResult<BatteryRow[]>> {
    const res = await fetch(`${BASE_URL}/battery?limit=${limit}`);
    return res.json();
}

export async function getLatestBattery(deviceId: number): Promise<ApiResult<BatteryRow>> {
    const res = await fetch(`${BASE_URL}/battery?action=history&deviceId=${deviceId}&limit=1`);
    const result = await res.json();
    return { data: result.data?.[0] ?? null, error: result.error };
}

export async function getBatteryStats(): Promise<ApiResult<{ avgBattery: number | null; buckets: BatteryBuckets }>> {
    const res = await fetch(`${BASE_URL}/battery?action=stats`);
    return res.json();
}

// ============================================
// COMMAND OPERATIONS
// ============================================

export async function getCommandLogs(limit: number = 5, deviceId?: number): Promise<ApiResult<CommandLog[]>> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (deviceId !== undefined) params.set('deviceId', deviceId.toString());
    const res = await fetch(`${BASE_URL}/commands?${params}`);
    return res.json();
}

export async function getErrorCount(): Promise<ApiResult<number>> {
    const res = await fetch(`${BASE_URL}/commands?action=error-count`);
    return res.json();
}

export async function getActivityData(deviceId: number): Promise<ApiResult<ActivityData[]>> {
    const res = await fetch(`${BASE_URL}/commands?action=activity&deviceId=${deviceId}`);
    return res.json();
}

// ============================================
// POSITION OPERATIONS
// ============================================

export async function getPositionHistory(deviceId: number, limit: number = 100): Promise<ApiResult<Position[]>> {
    const res = await fetch(`${BASE_URL}/position?action=history&deviceId=${deviceId}&limit=${limit}`);
    return res.json();
}

export async function getLatestPosition(deviceId: number): Promise<ApiResult<Position>> {
    const res = await fetch(`${BASE_URL}/position?action=latest&deviceId=${deviceId}`);
    return res.json();
}

export async function getAllLatestPositions(): Promise<ApiResult<Position[]>> {
    const res = await fetch(`${BASE_URL}/position?action=all-latest`);
    return res.json();
}

// ============================================
// STATE OPERATIONS
// ============================================

export async function getStateHistory(deviceId: number, limit: number = 50): Promise<ApiResult<RobotState[]>> {
    const res = await fetch(`${BASE_URL}/state?action=history&deviceId=${deviceId}&limit=${limit}`);
    return res.json();
}

export async function getLatestState(deviceId: number): Promise<ApiResult<RobotState>> {
    const res = await fetch(`${BASE_URL}/state?action=latest&deviceId=${deviceId}`);
    return res.json();
}

export async function getEmergencyDevices(): Promise<ApiResult<RobotState[]>> {
    const res = await fetch(`${BASE_URL}/state?action=emergency`);
    return res.json();
}

export async function countDevicesByMode(): Promise<ApiResult<Record<RobotMode, number>>> {
    const res = await fetch(`${BASE_URL}/state?action=count-by-mode`);
    return res.json();
}

// ============================================
// GOAL OPERATIONS
// ============================================

export async function getGoalsByMap(mapId: number): Promise<ApiResult<Goal[]>> {
    const res = await fetch(`${BASE_URL}/goals?action=by-map&mapId=${mapId}`);
    return res.json();
}

export async function getGoalById(goalId: number): Promise<ApiResult<Goal>> {
    const res = await fetch(`${BASE_URL}/goals/${goalId}`);
    return res.json();
}

export async function getGoalQueue(deviceId: number): Promise<ApiResult<GoalQueue[]>> {
    const res = await fetch(`${BASE_URL}/goals?action=queue&deviceId=${deviceId}`);
    return res.json();
}

export async function getActiveGoalQueues(): Promise<ApiResult<GoalQueue[]>> {
    const res = await fetch(`${BASE_URL}/goals?action=active-queues`);
    return res.json();
}

export async function countGoalsByType(): Promise<ApiResult<Record<string, number>>> {
    const res = await fetch(`${BASE_URL}/goals?action=count-by-type`);
    return res.json();
}

// ============================================
// MAP OPERATIONS
// ============================================

export async function getAllMaps(): Promise<ApiResult<Map[]>> {
    const res = await fetch(`${BASE_URL}/maps`);
    return res.json();
}

export async function getMapById(mapId: number): Promise<ApiResult<Map>> {
    const res = await fetch(`${BASE_URL}/maps/${mapId}`);
    return res.json();
}

export async function getMapsByFloor(floor: string): Promise<ApiResult<Map[]>> {
    const res = await fetch(`${BASE_URL}/maps?action=by-floor&floor=${floor}`);
    return res.json();
}

export async function getMapCount(): Promise<ApiResult<number>> {
    const res = await fetch(`${BASE_URL}/maps?action=count`);
    return res.json();
}

// ============================================
// AUTH OPERATIONS
// ============================================

export async function signIn(email: string, password: string): Promise<SignInResult> {
    const res = await fetch(`${BASE_URL}/auth?action=signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    return res.json();
}

export async function signUp(email: string, password: string, role: 'admin' | 'operator'): Promise<SignUpResult> {
    const res = await fetch(`${BASE_URL}/auth?action=signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
    });
    return res.json();
}

export async function signOut(): Promise<ApiResult<null>> {
    const res = await fetch(`${BASE_URL}/auth?action=signout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
    });
    return res.json();
}

export async function getCurrentUser(): Promise<ApiResult<AuthUser | null>> {
    const res = await fetch(`${BASE_URL}/auth`);
    return res.json();
}

export async function updateUserProfile(data: { email?: string; password?: string }): Promise<ApiResult<null>> {
    const res = await fetch(`${BASE_URL}/auth?action=update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res.json();
}

// ============================================
// PER-ROBOT SUMMARY OPERATIONS
// ============================================

export async function getRobotSummary(deviceId: number): Promise<ApiResult<RobotSummary>> {
    const res = await fetch(`${BASE_URL}/dashboard?action=robot-summary&deviceId=${deviceId}`);
    return res.json();
}

export async function getActiveRobotsWithStatus(): Promise<ApiResult<DeviceStatus[]>> {
    const res = await fetch(`${BASE_URL}/device-status?action=active`);
    return res.json();
}

export async function getInactiveRobots(): Promise<ApiResult<DeviceStatus[]>> {
    const res = await fetch(`${BASE_URL}/device-status?action=inactive`);
    return res.json();
}

export async function getRobotBatteryStats(deviceId: number): Promise<ApiResult<{ avgBattery: number | null; buckets: BatteryBuckets }>> {
    const res = await fetch(`${BASE_URL}/battery?action=robot-stats&deviceId=${deviceId}`);
    return res.json();
}

export async function getRobotErrorCount(deviceId: number): Promise<ApiResult<number>> {
    const res = await fetch(`${BASE_URL}/commands?action=robot-error-count&deviceId=${deviceId}`);
    return res.json();
}

// ============================================
// ACTIVITY LOG OPERATIONS
// ============================================

export async function getActivityLogs(limit: number = 50, deviceId?: number): Promise<ApiResult<ActivityLog[]>> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (deviceId !== undefined) params.set('deviceId', deviceId.toString());
    const res = await fetch(`${BASE_URL}/commands?action=activity-logs&${params}`);
    return res.json();
}

export async function getActivitiesBySentiment(sentiment: SentimentType, limit: number = 50): Promise<ApiResult<ActivityLog[]>> {
    const res = await fetch(`${BASE_URL}/commands?action=activity-logs&sentiment=${sentiment}&limit=${limit}`);
    return res.json();
}

// ============================================
// SYSTEM NOTIFICATIONS OPERATIONS
// ============================================

export async function getSystemNotifications(limit: number = 20): Promise<ApiResult<SystemNotification[]>> {
    const res = await fetch(`${BASE_URL}/notifications?action=system&limit=${limit}`);
    return res.json();
}

export async function getUnreadNotificationsCount(): Promise<ApiResult<number>> {
    const res = await fetch(`${BASE_URL}/notifications?action=unread-count`);
    return res.json();
}

export async function getLowBatteryNotifications(): Promise<ApiResult<SystemNotification[]>> {
    const res = await fetch(`${BASE_URL}/notifications?action=low-battery`);
    return res.json();
}
