"use client";

import { Layout, Menu, Drawer, Dropdown } from "antd";
import { ReactNode, useState, useEffect, useLayoutEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
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
} from "@ant-design/icons";
import { useAuth } from "@/providers/AuthProvider";
import { AppHeader } from "@/components/ui/Layout";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import type { MenuProps } from "antd";

const { Sider, Content, Header } = Layout;

interface DashboardLayoutProps {
  children: ReactNode;
  role?: "SUPERADMIN" | "LEADER" | "MEMBER";
}

export default function DashboardLayout({
  children,
  role: propRole,
}: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Use prop role if provided, otherwise use user role from auth context
  const role = propRole || (user?.role as "SUPERADMIN" | "LEADER" | "MEMBER");

  // Set mounted flag to prevent hydration mismatch
  // This is intentional to avoid hydration issues with dynamic content
  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    return () => setMounted(false);
  }, []);

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

    const rolePath = role.toLowerCase();
    const commonItems = [
      {
        key: "dashboard",
        icon: <DashboardOutlined />,
        label: <Link href={`/${rolePath}/dashboard`}>Dashboard</Link>,
        onClick: handleMenuClick,
      },
    ];

    if (role === "SUPERADMIN") {
      return [
        ...commonItems,
        {
          key: "groups",
          icon: <TeamOutlined />,
          label: <Link href="/superadmin/groups">Groups</Link>,
          onClick: handleMenuClick,
        },
        {
          key: "members",
          icon: <UserOutlined />,
          label: <Link href="/superadmin/members">Members</Link>,
          onClick: handleMenuClick,
        },
        {
          key: "analytics",
          icon: <FileTextOutlined />,
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

    if (role === "LEADER") {
      return [
        ...commonItems,
        {
          key: "my-group",
          icon: <TeamOutlined />,
          label: <Link href="/leader/my-group">My Group</Link>,
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
          key: "settings",
          icon: <SettingOutlined />,
          label: "Settings",
          children: [
            {
              key: "meeting-reminders",
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
    }

    // MEMBER
    return [
      ...commonItems,
      {
        key: "my-group",
        icon: <TeamOutlined />,
        label: <Link href="/member/my-group">My Group</Link>,
        onClick: handleMenuClick,
      },
      {
        key: "history",
        icon: <FileTextOutlined />,
        label: <Link href="/member/history">My History</Link>,
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
  // Determine logo to use based on theme (dark-bg logo for dark sidebar, white-bg logo for light sidebar)
  // Since sidebar has dark background, we use the dark-bg logo (white text)
  const logoSrc = "/logo/dark-bg-harvesters-Logo.jpg";

  // Sidebar content (shared between desktop and mobile)
  const sidebarContent = (
    <>
      <div className="h-20 flex items-center justify-center border-b border-white/10 backdrop-blur-sm px-4">
        {!collapsed || isMobile ? (
          <div className="flex items-center justify-center w-full">
            {mounted && (
              <Image
                src={logoSrc}
                alt="Harvesters International Christian Centre"
                width={180}
                height={60}
                className="object-contain"
                priority
              />
            )}
          </div>
        ) : (
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/10 backdrop-blur-sm">
            {mounted && (
              <Image
                src={logoSrc}
                alt="HICC"
                width={40}
                height={40}
                className="object-contain rounded-lg"
                priority
              />
            )}
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
      className="bg-white dark:bg-slate-950"
    >
      {/* Desktop Sidebar (Fixed position) */}
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          className="!bg-gradient-to-b !from-green-800 !via-green-700 !to-green-900 dark:!from-slate-900 dark:!via-slate-800 dark:!to-slate-950 shadow-2xl !fixed !left-0 !top-0 !h-screen !overflow-y-auto !z-10"
          width={280}
          collapsedWidth={80}
          aria-label="Main navigation sidebar"
        >
          {sidebarContent}
        </Sider>
      )}

      {/* Mobile Drawer (Overlay) */}
      <Drawer
        placement="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        width={280}
        styles={{
          body: { padding: 0 },
          header: { display: "none" },
        }}
        className="[&_.ant-drawer-body]:!bg-gradient-to-b [&_.ant-drawer-body]:!from-green-800 [&_.ant-drawer-body]:!via-green-700 [&_.ant-drawer-body]:!to-green-900 dark:[&_.ant-drawer-body]:!from-slate-900 dark:[&_.ant-drawer-body]:!via-slate-800 dark:[&_.ant-drawer-body]:!to-slate-950"
      >
        <div className="flex justify-end p-4">
          <button
            onClick={() => setMobileDrawerOpen(false)}
            className="text-white/80 hover:text-white text-2xl p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <CloseOutlined />
          </button>
        </div>
        {sidebarContent}
      </Drawer>

      <Layout
        className="bg-white dark:bg-slate-950"
        style={{
          marginLeft: !isMobile ? (collapsed ? 80 : 280) : 0,
          transition: "margin-left 0.2s",
        }}
      >
        <Header className="!bg-white dark:!bg-slate-900 !p-0 shadow-sm border-b border-gray-200 dark:border-slate-700 !sticky !top-0 !z-[5]">
          <div className="h-full flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              {isMobile && (
                <button
                  onClick={() => setMobileDrawerOpen(true)}
                  className="text-gray-700 dark:text-gray-200 text-2xl p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  aria-label="Open menu"
                >
                  <MenuOutlined />
                </button>
              )}
              <AppHeader
                title={`Welcome, ${user?.firstName || "User"}`}
                actions={
                  <div className="w-full flex items-center gap-5">
                    <ThemeToggle />
                    {role && (
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm">
                        {role === "SUPERADMIN"
                          ? "Super Admin"
                          : role.charAt(0) + role.slice(1).toLowerCase()}
                      </span>
                    )}
                    <Dropdown
                      menu={{ items: profileMenuItems }}
                      trigger={["click"]}
                      placement="bottomRight"
                    >
                      <div
                        className="w-11 h-11 rounded-full bg-gradient-to-br from-green-600 to-green-800 dark:from-green-700 dark:to-green-900 flex items-center justify-center text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                        aria-label={`${user?.firstName} ${user?.lastName} profile`}
                        title={`${user?.firstName} ${user?.lastName}`}
                      >
                        {user?.firstName?.[0]}
                        {user?.lastName?.[0]}
                      </div>
                    </Dropdown>
                  </div>
                }
              />
            </div>
          </div>
        </Header>

        <Content
          className="overflow-y-auto bg-gray-50 dark:bg-slate-950"
          style={{ height: "calc(100vh - 64px)" }}
        >
          <main
            id="main-content"
            tabIndex={-1}
            aria-label="Main content"
            className="p-6 md:p-8"
          >
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>

          {/* Footer with public links */}
          <footer className="mt-16 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    About
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <Link
                        href="/about"
                        className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                      >
                        About Us
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/contact"
                        className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                      >
                        Contact
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Resources
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <Link
                        href="/terms"
                        className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                      >
                        Terms of Service
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/privacy"
                        className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                      >
                        Privacy Policy
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Support
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a
                        href="mailto:support@harvestersintl.org"
                        className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                      >
                        Email Support
                      </a>
                    </li>
                    <li>
                      <Link
                        href="/contact"
                        className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                      >
                        Help Center
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Harvesters HICC
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Changing lives by pioneering thriving churches
                  </p>
                </div>
              </div>
              <div className="pt-6 border-t border-gray-200 dark:border-slate-800 text-center text-sm text-gray-600 dark:text-gray-400">
                <p>
                  &copy; {new Date().getFullYear()} Harvesters International
                  Christian Centre. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </Content>
      </Layout>
    </Layout>
  );
}
