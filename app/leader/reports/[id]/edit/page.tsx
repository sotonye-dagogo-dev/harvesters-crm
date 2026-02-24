"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Spin, Typography, message } from "antd";
import Button from "@/components/ui/Button";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { ReportStatus, MetricFieldType } from "@/lib/types";
import { useAuth } from "@/providers/AuthProvider";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { ReportForm } from "@/components/features/reports";
import type { ReportFormData } from "@/components/features/reports/ReportForm";

const { Title, Text } = Typography;

interface EditableReport {
  id: string;
  templateId: string;
  status: ReportStatus;
  deadline: string;
  notes?: string;
  sections: Array<{
    id: string;
    templateSectionId: string;
    sectionName: string;
    order: number;
    metrics: Array<{
      id: string;
      templateMetricId: string;
      metricName: string;
      fieldType: MetricFieldType;
      monthlyGoal?: number;
      monthlyAchieved?: number;
      yoyGoal?: number;
      textValue?: string;
      isLocked: boolean;
      order: number;
    }>;
  }>;
  template?: {
    name: string;
    version: number;
    sections: Array<{
      id: string;
      name: string;
      description?: string;
      order: number;
      isRequired: boolean;
      metrics: Array<{
        id: string;
        name: string;
        fieldType: MetricFieldType;
        isRequired: boolean;
        minValue?: number;
        maxValue?: number;
        order: number;
        capturesGoal: boolean;
        capturesAchieved: boolean;
        capturesYoY: boolean;
      }>;
      subSections?: Array<{
        name: string;
        description?: string;
        order: number;
        metrics: Array<{
          id: string;
          name: string;
          fieldType: MetricFieldType;
          isRequired: boolean;
          minValue?: number;
          maxValue?: number;
          order: number;
          capturesGoal: boolean;
          capturesAchieved: boolean;
          capturesYoY: boolean;
        }>;
      }>;
    }>;
  };
}

