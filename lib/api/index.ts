// Central export file for all API functions
// Import from here for use in CLIENT COMPONENTS
// For server-side code (API routes, server components), import directly from lib/api/*

// Types - Enums
export type {
    ConnectionType,
    GoalQueueStatus,
    GoalType,
    RobotMode,
} from '@/lib/types/database';

// Types - Data Models
export type {
    Robot,
    DeviceInfo,
    Company,
    Map,
    Goal,
    BatteryRow,
    Position,
    RobotState,
    CommandLog,
    ConnectionLog,
    GoalQueue,
    User,
    Settings,
    DeviceStatus,
    Notification,
    BatteryBuckets,
    DashboardStats,
    ActivityData,
    CreateRobotInput,
    UpdateRobotInput,
    AuthUser,
    SignInResult,
    SignUpResult,
    ApiResult,
    ActivityLog,
    RobotSummary,
    SystemNotification,
    SentimentType,
    NotificationType,
    GroupedRobot,
    GroupedRobotWithStatus,
} from '@/lib/types/database';


// Client-side API functions (call API routes via fetch)
// Safe for use in "use client" components
export {
    // Robot operations
    getRobots,
    getRobotById,
    getRecentRobots,
    createRobot,
    updateRobot,
    deleteRobot,
    getRobotCount,
    // Battery operations
    getBatteryHistory,
    getLatestBatteries,
    getLatestBattery,
    getBatteryStats,
    // Command operations
    getCommandLogs,
    getErrorCount,
    getActivityData,
    // Notification operations
    getNotifications,
    // Auth operations
    signIn,
    signUp,
    signOut,
    getCurrentUser,
    updateUserProfile,
    // Dashboard operations
    getDashboardStats,
    // Device Status operations
    getAllDeviceStatus,
    getDeviceStatus,
    getDevicesByMode,
    getLowBatteryDevices,
    // Position operations
    getPositionHistory,
    getLatestPosition,
    getAllLatestPositions,
    // State operations
    getStateHistory,
    getLatestState,
    getEmergencyDevices,
    countDevicesByMode,
    // Goals operations
    getGoalsByMap,
    getGoalById,
    getGoalQueue,
    getActiveGoalQueues,
    countGoalsByType,
    // Maps operations
    getAllMaps,
    getMapById,
    getMapsByFloor,
    getMapCount,
    // Per-robot summary operations
    getRobotSummary,
    getActiveRobotsWithStatus,
    getInactiveRobots,
    getRobotBatteryStats,
    getRobotErrorCount,
    // Activity log operations
    getActivityLogs,
    getActivitiesBySentiment,
    // System notifications operations
    getSystemNotifications,
    getUnreadNotificationsCount,
    getLowBatteryNotifications,
} from '@/lib/client-api';

// Robot grouping utilities (client-side data transformation)
export {
    extractRobotId,
    normalizeRobotId,
    getDeviceType,
    groupRobots,
    addStatusToGroupedRobots,
    getDeviceIdsFromGroup,
} from '@/lib/utils/robotGrouping';
