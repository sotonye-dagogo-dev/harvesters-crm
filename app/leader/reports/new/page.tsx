"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Form,
  Select,
  DatePicker,
  Button,
  Spin,
  message,
  Typography,
  Divider,
  Switch,
  Space,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { ReportPeriodType, MetricFieldType } from "@/lib/types";
import { useAuth } from "@/providers/AuthProvider";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { ReportForm } from "@/components/features/reports";
import type { ReportFormData } from "@/components/features/reports/ReportForm";
import { REPORT_PERIOD_LABELS } from "@/lib/constants/reports";
import { getRoleConfig } from "@/lib/constants/roles";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";

dayjs.extend(weekOfYear);

const { Title, Text } = Typography;

interface TemplateOption {
  id: string;
  name: string;
  version: number;
  sections: TemplateSectionOption[];
}

interface TemplateSectionOption {
  id: string;
  name: string;
  description?: string;
  order: number;
  isRequired: boolean;
  metrics: TemplateMetricOption[];
  subSections?: TemplateSubSectionOption[];
}

interface TemplateSubSectionOption {
  name: string;
  description?: string;
  order: number;
  metrics: TemplateMetricOption[];
}

interface TemplateMetricOption {
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

interface CampusOption {
  id: string;
  name: string;
}

export default function NewReportPage() {
  const router = useRouter();
  const { user } = useAuth();
  const role = user?.role;
  const roleConfig = role ? getRoleConfig(role) : null;

  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [campuses, setCampuses] = useState<CampusOption[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>();
  const [selectedCampusId, setSelectedCampusId] = useState<string>();
  const [periodType, setPeriodType] = useState<ReportPeriodType>(
    ReportPeriodType.WEEKLY
  );
  const [periodDate, setPeriodDate] = useState<dayjs.Dayjs>(dayjs());
  const [isDataEntry, setIsDataEntry] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
  const canDataEntry = roleConfig?.canDataEntry ?? false;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [templateRes, campusRes] = await Promise.all([
          fetch("/api/report-templates?isActive=true"),
          fetch("/api/campuses"),
        ]);

        if (templateRes.ok) {
          const data = await templateRes.json();
          setTemplates(data.data || []);
          // Auto-select default template
          const defaultTemplate = (data.data || []).find(
            (t: TemplateOption & { isDefault?: boolean }) => t.isDefault
          );
          if (defaultTemplate) setSelectedTemplateId(defaultTemplate.id);
        }

        if (campusRes.ok) {
          const data = await campusRes.json();
          setCampuses(data.data || []);
          // Auto-select user's campus if available
          if (user?.campusId) setSelectedCampusId(user.campusId);
        }
      } catch {
        message.error("Failed to load form data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.campusId]);

  const handleSaveDraft = async (formData: ReportFormData) => {
    if (!selectedTemplateId || !selectedCampusId) {
      message.warning("Please select a template and campus first");
      return;
    }

    setSaving(true);
    try {
      const periodYear = periodDate.year();
      const periodMonth = periodDate.month() + 1;
      const periodWeek =
        periodType === ReportPeriodType.WEEKLY
          ? periodDate.week()
          : undefined;

      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplateId,
          campusId: selectedCampusId,
          periodType,
          periodYear,
          periodMonth,
          periodWeek,
          isDataEntry,
          notes: formData.notes,
          sections: formData.sections.map((s) => ({
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
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create report");
      }

      const data = await response.json();
      message.success("Report saved as draft");
      router.push(`/leader/reports/${data.data.id}`);
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (formData: ReportFormData) => {
    if (!selectedTemplateId || !selectedCampusId) {
      message.warning("Please select a template and campus first");
      return;
    }

    setSaving(true);
    try {
      const periodYear = periodDate.year();
      const periodMonth = periodDate.month() + 1;
      const periodWeek =
        periodType === ReportPeriodType.WEEKLY
          ? periodDate.week()
          : undefined;

      // Create report first
      const createResponse = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplateId,
          campusId: selectedCampusId,
          periodType,
          periodYear,
          periodMonth,
          periodWeek,
          isDataEntry,
          notes: formData.notes,
          sections: formData.sections.map((s) => ({
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
          })),
        }),
      });

      if (!createResponse.ok) {
        const error = await createResponse.json();
        throw new Error(error.error || "Failed to create report");
      }

      const createData = await createResponse.json();

      // Then submit it
      const submitResponse = await fetch(
        `/api/reports/${createData.data.id}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!submitResponse.ok) {
        message.warning(
          "Report created but not submitted. You can submit it later."
        );
        router.push(`/leader/reports/${createData.data.id}`);
        return;
      }

      message.success("Report created and submitted");
      router.push(`/leader/reports/${createData.data.id}`);
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

  return (
    <DashboardLayout role={role}>
      <div className="flex flex-col gap-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push("/leader/reports")}
            type="text"
          />
          <div>
            <Title level={3} className="!mb-0">
              Create New Report
            </Title>
            <Text className="text-ds-text-subtle">
              Select a template and fill in the report data
            </Text>
          </div>
        </div>

        {/* Configuration */}
        <div className="bg-ds-surface-elevated p-6 rounded-xl shadow-sm border border-ds-border-base">
          <Form layout="vertical">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Form.Item label="Report Template" required>
                <Select
                  value={selectedTemplateId}
                  onChange={setSelectedTemplateId}
                  placeholder="Select template"
                  options={templates.map((t) => ({
                    value: t.id,
                    label: `${t.name} (v${t.version})`,
                  }))}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>

              <Form.Item label="Campus" required>
                <Select
                  value={selectedCampusId}
                  onChange={setSelectedCampusId}
                  placeholder="Select campus"
                  options={campuses.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>

              <Form.Item label="Period Type" required>
                <Select
                  value={periodType}
                  onChange={setPeriodType}
                  options={Object.entries(REPORT_PERIOD_LABELS).map(
                    ([value, label]) => ({
                      value,
                      label,
                    })
                  )}
                />
              </Form.Item>

              <Form.Item label="Report Period" required>
                <DatePicker
                  value={periodDate}
                  onChange={(date) => date && setPeriodDate(date)}
                  picker={
                    periodType === ReportPeriodType.YEARLY
                      ? "year"
                      : periodType === ReportPeriodType.MONTHLY
                        ? "month"
                        : "week"
                  }
                  className="w-full"
                />
              </Form.Item>

              {canDataEntry && (
                <Form.Item label="Historical Data Entry">
                  <Space>
                    <Switch checked={isDataEntry} onChange={setIsDataEntry} />
                    <Text className="text-sm text-ds-text-subtle">
                      {isDataEntry
                        ? "Entering historical data"
                        : "Current period report"}
                    </Text>
                  </Space>
                </Form.Item>
              )}
            </div>
          </Form>
        </div>

        <Divider />

        {/* Report Form */}
        {selectedTemplate ? (
          <ReportForm
            templateSections={selectedTemplate.sections}
            templateName={selectedTemplate.name}
            onSaveDraft={handleSaveDraft}
            onSubmit={handleSubmit}
            loading={saving}
          />
        ) : (
          <div className="text-center py-16 text-ds-text-subtle">
            <Text>Select a report template to begin</Text>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
