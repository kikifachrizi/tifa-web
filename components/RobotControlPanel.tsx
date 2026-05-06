"use client";

import { useState, useEffect, useCallback } from "react";
import TeleopDpad from "@/components/TeleopDpad";
import {
    sendRobotToTable,
    sendRobotToMove,
    getActiveRobotTasks,
    getTaskHistory,
    getAllMaps,
    getAllGoalsForMap,
    markTaskAsDone,
    setActiveMapForDevice,
    sendMapSelectedCommand,
    type Goal,
    type GoalQueue,
    type Map,
    type GroupedRobotWithStatus,
    type SendToTablePayload,
    type SendToMovePayload,
} from "@/lib/api";
import { useLanguage } from "@/components/LanguageProvider";

// ============================================
// TYPES
// ============================================

type ControlStep = "tray" | "table" | "confirm";
type ControlMode = "navigation" | "teleop";


type Props = {
    selectedGroup: GroupedRobotWithStatus;
};

// ============================================
// COMPONENT
// ============================================

import { useRef } from "react";

export default function RobotControlPanel({ selectedGroup }: Props) {
    const { dict } = useLanguage();
    const d = dict.dashboard.control;

    // Mode
    const [controlMode, setControlMode] = useState<ControlMode>("navigation");

    // State
    type TaskItem = { tray: number; goal: Goal };
    const [tasks, setTasks] = useState<TaskItem[]>([]);

    const [selectedTray, setSelectedTray] = useState<number | null>(null);
    const [step, setStep] = useState<ControlStep>("tray");
    const [tables, setTables] = useState<Goal[]>([]);
    const [maps, setMaps] = useState<Map[]>([]);
    const [selectedMapId, setSelectedMapId] = useState<number | null>(null);
    const [activeTasks, setActiveTasks] = useState<GoalQueue[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [isExpanded, setIsExpanded] = useState(true);
    const [historyItems, setHistoryItems] = useState<(GoalQueue & { day_label?: string })[]>([]);
    const [showHistory, setShowHistory] = useState(false);


    const [homeGoals, setHomeGoals] = useState<Goal[]>([]);
    const [chargeGoals, setChargeGoals] = useState<Goal[]>([]);
    const [activeMapIdFromDb, setActiveMapIdFromDb] = useState<number | null>(null);
    const [isSettingMap, setIsSettingMap] = useState(false);
    const [mapDropdownOpen, setMapDropdownOpen] = useState(false);
    const [mapSearch, setMapSearch] = useState('');
    const deviceId = selectedGroup.primaryDeviceId;
    const initialMapLoaded = useRef(false);
    const mapDropdownRef = useRef<HTMLDivElement>(null);

    // Close map dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (mapDropdownRef.current && !mapDropdownRef.current.contains(e.target as Node)) {
                setMapDropdownOpen(false);
            }
        };
        if (mapDropdownOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [mapDropdownOpen]);

    useEffect(() => {
        const loadMaps = async () => {
            const result = await getAllMaps();
            if (result.data && result.data.length > 0) {
                setMaps(result.data);
                // Track the DB active map
                const dbActiveMapId = selectedGroup.rbDevice?.active_map_id ?? selectedGroup.uiDevice?.active_map_id;
                setActiveMapIdFromDb(dbActiveMapId ?? null);
                // Only auto-select map on first load — don't override user's manual selection
                if (!initialMapLoaded.current) {
                    const defaultMap = dbActiveMapId
                        ? result.data.find(m => m.map_id === dbActiveMapId) ?? result.data[0]
                        : result.data[0];
                    setSelectedMapId(defaultMap.map_id);
                    initialMapLoaded.current = true;
                }
            }
        };
        void loadMaps();
    }, [selectedGroup]);

    // Handle setting a map as active (persists to DB)
    const handleSetActiveMap = async (mapId: number) => {
        setIsSettingMap(true);
        try {
            const result = await setActiveMapForDevice(deviceId, mapId);
            if (result.error) {
                setToast({ type: "error", message: result.error });
            } else {
                setActiveMapIdFromDb(mapId);
                setSelectedMapId(mapId);
                setTasks([]);
                setSelectedTray(null);
                setStep("tray");
                setToast({ type: "success", message: d.map_activated });

                // PM Requirement: Send MAP_SELECTED via WebSocket to the robot
                const robotId = selectedGroup.rbDevice?.device_code ?? `RB${selectedGroup.groupId}`;
                void sendMapSelectedCommand({ robot_id: robotId, map_id: mapId }).then((wsRes: { ws: boolean; ws_error?: string }) => {
                    if (wsRes.ws_error) {
                        console.warn('Map saved to DB but WS command failed:', wsRes.ws_error);
                        // Optional: Could show a separate toast warning here if WS fails
                    }
                });
            }
        } catch {
            setToast({ type: "error", message: "Failed to set active map." });
        } finally {
            setIsSettingMap(false);
        }
    };

    // Load table goals when map changes
    useEffect(() => {
        if (!selectedMapId) return;
        const loadTables = async () => {
            const result = await getAllGoalsForMap(selectedMapId);
            if (result.data) {
                const tableGoals = result.data.filter(g => {
                    // Include TABLE and CUSTOM goals as selectable destinations
                    if (g.goal_type !== 'TABLE' && g.goal_type !== 'CUSTOM') return false;
                    // Exclude goals that look like home/charge destinations
                    const name = (g.goal_name ?? '').toLowerCase();
                    if (name.includes('home') || name.includes('jemput') || name.includes('charg')) return false;
                    return true;
                });

                // Smarter fallback: users often map HOME to Charging, and CUSTOM to Homebase
                const homes = result.data.filter(g =>
                    (g.goal_type === 'HOME' && !g.goal_name?.toLowerCase().includes('charg')) ||
                    g.goal_name?.toLowerCase().includes('jemput') ||
                    g.goal_name?.toLowerCase().includes('home')
                );

                const charges = result.data.filter(g =>
                    g.goal_type === 'CHARGE' ||
                    g.goal_name?.toLowerCase().includes('charg') ||
                    (g.goal_type === 'HOME' && g.goal_name?.toLowerCase().includes('charg'))
                );

                const sortedTables = [...tableGoals].sort((a, b) => {
                    const nameA = a.goal_name ?? a.goal_code ?? `Table ${a.goal_id}`;
                    const nameB = b.goal_name ?? b.goal_code ?? `Table ${b.goal_id}`;
                    return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
                });
                setTables(sortedTables);
                setHomeGoals(homes);
                setChargeGoals(charges);
            }
        };
        void loadTables();
    }, [selectedMapId]);

    const prevTasksRef = useRef<GoalQueue[]>([]);

    // Load active tasks
    const loadActiveTasks = useCallback(async () => {
        const result = await getActiveRobotTasks(deviceId);
        if (result.data) {
            const newTasks = result.data;
            const prevTasks = prevTasksRef.current;

            // Subtly check for completed tasks (disappeared from active list)
            if (prevTasks.length > 0) {
                const disappearedIds = prevTasks.filter(p => !newTasks.some(n => n.goal_queue_id === p.goal_queue_id)).map(p => p.goal_queue_id);
                if (disappearedIds.length > 0) {
                    // Check history to see their result status
                    const histResult = await getTaskHistory(deviceId, 1);
                    if (histResult.data) {
                        for (const id of disappearedIds) {
                            const completedTask = histResult.data.find(h => h.goal_queue_id === id);
                            if (completedTask && completedTask.status === 'DONE') {
                                setToast({
                                    type: "success",
                                    message: `Task Successful: Robot has arrived at destination.`
                                });
                            } else if (completedTask && completedTask.status === 'FAILED') {
                                setToast({
                                    type: "error",
                                    message: `Task Failed: Robot could not reach destination.`
                                });
                            }
                        }
                    }
                }
            }

            prevTasksRef.current = newTasks;
            setActiveTasks(newTasks);
        }
    }, [deviceId]);

    useEffect(() => {
        void loadActiveTasks();
        const interval = setInterval(() => void loadActiveTasks(), 10000);
        return () => clearInterval(interval);
    }, [loadActiveTasks]);

    // Load history when toggled on
    useEffect(() => {
        if (!showHistory) return;
        const loadHistory = async () => {
            const result = await getTaskHistory(deviceId, 7);
            if (result.data) setHistoryItems(result.data);
        };
        void loadHistory();
    }, [showHistory, deviceId]);

    // Toast auto-dismiss
    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 4000);
        return () => clearTimeout(timer);
    }, [toast]);

    // Handle send
    const handleSend = async () => {
        if (tasks.length === 0 || !selectedMapId) return;
        setIsSending(true);

        try {
            const payload: SendToTablePayload = {
                device_id: deviceId,
                tasks: tasks.map(t => ({
                    tray: t.tray,
                    goal_id: t.goal.goal_id
                })),
                map_id: selectedMapId,
                robot_id: selectedGroup.rbDevice?.device_code ?? `RB${selectedGroup.groupId}`,
                origin_id: selectedGroup.uiDevice?.device_code ?? `UI_TIFA_${selectedGroup.groupId}`,
                speed: "S", // Default to slow as UI was removed
            };
            const result = await sendRobotToTable(payload);

            if (result.error) {
                setToast({ type: "error", message: result.error });
            } else {
                setToast({
                    type: "success",
                    message: d.success_detail
                        .replace("{table}", tasks.map(t => t.goal.goal_name ?? t.goal.goal_code).join(', '))
                        .replace("{tray}", tasks.map(t => t.tray).join(', ')),
                });
                // Reset selections
                setTasks([]);
                setSelectedTray(null);
                setStep("tray");
                // Refresh active tasks
                void loadActiveTasks();
            }
        } catch {
            setToast({ type: "error", message: d.error });
        } finally {
            setIsSending(false);
        }
    };

    const handleQuickAction = async (goal: Goal, actionName: string) => {
        if (!selectedMapId) return;
        setIsSending(true);
        try {
            const goalType = actionName.toLowerCase().includes('charge') || actionName.toLowerCase().includes('charging')
                ? 'CHARGING' : 'HOMEBASE';

            const payload: SendToMovePayload = {
                device_id: deviceId,
                goal_id: goal.goal_id,
                goal_type: goalType as 'HOMEBASE' | 'CHARGING',
                map_id: selectedMapId,
                robot_id: selectedGroup.rbDevice?.device_code ?? `RB${selectedGroup.groupId}`,
                origin_id: selectedGroup.uiDevice?.device_code ?? `UI_TIFA_${selectedGroup.groupId}`,
            };
            const result = await sendRobotToMove(payload);

            if (result.error) {
                setToast({ type: "error", message: result.error });
            } else {
                setToast({
                    type: "success",
                    message: `Sending robot to ${actionName}...`,
                });
                void loadActiveTasks();
            }
        } catch {
            setToast({ type: "error", message: "Failed to perform action." });
        } finally {
            setIsSending(false);
        }
    };

    const handleMarkDone = async (queueId: number) => {
        try {
            await markTaskAsDone(queueId);
            setToast({ type: "success", message: "Tugas ditandai selesai." });
            loadActiveTasks();
            if (showHistory) {
                const histResult = await getTaskHistory(deviceId, 7);
                if (histResult.data) setHistoryItems(histResult.data);
            }
        } catch {
            setToast({ type: "error", message: "Gagal menandai tugas." });
        }
    };

    // Reset when going back
    const goToStep = (newStep: ControlStep) => {
        if (newStep === "tray") {
            setSelectedTray(null);
        }
        setStep(newStep);
    };

    // Tray icons
    const trayIcons = [
        // Tray 1 (bottom)
        <svg key="tray1" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <rect x="4" y="14" width="16" height="4" rx="1" />
            <path d="M6 14v-2a1 1 0 011-1h10a1 1 0 011 1v2" />
        </svg>,
        // Tray 2 (middle)
        <svg key="tray2" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <rect x="4" y="15" width="16" height="3" rx="1" />
            <rect x="4" y="10" width="16" height="3" rx="1" />
            <path d="M6 10V9a1 1 0 011-1h10a1 1 0 011 1v1" />
        </svg>,
        // Tray 3 (top)
        <svg key="tray3" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <rect x="4" y="16" width="16" height="2.5" rx="1" />
            <rect x="4" y="12" width="16" height="2.5" rx="1" />
            <rect x="4" y="8" width="16" height="2.5" rx="1" />
            <path d="M6 8V7a1 1 0 011-1h10a1 1 0 011 1v1" />
        </svg>,
    ];

    return (
        <div className="glass-panel rounded-2xl relative z-50">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between px-5 py-4 border-b border-border-base hover:bg-white/[0.02] transition-colors rounded-t-2xl"
            >
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-[#0a0a0a] flex items-center justify-center border border-txt-accent shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                        </svg>
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-semibold text-txt-main">{d.title}</p>
                        <p className="text-[11px] text-txt-sec">{d.subtitle}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {activeTasks.length > 0 && (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sidebar border border-amber-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            <span className="text-[10px] font-medium text-txt-main">
                                {activeTasks.length} {d.active_task}
                            </span>
                        </span>
                    )}
                    <svg
                        className={`w-4 h-4 text-txt-sec transition-transform duration-200 ${isExpanded ? "rotate-0" : "-rotate-90"}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {/* Body */}
            {isExpanded && (
                <div className="p-5">
                    {/* Mode Switcher */}
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-sidebar border border-border-base mb-5">
                        <button
                            onClick={() => setControlMode("navigation")}
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${controlMode === "navigation"
                                ? "bg-txt-main text-page border border-txt-accent shadow-md"
                                : "text-txt-sec hover:text-txt-main hover:bg-txt-main/5"
                                }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            {d.mode_nav}
                        </button>
                        <button
                            onClick={() => setControlMode("teleop")}
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${controlMode === "teleop"
                                ? "bg-txt-main text-page border border-txt-accent shadow-md"
                                : "text-txt-sec hover:text-txt-main hover:bg-txt-main/5"
                                }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
                            </svg>
                            {d.mode_teleop}
                        </button>
                    </div>

                    {/* === TELEOP MODE === */}
                    {controlMode === "teleop" && (
                        <TeleopDpad
                            selectedGroup={selectedGroup}
                            onDone={() => setControlMode("navigation")}
                        />
                    )}

                    {/* === NAVIGATION MODE === */}
                    {controlMode === "navigation" && (
                        <>
                            {/* Toast */}
                            {toast && (
                                <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-in slide-in-from-top-2 ${toast.type === "success"
                                    ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-txt-accent border border-emerald-300 dark:border-emerald-500/20"
                                    : "bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-500/20"
                                    }`}>
                                    {toast.type === "success" ? (
                                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    )}
                                    {toast.message}
                                </div>
                            )}

                            {/* Quick Actions */}
                            {(homeGoals.length > 0 || chargeGoals.length > 0) && (
                                <div className="mb-5 grid grid-cols-2 gap-2">
                                    {homeGoals.slice(0, 1).map(home => (
                                        <button
                                            key={`home-${home.goal_id}`}
                                            onClick={() => handleQuickAction(home, 'Homebase')}
                                            disabled={isSending}
                                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-card border border-border-base hover:border-txt-accent transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group"
                                        >
                                            <div className="w-6 h-6 rounded-lg bg-transparent text-txt-main group-hover:text-txt-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                </svg>
                                            </div>
                                            <span className="text-xs font-semibold text-txt-sec group-hover:text-txt-main">Back to Homebase</span>
                                        </button>
                                    ))}
                                    {chargeGoals.slice(0, 1).map(charge => (
                                        <button
                                            key={`charge-${charge.goal_id}`}
                                            onClick={() => handleQuickAction(charge, 'Charging Station')}
                                            disabled={isSending}
                                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-card border border-border-base hover:border-txt-accent transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group"
                                        >
                                            <div className="w-6 h-6 rounded-lg bg-transparent text-txt-main group-hover:text-txt-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                            </div>
                                            <span className="text-xs font-semibold text-txt-sec group-hover:text-txt-main">Charging Station</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Map Selector — Searchable Dropdown */}
                            {maps.length > 0 && (() => {
                                const selectedMap = maps.find(m => m.map_id === selectedMapId);
                                const activeMap = maps.find(m => m.map_id === activeMapIdFromDb);

                                const filteredMaps = maps.filter(m =>
                                    m.map_name.toLowerCase().includes(mapSearch.toLowerCase()) ||
                                    (m.map_floor ?? '').toLowerCase().includes(mapSearch.toLowerCase())
                                );

                                return (
                                    <div className="mb-5" ref={mapDropdownRef}>
                                        <div className="flex items-center justify-between mb-2.5">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-3.5 h-3.5 text-txt-sec" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                                </svg>
                                                <span className="text-[11px] font-medium text-txt-sec uppercase tracking-wider">
                                                    {d.select_map}
                                                </span>
                                            </div>
                                            {activeMap && (
                                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-sidebar border border-txt-accent">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-txt-accent" />
                                                    <span className="text-[9px] font-semibold text-txt-accent uppercase tracking-wider">
                                                        {d.map_active_badge}: {activeMap.map_name}
                                                    </span>
                                                </span>
                                            )}
                                        </div>

                                        {/* Dropdown trigger */}
                                        <div className="relative">
                                            <button
                                                onClick={() => {
                                                    setMapDropdownOpen(!mapDropdownOpen);
                                                    setMapSearch('');
                                                }}
                                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 text-left ${mapDropdownOpen
                                                    ? 'bg-card border-txt-accent shadow-[0_0_15px_rgba(34,211,238,0.15)]'
                                                    : 'bg-sidebar border-border-base hover:border-border-highlight'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedMapId === activeMapIdFromDb ? 'text-txt-accent' : 'text-txt-sec'
                                                        }`}>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                                        </svg>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-txt-main truncate">
                                                            {selectedMap?.map_name ?? 'Select a map...'}
                                                        </p>
                                                        {selectedMap?.map_floor && (
                                                            <p className="text-[10px] text-txt-sec truncate">{selectedMap.map_floor}</p>
                                                        )}
                                                    </div>
                                                    {selectedMapId === activeMapIdFromDb && (
                                                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-txt-accent/10 border border-txt-accent/30 flex-shrink-0">
                                                            <span className="w-1 h-1 rounded-full bg-txt-accent animate-pulse" />
                                                            <span className="text-[8px] font-bold text-txt-accent uppercase">{d.map_active_badge}</span>
                                                        </span>
                                                    )}
                                                </div>
                                                <svg className={`w-4 h-4 text-txt-sec flex-shrink-0 transition-transform duration-200 ${mapDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>

                                            {/* Dropdown panel */}
                                            {mapDropdownOpen && (
                                                <div className="absolute z-50 mt-2 w-full bg-card border border-border-highlight rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                                    {/* Search */}
                                                    <div className="p-3 border-b border-border-base">
                                                        <div className="relative">
                                                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-txt-sec" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                            </svg>
                                                            <input
                                                                type="text"
                                                                value={mapSearch}
                                                                onChange={(e) => setMapSearch(e.target.value)}
                                                                placeholder="Cari map..."
                                                                autoFocus
                                                                className="w-full pl-9 pr-3 py-2 bg-sidebar border border-border-base rounded-lg text-xs text-txt-main placeholder:text-txt-sec/50 focus:outline-none focus:border-txt-accent/50 transition-colors"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Map list */}
                                                    <div className="max-h-[160px] overflow-y-auto custom-scrollbar">
                                                        {filteredMaps.length === 0 ? (
                                                            <div className="px-4 py-6 text-center text-xs text-txt-sec">
                                                                Tidak ada map ditemukan
                                                            </div>
                                                        ) : (
                                                            filteredMaps.map((map) => {
                                                                const isSelected = selectedMapId === map.map_id;
                                                                const isActive = activeMapIdFromDb === map.map_id;
                                                                return (
                                                                    <div
                                                                        key={map.map_id}
                                                                        onClick={() => {
                                                                            if (isSettingMap) return;
                                                                            setSelectedMapId(map.map_id);
                                                                            setTasks([]);
                                                                            setSelectedTray(null);
                                                                            setStep("tray");
                                                                        }}
                                                                        className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-all duration-150 border-b border-border-base/50 last:border-b-0 ${isSelected
                                                                            ? 'bg-txt-accent/10'
                                                                            : 'hover:bg-txt-main/5'
                                                                            }`}
                                                                    >
                                                                        <div className="flex items-center gap-3 min-w-0">
                                                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive ? 'text-txt-accent' : isSelected ? 'text-txt-main' : 'text-txt-sec'
                                                                                }`}>
                                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                                                                </svg>
                                                                            </div>
                                                                            <div className="min-w-0">
                                                                                <p className={`text-xs font-semibold truncate ${isSelected || isActive ? 'text-txt-main' : 'text-txt-sec'}`}>
                                                                                    {map.map_name}
                                                                                </p>
                                                                                {map.map_floor && (
                                                                                    <p className="text-[9px] text-txt-sec/60 truncate">{map.map_floor}</p>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                                            {isActive && (
                                                                                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-txt-accent/10 border border-txt-accent/30">
                                                                                    <span className="w-1 h-1 rounded-full bg-txt-accent animate-pulse" />
                                                                                    <span className="text-[8px] font-bold text-txt-accent uppercase">{d.map_active_badge}</span>
                                                                                </span>
                                                                            )}
                                                                            {isSelected && !isActive && (
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        void handleSetActiveMap(map.map_id);
                                                                                        setMapDropdownOpen(false);
                                                                                    }}
                                                                                    disabled={isSettingMap}
                                                                                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-sidebar border border-border-base hover:border-txt-accent text-white hover:text-txt-accent transition-all disabled:opacity-50"
                                                                                >
                                                                                    {isSettingMap ? (
                                                                                        <svg className="w-2.5 h-2.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                                                        </svg>
                                                                                    ) : (
                                                                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                                                        </svg>
                                                                                    )}
                                                                                    <span className="text-[9px] font-bold uppercase tracking-wider">{d.activate_map}</span>
                                                                                </button>
                                                                            )}
                                                                            {isSelected && (
                                                                                <svg className="w-4 h-4 text-txt-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                                                </svg>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })
                                                        )}
                                                    </div>

                                                    {/* Footer count */}
                                                    <div className="px-4 py-2 border-t border-border-base bg-sidebar/50">
                                                        <span className="text-[10px] text-txt-sec">
                                                            {filteredMaps.length} dari {maps.length} map
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}



                            {/* Step indicator */}
                            <div className="flex items-center gap-2 mb-5">
                                {[
                                    { key: "tray" as ControlStep, label: d.step_tray, num: 1 },
                                    { key: "table" as ControlStep, label: d.step_table, num: 2 },
                                    { key: "confirm" as ControlStep, label: d.step_confirm, num: 3 },
                                ].map((s, i) => {
                                    const isActive = step === s.key;
                                    const isDone = (s.key === "tray" && step !== "tray")
                                        || (s.key === "table" && tasks.length > 0 && step === "confirm");
                                    return (
                                        <div key={s.key} className="flex items-center gap-2 flex-1">
                                            {i > 0 && (
                                                <div className={`flex-shrink-0 w-6 h-[1px] ${isDone || isActive ? "bg-txt-accent/50" : "bg-border-base"}`} />
                                            )}
                                            <button
                                                onClick={() => {
                                                    if (s.key === "tray") goToStep("tray");
                                                    else if (s.key === "table" && selectedTray !== null) goToStep("table");
                                                    else if (s.key === "confirm" && tasks.length > 0) goToStep("confirm");
                                                }}
                                                disabled={s.key === "confirm" && tasks.length === 0}
                                                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all flex-shrink-0 border ${isActive
                                                    ? "bg-txt-accent text-[#171717] border-txt-accent shadow-[0_0_12px_rgba(3,230,228,0.35)]"
                                                    : isDone
                                                        ? "bg-txt-accent/10 text-txt-accent border-txt-accent/30"
                                                        : "bg-sidebar text-txt-sec border-border-base"
                                                    }`}
                                            >
                                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isActive
                                                    ? "bg-[#171717]/20 text-[#171717]"
                                                    : isDone
                                                        ? "bg-txt-accent/20 text-txt-accent"
                                                        : "bg-sidebar text-txt-sec"
                                                    }`}>
                                                    {isDone ? "✓" : s.num}
                                                </span>
                                                {s.label}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* STEP 1: Tray Selection */}
                            {step === "tray" && (
                                <div>
                                    <p className="text-xs text-txt-sec mb-3">{d.select_tray_desc}</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[1, 2, 3].map((tray) => {
                                            const existingTask = tasks.find(t => t.tray === tray);
                                            const isSelected = selectedTray === tray;
                                            const isAssigned = !!existingTask;

                                            return (
                                                <div
                                                    role="button"
                                                    tabIndex={0}
                                                    key={tray}
                                                    onClick={() => {
                                                        setSelectedTray(tray);
                                                        setStep("table");
                                                    }}
                                                    className={`group relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${isSelected
                                                        ? "bg-txt-accent border-txt-accent shadow-[0_0_20px_rgba(3,230,228,0.25)]"
                                                        : isAssigned
                                                            ? "bg-txt-accent/10 border-txt-accent/30 hover:border-txt-accent/60"
                                                            : "bg-sidebar border-border-base hover:border-txt-accent/40 hover:bg-txt-accent/5"
                                                        }`}
                                                >
                                                    <div className={`p-2.5 rounded-lg transition-colors ${isSelected
                                                        ? "bg-[#171717]/20 text-[#171717]"
                                                        : isAssigned
                                                            ? "bg-txt-accent/20 text-txt-accent"
                                                            : "bg-txt-main/5 text-txt-sec group-hover:text-txt-accent"
                                                        }`}>
                                                        {trayIcons[tray - 1]}
                                                    </div>
                                                    <div className="text-center">
                                                        <p className={`text-sm font-semibold ${isSelected ? "text-[#171717]" : isAssigned ? "text-txt-accent" : "text-txt-main"}`}>
                                                            {d.tray} {tray}
                                                        </p>
                                                        <p className={`text-[10px] mt-0.5 ${isSelected ? "text-[#171717]/70" : "text-txt-sec"}`}>
                                                            {isAssigned ? existingTask.goal.goal_name ?? existingTask.goal.goal_code : tray === 1 ? d.tray_bottom : tray === 2 ? d.tray_middle : d.tray_top}
                                                        </p>
                                                    </div>
                                                    {(isSelected || isAssigned) && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setTasks(prev => prev.filter(t => t.tray !== tray));
                                                                if (selectedTray === tray) {
                                                                    setSelectedTray(null);
                                                                }
                                                            }}
                                                            className="absolute top-2 right-2 z-10 p-1 group/cancel outline-none"
                                                            title="Batal Pilih Nampan"
                                                        >
                                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${isSelected ? "bg-[#171717]/20 hover:bg-rose-500 hover:shadow-md hover:scale-110" : "bg-txt-accent/20 hover:bg-rose-500 hover:shadow-md hover:scale-110"}`}>
                                                                <svg className={`w-3 h-3 transition-colors block group-hover/cancel:hidden ${isSelected ? "text-[#171717]" : "text-txt-accent"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                                <svg className="w-3 h-3 transition-colors hidden group-hover/cancel:block text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </div>
                                                        </button>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: Table Selection */}
                            {step === "table" && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-xs text-txt-sec">{d.select_table_desc}</p>
                                        <button
                                            onClick={() => goToStep("tray")}
                                            className="text-[11px] text-txt-accent hover:text-txt-accent/70 transition-colors font-medium"
                                        >
                                            ← {d.back}
                                        </button>
                                    </div>

                                    {/* Selected tray badge */}
                                    <div className="mb-3 flex items-center justify-between">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-txt-accent/10 border border-txt-accent/20 text-[11px] font-medium text-txt-accent transition-all">
                                            {trayIcons[selectedTray! - 1]}
                                            {d.tray} {selectedTray}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setTasks(prev => prev.filter(t => t.tray !== selectedTray));
                                                    setSelectedTray(null);
                                                    goToStep("tray");
                                                }}
                                                className="ml-1 p-0.5 hover:bg-rose-500 hover:text-white rounded-full transition-colors outline-none"
                                                title="Batal Nampan"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </span>
                                        {tasks.some(t => t.tray === selectedTray) && (
                                            <button
                                                onClick={() => setStep("confirm")}
                                                className="px-3 py-1.5 bg-txt-accent text-[#171717] border border-txt-accent rounded-lg text-xs font-semibold hover:bg-txt-accent/90 transition-all shadow-[0_0_12px_rgba(3,230,228,0.2)] flex items-center gap-1.5"
                                            >
                                                Review Selection
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>

                                    {tables.length === 0 ? (
                                        <div className="text-center py-8">
                                            <svg className="w-12 h-12 text-txt-sec/30 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                            <p className="text-sm text-txt-sec">{d.no_tables}</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                            {tables.map((table) => {
                                                const isSelected = tasks.some(t => t.tray === selectedTray && t.goal.goal_id === table.goal_id);
                                                return (
                                                    <button
                                                        key={table.goal_id}
                                                        onClick={() => {
                                                            setTasks(prev => {
                                                                const exists = prev.some(t => t.tray === selectedTray && t.goal.goal_id === table.goal_id);
                                                                if (exists) {
                                                                    return prev.filter(t => !(t.tray === selectedTray && t.goal.goal_id === table.goal_id));
                                                                } else {
                                                                    return [...prev, { tray: selectedTray!, goal: table }];
                                                                }
                                                            });
                                                        }}
                                                        className={`group relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200 ${isSelected ? "border-txt-accent bg-txt-accent shadow-[0_0_15px_rgba(3,230,228,0.25)]" : "border-border-base bg-sidebar hover:border-txt-accent/40 hover:bg-txt-accent/5"}`}
                                                    >
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isSelected ? "bg-[#171717]/20" : "bg-txt-accent/5 group-hover:bg-txt-accent/10"}`}>
                                                            <svg className={`w-5 h-5 ${isSelected ? "text-[#171717]" : "text-txt-accent"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 6v12a2 2 0 002 2h12a2 2 0 002-2V6M9 6V4a2 2 0 012-2h2a2 2 0 012 2v2" />
                                                            </svg>
                                                        </div>
                                                        <span className={`text-xs font-medium w-full text-center line-clamp-2 ${isSelected ? "text-[#171717]" : "text-txt-main group-hover:text-txt-accent"}`}>
                                                            {table.goal_name ?? table.goal_code ?? `Table ${table.goal_id}`}
                                                        </span>
                                                        {isSelected && (
                                                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-card rounded-full border-2 border-txt-accent flex items-center justify-center">
                                                                <svg className="w-3 h-3 text-txt-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* STEP 3: Confirmation */}
                            {step === "confirm" && tasks.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-xs text-txt-sec">{d.confirm_desc}</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => goToStep("table")}
                                                className="text-[11px] text-txt-accent hover:text-blue-700 dark:text-blue-400 transition-colors font-medium"
                                            >
                                                ← {d.back}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedTray(null);
                                                    setStep("tray");
                                                }}
                                                className="text-[11px] px-2 py-1 bg-txt-main/10 text-txt-main rounded hover:bg-txt-main/20 transition-colors font-medium border border-txt-main/20"
                                            >
                                                + Add Tray
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirmation cards */}
                                    <div className="space-y-2 mb-4 max-h-[300px] overflow-y-auto pr-1">
                                        {tasks.map((task, idx) => (
                                            <div key={`${task.tray}-${task.goal.goal_id}-${idx}`} className="bg-sidebar rounded-xl border border-accent/20 dark:border-neutral-700 shadow-sm p-4 border-l-[3px] border-l-accent dark:border-l-neutral-500 dark:bg-neutral-800/60">
                                                <div className="flex items-center gap-4">
                                                    {/* Robot */}
                                                    <div className="flex flex-col items-center gap-1.5">
                                                        <div className="w-10 h-10 rounded-xl bg-accent/10 dark:bg-neutral-700/60 flex items-center justify-center border border-accent/20 dark:border-neutral-600">
                                                            <svg className="w-5 h-5 text-accent dark:text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                                            </svg>
                                                        </div>
                                                        <span className="text-[9px] text-txt-sec dark:text-neutral-400 font-medium">{selectedGroup.displayName}</span>
                                                    </div>

                                                    {/* Arrow */}
                                                    <div className="flex-1 flex flex-col items-center justify-center">
                                                        <p className="text-[10px] text-accent dark:text-neutral-300 font-semibold mb-1">{d.tray} {task.tray}</p>
                                                        <div className="flex items-center gap-1 w-full justify-center">
                                                            <div className="h-[1px] w-full max-w-[40px] bg-accent/30 dark:bg-neutral-600" />
                                                            <svg className="w-4 h-4 text-accent dark:text-neutral-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                            </svg>
                                                        </div>
                                                    </div>

                                                    {/* Table */}
                                                    <div className="flex flex-col items-center gap-1.5">
                                                        <div className="w-10 h-10 rounded-xl bg-accent/10 dark:bg-neutral-700/60 flex items-center justify-center border border-accent/20 dark:border-neutral-600">
                                                            <svg className="w-5 h-5 text-accent dark:text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 6v12a2 2 0 002 2h12a2 2 0 002-2V6M9 6V4a2 2 0 012-2h2a2 2 0 012 2v2" />
                                                            </svg>
                                                        </div>
                                                        <span className="text-[9px] text-txt-sec dark:text-neutral-400 font-medium max-w-[60px] truncate text-center">
                                                            {task.goal.goal_name ?? task.goal.goal_code}
                                                        </span>
                                                    </div>

                                                    {/* Delete btn */}
                                                    <button
                                                        onClick={() => {
                                                            setTasks(prev => prev.filter(t => !(t.tray === task.tray && t.goal.goal_id === task.goal.goal_id)));
                                                            if (tasks.length === 1) {
                                                                setStep("tray");
                                                                setSelectedTray(null);
                                                            }
                                                        }}
                                                        className="p-1.5 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500/20 transition-colors dark:bg-neutral-700/50 dark:text-neutral-400 dark:hover:bg-rose-500/20 dark:hover:text-rose-400"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Send button */}
                                    <button
                                        onClick={handleSend}
                                        disabled={isSending}
                                        className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${isSending
                                            ? "bg-accent/20 dark:bg-neutral-700/50 text-accent/50 dark:text-neutral-500 cursor-not-allowed border border-accent/10 dark:border-neutral-700"
                                            : "bg-accent dark:bg-neutral-800 text-[#171717] hover:bg-accent/90 dark:hover:bg-white shadow-[0_0_20px_rgba(3,230,228,0.25)] border border-accent/50 dark:border-neutral-600 active:scale-[0.98]"
                                            }`}
                                    >
                                        {isSending ? (
                                            <>
                                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                {d.sending}
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                </svg>
                                                {d.send}
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Active Tasks Section (today only) */}
                            {activeTasks.length > 0 && (
                                <div className="mt-5 pt-4 border-t border-border-base">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-[11px] font-medium text-txt-sec uppercase tracking-wider">
                                            {d.active_tasks_title}
                                        </p>
                                        <span className="text-[10px] text-txt-sec/60 italic">{d.auto_reset_note}</span>
                                    </div>
                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                        {activeTasks.map((task) => {
                                            const taskPayload = task.payload as Record<string, unknown> | null;
                                            const goalName = (taskPayload?.goal_name as string) ?? task.queue_code;
                                            const trayNum = taskPayload?.tray as number;
                                            return (
                                                <div
                                                    key={task.goal_queue_id}
                                                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-sidebar border border-border-base"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${task.status === "IN_PROGRESS" ? "bg-amber-500 animate-pulse" : "bg-accent"}`} />
                                                        <span className="text-xs text-txt-main font-medium">{goalName}</span>
                                                        {trayNum && (
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent font-mono">
                                                                T{trayNum}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${task.status === "IN_PROGRESS"
                                                            ? "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/20"
                                                            : "bg-accent/10 text-accent border border-accent/20"
                                                            }`}>
                                                            {task.status}
                                                        </span>
                                                        <button
                                                            onClick={() => handleMarkDone(task.goal_queue_id)}
                                                            className="w-5 h-5 flex items-center justify-center rounded bg-accent/10 text-accent hover:bg-accent/20 transition-colors tooltip-trigger"
                                                            title="Tandai Selesai (Manual)"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* History Toggle Button */}
                            <div className={`${activeTasks.length > 0 ? 'mt-3' : 'mt-5 pt-4 border-t border-border-base'}`}>
                                <button
                                    onClick={() => setShowHistory(!showHistory)}
                                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-medium text-txt-sec hover:text-txt-main hover:bg-white/[0.03] border border-border-base transition-all"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {showHistory ? d.history_hide : d.history_show}
                                    <svg className={`w-3 h-3 transition-transform ${showHistory ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </div>

                            {/* Task History Section */}
                            {showHistory && (
                                <div className="mt-3">
                                    <p className="text-[11px] font-medium text-txt-sec uppercase tracking-wider mb-2">
                                        {d.history_title}
                                    </p>
                                    {historyItems.length === 0 ? (
                                        <div className="flex items-center justify-center py-6 text-txt-sec/50">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-xs">{d.history_empty}</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                                            {(() => {
                                                const today = new Date().toISOString().split('T')[0];
                                                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                                                let currentDay = '';

                                                return historyItems.map((item) => {
                                                    const dayLabel = item.day_label ?? item.created_at?.split('T')[0] ?? '';
                                                    const showDayHeader = dayLabel !== currentDay;
                                                    if (showDayHeader) currentDay = dayLabel;

                                                    const taskPayload = item.payload as Record<string, unknown> | null;
                                                    const trayTasks = (taskPayload?.data as Record<string, unknown>)?.tray_tasks as Array<Record<string, unknown>> | undefined;
                                                    const goalName = trayTasks?.[0]?.goal_id
                                                        ? `Table (Goal ${trayTasks[0].goal_id})`
                                                        : item.queue_code;
                                                    const trayNum = trayTasks?.[0]?.tray as number | undefined;
                                                    const createdTime = item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

                                                    const statusConfig = {
                                                        DONE: { label: d.status_done, color: 'bg-accent/10 text-accent border-accent/20' },
                                                        FAILED: { label: d.status_failed, color: 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/20' },
                                                        CANCELLED: { label: d.status_cancelled, color: 'bg-sidebar border-border-base text-txt-sec' },
                                                    } as Record<string, { label: string; color: string }>;
                                                    const status = statusConfig[item.status] ?? { label: item.status, color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };

                                                    return (
                                                        <div key={item.goal_queue_id}>
                                                            {showDayHeader && (
                                                                <div className="flex items-center gap-2 mb-2 mt-1">
                                                                    <div className="h-[1px] flex-1 bg-border-base" />
                                                                    <span className="text-[10px] font-semibold text-txt-sec uppercase tracking-wider px-2">
                                                                        {dayLabel === today ? d.today : dayLabel === yesterday ? d.yesterday : dayLabel}
                                                                    </span>
                                                                    <div className="h-[1px] flex-1 bg-border-base" />
                                                                </div>
                                                            )}
                                                            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-sidebar/50 border border-border-base">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'DONE' ? 'bg-accent' :
                                                                        item.status === 'FAILED' ? 'bg-rose-500' : 'bg-txt-sec/50'
                                                                        }`} />
                                                                    <span className="text-xs text-txt-main/70 font-medium">{goalName}</span>
                                                                    {trayNum && (
                                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/5 text-accent/80 font-mono">
                                                                            T{trayNum}
                                                                        </span>
                                                                    )}
                                                                    <span className="text-[10px] text-txt-sec/40">{createdTime}</span>
                                                                </div>
                                                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${status.color}`}>
                                                                    {status.label}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>)}
                </div>
            )}
        </div>
    );
}



