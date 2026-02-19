"use client";

import { Select, DatePicker, Space, Button, Input } from "antd";
import { SearchOutlined, ClearOutlined } from "@ant-design/icons";
import { ReportStatus, ReportPeriodType } from "@/lib/types";
import {
  REPORT_STATUS_LABELS,
  REPORT_PERIOD_LABELS,
} from "@/lib/constants/reports";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

interface ReportFilterBarProps {
  filters: ReportFilters;
  onChange: (filters: ReportFilters) => void;
  /** Available campuses for the campus filter */
  campuses?: Array<{ id: string; name: string }>;
  /** Available templates */
  templates?: Array<{ id: string; name: string }>;
  /** Whether to show campus filter (hidden for scoped roles) */
  showCampusFilter?: boolean;
  /** Whether to show template filter */
  showTemplateFilter?: boolean;
  className?: string;
}

interface ReportFilters {
  status?: ReportStatus;
  periodType?: ReportPeriodType;
  campusId?: string;
  templateId?: string;
  groupId?: string;
  search?: string;
  dateRange?: [string, string];
}

export type { ReportFilters };

/**
 * Filter bar for report list pages.
 * Shows status, period type, campus, template, search, and date range filters.
 */
export default function ReportFilterBar({
  filters,
  onChange,
  campuses = [],
  templates = [],
  showCampusFilter = true,
  showTemplateFilter = true,
  className,
}: ReportFilterBarProps) {
  const handleClear = () => {
    onChange({});
  };

  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== ""
  );

  return (
    <div className={`flex flex-wrap gap-3 items-center ${className ?? ""}`}>
      <Input
        placeholder="Search reports…"
        prefix={<SearchOutlined className="text-gray-400" />}
        value={filters.search}
        onChange={(e) =>
          onChange({ ...filters, search: e.target.value || undefined })
        }
        allowClear
        className="w-48"
      />

      <Select
        placeholder="Status"
        value={filters.status}
        onChange={(value) =>
          onChange({ ...filters, status: value || undefined })
        }
        allowClear
        className="w-40"
        options={Object.entries(REPORT_STATUS_LABELS).map(([value, label]) => ({
          value,
          label,
        }))}
      />

      <Select
        placeholder="Period"
        value={filters.periodType}
        onChange={(value) =>
          onChange({ ...filters, periodType: value || undefined })
        }
        allowClear
        className="w-36"
        options={Object.entries(REPORT_PERIOD_LABELS).map(([value, label]) => ({
          value,
          label,
        }))}
      />

      {showCampusFilter && campuses.length > 0 && (
        <Select
          placeholder="Campus"
          value={filters.campusId}
          onChange={(value) =>
            onChange({ ...filters, campusId: value || undefined })
          }
          allowClear
          className="w-44"
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          options={campuses.map((c) => ({ value: c.id, label: c.name }))}
        />
      )}

      {showTemplateFilter && templates.length > 0 && (
        <Select
          placeholder="Template"
          value={filters.templateId}
          onChange={(value) =>
            onChange({ ...filters, templateId: value || undefined })
          }
          allowClear
          className="w-48"
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          options={templates.map((t) => ({ value: t.id, label: t.name }))}
        />
      )}

      <Space.Compact>
        <RangePicker
          value={
            filters.dateRange
              ? [dayjs(filters.dateRange[0]), dayjs(filters.dateRange[1])]
              : null
          }
          onChange={(dates) =>
            onChange({
              ...filters,
              dateRange: dates
                ? [
                    dates[0]!.startOf("day").toISOString(),
                    dates[1]!.endOf("day").toISOString(),
                  ]
                : undefined,
            })
          }
          format="YYYY-MM-DD"
        />
      </Space.Compact>

      {hasActiveFilters && (
        <Button
          icon={<ClearOutlined />}
          onClick={handleClear}
          size="small"
          type="text"
        >
          Clear
        </Button>
      )}
    </div>
  );
}
