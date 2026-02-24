"use client";

import { InputNumber, Tooltip, Tag } from "antd";
import { TextArea } from "@/components/ui/Input";
import { LockOutlined } from "@ant-design/icons";
import { MetricFieldType } from "@/lib/types";
import { METRIC_FIELD_TYPE_LABELS } from "@/lib/constants/reports";
import { useCallback } from "react";

interface MetricValues {
  monthlyGoal?: number;
  monthlyAchieved?: number;
  yoyGoal?: number;
  textValue?: string;
}

interface ReportMetricFieldProps {
  /** Metric name (display label) */
  name: string;
  fieldType: MetricFieldType;
  /** Whether this metric captures goal/achieved/yoy values */
  capturesGoal: boolean;
  capturesAchieved: boolean;
  capturesYoY: boolean;
  /** Current values */
  value: MetricValues;
  /** Callback when values change */
  onChange: (value: MetricValues) => void;
  /** Whether the field is locked (read-only) */
  isLocked?: boolean;
  /** Whether the form is in read-only mode */
  readOnly?: boolean;
  /** Validation constraints */
  minValue?: number;
  maxValue?: number;
  isRequired?: boolean;
  /** Auto-calculated percentage */
  computedPercentage?: number;
  /** Year-over-Year growth percentage (auto-calculated) */
  yoyGrowth?: number;
  className?: string;
  /** Metric row index for keyboard navigation (0-based) */
  metricIndex?: number;
}

/**
 * Input component for a single report metric.
 * Renders goal, achieved, and YoY inputs based on metric configuration.
 * Shows lock indicator and computed percentage when applicable.
 */
