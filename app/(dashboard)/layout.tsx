"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser, signOut as apiSignOut, type User } from "@/lib/api";
import { useLanguage } from "@/components/LanguageProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import UserDropdown from "@/components/UserDropdown";
import LogoutConfirmDialog from "@/components/LogoutConfirmDialog";

type UserInfo = {
  id: string;
  email: string;
  role: string;
};

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { dict } = useLanguage();

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState) {
      setSidebarCollapsed(JSON.parse(savedState));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    const loadUser = async () => {
      const { data: user } = await getCurrentUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserInfo({
        id: user.id,
        email: user.email ?? "",
        role: user.role || "operator",
      });
    };

    void loadUser();
  }, [router]);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    setLoggingOut(true);
    await apiSignOut();
    router.push("/login");
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const menuItems = [
    {
      href: "/dashboard",
      label: dict.dashboard.sidebar.dashboard,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href: "/robots",
      label: dict.dashboard.sidebar.robots,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      ),
    },
    {
      href: "/robots/manage",
      label: dict.dashboard.sidebar.manage_robots,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
    },
    {
      href: "/notifications",
      label: dict.dashboard.sidebar.notifications,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
    {
      href: "/settings",
      label: dict.dashboard.sidebar.settings,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex bg-page text-txt-main bg-grain transition-colors duration-300">
      {/* Logout Confirmation Dialog */}
      <LogoutConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        loading={loggingOut}
      />

      {/* Sidebar - Uses semantic vars - GPU optimized */}
      <aside
        className={`bg-sidebar border-r border-border-base flex flex-col sidebar-transition relative z-10 gpu-accelerated ${sidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        style={{ contain: 'layout' }}
      >
        {/* Logo */}
        <div className="px-4 py-6 border-b border-border-base">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#2FAEB7] to-[#20C5D0] flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-[#2FAEB7]/20 flex-shrink-0 border border-[#20C5D0]/20">
              F
            </div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden">
                <h1 className="text-sm font-semibold tracking-tight text-txt-main">
                  Forgix Dashboard
                </h1>
                <p className="text-[11px] text-txt-sec truncate">
                  Robot Monitoring
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="mx-3 mt-4 mb-2 p-2 rounded-lg bg-card-bg hover:bg-primary-glow text-txt-sec hover:text-txt-main transition-colors flex items-center justify-center border border-border-base hover:border-border-highlight"
        >
          <svg
            className={`w-5 h-5 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {menuItems.map((item) => (
            <SidebarLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={isActive(item.href)}
              collapsed={sidebarCollapsed}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className={`px-4 py-4 border-t border-border-base text-[11px] text-txt-sec ${sidebarCollapsed ? 'text-center' : ''}`}>
          {sidebarCollapsed ? (
            <span>©</span>
          ) : (
            <span>© {new Date().getFullYear()} Forgix</span>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 relative z-0">
        {/* Header - Semi transparent glass - optimized */}
        <header className="h-16 border-b border-border-base bg-card-bg/80 backdrop-blur-sm flex items-center justify-between px-6 flex-shrink-0 z-20 transition-colors duration-300 gpu-accelerated">
          <div>
            <p className="text-xs font-medium text-txt-accent uppercase tracking-wider">
              {dict.dashboard.header.status}
            </p>
            <p className="text-[11px] text-txt-sec">
              {dict.dashboard.header.monitoring}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Theme & Language Switchers */}
            <div className="flex items-center gap-2">
              <ThemeSwitcher />
              <LanguageSwitcher />
            </div>

            {/* User Dropdown */}
            {userInfo && (
              <div className="pl-3 border-l border-border-base">
                <UserDropdown
                  email={userInfo.email}
                  role={userInfo.role}
                  onLogoutClick={handleLogoutClick}
                />
              </div>
            )}
          </div>
        </header>

        {/* Page Content - with deep blue gradient background in dark mode, light in light mode managed by CSS var */}
        <div className="flex-1 min-h-0 p-6 overflow-y-auto bg-deep-blue-gradient">{children}</div>
      </main>
    </div>
  );
}

function SidebarLink({
  href,
  label,
  icon,
  active,
  collapsed,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-300 ${active
        ? "bg-primary-glow text-txt-accent border border-border-highlight"
        : "text-txt-sec hover:bg-card-bg hover:text-txt-main border border-transparent"
        }`}
      title={collapsed ? label : undefined}
    >
      <span className={`flex-shrink-0 transition-colors ${active ? 'text-txt-accent drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'group-hover:text-txt-main'}`}>
        {icon}
      </span>
      {!collapsed && (
        <span className="text-sm font-medium truncate">{label}</span>
      )}
      {active && (
        <div className="absolute left-0 bottom-0 top-0 w-0.5 bg-[#2FAEB7] rounded-r shadow-[0_0_10px_rgba(47,174,183,0.8)]" />
      )}

      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className="absolute left-full ml-3 px-3 py-1.5 bg-sidebar text-txt-main text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl border border-border-base">
          {label}
        </div>
      )}
    </Link>
  );
}
