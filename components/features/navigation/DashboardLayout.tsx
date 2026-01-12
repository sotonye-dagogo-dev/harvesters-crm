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
  role: "SUPERADMIN" | "LEADER" | "MEMBER";
}

export default function DashboardLayout({
  children,
  role,
}: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

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
    <Layout className="min-h-screen">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className="!bg-church-primary"
        theme="dark"
        width={250}
        aria-label="Main navigation"
      >
        <div className="h-16 flex items-center justify-center border-b border-white/10">
          {!collapsed ? (
            <h1 className="text-white text-lg font-bold m-0">Fellowship CRM</h1>
          ) : (
            <h1 className="text-white text-lg font-bold m-0">FC</h1>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["dashboard"]}
          items={getMenuItems()}
          className="!bg-church-primary !border-r-0"
          aria-label="Dashboard navigation menu"
        />

        <div className="absolute bottom-4 w-full px-4">
          <Menu
            theme="dark"
            mode="inline"
            className="!bg-church-primary !border-r-0"
            items={[
              {
                key: "logout",
                icon: <LogoutOutlined />,
                label: "Logout",
                onClick: logout,
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
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {role === "SUPERADMIN"
                  ? "Super Admin"
                  : role.charAt(0) + role.slice(1).toLowerCase()}
              </span>
              <div className="w-10 h-10 rounded-full bg-church-primary dark:bg-green-600 text-white flex items-center justify-center font-semibold">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </div>
            </div>
          }
        />

        <Content className="p-6 bg-gray-50 dark:bg-slate-900">
          <main id="main-content" tabIndex={-1} aria-label="Main content">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </Content>

        <AppFooter />
      </Layout>
    </Layout>
  );
}
