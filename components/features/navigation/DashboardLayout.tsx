"use client";

import { Layout, Menu, Drawer, Dropdown } from "antd";
import { ReactNode, useState, useEffect, useMemo } from "react";
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
  BellOutlined,
  MenuOutlined,
  CloseOutlined,
  GlobalOutlined,
  BankOutlined,
  ApartmentOutlined,
  UsergroupAddOutlined,
  ShareAltOutlined,
  BarChartOutlined,
  FormOutlined,
  PullRequestOutlined,
  MessageOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/providers/AuthProvider";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useTheme } from "next-themes";
import type { MenuProps } from "antd";
import { getRoleConfig } from "@/lib/constants/roles";

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

  // Icon mapping — converts string icon names from ROLE_CONFIG to React elements
  const iconMap: Record<string, React.ReactNode> = useMemo(
    () => ({
      DashboardOutlined: <DashboardOutlined />,
      TeamOutlined: <TeamOutlined />,
      UserOutlined: <UserOutlined />,
      CalendarOutlined: <CalendarOutlined />,
      PhoneOutlined: <PhoneOutlined />,
      FileTextOutlined: <FileTextOutlined />,
      SettingOutlined: <SettingOutlined />,
      LogoutOutlined: <LogoutOutlined />,
      BellOutlined: <BellOutlined />,
      GlobalOutlined: <GlobalOutlined />,
      BankOutlined: <BankOutlined />,
      ApartmentOutlined: <ApartmentOutlined />,
      UsergroupAddOutlined: <UsergroupAddOutlined />,
      ShareAltOutlined: <ShareAltOutlined />,
      BarChartOutlined: <BarChartOutlined />,
      FormOutlined: <FormOutlined />,
      PullRequestOutlined: <PullRequestOutlined />,
      MessageOutlined: <MessageOutlined />,
      HistoryOutlined: <HistoryOutlined />,
    }),
    []
  );

  // Convert a ROLE_CONFIG navItem to an Ant Design menu item
  const toMenuItem = (item: RoleNavItem): NonNullable<MenuProps["items"]>[number] => {
    if (item.children && item.children.length > 0) {
      return {
        key: item.key,
        icon: iconMap[item.icon] || <FileTextOutlined />,
        label: item.label,
        children: item.children.map(toMenuItem),
      };
    }

    return {
      key: item.key,
      icon: iconMap[item.icon] || <FileTextOutlined />,
      label: <Link href={item.path}>{item.label}</Link>,
      onClick: handleMenuClick,
    };
  };

  // Menu items based on role — driven entirely by ROLE_CONFIG
  const getMenuItems = (): MenuProps["items"] => {
    if (!role) return [];

    const roleConfig = getRoleConfig(role);
    const navItems = roleConfig.navItems;

    // Build menu from ROLE_CONFIG nav items
    const items: MenuProps["items"] = navItems.map(toMenuItem);

    // Append Settings submenu with notifications, profile, and logout
    const settingsPath = `${roleConfig.routePrefix}/settings`;
    items.push({
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
      children: [
        {
          key: "notifications",
          icon: <BellOutlined />,
          label: (
            <Link href={`${settingsPath}/notifications`}>Notifications</Link>
          ),
          onClick: handleMenuClick,
        },
        {
          key: "profile-settings",
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
    });

    return items;
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
