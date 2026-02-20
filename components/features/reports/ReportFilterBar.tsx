"use client";

import { useMemo } from "react";
import { ReportStatus, ReportPeriodType } from "@/lib/types";
import {
  REPORT_STATUS_LABELS,
  REPORT_PERIOD_LABELS,
} from "@/lib/constants/reports";
import dayjs from "dayjs";
import FilterToolbar, { type FilterConfig } from "@/components/ui/FilterToolbar";
import type { Dayjs } from "dayjs";

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
 * Composes FilterToolbar with domain-specific filter configs.
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
  const filterConfigs = useMemo<FilterConfig[]>(() => {
    const configs: FilterConfig[] = [
      {
        key: "search",
        type: "search",
        label: "Search",
        placeholder: "Search reports…",
        width: 192,
      },
      {
        key: "status",
        type: "select",
        label: "Status",
        placeholder: "Status",
        options: Object.entries(REPORT_STATUS_LABELS).map(([value, label]) => ({
          value,
          label,
        })),
        width: 160,
      },
      {
        key: "periodType",
        type: "select",
        label: "Period",
        placeholder: "Period",
        options: Object.entries(REPORT_PERIOD_LABELS).map(([value, label]) => ({
          value,
          label,
        })),
        width: 144,
      },
    ];

    if (showCampusFilter && campuses.length > 0) {
      configs.push({
        key: "campusId",
        type: "select",
        label: "Campus",
        placeholder: "Campus",
        options: campuses.map((c) => ({ value: c.id, label: c.name })),
        width: 176,
      });
    }

    if (showTemplateFilter && templates.length > 0) {
      configs.push({
        key: "templateId",
        type: "select",
        label: "Template",
        placeholder: "Template",
        options: templates.map((t) => ({ value: t.id, label: t.name })),
        width: 192,
      });
    }

    configs.push({
      key: "dateRange",
      type: "dateRange",
      label: "Date Range",
    });

    return configs;
  }, [campuses, templates, showCampusFilter, showTemplateFilter]);

  // Convert ISO string date range to Dayjs for FilterToolbar
  const toolbarValues: Record<string, unknown> = {
    ...filters,
    dateRange: filters.dateRange
      ? [dayjs(filters.dateRange[0]), dayjs(filters.dateRange[1])]
      : undefined,
  };

  const handleChange = (key: string, value: unknown) => {
    if (key === "dateRange") {
      const dates = value as [Dayjs, Dayjs] | null;
      onChange({
        ...filters,
        dateRange: dates
          ? [
              dates[0].startOf("day").toISOString(),
              dates[1].endOf("day").toISOString(),
            ]
          : undefined,
      });
    } else {
      onChange({ ...filters, [key]: value || undefined });
    }
  };

  return (
    <FilterToolbar
      filters={filterConfigs}
      values={toolbarValues}
      onChange={handleChange}
      onReset={() => onChange({})}
      className={className}
    />
  );
}
