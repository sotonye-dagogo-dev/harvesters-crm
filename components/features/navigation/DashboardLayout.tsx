"use client";

import { Layout, Menu, Drawer, Dropdown } from "antd";
import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { UserRole } from "@/lib/types";
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
  MenuOutlined,
  CloseOutlined,
  GlobalOutlined,
  BankOutlined,
  ApartmentOutlined,
  UsergroupAddOutlined,
  ShareAltOutlined,
  BarChartOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/providers/AuthProvider";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useTheme } from "next-themes";
import type { MenuProps } from "antd";

const { Sider, Content, Header } = Layout;

interface DashboardLayoutProps {
  children: ReactNode;
  role?: UserRole;
}

export default function DashboardLayout({
  children,
  role: propRole,
}: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  // Determine logo to use dynamically based on theme
  const logoSrc =
    theme === "dark"
      ? "/logo/dark-bg-harvesters-Logo.jpg"
      : "/logo/white-bg-harvesters-Logo.jpg";

  // Use prop role if provided, otherwise use user role from auth context
  const role = propRole || user?.role;

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Get active key from pathname
  const getSelectedKeys = () => {
    if (!pathname) return ["dashboard"];

    // Extract the key from pathname
    const pathParts = pathname.split("/").filter(Boolean);
    if (pathParts.length >= 2) {
      // For nested routes like /leader/my-group, return ["my-group"]
      return [pathParts[1]];
    }
    return ["dashboard"];
  };

  const handleMenuClick = () => {
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };

  // Menu items based on role
  const getMenuItems = () => {
    // Return empty array if no role is available
    if (!role) return [];

    // SUPERADMIN - Full system access
    if (role === "SUPERADMIN") {
      return [
        {
          key: "dashboard",
          icon: <DashboardOutlined />,
          label: <Link href="/superadmin/dashboard">Dashboard</Link>,
          onClick: handleMenuClick,
        },
        {
          key: "zones",
          icon: <GlobalOutlined />,
          label: <Link href="/superadmin/zones">Zones</Link>,
          onClick: handleMenuClick,
        },
        {
          key: "campuses",
          icon: <BankOutlined />,
          label: <Link href="/superadmin/campuses">Campuses</Link>,
          onClick: handleMenuClick,
        },
        {
          key: "departments",
          icon: <ApartmentOutlined />,
          label: <Link href="/superadmin/departments">Departments</Link>,
          onClick: handleMenuClick,
        },
        {
          key: "groups",
          icon: <TeamOutlined />,
          label: <Link href="/superadmin/groups">Groups</Link>,
          onClick: handleMenuClick,
        },
        {
          key: "cells",
          icon: <UsergroupAddOutlined />,
          label: <Link href="/superadmin/cells">Cells</Link>,
          onClick: handleMenuClick,
        },
        {
          key: "members",
          icon: <UserOutlined />,
          label: <Link href="/superadmin/members">Members</Link>,
          onClick: handleMenuClick,
        },
        {
          key: "meetings",
          icon: <CalendarOutlined />,
          label: <Link href="/superadmin/meetings">Meetings</Link>,
          onClick: handleMenuClick,
        },
        {
          key: "campaigns",
          icon: <ShareAltOutlined />,
          label: <Link href="/superadmin/campaigns">Campaigns</Link>,
          onClick: handleMenuClick,
        },
        {
          key: "reports",
          icon: <SolutionOutlined />,
          label: "Reports",
          children: [
            {
              key: "reports-list",
              icon: <FileTextOutlined />,
              label: <Link href="/superadmin/reports">All Reports</Link>,
              onClick: handleMenuClick,
            },
            {
              key: "reports-analytics",
              icon: <BarChartOutlined />,
              label: (
                <Link href="/superadmin/reports/analytics">
                  Report Analytics
                </Link>
              ),
              onClick: handleMenuClick,
            },
            {
              key: "report-types",
              label: <Link href="/superadmin/reports/types">Report Types</Link>,
              onClick: handleMenuClick,
            },
          ],
        },
        {
          key: "analytics",
          icon: <BarChartOutlined />,
          label: <Link href="/superadmin/analytics">Analytics</Link>,
          onClick: handleMenuClick,
        },
        {
          key: "settings",
          icon: <SettingOutlined />,
          label: "Settings",
          children: [
            {
              key: "system-notifications",
              icon: <BellOutlined />,
              label: (
                <Link href="/superadmin/settings/system-notifications">
                  Notifications
                </Link>
              ),
              onClick: handleMenuClick,
            },
            {
              key: "profile",
              icon: <UserOutlined />,
              label: <Link href="/profile">Profile</Link>,
              onClick: handleMenuClick,
            },
            {
              key: "logout",
              icon: <LogoutOutlined />,
              label: "Logout",
              onClick: logout,
              danger: true,
            },
          ],
        },
      ];
    }

    // MEMBER - Basic access
    if (role === "MEMBER") {
      return [
        {
          key: "dashboard",
          icon: <DashboardOutlined />,
          label: <Link href="/member/dashboard">Dashboard</Link>,
          onClick: handleMenuClick,
        },
        {
          key: "my-group",
          icon: <TeamOutlined />,
          label: <Link href="/member/my-group">My Group</Link>,
          onClick: handleMenuClick,
        },
        {
          key: "my-cell",
          icon: <UsergroupAddOutlined />,
          label: <Link href="/member/my-cell">My Cell</Link>,
          onClick: handleMenuClick,
        },
        {
          key: "history",
          icon: <FileTextOutlined />,
          label: <Link href="/member/history">My History</Link>,
          onClick: handleMenuClick,
        },
        {
          key: "campaigns",
          icon: <ShareAltOutlined />,
          label: <Link href="/member/campaigns">Campaigns</Link>,
          onClick: handleMenuClick,
        },
        {
          key: "settings",
          icon: <SettingOutlined />,
          label: "Settings",
          children: [
            {
              key: "preferences",
              icon: <BellOutlined />,
              label: (
                <Link href="/member/settings/preferences">Notifications</Link>
              ),
              onClick: handleMenuClick,
            },
            {
              key: "profile",
              icon: <UserOutlined />,
              label: <Link href="/profile">Profile</Link>,
              onClick: handleMenuClick,
            },
            {
              key: "logout",
              icon: <LogoutOutlined />,
              label: "Logout",
              onClick: logout,
              danger: true,
            },
          ],
        },
      ];
    }

    // ALL LEADER ROLES - Universal leader navigation
    // Dynamic nav for: CELL_LEADER, ZONE_LEADER, AREA_LEADER,
    // COMMUNITY_LEADER, DISTRICT_LEADER, CAMPUS_LEADER, CAMPUS_PASTOR,
    // GROUP_LEADER, GROUP_ADMIN, SPO, CHURCH_MINISTRY
    const leaderItems = [
      {
        key: "dashboard",
        icon: <DashboardOutlined />,
        label: <Link href="/leader/dashboard">Dashboard</Link>,
        onClick: handleMenuClick,
      },
      {
        key: "my-group",
        icon: <TeamOutlined />,
        label: <Link href="/leader/my-group">My Unit</Link>,
        onClick: handleMenuClick,
      },
      {
        key: "meetings",
        icon: <CalendarOutlined />,
        label: <Link href="/leader/meetings">Meetings</Link>,
        onClick: handleMenuClick,
      },
      {
        key: "schedule",
        icon: <ScheduleOutlined />,
        label: <Link href="/leader/schedule">Schedule</Link>,
        onClick: handleMenuClick,
      },
      {
        key: "follow-ups",
        icon: <ClockCircleOutlined />,
        label: <Link href="/leader/follow-ups">Follow-ups</Link>,
        onClick: handleMenuClick,
      },
      {
        key: "members",
        icon: <UserOutlined />,
        label: <Link href="/leader/members">Members</Link>,
        onClick: handleMenuClick,
      },
      {
        key: "interactions",
        icon: <PhoneOutlined />,
        label: <Link href="/leader/interactions">Interactions</Link>,
        onClick: handleMenuClick,
      },
      {
        key: "campaigns",
        icon: <ShareAltOutlined />,
        label: <Link href="/leader/campaigns">Campaigns</Link>,
        onClick: handleMenuClick,
      },
      {
        key: "reports",
        icon: <SolutionOutlined />,
        label: "Reports",
        children: [
          {
            key: "reports-list",
            icon: <FileTextOutlined />,
            label: <Link href="/leader/reports">My Reports</Link>,
            onClick: handleMenuClick,
          },
          {
            key: "reports-submit",
            label: <Link href="/leader/reports/submit">Submit Report</Link>,
            onClick: handleMenuClick,
          },
          {
            key: "reports-analytics",
            icon: <BarChartOutlined />,
            label: (
              <Link href="/leader/reports/analytics">Report Analytics</Link>
            ),
            onClick: handleMenuClick,
          },
        ],
      },
      {
        key: "analytics",
        icon: <BarChartOutlined />,
        label: <Link href="/leader/analytics">Analytics</Link>,
        onClick: handleMenuClick,
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
            onClick: handleMenuClick,
          },
          {
            key: "profile",
            icon: <UserOutlined />,
            label: <Link href="/profile">Profile</Link>,
            onClick: handleMenuClick,
          },
          {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "Logout",
            onClick: logout,
            danger: true,
          },
        ],
      },
    ];

    return leaderItems;
  };

  // Profile dropdown menu items
  const profileMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "My Profile",
      onClick: () => router.push("/profile"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: logout,
      danger: true,
    },
  ];

  // Sidebar content (shared between desktop and mobile)
  const sidebarContent = (
    <>
      <div className="h-20 flex items-center justify-center border-b border-white/10 backdrop-blur-sm px-4">
        {!collapsed || isMobile ? (
          <div className="flex items-center justify-center w-full">
            <Image
              src={logoSrc}
              alt="Harvesters International Christian Centre"
              width={180}
              height={60}
              className="object-contain rounded-lg"
              priority
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/10 backdrop-blur-sm">
            <Image
              src={logoSrc}
              alt="HICC"
              width={40}
              height={40}
              className="object-contain rounded-lg"
              priority
            />
          </div>
        )}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={getSelectedKeys()}
        items={getMenuItems()}
        className="!bg-transparent !border-r-0 mt-4 px-2 [&_.ant-menu-item]:rounded-xl [&_.ant-menu-item]:mb-2 [&_.ant-menu-item:hover]:bg-white/10 [&_.ant-menu-item-selected]:bg-white/20 [&_.ant-menu-item-selected]:shadow-lg [&_.ant-menu-submenu-title]:rounded-xl [&_.ant-menu-submenu-title:hover]:bg-white/10"
        aria-label="Dashboard navigation menu"
      />
    </>
  );

  return (
    <Layout
      style={{ minHeight: "100vh" }}
      className="bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
    >
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={260}
          className="!bg-gradient-to-b !from-indigo-600 !via-indigo-700 !to-indigo-800 dark:!from-indigo-900 dark:!via-indigo-950 dark:!to-gray-950 shadow-2xl !fixed !left-0 !top-0 !bottom-0 !h-screen overflow-auto z-10 transition-all duration-300"
          trigger={null}
          theme="dark"
        >
          {sidebarContent}
        </Sider>
      )}

      {/* Mobile Drawer */}
      <Drawer
        title={
          <div className="flex items-center justify-between">
            <Image
              src={logoSrc}
              alt="Harvesters International Christian Centre"
              width={140}
              height={50}
              className="object-contain"
            />
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="text-white hover:text-gray-300"
              aria-label="Close menu"
            >
              <CloseOutlined />
            </button>
          </div>
        }
        placement="left"
        closable={false}
        onClose={() => setMobileDrawerOpen(false)}
        open={isMobile && mobileDrawerOpen}
        className="[&_.ant-drawer-header]:!bg-gradient-to-r [&_.ant-drawer-header]:!from-indigo-600 [&_.ant-drawer-header]:!to-indigo-700 [&_.ant-drawer-body]:!bg-gradient-to-b [&_.ant-drawer-body]:!from-indigo-600 [&_.ant-drawer-body]:!via-indigo-700 [&_.ant-drawer-body]:!to-indigo-800 [&_.ant-drawer-body]:!p-0"
        width={280}
      >
        {sidebarContent}
      </Drawer>

      <Layout
        className="transition-all duration-300"
        style={{
          marginLeft: isMobile ? 0 : collapsed ? 80 : 260,
        }}
      >
        <Header className="!bg-white dark:!bg-gray-800 !p-0 shadow-sm sticky top-0 z-10 backdrop-blur-sm">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-4">
              {isMobile && (
                <button
                  onClick={() => setMobileDrawerOpen(true)}
                  className="text-2xl text-gray-700 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  aria-label="Open menu"
                >
                  <MenuOutlined />
                </button>
              )}
              {!isMobile && (
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className="text-2xl text-gray-700 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  aria-label={collapsed ? "Expand menu" : "Collapse menu"}
                >
                  <MenuOutlined />
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              {user && (
                <Dropdown
                  menu={{ items: profileMenuItems }}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <button
                    className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="User profile menu"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white font-medium">
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </div>
                    <span className="hidden sm:inline text-gray-700 dark:text-white font-medium">
                      {user.firstName} {user.lastName}
                    </span>
                  </button>
                </Dropdown>
              )}
            </div>
          </div>
        </Header>

        <Content className="p-6 min-h-[calc(100vh-64px)]">{children}</Content>
      </Layout>
    </Layout>
  );
}
