"use client";

import { Select, DatePicker } from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import Input from "./Input";
import { ReactNode } from "react";
import type { Dayjs } from "dayjs";
import Button from "./Button";

const { RangePicker } = DatePicker;

// ─── Filter Config Types ────────────────────────────────────────────────────

interface SelectFilterConfig {
  key: string;
  type: "select";
  label: string;
  placeholder?: string;
  options: { label: string; value: string }[];
  allowClear?: boolean;
  mode?: "multiple" | "tags";
  width?: number | string;
}

interface SearchFilterConfig {
  key: string;
  type: "search";
  label: string;
  placeholder?: string;
  width?: number | string;
}

interface DateFilterConfig {
  key: string;
  type: "date";
  label: string;
  placeholder?: string;
  width?: number | string;
}

interface DateRangeFilterConfig {
  key: string;
  type: "dateRange";
  label: string;
  placeholder?: [string, string];
  width?: number | string;
}

export type FilterConfig =
  | SelectFilterConfig
  | SearchFilterConfig
  | DateFilterConfig
  | DateRangeFilterConfig;

// ─── FilterToolbar Props ────────────────────────────────────────────────────

interface FilterToolbarProps {
  /** Array of filter configurations */
  filters: FilterConfig[];
  /** Current filter values */
  values: Record<string, unknown>;
  /** Called when any filter value changes */
  onChange: (key: string, value: unknown) => void;
  /** Called when reset button is clicked */
  onReset?: () => void;
  /** Additional action buttons (e.g., "Add New") */
  actions?: ReactNode;
  /** Layout direction */
  layout?: "horizontal" | "vertical";
  /** Additional CSS class */
  className?: string;
}

// ─── FilterToolbar Component ────────────────────────────────────────────────

export default function FilterToolbar({
  filters,
  values,
  onChange,
  onReset,
  actions,
  layout = "horizontal",
  className = "",
}: FilterToolbarProps) {
  const isHorizontal = layout === "horizontal";
  const hasActiveFilters = Object.values(values).some(
    (v) => v !== undefined && v !== null && v !== ""
  );

  const renderFilter = (config: FilterConfig) => {
    const defaultWidth = config.width || (isHorizontal ? 200 : "100%");

    switch (config.type) {
      case "select":
        return (
          <Select
            value={values[config.key] as string | string[] | undefined}
            onChange={(val) => onChange(config.key, val)}
            placeholder={config.placeholder || `Select ${config.label}`}
            allowClear={config.allowClear !== false}
            mode={config.mode}
            style={{ width: defaultWidth }}
            options={config.options}
          />
        );

      case "search":
        return (
          <Input
            value={values[config.key] as string | undefined}
            onChange={(e) => onChange(config.key, e.target.value)}
            placeholder={config.placeholder || `Search ${config.label}`}
            prefix={<SearchOutlined className="text-ds-text-subtle" />}
            allowClear
            style={{ width: defaultWidth }}
          />
        );

      case "date":
        return (
          <DatePicker
            value={values[config.key] as Dayjs | undefined}
            onChange={(val) => onChange(config.key, val)}
            placeholder={config.placeholder || `Select ${config.label}`}
            style={{ width: defaultWidth }}
          />
        );

      case "dateRange":
        return (
          <RangePicker
            value={values[config.key] as [Dayjs, Dayjs] | undefined}
            onChange={(val) => onChange(config.key, val)}
            placeholder={config.placeholder || ["Start date", "End date"]}
            style={{ width: defaultWidth }}
          />
        );
    }
  };

  return (
    <div
      className={`flex ${
        isHorizontal
          ? "flex-col sm:flex-row sm:items-center flex-wrap"
          : "flex-col"
      } gap-3 mb-4 ${className}`}
    >
      {filters.map((config) => (
        <div key={config.key} className="flex flex-col gap-1">
          {!isHorizontal && (
            <label className="text-xs font-medium text-ds-text-secondary uppercase tracking-wide">
              {config.label}
            </label>
          )}
          {renderFilter(config)}
        </div>
      ))}

      {onReset && hasActiveFilters && (
        <Button
          variant="text"
          size="small"
          icon={<ReloadOutlined />}
          onClick={onReset}
          className="text-ds-text-secondary hover:text-ds-text-primary"
        >
          Reset
        </Button>
      )}

      {actions && (
        <div
          className={`${isHorizontal ? "sm:ml-auto" : ""} flex flex-wrap gap-2`}
        >
          {actions}
        </div>
      )}
    </div>
  );
}
