"use client";

import { useState, useCallback } from "react";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import ReportTypeSelector from "@/components/features/reports/ReportTypeSelector";
import DynamicFormRenderer from "@/components/features/reports/DynamicFormRenderer";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useReportAutoSave } from "@/lib/hooks/useReportAutoSave";
import {
  Button,
  Steps,
  Typography,
  message,
  InputNumber,
  Select,
  Form,
  Card,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

const { Title } = Typography;

interface SubmitReportPageProps {
  /** The base path to redirect to after successful submission (e.g. "/hod/reports") */
  redirectPath: string;
}

export default function SubmitReportPage({
  redirectPath,
}: SubmitReportPageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState<ReportType | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [periodData, setPeriodData] = useState<{
    reportWeek?: number;
    reportMonth?: number;
    reportQuarter?: number;
    reportYear: number;
  }>({
    reportYear: new Date().getFullYear(),
    reportMonth: new Date().getMonth() + 1,
    reportWeek: 1,
  });
  const [creatingDraft, setCreatingDraft] = useState(false);

  const { isSaving, lastSaved } = useReportAutoSave(reportId, formData, {
    enabled: !!reportId,
  });

  const handleTypeSelect = (reportType: ReportType) => {
    setSelectedType(reportType);
    setStep(1);
  };

  const handleCreateDraft = async () => {
    if (!selectedType) return;

    setCreatingDraft(true);
    try {
      const body = {
        reportTypeId: selectedType.id,
        reportYear: periodData.reportYear,
        reportMonth: periodData.reportMonth,
        reportWeek: periodData.reportWeek,
        reportQuarter: periodData.reportQuarter,
        formData: {},
      };

      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.success && data.data) {
        setReportId(data.data.id);
        setStep(2);
        message.success("Draft created. You can now fill in the report.");
      } else {
        message.error(data.error ?? "Failed to create draft.");
      }
    } catch {
      message.error("Failed to create report draft.");
    } finally {
      setCreatingDraft(false);
    }
  };

  const handleSave = useCallback(
    async (values: Record<string, unknown>) => {
      if (!reportId) return;
      setFormData(values);

      try {
        await fetch(`/api/reports/${reportId}/auto-save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formData: values }),
        });
        message.success("Draft saved.");
      } catch {
        message.error("Failed to save draft.");
      }
    },
    [reportId]
  );

  const handleSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      if (!reportId) return;

      try {
        // First save the form data
        await fetch(`/api/reports/${reportId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formData: values }),
        });

        // Then submit for review
        const response = await fetch(`/api/reports/${reportId}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (data.success) {
          message.success("Report submitted for review!");
          router.push(redirectPath);
        } else {
          message.error(data.error ?? "Failed to submit report.");
        }
      } catch {
        message.error("Failed to submit report.");
      }
    },
    [reportId, router, redirectPath]
  );

  const handleFormChange = useCallback((values: Record<string, unknown>) => {
    setFormData(values);
  }, []);

  return (
    <DashboardLayout role={user?.role}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          {step > 0 && (
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => setStep(Math.max(0, step - 1))}
            />
          )}
          <Title level={4} className="!mb-0">
            Submit Report
          </Title>
        </div>

        <Steps
          current={step}
          size="small"
          items={[
            { title: "Select Type" },
            { title: "Set Period" },
            { title: "Fill Report" },
          ]}
          className="max-w-lg"
        />

        {/* Step 0: Select Report Type */}
        {step === 0 && <ReportTypeSelector onSelect={handleTypeSelect} />}

        {/* Step 1: Set Report Period */}
        {step === 1 && selectedType && (
          <Card title={`Period for: ${selectedType.name}`} className="max-w-md">
            <Form layout="vertical">
              <Form.Item label="Year" required>
                <InputNumber
                  value={periodData.reportYear}
                  onChange={(val) =>
                    setPeriodData((prev) => ({
                      ...prev,
                      reportYear: val ?? new Date().getFullYear(),
                    }))
                  }
                  min={2020}
                  max={2100}
                  className="!w-full"
                />
              </Form.Item>

              {(selectedType.frequency === "WEEKLY" ||
                selectedType.frequency === "MONTHLY") && (
                <Form.Item label="Month" required>
                  <Select
                    value={periodData.reportMonth}
                    onChange={(val) =>
                      setPeriodData((prev) => ({ ...prev, reportMonth: val }))
                    }
                    options={Array.from({ length: 12 }, (_, i) => ({
                      value: i + 1,
                      label: new Date(2024, i, 1).toLocaleString("default", {
                        month: "long",
                      }),
                    }))}
                  />
                </Form.Item>
              )}

              {selectedType.frequency === "WEEKLY" && (
                <Form.Item label="Week Number" required>
                  <InputNumber
                    value={periodData.reportWeek}
                    onChange={(val) =>
                      setPeriodData((prev) => ({
                        ...prev,
                        reportWeek: val ?? 1,
                      }))
                    }
                    min={1}
                    max={53}
                    className="!w-full"
                  />
                </Form.Item>
              )}

              {selectedType.frequency === "QUARTERLY" && (
                <Form.Item label="Quarter" required>
                  <Select
                    value={periodData.reportQuarter}
                    onChange={(val) =>
                      setPeriodData((prev) => ({
                        ...prev,
                        reportQuarter: val,
                      }))
                    }
                    options={[
                      { value: 1, label: "Q1 (Jan-Mar)" },
                      { value: 2, label: "Q2 (Apr-Jun)" },
                      { value: 3, label: "Q3 (Jul-Sep)" },
                      { value: 4, label: "Q4 (Oct-Dec)" },
                    ]}
                  />
                </Form.Item>
              )}

              <Button
                type="primary"
                onClick={handleCreateDraft}
                loading={creatingDraft}
                className="!bg-green-600 hover:!bg-green-700"
                block
              >
                Create Draft & Continue
              </Button>
            </Form>
          </Card>
        )}

        {/* Step 2: Fill the Dynamic Form */}
        {step === 2 && selectedType && reportId && (
          <DynamicFormRenderer
            reportType={selectedType}
            mode="create"
            initialData={formData}
            onSave={handleSave}
            onSubmit={handleSubmit}
            onFormChange={handleFormChange}
            isSaving={isSaving}
            lastSaved={lastSaved}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
