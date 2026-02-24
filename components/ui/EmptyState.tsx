import { Empty as AntEmpty } from "antd";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({
  icon,
  title = "No Data",
  description = "There is no data to display",
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      {icon && <div className="text-6xl text-ds-text-subtle mb-4">{icon}</div>}
      <AntEmpty
        image={AntEmpty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div>
            <p className="text-lg font-medium text-ds-text-primary mb-1">
              {title}
            </p>
            <p className="text-sm text-ds-text-secondary">{description}</p>
          </div>
        }
      >
        {action && <div className="mt-4">{action}</div>}
      </AntEmpty>
    </div>
  );
}
