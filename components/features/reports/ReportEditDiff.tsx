"use client";

import { Descriptions, Tag, Divider, Typography, Empty } from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import { MetricFieldType } from "@/lib/types";

const { Text } = Typography;

interface DiffMetric {
  metricName: string;
  fieldType: MetricFieldType;
  // Original values
  originalMonthlyGoal?: number;
  originalMonthlyAchieved?: number;
  originalYoyGoal?: number;
  originalTextValue?: string;
  // Proposed new values
  monthlyGoal?: number;
  monthlyAchieved?: number;
  yoyGoal?: number;
  textValue?: string;
}

interface DiffSection {
  sectionName: string;
  metrics: DiffMetric[];
}

interface ReportEditDiffProps {
  sections: DiffSection[];
  /** Display mode */
  mode?: "inline" | "side-by-side";
  className?: string;
}

function formatValue(
  value: number | string | undefined,
  fieldType: MetricFieldType
): string {
  if (value === undefined || value === null) return "—";
  if (typeof value === "string") return value || "—";
  if (fieldType === MetricFieldType.CURRENCY)
    return `₦${value.toLocaleString()}`;
  if (fieldType === MetricFieldType.PERCENTAGE) return `${value}%`;
  return value.toLocaleString();
}

function DiffValue({
  original,
  proposed,
  fieldType,
}: {
  original: number | string | undefined;
  proposed: number | string | undefined;
  fieldType: MetricFieldType;
}) {
  const origStr = formatValue(original, fieldType);
  const propStr = formatValue(proposed, fieldType);
  const hasChanged = origStr !== propStr;

  if (!hasChanged) {
    return <Text className="text-gray-500">{origStr}</Text>;
  }

  // Determine direction for numeric values
  let changeIcon = <MinusOutlined />;
  let changeColor = "text-gray-500";
  if (typeof original === "number" && typeof proposed === "number") {
    if (proposed > original) {
      changeIcon = <ArrowUpOutlined />;
      changeColor = "text-green-600";
    } else if (proposed < original) {
      changeIcon = <ArrowDownOutlined />;
      changeColor = "text-red-600";
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Text delete className="text-gray-400">
        {origStr}
      </Text>
      <span className={changeColor}>{changeIcon}</span>
      <Text strong className={changeColor}>
        {propStr}
      </Text>
    </div>
  );
}

/**
 * Side-by-side or inline diff between main report values and proposed edit values.
 * Highlights changed fields with directional arrows.
 */
export default function ReportEditDiff({
  sections,
  mode = "inline",
  className,
}: ReportEditDiffProps) {
  if (!sections.length) {
    return (
      <Empty
        description="No changes to display"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  const hasAnyChanges = sections.some((section) =>
    section.metrics.some((m) => {
      const goalChanged =
        m.originalMonthlyGoal !== m.monthlyGoal &&
        (m.originalMonthlyGoal !== undefined || m.monthlyGoal !== undefined);
      const achievedChanged =
        m.originalMonthlyAchieved !== m.monthlyAchieved &&
        (m.originalMonthlyAchieved !== undefined ||
          m.monthlyAchieved !== undefined);
      const yoyChanged =
        m.originalYoyGoal !== m.yoyGoal &&
        (m.originalYoyGoal !== undefined || m.yoyGoal !== undefined);
      const textChanged =
        m.originalTextValue !== m.textValue &&
        (m.originalTextValue !== undefined || m.textValue !== undefined);
      return goalChanged || achievedChanged || yoyChanged || textChanged;
    })
  );

  if (!hasAnyChanges) {
    return (
      <div className={className}>
        <Tag color="default">No changes detected</Tag>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-4 ${className ?? ""}`}>
      {sections.map((section) => (
        <div key={section.sectionName}>
          <Text strong className="text-base">
            {section.sectionName}
          </Text>
          <Divider className="my-2" />

          {mode === "inline" ? (
            <Descriptions column={1} size="small" bordered>
              {section.metrics.map((metric) => (
                <Descriptions.Item
                  key={metric.metricName}
                  label={metric.metricName}
                  className="align-top"
                >
                  <div className="flex flex-wrap gap-4">
                    {metric.fieldType === MetricFieldType.TEXT ? (
                      <DiffValue
                        original={metric.originalTextValue}
                        proposed={metric.textValue}
                        fieldType={metric.fieldType}
                      />
                    ) : (
                      <>
                        {(metric.originalMonthlyGoal !== undefined ||
                          metric.monthlyGoal !== undefined) && (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-gray-400">Goal</span>
                            <DiffValue
                              original={metric.originalMonthlyGoal}
                              proposed={metric.monthlyGoal}
                              fieldType={metric.fieldType}
                            />
                          </div>
                        )}
                        {(metric.originalMonthlyAchieved !== undefined ||
                          metric.monthlyAchieved !== undefined) && (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-gray-400">
                              Achieved
                            </span>
                            <DiffValue
                              original={metric.originalMonthlyAchieved}
                              proposed={metric.monthlyAchieved}
                              fieldType={metric.fieldType}
                            />
                          </div>
                        )}
                        {(metric.originalYoyGoal !== undefined ||
                          metric.yoyGoal !== undefined) && (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-gray-400">
                              YoY Goal
                            </span>
                            <DiffValue
                              original={metric.originalYoyGoal}
                              proposed={metric.yoyGoal}
                              fieldType={metric.fieldType}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </Descriptions.Item>
              ))}
            </Descriptions>
          ) : (
            /* side-by-side mode */
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text className="text-sm font-medium text-gray-500 mb-2 block">
                  Original
                </Text>
                <Descriptions column={1} size="small" bordered>
                  {section.metrics.map((metric) => (
                    <Descriptions.Item
                      key={metric.metricName}
                      label={metric.metricName}
                    >
                      <div className="flex gap-3">
                        {metric.fieldType === MetricFieldType.TEXT ? (
                          <span>
                            {formatValue(
                              metric.originalTextValue,
                              metric.fieldType
                            )}
                          </span>
                        ) : (
                          <>
                            {metric.originalMonthlyGoal !== undefined && (
                              <span className="text-xs">
                                Goal:{" "}
                                {formatValue(
                                  metric.originalMonthlyGoal,
                                  metric.fieldType
                                )}
                              </span>
                            )}
                            {metric.originalMonthlyAchieved !== undefined && (
                              <span className="text-xs">
                                Ach:{" "}
                                {formatValue(
                                  metric.originalMonthlyAchieved,
                                  metric.fieldType
                                )}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </Descriptions.Item>
                  ))}
                </Descriptions>
              </div>
              <div>
                <Text className="text-sm font-medium text-blue-600 mb-2 block">
                  Proposed
                </Text>
                <Descriptions column={1} size="small" bordered>
                  {section.metrics.map((metric) => (
                    <Descriptions.Item
                      key={metric.metricName}
                      label={metric.metricName}
                    >
                      <div className="flex gap-3">
                        {metric.fieldType === MetricFieldType.TEXT ? (
                          <span>
                            {formatValue(metric.textValue, metric.fieldType)}
                          </span>
                        ) : (
                          <>
                            {metric.monthlyGoal !== undefined && (
                              <span className="text-xs">
                                Goal:{" "}
                                {formatValue(
                                  metric.monthlyGoal,
                                  metric.fieldType
                                )}
                              </span>
                            )}
                            {metric.monthlyAchieved !== undefined && (
                              <span className="text-xs">
                                Ach:{" "}
                                {formatValue(
                                  metric.monthlyAchieved,
                                  metric.fieldType
                                )}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </Descriptions.Item>
                  ))}
                </Descriptions>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
