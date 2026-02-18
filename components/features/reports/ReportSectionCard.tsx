"use client";

import { Collapse, Card as AntCard, Empty } from "antd";
import { MetricFieldType } from "@/lib/types";
import ReportMetricField from "./ReportMetricField";

interface SectionMetricValue {
  templateMetricId: string;
  monthlyGoal?: number;
  monthlyAchieved?: number;
  yoyGoal?: number;
  textValue?: string;
  computedPercentage?: number;
  yoyGrowth?: number;
  isLocked?: boolean;
}

interface SectionData {
  templateSectionId: string;
  sectionName: string;
  order: number;
  description?: string;
  isRequired?: boolean;
  metrics: SectionMetricData[];
  subSections?: SubSectionData[];
}

interface SubSectionData {
  name: string;
  description?: string;
  order: number;
  metrics: SectionMetricData[];
}

interface SectionMetricData {
  templateMetricId: string;
  name: string;
  fieldType: MetricFieldType;
  isRequired: boolean;
  minValue?: number;
  maxValue?: number;
  capturesGoal: boolean;
  capturesAchieved: boolean;
  capturesYoY: boolean;
  order: number;
}

interface ReportSectionCardProps {
  section: SectionData;
  /** Current metric values for this section */
  values: SectionMetricValue[];
  /** Callback when a metric value changes */
  onMetricChange: (
    templateMetricId: string,
    value: {
      monthlyGoal?: number;
      monthlyAchieved?: number;
      yoyGoal?: number;
      textValue?: string;
    }
  ) => void;
  /** Whether the form is in read-only mode */
  readOnly?: boolean;
  /** Whether the section starts expanded */
  defaultExpanded?: boolean;
  className?: string;
}

/**
 * Collapsible card for one report section.
 * Renders its child metrics and any sub-sections.
 */
export default function ReportSectionCard({
  section,
  values,
  onMetricChange,
  readOnly = false,
  defaultExpanded = true,
  className,
}: ReportSectionCardProps) {
  const getMetricValue = (templateMetricId: string): SectionMetricValue => {
    return (
      values.find((v) => v.templateMetricId === templateMetricId) ?? {
        templateMetricId,
      }
    );
  };

  const renderMetrics = (metrics: SectionMetricData[]) => {
    if (!metrics.length) {
      return <Empty description="No metrics in this section" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }

    return (
      <div className="flex flex-col gap-4">
        {metrics
          .sort((a, b) => a.order - b.order)
          .map((metric) => {
            const val = getMetricValue(metric.templateMetricId);
            return (
              <ReportMetricField
                key={metric.templateMetricId}
                name={metric.name}
                fieldType={metric.fieldType}
                capturesGoal={metric.capturesGoal}
                capturesAchieved={metric.capturesAchieved}
                capturesYoY={metric.capturesYoY}
                value={{
                  monthlyGoal: val.monthlyGoal,
                  monthlyAchieved: val.monthlyAchieved,
                  yoyGoal: val.yoyGoal,
                  textValue: val.textValue,
                }}
                onChange={(newVal) =>
                  onMetricChange(metric.templateMetricId, newVal)
                }
                isLocked={val.isLocked}
                readOnly={readOnly}
                minValue={metric.minValue}
                maxValue={metric.maxValue}
                isRequired={metric.isRequired}
                computedPercentage={val.computedPercentage}
                yoyGrowth={val.yoyGrowth}
              />
            );
          })}
      </div>
    );
  };

  const sectionContent = (
    <div className="flex flex-col gap-6">
      {section.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 -mt-1">
          {section.description}
        </p>
      )}

      {/* Direct metrics (no sub-section) */}
      {section.metrics.length > 0 && renderMetrics(section.metrics)}

      {/* Sub-sections */}
      {section.subSections &&
        section.subSections
          .sort((a, b) => a.order - b.order)
          .map((sub) => (
            <AntCard
              key={sub.name}
              size="small"
              title={sub.name}
              className="bg-gray-50 dark:bg-gray-800/50"
            >
              {sub.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  {sub.description}
                </p>
              )}
              {renderMetrics(sub.metrics)}
            </AntCard>
          ))}
    </div>
  );

  return (
    <Collapse
      defaultActiveKey={defaultExpanded ? [section.templateSectionId] : []}
      className={className}
      items={[
        {
          key: section.templateSectionId,
          label: (
            <div className="flex items-center gap-2">
              <span className="font-medium">{section.sectionName}</span>
              {section.isRequired && (
                <span className="text-xs text-red-500">(Required)</span>
              )}
              <span className="text-xs text-gray-400">
                {section.metrics.length +
                  (section.subSections?.reduce(
                    (sum, s) => sum + s.metrics.length,
                    0
                  ) ?? 0)}{" "}
                metrics
              </span>
            </div>
          ),
          children: sectionContent,
        },
      ]}
    />
  );
}
