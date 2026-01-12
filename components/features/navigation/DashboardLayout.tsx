"use client";

import { Layout, Menu } from "antd";
import { ReactNode, useState } from "react";
import Link from "next/link";
import {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  CalendarOutlined,
  PhoneOutlined,
  FileTextOutlined,
  SettingOutlined,
  LogoutOutlined,
  ScheduleOutlined,
  ClockCircleOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/providers/AuthProvider";
import { AppHeader, AppFooter } from "@/components/ui/Layout";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const { Sider, Content } = Layout;

interface DashboardLayoutProps {
  children: ReactNode;
  role?: "SUPERADMIN" | "LEADER" | "MEMBER";
}

export default function DashboardLayout({
  children,
  role: propRole,
}: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  // Use prop role if provided, otherwise use user role from auth context
  const role = propRole || (user?.role as "SUPERADMIN" | "LEADER" | "MEMBER");

  // Menu items based on role
  const getMenuItems = () => {
    const commonItems = [
      {
        key: "dashboard",
        icon: <DashboardOutlined />,
        label: <Link href={`/${role.toLowerCase()}/dashboard`}>Dashboard</Link>,
      },
    ];

    if (role === "SUPERADMIN") {
      return [
        ...commonItems,
        {
          key: "groups",
          icon: <TeamOutlined />,
          label: <Link href="/superadmin/groups">Groups</Link>,
        },
        {
          key: "members",
          icon: <UserOutlined />,
          label: <Link href="/superadmin/members">Members</Link>,
        },
        {
          key: "analytics",
          icon: <FileTextOutlined />,
          label: <Link href="/superadmin/analytics">Analytics</Link>,
        },
        {
          key: "settings",
          icon: <SettingOutlined />,
          label: "Settings",
          children: [
            {
              key: "notifications",
              icon: <BellOutlined />,
              label: (
                <Link href="/superadmin/settings/system-notifications">
                  Notifications
                </Link>
              ),
            },
          ],
        },
      ];
    }

    if (role === "LEADER") {
      return [
        ...commonItems,
        {
          key: "my-group",
          icon: <TeamOutlined />,
          label: <Link href="/leader/my-group">My Group</Link>,
        },
        {
          key: "meetings",
          icon: <CalendarOutlined />,
          label: <Link href="/leader/meetings">Meetings</Link>,
        },
        {
          key: "schedule",
          icon: <ScheduleOutlined />,
          label: <Link href="/leader/schedule">Schedule</Link>,
        },
        {
          key: "follow-ups",
          icon: <ClockCircleOutlined />,
          label: <Link href="/leader/follow-ups">Follow-ups</Link>,
        },
        {
          key: "members",
          icon: <UserOutlined />,
          label: <Link href="/leader/members">Members</Link>,
        },
        {
          key: "interactions",
          icon: <PhoneOutlined />,
          label: <Link href="/leader/interactions">Interactions</Link>,
        },
        {
          key: "settings",
          icon: <SettingOutlined />,
          label: "Settings",
          children: [
            {
              key: "notifications",
              icon: <BellOutlined />,
              label: (
                <Link href="/leader/settings/meeting-reminders">
                  Notifications
                </Link>
              ),
            },
          ],
        },
      ];
    }

    // MEMBER
    return [
      ...commonItems,
      {
        key: "my-group",
        icon: <TeamOutlined />,
        label: <Link href="/member/my-group">My Group</Link>,
      },
      {
        key: "history",
        icon: <FileTextOutlined />,
        label: <Link href="/member/history">My History</Link>,
      },
      {
        key: "settings",
        icon: <SettingOutlined />,
        label: "Settings",
        children: [
          {
            key: "notifications",
            icon: <BellOutlined />,
            label: (
              <Link href="/member/settings/preferences">Notifications</Link>
            ),
          },
        ],
      },
    ];
  };

  return (
    <Layout className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className="!bg-gradient-to-b !from-green-800 !via-green-700 !to-green-900 dark:!from-slate-900 dark:!via-slate-800 dark:!to-slate-900 shadow-2xl"
        theme="dark"
        width={280}
        collapsedWidth={80}
        aria-label="Main navigation"
      >
        <div className="h-20 flex items-center justify-center border-b border-white/10 backdrop-blur-sm">
          {!collapsed ? (
            <h1 className="text-white text-xl font-bold m-0 tracking-wide drop-shadow-lg">
              Fellowship CRM
            </h1>
          ) : (
            <h1 className="text-white text-2xl font-bold m-0 bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-sm">
              FC
            </h1>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["dashboard"]}
          items={getMenuItems()}
          className="!bg-transparent !border-r-0 mt-4 px-2 [&_.ant-menu-item]:rounded-xl [&_.ant-menu-item]:mb-2 [&_.ant-menu-item:hover]:bg-white/10 [&_.ant-menu-item-selected]:bg-white/20 [&_.ant-menu-item-selected]:shadow-lg [&_.ant-menu-submenu-title]:rounded-xl [&_.ant-menu-submenu-title:hover]:bg-white/10"
          aria-label="Dashboard navigation menu"
        />

        <div className="absolute bottom-6 w-full px-4">
          <Menu
            theme="dark"
            mode="inline"
            className="!bg-transparent !border-r-0"
            items={[
              {
                key: "logout",
                icon: <LogoutOutlined className="text-lg" />,
                label: <span className="font-semibold">Logout</span>,
                onClick: logout,
                className:
                  "!rounded-xl hover:!bg-red-500/20 !text-red-200 hover:!text-red-100",
              },
            ]}
            aria-label="User account actions"
          />
        </div>
      </Sider>

      <Layout>
        <AppHeader
          title={`Welcome, ${user?.firstName || "User"}`}
          actions={
            <div className="flex items-center gap-5">
              <ThemeToggle />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm">
                {role === "SUPERADMIN"
                  ? "Super Admin"
                  : role.charAt(0) + role.slice(1).toLowerCase()}
              </span>
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-green-600 to-green-700 dark:from-green-500 dark:to-green-600 text-white flex items-center justify-center font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 border-white dark:border-slate-700">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </div>
            </div>
          }
        />

        <Content className="p-8 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen">
          <main id="main-content" tabIndex={-1} aria-label="Main content">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </Content>

        <AppFooter />
      </Layout>
    </Layout>
  );
}
