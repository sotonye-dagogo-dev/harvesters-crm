"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { message, Space, Divider, Typography, Modal, Alert } from "antd";
import Button from "@/components/ui/Button";
import { TextArea } from "@/components/ui/Input";
import {
  SaveOutlined,
  SendOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import ReportSectionCard from "./ReportSectionCard";
import ReportStatusBadge from "./ReportStatusBadge";
import ReportDeadlineCountdown from "./ReportDeadlineCountdown";
import { ReportStatus, MetricFieldType } from "@/lib/types";
import {
  computeAchievementPercentage,
  computeYoYGrowth,
  isReportFullyLocked,
  getFieldLockLabel,
  validateReportForSubmission,
  type ReportValidationResult,
} from "@/lib/utils/reportFieldUtils";

const { Title, Text } = Typography;

// ============================================================================
// Types for the form's internal state
// ============================================================================

interface MetricValue {
  templateMetricId: string;
  metricName?: string;
  fieldType?: MetricFieldType;
  order?: number;
  monthlyGoal?: number;
  monthlyAchieved?: number;
  yoyGoal?: number;
  textValue?: string;
}

interface SectionValue {
  templateSectionId: string;
  sectionName: string;
  order: number;
  metrics: MetricValue[];
}

/** Template section definition (from API) */
interface TemplateSectionDef {
  id: string;
  name: string;
  description?: string;
  order: number;
  isRequired: boolean;
  metrics: TemplateMetricDef[];
  subSections?: TemplateSubSectionDef[];
}

interface TemplateSubSectionDef {
  name: string;
  description?: string;
  order: number;
  metrics: TemplateMetricDef[];
}

interface TemplateMetricDef {
  id: string;
  name: string;
  description?: string;
  fieldType: MetricFieldType;
  isRequired: boolean;
  minValue?: number;
  maxValue?: number;
  order: number;
  capturesGoal: boolean;
  capturesAchieved: boolean;
  capturesYoY: boolean;
}

// ============================================================================
// Props
// ============================================================================

interface ReportFormProps {
  /** Template sections to render the form from */
  templateSections: TemplateSectionDef[];
  /** Template name for display */
  templateName?: string;
  /** Current report status (if editing existing report) */
  status?: ReportStatus;
  /** Deadline string (ISO) */
  deadline?: string;
  /** Initial metric values (for editing) */
  initialValues?: SectionValue[];
  /** Optional notes */
  initialNotes?: string;
  /** Locked metric IDs (from field locking) */
  lockedMetricIds?: Set<string>;
  /** Whether the form is read-only */
  readOnly?: boolean;
  /** Called when saving as draft */
  onSaveDraft?: (data: ReportFormData) => Promise<void>;
  /** Called when submitting */
  onSubmit?: (data: ReportFormData) => Promise<void>;
  /** Loading state */
  loading?: boolean;
  className?: string;
}

interface ReportFormData {
  sections: SectionValue[];
  notes?: string;
}

export type { ReportFormData, SectionValue, MetricValue };

// ============================================================================
// Component
// ============================================================================

/**
 * Dynamic report form that renders from a template definition.
 * Handles metric values, auto-calculated percentages, field locking,
 * save/submit actions, and auto-save.
 */
export default function ReportForm({
  templateSections,
  templateName,
  status,
  deadline,
  initialValues,
  initialNotes,
  lockedMetricIds = new Set(),
  readOnly = false,
  onSaveDraft,
  onSubmit,
  loading = false,
  className,
}: ReportFormProps) {
  // Build initial state from template + existing values
  const [sections, setSections] = useState<SectionValue[]>(() => {
    if (initialValues && initialValues.length > 0) {
      return initialValues;
    }

    // Create empty section values from template
    return templateSections.map((ts) => ({
      templateSectionId: ts.id,
      sectionName: ts.name,
      order: ts.order,
      metrics: [
        ...ts.metrics.map((m) => ({
          templateMetricId: m.id,
          metricName: m.name,
          fieldType: m.fieldType,
          order: m.order,
          monthlyGoal: undefined,
          monthlyAchieved: undefined,
          yoyGoal: undefined,
          textValue: undefined,
        })),
        ...(ts.subSections ?? []).flatMap((sub) =>
          sub.metrics.map((m) => ({
            templateMetricId: m.id,
            metricName: m.name,
            fieldType: m.fieldType,
            order: m.order,
            monthlyGoal: undefined,
            monthlyAchieved: undefined,
            yoyGoal: undefined,
            textValue: undefined,
          }))
        ),
      ],
    }));
  });

  const [notes, setNotes] = useState(initialNotes ?? "");
  const [validationErrors, setValidationErrors] = useState<
    ReportValidationResult["errors"]
  >([]);
  const [showValidationModal, setShowValidationModal] = useState(false);

  // Safety net: re-sync sections state when templateSections change (e.g. template switch).
  // Normally the parent should remount this component via `key` prop, but this covers edge cases.
  const prevTemplateSectionIds = useRef(
    templateSections.map((ts) => ts.id).join(",")
  );
  useEffect(() => {
    const currentIds = templateSections.map((ts) => ts.id).join(",");
    if (currentIds !== prevTemplateSectionIds.current) {
      prevTemplateSectionIds.current = currentIds;
      // Template changed — rebuild sections from the new template
      setSections(
        templateSections.map((ts) => ({
          templateSectionId: ts.id,
          sectionName: ts.name,
          order: ts.order,
          metrics: [
            ...ts.metrics.map((m) => ({
              templateMetricId: m.id,
              metricName: m.name,
              fieldType: m.fieldType,
              order: m.order,
              monthlyGoal: undefined,
              monthlyAchieved: undefined,
              yoyGoal: undefined,
              textValue: undefined,
            })),
            ...(ts.subSections ?? []).flatMap((sub) =>
              sub.metrics.map((m) => ({
                templateMetricId: m.id,
                metricName: m.name,
                fieldType: m.fieldType,
                order: m.order,
                monthlyGoal: undefined,
                monthlyAchieved: undefined,
                yoyGoal: undefined,
                textValue: undefined,
              }))
            ),
          ],
        }))
      );
      setValidationErrors([]);
    }
  }, [templateSections]);

  // Auto-determine readOnly based on status if not explicitly set
  const effectiveReadOnly =
    readOnly || (status ? isReportFullyLocked(status) : false);
  const lockLabel = status ? getFieldLockLabel(status) : undefined;

  // Update a metric value in a section
  const handleMetricChange = useCallback(
    (
      templateSectionId: string,
      templateMetricId: string,
      value: {
        monthlyGoal?: number;
        monthlyAchieved?: number;
        yoyGoal?: number;
        textValue?: string;
      }
    ) => {
      setSections((prev) =>
        prev.map((section) => {
          if (section.templateSectionId !== templateSectionId) return section;

          return {
            ...section,
            metrics: section.metrics.map((metric) => {
              if (metric.templateMetricId !== templateMetricId) return metric;
              return { ...metric, ...value };
            }),
          };
        })
      );
    },
    []
  );

  // Build section cards props, computing achievement percentages
  const sectionCards = useMemo(() => {
    return templateSections
      .sort((a, b) => a.order - b.order)
      .map((ts) => {
        const sectionValues =
          sections.find((s) => s.templateSectionId === ts.id)?.metrics ?? [];

        // Build values with computed percentages and YoY growth
        const enrichedValues = sectionValues.map((mv) => {
          const computedPercentage = computeAchievementPercentage(
            mv.monthlyGoal,
            mv.monthlyAchieved
          );
          const yoyGrowth = computeYoYGrowth(mv.monthlyAchieved, mv.yoyGoal);

          return {
            templateMetricId: mv.templateMetricId,
            monthlyGoal: mv.monthlyGoal,
            monthlyAchieved: mv.monthlyAchieved,
            yoyGoal: mv.yoyGoal,
            textValue: mv.textValue,
            computedPercentage,
            yoyGrowth,
            isLocked: lockedMetricIds.has(mv.templateMetricId),
          };
        });

        // All metrics for this section (top-level + sub-sections)
        const allMetrics: Array<{
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
        }> = ts.metrics.map((m) => ({
          templateMetricId: m.id,
          name: m.name,
          fieldType: m.fieldType,
          isRequired: m.isRequired,
          minValue: m.minValue,
          maxValue: m.maxValue,
          capturesGoal: m.capturesGoal,
          capturesAchieved: m.capturesAchieved,
          capturesYoY: m.capturesYoY,
          order: m.order,
        }));

        const subSections = ts.subSections?.map((sub) => ({
          name: sub.name,
          description: sub.description,
          order: sub.order,
          metrics: sub.metrics.map((m) => ({
            templateMetricId: m.id,
            name: m.name,
            fieldType: m.fieldType,
            isRequired: m.isRequired,
            minValue: m.minValue,
            maxValue: m.maxValue,
            capturesGoal: m.capturesGoal,
            capturesAchieved: m.capturesAchieved,
            capturesYoY: m.capturesYoY,
            order: m.order,
          })),
        }));

        return {
          section: {
            templateSectionId: ts.id,
            sectionName: ts.name,
            order: ts.order,
            description: ts.description,
            isRequired: ts.isRequired,
            metrics: allMetrics,
            subSections,
          },
          values: enrichedValues,
          sectionId: ts.id,
        };
      });
  }, [templateSections, sections, lockedMetricIds]);

  const formData: ReportFormData = useMemo(
    () => ({
      sections,
      notes: notes.trim() || undefined,
    }),
    [sections, notes]
  );

  // ── Client-side validation ────────────────────────────────────────────────
  const runValidation = useCallback(
    (mode: "submit" | "draft"): boolean => {
      // For drafts, we only require sections to exist — no strict metric checks
      if (mode === "draft") {
        setValidationErrors([]);
        return true;
      }

      // Build the report shape expected by validateReportForSubmission
      const reportForValidation = {
        sections: sections.map((s) => ({
          templateSectionId: s.templateSectionId,
          sectionName: s.sectionName,
          metrics: s.metrics.map((m) => ({
            templateMetricId: m.templateMetricId,
            metricName: m.metricName || "",
            fieldType: m.fieldType || MetricFieldType.NUMBER,
            monthlyGoal: m.monthlyGoal,
            monthlyAchieved: m.monthlyAchieved,
            yoyGoal: m.yoyGoal,
            textValue: m.textValue,
          })),
        })),
      };

      // Build the template shape for validation
      const templateForValidation = {
        sections: templateSections.map((ts) => ({
          id: ts.id,
          name: ts.name,
          isRequired: ts.isRequired,
          metrics: [
            ...ts.metrics.map((m) => ({
              id: m.id,
              name: m.name,
              fieldType: m.fieldType,
              isRequired: m.isRequired,
              minValue: m.minValue,
              maxValue: m.maxValue,
              capturesGoal: m.capturesGoal,
              capturesAchieved: m.capturesAchieved,
              capturesYoY: m.capturesYoY,
            })),
            ...(ts.subSections ?? []).flatMap((sub) =>
              sub.metrics.map((m) => ({
                id: m.id,
                name: m.name,
                fieldType: m.fieldType,
                isRequired: m.isRequired,
                minValue: m.minValue,
                maxValue: m.maxValue,
                capturesGoal: m.capturesGoal,
                capturesAchieved: m.capturesAchieved,
                capturesYoY: m.capturesYoY,
              }))
            ),
          ],
        })),
      };

      const result = validateReportForSubmission(
        reportForValidation,
        templateForValidation
      );

      setValidationErrors(result.errors);

      if (!result.isValid) {
        setShowValidationModal(true);
        return false;
      }

      return true;
    },
    [sections, templateSections]
  );

  const handleSaveDraft = async () => {
    if (!onSaveDraft) return;
    // Light validation for drafts (always passes)
    runValidation("draft");
    try {
      await onSaveDraft(formData);
      message.success("Report saved as draft");
    } catch {
      message.error("Failed to save draft");
    }
  };

  const handleSubmit = async () => {
    if (!onSubmit) return;
    // Full validation before submission
    if (!runValidation("submit")) {
      message.warning(
        "Please fix the validation errors before submitting the report."
      );
      return;
    }
    try {
      await onSubmit(formData);
      message.success("Report submitted successfully");
    } catch {
      message.error("Failed to submit report");
    }
  };

  return (
    <div className={`flex flex-col gap-6 ${className ?? ""}`}>
      {/* Validation Error Modal */}
      <Modal
        title={
          <span className="flex items-center gap-2 text-ds-status-error">
            <ExclamationCircleOutlined /> Report Validation Errors
          </span>
        }
        open={showValidationModal}
        onCancel={() => setShowValidationModal(false)}
        footer={[
          <Button key="ok" onClick={() => setShowValidationModal(false)}>
            Fix Errors
          </Button>,
        ]}
        width={600}
      >
        <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
          <p className="text-sm text-ds-text-subtle">
            Please fix the following {validationErrors.length} error
            {validationErrors.length !== 1 ? "s" : ""} before submitting:
          </p>
          {/* Group errors by section */}
          {Object.entries(
            validationErrors.reduce(
              (acc, err) => {
                const key = err.sectionName;
                if (!acc[key]) acc[key] = [];
                acc[key].push(err);
                return acc;
              },
              {} as Record<string, typeof validationErrors>
            )
          ).map(([sectionName, errors]) => (
            <div
              key={sectionName}
              className="border border-ds-border-base rounded-lg p-3"
            >
              <p className="font-medium text-sm mb-2">{sectionName}</p>
              <ul className="list-disc list-inside text-sm text-ds-status-error flex flex-col gap-1">
                {errors.map((err, idx) => (
                  <li key={idx}>{err.message}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Modal>

      {/* Inline validation summary (persistent banner) */}
      {validationErrors.length > 0 && (
        <Alert
          type="error"
          showIcon
          message={`${validationErrors.length} validation error${validationErrors.length !== 1 ? "s" : ""} found`}
          description="Please review and fix all required fields before submitting."
          action={
            <Button
              variant="secondary"
              size="small"
              onClick={() => setShowValidationModal(true)}
            >
              View Details
            </Button>
          }
          closable
          onClose={() => setValidationErrors([])}
        />
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          {templateName && (
            <Title level={4} className="!mb-0">
              {templateName}
            </Title>
          )}
          <div className="flex items-center gap-3">
            {status && <ReportStatusBadge status={status} />}
            {deadline && <ReportDeadlineCountdown deadline={deadline} />}
            {lockLabel && effectiveReadOnly && (
              <Text className="text-xs text-ds-text-subtle italic">
                {lockLabel}
              </Text>
            )}
          </div>
        </div>

        {!effectiveReadOnly && (
          <Space>
            {onSaveDraft && (
              <Button
                variant="secondary"
                icon={<SaveOutlined />}
                onClick={handleSaveDraft}
                loading={loading}
                disabled={effectiveReadOnly}
              >
                Save Draft
              </Button>
            )}
            {onSubmit &&
              (!status ||
                status === ReportStatus.DRAFT ||
                status === ReportStatus.REQUIRES_EDITS) && (
                <Button
                  icon={<SendOutlined />}
                  onClick={handleSubmit}
                  loading={loading}
                  disabled={effectiveReadOnly}
                >
                  Submit Report
                </Button>
              )}
          </Space>
        )}
      </div>

      <Divider className="my-0" />

      {/* Section cards */}
      {sectionCards.map((sc) => (
        <ReportSectionCard
          key={sc.sectionId}
          section={sc.section}
          values={sc.values}
          onMetricChange={(templateMetricId, value) =>
            handleMetricChange(sc.sectionId, templateMetricId, value)
          }
          readOnly={effectiveReadOnly}
        />
      ))}

      {/* Notes */}
      <div className="flex flex-col gap-2">
        <Text strong>Notes</Text>
        <TextArea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Optional notes about this report…"
          disabled={effectiveReadOnly}
          maxLength={2000}
          showCount
        />
      </div>

      {/* Bottom action buttons (sticky) */}
      {!effectiveReadOnly && (
        <>
          <Divider className="my-0" />
          <div className="flex justify-end gap-3 sticky bottom-0 bg-ds-surface-elevated py-4 -mx-6 px-6 border-t border-ds-border-base z-10">
            {onSaveDraft && (
              <Button
                variant="secondary"
                icon={<SaveOutlined />}
                onClick={handleSaveDraft}
                loading={loading}
                size="large"
              >
                Save Draft
              </Button>
            )}
            {onSubmit &&
              (!status ||
                status === ReportStatus.DRAFT ||
                status === ReportStatus.REQUIRES_EDITS) && (
                <Button
                  icon={<SendOutlined />}
                  onClick={handleSubmit}
                  loading={loading}
                  size="large"
                >
                  Submit Report
                </Button>
              )}
          </div>
        </>
      )}
    </div>
  );
}
