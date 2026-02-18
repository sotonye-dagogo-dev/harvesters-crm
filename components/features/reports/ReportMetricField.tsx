"use client";

import { InputNumber, Input, Tooltip, Tag } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { MetricFieldType } from "@/lib/types";
import { METRIC_FIELD_TYPE_LABELS } from "@/lib/constants/reports";

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
}: ReportMetricFieldProps) {
  const disabled = isLocked || readOnly;
  const fieldTypeLabel = METRIC_FIELD_TYPE_LABELS[fieldType];

  const handleNumberChange = (field: keyof MetricValues, val: number | null) => {
    onChange({ ...value, [field]: val ?? undefined });
  };

  // For TEXT field type
  if (fieldType === MetricFieldType.TEXT) {
    return (
      <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {name}
            {isRequired && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          {isLocked && (
            <Tooltip title="This field is locked">
              <LockOutlined className="text-gray-400" />
            </Tooltip>
          )}
          <Tag className="text-xs">{fieldTypeLabel}</Tag>
        </div>
        <Input.TextArea
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
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {name}
          {isRequired && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {isLocked && (
          <Tooltip title="This field is locked">
            <LockOutlined className="text-gray-400" />
          </Tooltip>
        )}
        <Tag className="text-xs">{fieldTypeLabel}</Tag>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {capturesGoal && (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-500 dark:text-gray-400">
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
              className="w-32"
            />
          </div>
        )}

        {capturesAchieved && (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-500 dark:text-gray-400">
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
              className="w-32"
            />
          </div>
        )}

        {capturesYoY && (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-500 dark:text-gray-400">
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
              className="w-32"
            />
          </div>
        )}

        {/* Auto-computed percentage when both goal and achieved exist */}
        {capturesGoal && capturesAchieved && (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-500 dark:text-gray-400">
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
            <span className="text-xs text-gray-500 dark:text-gray-400">
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
