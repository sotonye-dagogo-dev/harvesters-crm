import { Table as AntTable, TableProps } from "antd";
import { useState, ReactNode } from "react";

interface CustomTableProps<T> extends TableProps<T> {
  searchable?: boolean;
  responsiveScroll?: boolean;
}

export default function Table<T extends object>({
  searchable = false,
  responsiveScroll = true,
  scroll,
  ...props
}: CustomTableProps<T>) {
  const [, setSearchText] = useState("");

  // Enable horizontal scroll on mobile by default
  const defaultScroll = responsiveScroll ? { x: 800, ...scroll } : scroll;

  return (
    <div className="w-full overflow-x-auto">
      {searchable && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-church-primary"
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      )}
      <AntTable<T>
        {...props}
        scroll={defaultScroll}
        className={`custom-table ${props.className || ""}`}
        pagination={{
          ...props.pagination,
          showSizeChanger: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
      />
    </div>
  );
}

interface TableHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function TableHeader({ title, subtitle, actions }: TableHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
