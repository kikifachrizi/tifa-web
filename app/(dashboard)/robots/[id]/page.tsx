/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { use, useEffect, useState } from "react";
import { getRobotById, getBatteryHistory, getActivityData, type DeviceInfo, type BatteryRow, type ActivityData } from "@/lib/api";

export default function RobotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const deviceId = Number(id);

  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [latestBattery, setLatestBattery] = useState<BatteryRow | null>(null);
  const [batteryHistory, setBatteryHistory] = useState<BatteryRow[]>([]);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      // Load device info
      const { data: deviceData, error: deviceError } = await getRobotById(deviceId);

      if (deviceError) {
        setError(deviceError);
      } else if (deviceData) {
        setDeviceInfo(deviceData);
      }

      // Load battery history
      const { data: batteryData, error: batteryError } = await getBatteryHistory(deviceId, 50);

      if (batteryError) {
        setError(batteryError);
      } else if (batteryData) {
        setLatestBattery(batteryData[0] ?? null);
        setBatteryHistory(batteryData);
      }

      // Load Activity Data
      const { data: activityResult } = await getActivityData(deviceId);
      if (activityResult) {
        setActivityData(activityResult);
      }

      setLoading(false);
    };

    void loadData();
  }, [deviceId]);

  const batteryColor =
    latestBattery && Number(latestBattery.battery_percent ?? 0) <= 30
      ? "text-rose-500"
      : latestBattery && Number(latestBattery.battery_percent ?? 0) <= 60
        ? "text-amber-500"
        : "text-emerald-500";

  // Find max value for graph scaling
  const maxActivity = Math.max(...activityData.map(d => d.count), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-txt-main tracking-tight">
            {deviceInfo?.device_name ?? "Loading Device..."}
          </h1>
          <div className="flex flex-wrap gap-4 text-xs font-mono text-txt-accent mt-1">
            <span className="bg-primary-glow px-2 py-0.5 rounded border border-border-highlight">ID: {deviceId}</span>
            {deviceInfo?.device_code && <span>CODE: {deviceInfo.device_code}</span>}
            {deviceInfo?.robot_local_ip && <span>IP: {deviceInfo.robot_local_ip}</span>}
            {deviceInfo?.robot_local_ssid && <span>NET: {deviceInfo.robot_local_ssid}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-medium text-emerald-500 uppercase tracking-widest">Online</span>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400 border border-red-900/50 bg-red-900/20 rounded-lg px-4 py-3">
          Error: {error}
        </p>
      )}

      {/* Battery Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel rounded-xl p-5 relative overflow-hidden">
          <p className="text-xs font-medium text-txt-sec uppercase tracking-widest">
            Battery Charge
          </p>
          <p className={`mt-2 text-3xl font-bold tracking-tight ${batteryColor} text-shadow-glow`}>
            {latestBattery && latestBattery.battery_percent != null
              ? `${Number(latestBattery.battery_percent)}%`
              : "-"}
          </p>
          <p className="mt-2 text-xs text-txt-sec font-mono">
            {latestBattery
              ? `LAST UPDATE: ${new Date(latestBattery.recorded_at).toLocaleTimeString()}`
              : "WAITING FOR TELEMETRY..."}
          </p>
        </div>

        <div className="glass-panel rounded-xl p-5">
          <p className="text-xs font-medium text-txt-sec uppercase tracking-widest">Device ID</p>
          <p className="mt-2 text-xl font-bold text-txt-main tracking-tight">
            {latestBattery?.device_id ?? "-"}
          </p>
          <p className="mt-2 text-xs text-txt-sec">
            Device identifier
          </p>
        </div>

        <div className="glass-panel rounded-xl p-5">
          <p className="text-xs font-medium text-txt-sec uppercase tracking-widest">Voltage</p>
          <p className="mt-2 text-xl font-bold text-txt-main tracking-tight">
            {latestBattery?.voltage != null ? `${latestBattery.voltage} V` : "-"}
          </p>
          <p className="mt-2 text-xs text-txt-sec">
            Terminal voltage
          </p>
        </div>
      </div>

      {/* Robot Activity Graph */}
      <div className="glass-panel rounded-xl p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-sm font-bold text-txt-main uppercase tracking-widest">Activity Monitor</h2>
            <p className="text-xs text-txt-sec mt-1">
              Command execution frequency (24h)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium px-2 py-1 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase tracking-wider">
              Live Data
            </span>
          </div>
        </div>

        <div className="relative h-48 w-full">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-txt-sec pointer-events-none font-mono">
            <div className="w-full border-b border-dashed border-border-base h-0"><span className="absolute -left-8 -top-2">{maxActivity}</span></div>
            <div className="w-full border-b border-dashed border-border-base h-0"><span className="absolute -left-8 -top-2">{Math.round(maxActivity * 0.66)}</span></div>
            <div className="w-full border-b border-dashed border-border-base h-0"><span className="absolute -left-8 -top-2">{Math.round(maxActivity * 0.33)}</span></div>
            <div className="w-full border-b border-border-base h-0"><span className="absolute -left-8 -top-2">0</span></div>
          </div>

          {/* Bars */}
          <div className="absolute inset-0 flex items-end justify-between px-2 gap-1">
            {activityData.map((data, index) => {
              const heightPct = (data.count / maxActivity) * 100;
              const visualHeight = data.count > 0 ? Math.max(heightPct, 5) : 0;

              return (
                <div key={index} className="flex flex-col items-center justify-end h-full w-full group relative">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 bg-sidebar border border-border-highlight text-txt-main text-[10px] font-medium px-3 py-1.5 rounded shadow-xl pointer-events-none whitespace-nowrap z-20">
                    <span className="font-bold text-txt-accent">{data.count}</span> commands at {data.hour}:00
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-sidebar border-b border-r border-border-highlight rotate-45"></div>
                  </div>

                  {/* Bar */}
                  <div
                    className="w-full max-w-[12px] rounded-t-[2px] transition-all duration-500 ease-out hover:brightness-125 relative group-hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                    style={{
                      height: `${visualHeight}%`,
                      backgroundColor: data.count > 0 ? '#3B82F6' : 'rgba(59, 130, 246, 0.05)',
                      opacity: data.count > 0 ? 0.8 + (data.count / maxActivity) * 0.2 : 1
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* X-Axis Labels */}
        <div className="flex justify-between mt-4 text-[10px] text-txt-sec px-2 font-mono">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>23:00</span>
        </div>
      </div>

      {/* Battery History Table */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-base">
          <h2 className="text-sm font-semibold text-txt-main uppercase tracking-widest">
            Battery History
          </h2>
          {loading && (
            <span className="text-[10px] text-blue-400 animate-pulse uppercase tracking-wider">Syncing...</span>
          )}
        </div>
        <div className="max-h-64 overflow-y-auto custom-scrollbar">
          <table className="min-w-full text-xs">
            <thead className="bg-[#0f172a]/50 text-left text-[10px] font-semibold text-blue-400 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">Charge</th>
                <th className="px-6 py-3">Voltage</th>
                <th className="px-6 py-3">Device ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-base">
              {batteryHistory.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-txt-sec">
                    No battery telemetry recorded.
                  </td>
                </tr>
              ) : (
                batteryHistory.map((item) => (
                  <tr key={item.h_battery_id} className="hover:bg-card-bg transition-colors">
                    <td className="px-6 py-3 text-txt-sec font-mono">
                      {new Date(item.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="px-6 py-3 font-medium text-txt-main">
                      {item.battery_percent != null
                        ? `${Number(item.battery_percent)}%`
                        : "-"}
                    </td>
                    <td className="px-6 py-3 text-txt-sec">
                      {item.voltage != null ? `${item.voltage} V` : "-"}
                    </td>
                    <td className="px-6 py-3 text-txt-sec font-mono text-[10px]">
                      {item.device_id}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
