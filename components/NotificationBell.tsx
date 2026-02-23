"use client";

import { useState, useEffect, useRef } from "react";
import { getLowBatteryDevices, getSystemNotifications, type DeviceStatus, type SystemNotification } from "@/lib/api";
import { useLanguage } from "@/components/LanguageProvider";

export default function NotificationBell() {
    const { dict } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<SystemNotification[]>([]);
    const [lowBatteryDevices, setLowBatteryDevices] = useState<DeviceStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const popupRef = useRef<HTMLDivElement>(null);

    const loadNotifications = async () => {
        setLoading(true);

        // Get low battery devices
        const { data: lowBattery } = await getLowBatteryDevices();
        setLowBatteryDevices(lowBattery ?? []);

        // Generate notifications from low battery devices
        const batteryNotifs: SystemNotification[] = (lowBattery ?? []).map((device, index) => ({
            id: `battery-${device.device_id}-${index}`,
            device_id: device.device_id,
            device_name: device.device_name,
            type: 'low_battery' as const,
            title: dict.dashboard.notifications?.low_battery_title || 'Low Battery Alert',
            message: `${device.device_name || device.device_code} - ${device.battery_percent}%`,
            is_read: false,
            created_at: device.status_updated_at || new Date().toISOString(),
        }));

        setNotifications(batteryNotifs);
        setLoading(false);
    };

    useEffect(() => {
        void loadNotifications();
        // Refresh every 30 seconds
        const interval = setInterval(() => {
            void loadNotifications();
        }, 30000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Close popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const getNotificationIcon = (type: SystemNotification['type']) => {
        switch (type) {
            case 'low_battery':
                return (
                    <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'activity':
                return (
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-4 h-4 text-txt-sec" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                );
        }
    };

    return (
        <div className="relative" ref={popupRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-sidebar transition-colors group"
                aria-label="Notifications"
            >
                <svg
                    className="w-5 h-5 text-txt-sec group-hover:text-txt-main transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>

                {/* Badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-lg shadow-rose-500/30 animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Popup Panel */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 glass-panel rounded-xl border border-border-highlight shadow-2xl z-50 overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-border-base bg-sidebar/50">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-txt-main">
                                {dict.dashboard.notifications?.popup_title || 'Notifications'}
                            </h3>
                            <span className="text-[10px] text-txt-sec font-mono">
                                {notifications.length} {dict.dashboard.notifications?.items || 'items'}
                            </span>
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-80 overflow-y-auto">
                        {loading ? (
                            <div className="p-6 text-center">
                                <div className="w-5 h-5 border-2 border-txt-sec border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                <span className="text-xs text-txt-sec">{dict.common?.loading || 'Loading...'}</span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-6 text-center">
                                <svg className="w-10 h-10 text-txt-sec/30 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <p className="text-xs text-txt-sec">
                                    {dict.dashboard.notifications?.no_notifications || 'No notifications'}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border-base">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`px-4 py-3 hover:bg-card-bg transition-colors ${!notif.is_read ? 'bg-primary-glow/30' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="flex-shrink-0 mt-0.5">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${notif.type === 'low_battery' ? 'bg-amber-500/10 border border-amber-500/20' :
                                                        notif.type === 'error' ? 'bg-rose-500/10 border border-rose-500/20' :
                                                            'bg-blue-500/10 border border-blue-500/20'
                                                    }`}>
                                                    {getNotificationIcon(notif.type)}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-txt-main truncate">
                                                    {notif.title}
                                                </p>
                                                <p className="text-[11px] text-txt-sec mt-0.5 truncate">
                                                    {notif.message}
                                                </p>
                                                <p className="text-[10px] text-txt-sec/70 mt-1 font-mono">
                                                    {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-2 border-t border-border-base bg-sidebar/50">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-[11px] text-txt-accent hover:text-blue-400 transition-colors font-medium"
                            >
                                {dict.dashboard.notifications?.view_all || 'View All Notifications →'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
