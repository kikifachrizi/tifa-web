"use client";

import { useState, useEffect } from "react";
import { getActivityLogs, type ActivityLog, type SentimentType } from "@/lib/api";
import { useLanguage } from "@/components/LanguageProvider";

export default function NotificationsPage() {
  const { dict } = useLanguage();
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "positive" | "negative" | "neutral">("all");

  useEffect(() => {
    const loadActivityLogs = async () => {
      setLoading(true);

      const { data } = await getActivityLogs(100);

      let logs = data ?? [];

      // Filter by sentiment if needed
      if (filter !== "all") {
        logs = logs.filter(log => log.sentiment === filter);
      }

      setActivityLogs(logs);
      setLoading(false);
    };

    void loadActivityLogs();
  }, [filter]);

  const getSentimentBadge = (sentiment: SentimentType | null) => {
    switch (sentiment) {
      case 'positive':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] font-medium">{dict.dashboard.notifications.positive}</span>
          </span>
        );
      case 'negative':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] font-medium">{dict.dashboard.notifications.negative}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-400">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] font-medium">{dict.dashboard.notifications.neutral}</span>
          </span>
        );
    }
  };

  const getActivityIcon = (activityType: ActivityLog['activity_type']) => {
    switch (activityType) {
      case 'delivery':
        return (
          <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-blue-500/10 border border-blue-500/20 text-blue-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'interaction':
        return (
          <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-purple-500/10 border border-purple-500/20 text-purple-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
        );
      case 'battery':
        return (
          <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-rose-500/10 border border-rose-500/20 text-rose-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-txt-main tracking-tight">{dict.dashboard.notifications.title}</h1>
          <p className="text-sm text-txt-sec">
            {dict.dashboard.notifications.subtitle}
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex bg-sidebar p-1 rounded-lg border border-border-base">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filter === "all"
              ? "bg-card-bg text-txt-main shadow-sm border border-border-highlight"
              : "text-txt-sec hover:text-txt-main"
              }`}
          >
            {dict.dashboard.notifications.filter_all}
          </button>
          <button
            onClick={() => setFilter("positive")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filter === "positive"
              ? "bg-emerald-900/30 text-emerald-500 border border-emerald-500/30"
              : "text-txt-sec hover:text-emerald-500"
              }`}
          >
            {dict.dashboard.notifications.positive}
          </button>
          <button
            onClick={() => setFilter("negative")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filter === "negative"
              ? "bg-rose-900/30 text-rose-500 border border-rose-500/30"
              : "text-txt-sec hover:text-rose-500"
              }`}
          >
            {dict.dashboard.notifications.negative}
          </button>
          <button
            onClick={() => setFilter("neutral")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filter === "neutral"
              ? "bg-slate-700/30 text-slate-400 border border-slate-500/30"
              : "text-txt-sec hover:text-slate-400"
              }`}
          >
            {dict.dashboard.notifications.neutral}
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center gap-3 text-txt-sec">
              <div className="w-5 h-5 border-2 border-txt-sec border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-mono uppercase tracking-wider">{dict.dashboard.notifications.loading}</span>
            </div>
          </div>
        ) : activityLogs.length === 0 ? (
          <div className="p-12 text-center text-txt-sec">
            {dict.dashboard.notifications.no_logs}
          </div>
        ) : (
          <div className="divide-y divide-border-base">
            {activityLogs.map((item) => (
              <div key={item.id} className="p-4 hover:bg-card-bg transition-colors flex gap-4 group">
                {/* Activity Icon */}
                {getActivityIcon(item.activity_type)}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-txt-main">
                        {item.device_name || `Robot #${item.device_id}`}
                      </p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium uppercase">
                        {item.activity_type}
                      </span>
                    </div>
                    <span className="text-xs text-txt-sec whitespace-nowrap font-mono">
                      {new Date(item.created_at).toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Activity Message */}
                  <p className="text-sm text-txt-main mb-2">
                    {item.message}
                  </p>

                  {/* Customer Response & Sentiment */}
                  {item.customer_response && (
                    <div className="flex items-center gap-3 mt-2 p-2 rounded-lg bg-sidebar border border-border-base">
                      <div className="flex-1">
                        <p className="text-[10px] text-txt-sec uppercase tracking-wider mb-1">
                          {dict.dashboard.notifications.robot_activity}
                        </p>
                        <p className="text-xs text-txt-main italic">
                          "{item.customer_response}"
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <p className="text-[10px] text-txt-sec uppercase tracking-wider mb-1 text-right">
                          {dict.dashboard.notifications.classification}
                        </p>
                        {getSentimentBadge(item.sentiment)}
                      </div>
                    </div>
                  )}

                  {!item.customer_response && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-txt-sec uppercase tracking-wider">
                        {dict.dashboard.notifications.classification}:
                      </span>
                      {getSentimentBadge(item.sentiment)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
