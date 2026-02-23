"use client";

import Link from "next/link";
import {
  getDashboardStats,
  getAllDeviceStatus,
  getRobots,
  getRobotBatteryStats,
  getRobotErrorCount,
  getCommandLogs,
  groupRobots,
  addStatusToGroupedRobots,
  type Robot,
  type CommandLog,
  type BatteryBuckets,
  type DeviceStatus,
  type GroupedRobotWithStatus
} from "@/lib/api";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import NotificationBell from "@/components/NotificationBell";
import RobotSelectorModal from "@/components/RobotSelectorModal";

export default function DashboardHomePage() {
  const { dict } = useLanguage();

  // Robot selection state - now uses grouped robots
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupedRobots, setGroupedRobots] = useState<GroupedRobotWithStatus[]>([]);
  const [activeGroups, setActiveGroups] = useState<GroupedRobotWithStatus[]>([]);
  const [inactiveGroups, setInactiveGroups] = useState<GroupedRobotWithStatus[]>([]);

  // Stats state (for selected robot or all)
  const [robotCount, setRobotCount] = useState<number | null>(null);
  const [avgBattery, setAvgBattery] = useState<number | null>(null);
  const [errorCount, setErrorCount] = useState<number | null>(null);
  const [latestCommands, setLatestCommands] = useState<CommandLog[]>([]);
  const [recentRobots, setRecentRobots] = useState<Robot[]>([]);
  const [batteryBuckets, setBatteryBuckets] = useState<BatteryBuckets>({
    critical: 0,
    warning: 0,
    healthy: 0,
  });

  // Load all devices and group them
  useEffect(() => {
    const loadGroupedRobots = async () => {
      const [robotsResult, statusResult] = await Promise.all([
        getRobots(),
        getAllDeviceStatus(),
      ]);

      if (robotsResult.data && statusResult.data) {
        // Create status map
        const statusMap = new Map<number, DeviceStatus>();
        statusResult.data.forEach(status => {
          statusMap.set(status.device_id, status);
        });

        // Group robots and add status
        const grouped = groupRobots(robotsResult.data);
        const groupedWithStatus = addStatusToGroupedRobots(grouped, statusMap);

        setGroupedRobots(groupedWithStatus);
        setActiveGroups(groupedWithStatus.filter(g => g.isOnline));
        setInactiveGroups(groupedWithStatus.filter(g => !g.isOnline));
      }
    };

    void loadGroupedRobots();
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      void loadGroupedRobots();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Get selected group
  const selectedGroup = selectedGroupId !== null
    ? groupedRobots.find(g => g.groupId === selectedGroupId)
    : null;

  // Load stats based on selected robot group
  useEffect(() => {
    const loadStats = async () => {
      if (selectedGroup) {
        // Load per-robot stats using primary device
        const deviceId = selectedGroup.primaryDeviceId;
        const [batteryStatsResult, errorCountResult, commandsResult] = await Promise.all([
          getRobotBatteryStats(deviceId),
          getRobotErrorCount(deviceId),
          getCommandLogs(5, deviceId),
        ]);

        setAvgBattery(batteryStatsResult.data?.avgBattery ?? null);
        setBatteryBuckets(batteryStatsResult.data?.buckets ?? { critical: 0, warning: 0, healthy: 0 });
        setErrorCount(errorCountResult.data ?? 0);
        setLatestCommands(commandsResult.data ?? []);
      } else {
        // Load all stats
        const { data: stats } = await getDashboardStats();

        if (stats) {
          setRobotCount(stats.robotCount);
          setAvgBattery(stats.avgBattery);
          setErrorCount(stats.errorCount);
          setBatteryBuckets(stats.batteryBuckets);
          setLatestCommands(stats.latestCommands);
          setRecentRobots(stats.recentRobots);
        }
      }
    };

    void loadStats();
  }, [selectedGroup]);

  const totalSamples =
    batteryBuckets.critical + batteryBuckets.warning + batteryBuckets.healthy;

  const criticalPct =
    totalSamples === 0
      ? 0
      : Math.round((batteryBuckets.critical / totalSamples) * 100);
  const warningPct =
    totalSamples === 0
      ? 0
      : Math.round((batteryBuckets.warning / totalSamples) * 100);
  const healthyPct =
    totalSamples === 0
      ? 0
      : Math.round((batteryBuckets.healthy / totalSamples) * 100);

  return (
    <div className="space-y-6">
      {/* Header with Robot Selector and Notification Bell */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-txt-main tracking-tight">
            {dict.dashboard.home.title}
          </h1>
          <p className="text-sm text-txt-sec">
            {dict.dashboard.home.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* New Robot Selector Modal */}
          <RobotSelectorModal
            selectedGroupId={selectedGroupId}
            groupedRobots={groupedRobots}
            activeCount={activeGroups.length}
            onSelect={setSelectedGroupId}
            allRobotsLabel={dict.dashboard.home.all_robots}
            selectRobotLabel={dict.dashboard.home.select_robot}
            activeCountLabel={dict.dashboard.home.active_count}
          />

          {/* Notification Bell */}
          <NotificationBell />
        </div>
      </div>

      {/* Selected Robot Info Banner */}
      {selectedGroup && (
        <div className="glass-panel rounded-xl p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-900/20 flex items-center justify-center border border-blue-800/30">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-txt-main">{dict.dashboard.home.robot_detail}: {selectedGroup.displayName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {selectedGroup.rbDevice && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono">
                      {selectedGroup.rbDevice.device_code}
                    </span>
                  )}
                  {selectedGroup.uiDevice && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono">
                      {selectedGroup.uiDevice.device_code}
                    </span>
                  )}
                  <span className="text-[10px] text-txt-sec">• {selectedGroup.mode || 'UNKNOWN'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {selectedGroup.battery !== null && (
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${selectedGroup.battery <= 30 ? 'bg-rose-500/10 border border-rose-500/20' :
                  selectedGroup.battery <= 60 ? 'bg-amber-500/10 border border-amber-500/20' :
                    'bg-emerald-500/10 border border-emerald-500/20'
                  }`}>
                  <svg className={`w-4 h-4 ${selectedGroup.battery <= 30 ? 'text-rose-500' :
                    selectedGroup.battery <= 60 ? 'text-amber-500' :
                      'text-emerald-500'
                    }`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 4h-3V2h-4v2H7v18h10V4zm-2 14H9V6h6v12z" />
                  </svg>
                  <span className="text-sm font-semibold text-txt-main">{selectedGroup.battery}%</span>
                </div>
              )}
              <Link
                href={`/robots/${selectedGroup.primaryDeviceId}`}
                className="text-xs text-txt-accent hover:text-blue-400 transition-colors font-medium"
              >
                {dict.dashboard.robots.access_terminal} →
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Robots Card */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="w-16 h-16 text-txt-accent" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" /></svg>
          </div>
          <p className="text-xs font-medium text-blue-400 uppercase tracking-widest">{dict.dashboard.home.active_robots}</p>
          <p className="mt-3 text-4xl font-bold text-txt-main tracking-tight text-shadow-glow">
            {selectedGroupId !== null ? "1" : (groupedRobots.length === 0 ? "-" : groupedRobots.length)}
          </p>
          <p className="mt-2 text-xs text-txt-sec">
            {selectedGroupId !== null
              ? selectedGroup?.displayName
              : dict.dashboard.home.active_robots_desc}
          </p>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-600 to-transparent opacity-50" />
        </div>

        {/* Avg Battery Card */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
          <p className="text-xs font-medium text-txt-sec uppercase tracking-widest">
            {dict.dashboard.home.avg_battery}
          </p>
          <p className="mt-3 text-4xl font-bold text-txt-main tracking-tight">
            {avgBattery === null ? "-" : `${avgBattery}%`}
          </p>
          <p className="mt-2 text-xs text-txt-sec">
            {dict.dashboard.home.avg_battery_desc.replace('{count}', totalSamples.toString())}
          </p>
        </div>

        {/* Critical Errors Card */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
          <p className="text-xs font-medium text-rose-400 uppercase tracking-widest">
            {dict.dashboard.home.critical_errors}
          </p>
          <p className="mt-3 text-4xl font-bold text-txt-main tracking-tight">
            {errorCount === null ? "-" : errorCount}
          </p>
          <p className="mt-2 text-xs text-txt-sec">
            {dict.dashboard.home.critical_errors_desc}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Battery Health Distribution */}
          <div className="glass-panel rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-txt-main">
                  {dict.dashboard.home.battery_health}
                </p>
                <p className="text-[11px] text-txt-sec">
                  {dict.dashboard.home.battery_monitoring_sample}
                </p>
              </div>
              <span className="rounded-full bg-sidebar border border-border-base px-2 py-1 text-[11px] text-txt-sec">
                {totalSamples} {dict.dashboard.home.samples}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-sidebar flex border border-border-base">
              <div
                className="h-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                style={{ width: `${criticalPct}%` }}
              />
              <div
                className="h-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                style={{ width: `${warningPct}%` }}
              />
              <div
                className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                style={{ width: `${healthyPct}%` }}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-txt-sec">
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_#10b981]" />{" "}
                {dict.dashboard.home.healthy} ({healthyPct}%)
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_4px_#f59e0b]" />{" "}
                {dict.dashboard.home.warning} ({warningPct}%)
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shadow-[0_0_4px_#f43f5e]" />{" "}
                {dict.dashboard.home.critical} ({criticalPct}%)
              </span>
            </div>
          </div>

          {/* Inactive Robot History - now uses grouped robots */}
          <div className="glass-panel rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-txt-main">
                  {dict.dashboard.home.robot_history}
                </p>
                <p className="text-[11px] text-txt-sec">
                  {dict.dashboard.home.latest_devices}
                </p>
              </div>
              <Link
                href="/robots"
                className="text-[11px] font-semibold text-txt-accent hover:text-blue-400 transition-colors"
              >
                {dict.dashboard.home.view_all}
              </Link>
            </div>
            <div className="max-h-64 overflow-y-auto pr-2">
              {inactiveGroups.length === 0 ? (
                <p className="text-sm text-txt-sec py-4 text-center">
                  {dict.dashboard.home.no_inactive_robots}
                </p>
              ) : (
                <ul className="space-y-2">
                  {inactiveGroups.map((group) => (
                    <li
                      key={group.groupId}
                      className="group flex items-center justify-between gap-3 p-3 rounded-xl bg-sidebar border border-transparent hover:border-border-highlight hover:bg-card-bg transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-slate-900/50 flex items-center justify-center border border-slate-700/30 text-slate-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/robots/${group.primaryDeviceId}`}
                            className="text-sm font-medium text-txt-main group-hover:text-txt-accent transition-colors truncate block"
                          >
                            {group.displayName}
                          </Link>
                          <div className="flex items-center gap-1">
                            {group.rbDevice && (
                              <span className="text-[9px] px-1 rounded bg-blue-500/10 text-blue-400 font-mono">
                                {group.rbDevice.device_code}
                              </span>
                            )}
                            {group.uiDevice && (
                              <span className="text-[9px] px-1 rounded bg-purple-500/10 text-purple-400 font-mono">
                                {group.uiDevice.device_code}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-700/30 border border-slate-600/30">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
                          <span className="text-[10px] font-medium text-slate-400">{dict.common.offline}</span>
                        </div>
                        <Link
                          href={`/robots/${group.primaryDeviceId}`}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-primary-glow text-txt-accent hover:bg-blue-500/20"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Activity Log */}
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-0 overflow-hidden flex flex-col h-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-base">
              <div>
                <p className="text-sm font-semibold text-txt-main">
                  {dict.dashboard.home.activity_log}
                </p>
                <p className="text-[11px] text-txt-sec">
                  {dict.dashboard.home.latest_commands}
                </p>
              </div>
              <Link
                href="/notifications"
                className="text-[11px] font-semibold text-txt-accent hover:text-blue-400"
              >
                {dict.dashboard.home.full_log}
              </Link>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[400px]">
              {latestCommands.length === 0 ? (
                <div className="px-5 py-6 text-sm text-txt-sec text-center">
                  {dict.dashboard.home.no_activity}
                </div>
              ) : (
                <div className="divide-y divide-border-base">
                  {latestCommands.map((cmd) => (
                    <div key={cmd.h_command_log_id} className="px-5 py-3 hover:bg-white/[0.02] transition-colors relative group">
                      <div className="flex items-start gap-3">
                        <div className={`mt-1.5 h-1.5 w-1.5 rounded-full shadow-[0_0_5px] flex-shrink-0 ${cmd.status !== "success" ? "bg-rose-500 shadow-rose-500/50" : "bg-emerald-500 shadow-emerald-500/50"
                          }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs font-medium text-txt-main font-mono truncate">
                              {cmd.command_code || "UNKNOWN"}
                            </span>
                            <span className="text-[10px] text-txt-sec whitespace-nowrap ml-2">
                              {new Date(cmd.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {cmd.status_message && (
                            <p className="text-[11px] text-txt-sec truncate group-hover:whitespace-normal group-hover:text-txt-main transition-colors">
                              {cmd.status_message}
                            </p>
                          )}
                          {!cmd.status_message && (
                            <p className="text-[10px] text-txt-sec uppercase tracking-wider font-semibold mt-0.5">
                              {cmd.status}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
