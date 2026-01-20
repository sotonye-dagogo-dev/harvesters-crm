import { Layout } from "antd";
import { ReactNode } from "react";

const { Header, Content, Footer } = Layout;

interface AppHeaderProps {
  title: string;
  actions?: ReactNode;
}

export function AppHeader({ title, actions }: AppHeaderProps) {
  return (
    <Header className="!w-full !text-white !px-2 !flex !items-center !justify-center !gap-4 !h-16">
      <h1 className="text-xl font-semibold m-0">
        {title}
      </h1>
      {actions && <div className="flex items-center gap-4">{actions}</div>}
    </Header>
  );
}

interface AppFooterProps {
  className?: string;
}

export function AppFooter({ className = "" }: AppFooterProps) {
  return (
    <Footer className={`text-center bg-gray-50 dark:bg-slate-900 ${className}`}>
      <p className="text-gray-600 dark:text-gray-400 text-sm m-0">
        Church Fellowship CRM © {new Date().getFullYear()}
      </p>
    </Footer>
  );
}

interface AppContentProps {
  children: ReactNode;
  className?: string;
}

export function AppContent({ children, className = "" }: AppContentProps) {
  return (
    <Content className={`p-6 ${className}`}>
      <div className="max-w-7xl mx-auto">{children}</div>
    </Content>
  );
}
