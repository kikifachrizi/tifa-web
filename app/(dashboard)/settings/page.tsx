"use client";

import { useMemo } from "react";
import { useLanguage } from "@/components/LanguageProvider";

const TIFA_APP_DEEP_LINK_BASE = "tifa://robot";

export default function SettingsPage() {
  const { dict } = useLanguage();
  const appBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const exampleRobotId = useMemo(
    () => "contoh-robot-id-1234",
    [],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-txt-main tracking-tight">
          {dict.dashboard.settings.title}
        </h1>
        <p className="text-sm text-txt-sec">
          {dict.dashboard.settings.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-txt-main">
              {dict.dashboard.settings.mobile_app.title}
            </h2>
          </div>
          <p className="text-xs text-txt-sec leading-relaxed">
            {dict.dashboard.settings.mobile_app.description}
          </p>
          <div className="rounded-lg bg-sidebar border border-border-base p-3 group relative overflow-hidden">
            <code className="text-xs font-mono text-emerald-500 break-all bg-transparent relative z-10 block">
              {TIFA_APP_DEEP_LINK_BASE}/<span className="text-txt-sec">{exampleRobotId}</span>
            </code>
            <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors pointer-events-none"></div>
          </div>
          <p className="text-[10px] text-txt-sec">
            {dict.dashboard.settings.mobile_app.note.replace('{id}', '')} <span className="font-mono text-txt-accent">example-id</span> {dict.dashboard.settings.mobile_app.note.includes(' UUID') ? '' : ''}
          </p>
        </div>

        <div className="glass-panel rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-txt-main">
              {dict.dashboard.settings.web_app.title}
            </h2>
          </div>
          <p className="text-xs text-txt-sec leading-relaxed">
            {dict.dashboard.settings.web_app.description}
          </p>
          <div className="rounded-lg bg-sidebar border border-border-base p-3 group relative overflow-hidden">
            <code className="text-xs font-mono text-indigo-500 break-all bg-transparent relative z-10 block">
              {appBaseUrl}?robotId=<span className="text-txt-sec">{exampleRobotId}</span>
            </code>
            <div className="absolute inset-0 bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors pointer-events-none"></div>
          </div>
          <p className="text-[10px] text-txt-sec">
            {dict.dashboard.settings.web_app.note.replace('{env}', '')} <span className="font-mono text-txt-accent">NEXT_PUBLIC_APP_URL</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
