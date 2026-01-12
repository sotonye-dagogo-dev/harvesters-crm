import { Layout } from "antd";
import { ReactNode } from "react";

const { Header, Content, Footer } = Layout;

interface AppHeaderProps {
  title: string;
  actions?: ReactNode;
}

export function AppHeader({ title, actions }: AppHeaderProps) {
  return (
    <Header className="bg-white border-b border-gray-200 px-6 flex items-center justify-between h-16">
      <h1 className="text-xl font-semibold text-gray-900 m-0">{title}</h1>
      {actions && <div className="flex items-center gap-4">{actions}</div>}
    </Header>
  );
}

interface AppFooterProps {
  className?: string;
}

export function AppFooter({ className = "" }: AppFooterProps) {
  return (
    <Footer className={`text-center bg-gray-50 ${className}`}>
      <p className="text-gray-600 text-sm m-0">
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