export default function ReportMetricField({
  name,
  fieldType,
  capturesGoal,
  capturesAchieved,
  capturesYoY,
  value,
  onChange,
  isLocked = false,
  readOnly = false,
  minValue,
  maxValue,
  isRequired = false,
  computedPercentage,
  yoyGrowth,
  className,
  metricIndex,
}: ReportMetricFieldProps) {
  const disabled = isLocked || readOnly;
  const fieldTypeLabel = METRIC_FIELD_TYPE_LABELS[fieldType];

  const handleNumberChange = (field: keyof MetricValues, val: number | null) => {
    onChange({ ...value, [field]: val ?? undefined });
  };

  /**
   * Keyboard navigation handler for metric InputNumber fields.
   * - ArrowDown / Enter: Focus the same column in the next metric row.
   * - ArrowUp: Focus the same column in the previous metric row.
   * - ArrowLeft / ArrowRight: Move between columns (Goal ↔ Achieved ↔ YoY) within the same row.
   */
  const handleFieldKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>, column: string) => {
      if (metricIndex === undefined) return;
      const navKeys = ["ArrowDown", "ArrowUp", "Enter", "ArrowLeft", "ArrowRight"];
      if (!navKeys.includes(e.key)) return;

      // Don't hijack normal text cursor movement inside InputNumber
      // ArrowLeft/ArrowRight should only navigate columns when user isn't mid-edit
      // We allow ArrowLeft/Right always between columns since InputNumber doesn't heavily use them.
      const targetRow =
        e.key === "ArrowDown" || e.key === "Enter"
          ? metricIndex + 1
          : e.key === "ArrowUp"
            ? metricIndex - 1
            : metricIndex;

      let targetColumn = column;
      const columns = ["goal", "achieved", "yoy"].filter((c) => {
        if (c === "goal") return capturesGoal;
        if (c === "achieved") return capturesAchieved;
        if (c === "yoy") return capturesYoY;
        return false;
      });

      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const colIdx = columns.indexOf(column);
        if (colIdx === -1) return;
        const nextIdx = e.key === "ArrowRight" ? colIdx + 1 : colIdx - 1;
        if (nextIdx < 0 || nextIdx >= columns.length) return; // at edge — do nothing
        targetColumn = columns[nextIdx];
      }

      // Find the target InputNumber via data attributes
      const selector = `[data-metric-row="${targetRow}"][data-metric-col="${targetColumn}"]`;
      const targetEl = document.querySelector<HTMLElement>(selector);
      if (targetEl) {
        e.preventDefault();
        // Ant Design InputNumber renders an <input> inside the wrapper
        const input = targetEl.querySelector<HTMLInputElement>("input");
        if (input) {
          input.focus();
          input.select();
        } else {
          targetEl.focus();
        }
      }
    },
    [metricIndex, capturesGoal, capturesAchieved, capturesYoY]
  );

  // For TEXT field type
  if (fieldType === MetricFieldType.TEXT) {
    return (
      <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-ds-text-secondary">
            {name}
            {isRequired && <span className="text-ds-status-error ml-0.5">*</span>}
          </label>
          {isLocked && (
            <Tooltip title="This field is locked">
              <LockOutlined className="text-ds-text-subtle" />
            </Tooltip>
          )}
          <Tag className="text-xs">{fieldTypeLabel}</Tag>
        </div>
        <TextArea
          value={value.textValue}
          onChange={(e) => onChange({ ...value, textValue: e.target.value })}
          disabled={disabled}
          rows={2}
          placeholder={`Enter ${name.toLowerCase()}…`}
          className="max-w-lg"
        />
      </div>
    );
  }

  // For numeric field types (NUMBER, PERCENTAGE, CURRENCY)
  const prefix =
    fieldType === MetricFieldType.CURRENCY ? "₦" : undefined;
  const suffix =
    fieldType === MetricFieldType.PERCENTAGE ? "%" : undefined;

  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-ds-text-secondary">
          {name}
          {isRequired && <span className="text-ds-status-error ml-0.5">*</span>}
        </label>
        {isLocked && (
          <Tooltip title="This field is locked">
            <LockOutlined className="text-ds-text-subtle" />
          </Tooltip>
        )}
        <Tag className="text-xs">{fieldTypeLabel}</Tag>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {capturesGoal && (
          <div
            className="flex flex-col gap-0.5"
            data-metric-row={metricIndex}
            data-metric-col="goal"
          >
            <span className="text-xs text-ds-text-subtle">
              Monthly Goal
            </span>
            <InputNumber
              value={value.monthlyGoal}
              onChange={(val) => handleNumberChange("monthlyGoal", val)}
              disabled={disabled}
              min={minValue}
              max={maxValue}
              prefix={prefix}
              suffix={suffix}
              placeholder="0"
              className="w-32 text-ds-text-primary"
              onKeyDown={(e) => handleFieldKeyDown(e, "goal")}
            />
          </div>
        )}

        {capturesAchieved && (
          <div
            className="flex flex-col gap-0.5"
            data-metric-row={metricIndex}
            data-metric-col="achieved"
          >
            <span className="text-xs text-ds-text-subtle">
              Monthly Achieved
            </span>
            <InputNumber
              value={value.monthlyAchieved}
              onChange={(val) => handleNumberChange("monthlyAchieved", val)}
              disabled={disabled}
              min={minValue}
              max={maxValue}
              prefix={prefix}
              suffix={suffix}
              placeholder="0"
              className="w-32 text-ds-text-primary"
              onKeyDown={(e) => handleFieldKeyDown(e, "achieved")}
            />
          </div>
        )}

        {capturesYoY && (
          <div
            className="flex flex-col gap-0.5"
            data-metric-row={metricIndex}
            data-metric-col="yoy"
          >
            <span className="text-xs text-ds-text-subtle">
              YoY Goal
            </span>
            <InputNumber
              value={value.yoyGoal}
              onChange={(val) => handleNumberChange("yoyGoal", val)}
              disabled={disabled}
              min={minValue}
              max={maxValue}
              prefix={prefix}
              suffix={suffix}
              placeholder="0"
              className="w-32 text-ds-text-primary"
              onKeyDown={(e) => handleFieldKeyDown(e, "yoy")}
            />
          </div>
        )}

        {/* Auto-computed percentage when both goal and achieved exist */}
        {capturesGoal && capturesAchieved && (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-ds-text-subtle">
              Achievement %
            </span>
            <Tooltip title="Auto-calculated: (Achieved / Goal) × 100">
              <Tag
                color={
                  computedPercentage !== undefined
                    ? computedPercentage >= 100
                      ? "success"
                      : computedPercentage >= 75
                        ? "processing"
                        : computedPercentage >= 50
                          ? "warning"
                          : "error"
                    : "default"
                }
                className="h-8 flex items-center justify-center text-sm font-medium min-w-[60px]"
              >
                {computedPercentage !== undefined
                  ? `${computedPercentage.toFixed(1)}%`
                  : "—"}
              </Tag>
            </Tooltip>
          </div>
        )}

        {/* YoY growth display */}
        {capturesYoY && yoyGrowth !== undefined && (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-ds-text-subtle">
              YoY Growth
            </span>
            <Tooltip title="Auto-calculated: ((Achieved − Last Year) / Last Year) × 100">
              <Tag
                color={yoyGrowth >= 0 ? "success" : "error"}
                className="h-8 flex items-center justify-center text-sm font-medium min-w-[60px]"
              >
                {yoyGrowth >= 0 ? "+" : ""}
                {yoyGrowth.toFixed(1)}%
              </Tag>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
}
