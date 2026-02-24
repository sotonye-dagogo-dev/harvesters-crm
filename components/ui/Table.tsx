"use client";

import { Table as AntTable, TableProps, Dropdown, Empty } from "antd";
import { MoreOutlined, SearchOutlined } from "@ant-design/icons";
import { useState, useMemo, ReactNode } from "react";
import type { MenuProps } from "antd";
import { ConfirmModal } from "./Modal";

// ─── Action Types ───────────────────────────────────────────────────────────

export interface TableAction<T> {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: (record: T) => void;
  danger?: boolean;
  confirm?: {
    title: string;
    description?: string;
  };
  hidden?: (record: T) => boolean;
  disabled?: (record: T) => boolean;
}

// ─── Table Props ────────────────────────────────────────────────────────────

interface CustomTableProps<T> extends TableProps<T> {
  /** Enable global search bar that filters across all string fields */
  searchable?: boolean;
  /** Enable horizontal scrolling on mobile (default: true) */
  responsiveScroll?: boolean;
  /** Row actions rendered as ellipsis dropdown menu */
  actions?: TableAction<T>[];
  /** Custom title for actions column (default: "Actions") */
  actionsColumnTitle?: string;
  /** Fixed width for actions column (default: 70) */
  actionsColumnWidth?: number;
  /** Text shown when table is empty */
  emptyText?: string;
  /** Search input placeholder */
  searchPlaceholder?: string;
}

// ─── Action Cell Component ──────────────────────────────────────────────────

function ActionCell<T extends object>({
  record,
  actions,
}: {
  record: T;
  actions: TableAction<T>[];
}) {
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    action: TableAction<T> | null;
  }>({ open: false, action: null });

  const visibleActions = actions.filter((a) => !a.hidden?.(record));

  if (visibleActions.length === 0) return null;

  const menuItems: MenuProps["items"] = visibleActions.map((action) => ({
    key: action.key,
    label: (
      <span className="flex items-center gap-2">
        {action.icon && <span className="text-base">{action.icon}</span>}
        {action.label}
      </span>
    ),
    danger: action.danger,
    disabled: action.disabled?.(record),
  }));

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    const action = visibleActions.find((a) => a.key === key);
    if (!action) return;

    if (action.confirm) {
      setConfirmState({ open: true, action });
    } else {
      action.onClick(record);
    }
  };

  return (
    <>
      <Dropdown
        menu={{ items: menuItems, onClick: handleMenuClick }}
        trigger={["click"]}
        placement="bottomRight"
      >
        <button
          className="inline-flex items-center justify-center w-8 h-8 rounded-[var(--ds-radius-md)] text-ds-text-secondary hover:text-ds-text-primary hover:bg-ds-surface-sunken transition-all duration-200 cursor-pointer border-0 bg-transparent"
          onClick={(e) => e.stopPropagation()}
          aria-label="Row actions"
        >
          <MoreOutlined className="text-lg" />
        </button>
      </Dropdown>

      {confirmState.action?.confirm && (
        <ConfirmModal
          open={confirmState.open}
          title={confirmState.action.confirm.title}
          content={confirmState.action.confirm.description}
          danger={confirmState.action.danger}
          onConfirm={() => {
            confirmState.action?.onClick(record);
            setConfirmState({ open: false, action: null });
          }}
          onCancel={() => setConfirmState({ open: false, action: null })}
        />
      )}
    </>
  );
}

// ─── Main Table Component ───────────────────────────────────────────────────

export default function Table<T extends object>({
  searchable = false,
  responsiveScroll = true,
  actions,
  actionsColumnTitle = "Actions",
  actionsColumnWidth = 70,
  emptyText = "No data found",
  searchPlaceholder = "Search...",
  scroll,
  columns,
  dataSource,
  ...props
}: CustomTableProps<T>) {
  const [searchText, setSearchText] = useState("");

  // Global search: filter dataSource across all string values
  const filteredData = useMemo(() => {
    if (!searchable || !searchText.trim() || !dataSource) return dataSource;

    const query = searchText.toLowerCase().trim();
    return dataSource.filter((record) =>
      Object.values(record as Record<string, unknown>).some((val) => {
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(query);
      })
    );
  }, [searchable, searchText, dataSource]);

  // Append actions column if actions are provided
  const mergedColumns = useMemo(() => {
    if (!actions || actions.length === 0) return columns;

    const actionColumn = {
      title: actionsColumnTitle,
      key: "__actions",
      width: actionsColumnWidth,
      fixed: "right" as const,
      render: (_: unknown, record: T) => (
        <ActionCell record={record} actions={actions} />
      ),
    };

    return [...(columns || []), actionColumn];
  }, [columns, actions, actionsColumnTitle, actionsColumnWidth]);

  // Enable horizontal scroll on mobile by default
  const defaultScroll = responsiveScroll ? { x: 800, ...scroll } : scroll;

  return (
    <div className="w-full overflow-x-auto">
      {searchable && (
        <div className="mb-4">
          <div className="relative max-w-md">
            <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-ds-text-subtle z-10" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchText}
              className="w-full pl-9 pr-4 py-2 border border-ds-border-base bg-ds-surface-sunken text-ds-text-primary rounded-[var(--ds-radius-lg)] focus:outline-none focus:ring-2 focus:ring-ds-brand-accent focus:border-ds-brand-accent transition-all duration-200 text-sm"
              onChange={(e) => setSearchText(e.target.value)}
            />
            {searchText && (
              <button
                onClick={() => setSearchText("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ds-text-subtle hover:text-ds-text-primary transition-colors cursor-pointer bg-transparent border-0 text-xs"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}
      <AntTable<T>
        {...props}
        columns={mergedColumns}
        dataSource={filteredData}
        scroll={defaultScroll}
        className={`custom-table ${props.className || ""}`}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="text-ds-text-secondary">{emptyText}</span>
              }
            />
          ),
          ...props.locale,
        }}
        pagination={
          props.pagination === false
            ? false
            : {
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`,
                pageSizeOptions: ["10", "20", "50", "100"],
                ...props.pagination,
              }
        }
      />
    </div>
  );
}

// ─── Table Header Sub-component ─────────────────────────────────────────────

interface TableHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function TableHeader({ title, subtitle, actions }: TableHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
      <div>
        <h3 className="text-lg font-semibold text-ds-text-primary">{title}</h3>
        {subtitle && (
          <p className="text-sm text-ds-text-secondary mt-1">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
