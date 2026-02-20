import { ReactNode } from "react";
import { Spin, Empty } from "antd";
import Card from "./Card";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  icon,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold text-ds-text-primary flex items-center gap-2">
          {icon}
          {title}
        </h2>
        {subtitle && <p className="text-ds-text-secondary mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

interface PageLoadingProps {
  message?: string;
}

export function PageLoading({ message = "Loading..." }: PageLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center h-96 gap-4">
      <Spin size="large" />
      {message && <p className="text-ds-text-secondary">{message}</p>}
    </div>
  );
}

interface PageEmptyProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function PageEmpty({
  title = "No data found",
  description,
  icon,
  action,
}: PageEmptyProps) {
  return (
    <Card>
      <div className="text-center py-12">
        {icon && (
          <div className="text-6xl text-ds-text-subtle mb-4">{icon}</div>
        )}
        <h3 className="text-lg font-semibold text-ds-text-primary mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-ds-text-secondary mb-4">{description}</p>
        )}
        {action && <div className="mt-4">{action}</div>}
      </div>
    </Card>
  );
}

interface PageErrorProps {
  error: string;
  onRetry?: () => void;
}

export function PageError({ error, onRetry }: PageErrorProps) {
  return (
    <Card>
      <Empty
        description={
          <div className="space-y-4">
            <p className="text-ds-status-error">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-ds-brand-accent text-white rounded-[var(--ds-radius-lg)] hover:bg-ds-brand-accent-hover transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        }
      />
    </Card>
  );
}

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveContainer({
  children,
  className = "",
}: ResponsiveContainerProps) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <div className="min-w-full">{children}</div>
    </div>
  );
}

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({
  children,
  className = "",
}: PageContainerProps) {
  return <div className={`space-y-6 ${className}`}>{children}</div>;
}
