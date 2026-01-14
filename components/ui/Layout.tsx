import { Layout } from "antd";
import { ReactNode } from "react";
import Link from "next/link";

const { Header, Content, Footer } = Layout;

interface AppHeaderProps {
  title: string;
  actions?: ReactNode;
}

export function AppHeader({ title, actions }: AppHeaderProps) {
  return (
    <Header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 flex items-center justify-between h-16">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white m-0">
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
    <Footer
      className={`text-center bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 py-6 ${className}`}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <Link
            href="/about"
            className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          >
            Contact
          </Link>
          <Link
            href="/terms"
            className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          >
            Privacy
          </Link>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm m-0">
          Harvesters Small Groups CRM © {new Date().getFullYear()}
        </p>
      </div>
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