export default function EditReportPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params.id as string;
  const { user } = useAuth();
  const role = user?.role;

  const [report, setReport] = useState<EditableReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports/${reportId}`);
      if (!response.ok) throw new Error("Failed to fetch report");
      const data = await response.json();
      setReport(data.data);
    } catch {
      message.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const isEditableStatus =
    report?.status === ReportStatus.DRAFT ||
    report?.status === ReportStatus.REQUIRES_EDITS;

  // For already-submitted reports, create a ReportEdit instead of updating directly
  const isPostSubmitEdit =
    report && !isEditableStatus && report.status !== ReportStatus.LOCKED;

  const handleSaveDraft = async (formData: ReportFormData) => {
    if (!report) return;
    setSaving(true);

    try {
      if (isPostSubmitEdit) {
        // Create a ReportEdit entity
        const response = await fetch(`/api/reports/${reportId}/edits`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reason: formData.notes ?? "Edit submission",
            sections: formData.sections.map((s) => ({
              templateSectionId: s.templateSectionId,
              sectionName: s.sectionName,
              order: s.order,
              metrics: s.metrics.map((m) => ({
                templateMetricId: m.templateMetricId,
                metricName:
                  report.sections
                    .flatMap((rs) => rs.metrics)
                    .find((rm) => rm.templateMetricId === m.templateMetricId)
                    ?.metricName ?? "",
                fieldType:
                  report.sections
                    .flatMap((rs) => rs.metrics)
                    .find((rm) => rm.templateMetricId === m.templateMetricId)
                    ?.fieldType ?? MetricFieldType.NUMBER,
                monthlyGoal: m.monthlyGoal,
                monthlyAchieved: m.monthlyAchieved,
                yoyGoal: m.yoyGoal,
                textValue: m.textValue,
                order:
                  report.sections
                    .flatMap((rs) => rs.metrics)
                    .find((rm) => rm.templateMetricId === m.templateMetricId)
                    ?.order ?? 0,
              })),
            })),
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create edit");
        }

        message.success(
          "Edit submitted for review. It will be applied after approval."
        );
        router.push(`/leader/reports/${reportId}`);
      } else {
        // Direct update (DRAFT or REQUIRES_EDITS)
        const response = await fetch(`/api/reports/${reportId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            notes: formData.notes,
            sections: formData.sections.map((s) => ({
              templateSectionId: s.templateSectionId,
              sectionName: s.sectionName || "Unnamed Section",
              order: s.order ?? 0,
              metrics: s.metrics.map((m) => ({
                templateMetricId: m.templateMetricId,
                metricName: m.metricName || "",
                fieldType: m.fieldType || MetricFieldType.NUMBER,
                order: m.order ?? 0,
                ...(m.monthlyGoal !== undefined && {
                  monthlyGoal: m.monthlyGoal,
                }),
                ...(m.monthlyAchieved !== undefined && {
                  monthlyAchieved: m.monthlyAchieved,
                }),
                ...(m.yoyGoal !== undefined && { yoyGoal: m.yoyGoal }),
                ...(m.textValue !== undefined &&
                  m.textValue !== "" && { textValue: m.textValue }),
              })),
            })),
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to save");
        }

        message.success("Report saved");
      }
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (formData: ReportFormData) => {
    if (!report || !isEditableStatus) return;
    setSaving(true);

    try {
      // Save first
      await fetch(`/api/reports/${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: formData.notes,
          sections: formData.sections.map((s) => ({
            templateSectionId: s.templateSectionId,
            sectionName: s.sectionName || "Unnamed Section",
            order: s.order ?? 0,
            metrics: s.metrics.map((m) => ({
              templateMetricId: m.templateMetricId,
              metricName: m.metricName || "",
              fieldType: m.fieldType || MetricFieldType.NUMBER,
              order: m.order ?? 0,
              ...(m.monthlyGoal !== undefined && {
                monthlyGoal: m.monthlyGoal,
              }),
              ...(m.monthlyAchieved !== undefined && {
                monthlyAchieved: m.monthlyAchieved,
              }),
              ...(m.yoyGoal !== undefined && { yoyGoal: m.yoyGoal }),
              ...(m.textValue !== undefined &&
                m.textValue !== "" && { textValue: m.textValue }),
            })),
          })),
        }),
      });

      // Then submit
      const submitResponse = await fetch(`/api/reports/${reportId}/submit`, {
        method: "POST",
      });

      if (!submitResponse.ok) {
        const error = await submitResponse.json();
        throw new Error(error.error || "Failed to submit");
      }

      message.success("Report submitted successfully");
      router.push(`/leader/reports/${reportId}`);
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !role) {
    return (
      <DashboardLayout role={role}>
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (!report) {
    return (
      <DashboardLayout role={role}>
        <div className="text-center py-16">
          <Text className="text-ds-text-subtle">Report not found</Text>
          <br />
          <Button
            variant="secondary"
            onClick={() => router.push("/leader/reports")}
            className="mt-4"
          >
            Back to Reports
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (report.status === ReportStatus.LOCKED) {
    return (
      <DashboardLayout role={role}>
        <div className="text-center py-16">
          <Text className="text-ds-text-subtle">
            This report is locked and cannot be edited.
          </Text>
          <br />
          <Button
            variant="secondary"
            onClick={() => router.push(`/leader/reports/${reportId}`)}
            className="mt-4"
          >
            View Report
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Build locked metric set
  const lockedMetricIds = new Set(
    report.sections
      .flatMap((s) => s.metrics)
      .filter((m) => m.isLocked)
      .map((m) => m.templateMetricId)
  );

  // Build initial values from existing report data
  const initialValues = report.sections.map((s) => ({
    templateSectionId: s.templateSectionId,
    sectionName: s.sectionName,
    order: s.order,
    metrics: s.metrics.map((m) => ({
      templateMetricId: m.templateMetricId,
      monthlyGoal: m.monthlyGoal,
      monthlyAchieved: m.monthlyAchieved,
      yoyGoal: m.yoyGoal,
      textValue: m.textValue,
    })),
  }));

  return (
    <DashboardLayout role={role}>
      <div className="flex flex-col gap-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push(`/leader/reports/${reportId}`)}
            variant="text"
          />
          <div>
            <Title level={3} className="!mb-0">
              {isPostSubmitEdit ? "Submit Edit Request" : "Edit Report"}
            </Title>
            <Text className="text-ds-text-subtle">
              {isPostSubmitEdit
                ? "Changes will be submitted as an edit request for review"
                : "Update report data and save or submit"}
            </Text>
          </div>
        </div>

        {isPostSubmitEdit && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
            <Text className="text-amber-800 dark:text-amber-300">
              This report has already been submitted. Your changes will be saved
              as an edit request and require approval before being applied to
              the report.
            </Text>
          </div>
        )}

        {report.template?.sections ? (
          <ReportForm
            templateSections={report.template.sections}
            templateName={report.template.name}
            status={report.status}
            deadline={report.deadline}
            initialValues={initialValues}
            initialNotes={report.notes}
            lockedMetricIds={lockedMetricIds}
            onSaveDraft={handleSaveDraft}
            onSubmit={isEditableStatus ? handleSubmit : undefined}
            loading={saving}
          />
        ) : (
          <div className="text-center py-16">
            <Text className="text-ds-text-subtle">
              Template information not available. Cannot render edit form.
            </Text>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
