"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  Typography,
  Spin,
  Button,
  Space,
  Descriptions,
  Divider,
  Modal,
  Input,
  message,
  Result,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  EditOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import DynamicFormRenderer from "./DynamicFormRenderer";
import ReportStatusBadge from "./ReportStatusBadge";
import ReportComments from "./ReportComments";
import { useReportAutoSave } from "@/lib/hooks/useReportAutoSave";
import {
  REPORT_FREQUENCY_LABELS,
  REPORT_CATEGORY_LABELS,
  REPORT_REVIEWER_ROLES,
} from "@/lib/constants";
import { getReportPeriodLabel, getNextStatuses } from "@/lib/utils/reporting";
import { ReportFrequency, ReportStatus, UserRole } from "@/lib/types";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface ReportDetailViewProps {
  reportId: string;
  backUrl: string;
  currentUserId?: string;
  currentUserRole?: string;
}

interface EnrichedReport extends ReportSubmission {
  reportType?: ReportType;
  metricEntries?: MetricEntry[];
  comments?: ReportComment[];
  reportTypeName?: string;
  reportTypeCode?: string;
  submitterName?: string;
}

export default function ReportDetailView({
  reportId,
  backUrl,
  currentUserId,
  currentUserRole,
}: ReportDetailViewProps) {
  const router = useRouter();
  const [report, setReport] = useState<EnrichedReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [actionLoading, setActionLoading] = useState(false);
  const [editNotesModal, setEditNotesModal] = useState(false);
  const [editNotes, setEditNotes] = useState("");

  const isSubmitter = report?.submittedById === currentUserId;
  const isReviewer = REPORT_REVIEWER_ROLES.includes(
    currentUserRole as UserRole
  );
  const canEdit =
    isSubmitter &&
    (report?.status === ReportStatus.DRAFT ||
      report?.status === ReportStatus.REQUIRES_EDITS) &&
    !report?.isLocked;
  const nextStatuses = report ? getNextStatuses(report.status) : [];

  const { isSaving, lastSaved } = useReportAutoSave(
    canEdit ? reportId : null,
    formData,
    { enabled: canEdit }
  );

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports/${reportId}`);
      const data = await response.json();
      if (data.success && data.data) {
        setReport(data.data);
        setFormData((data.data.formData as Record<string, unknown>) ?? {});
      } else {
        setReport(null);
      }
    } catch {
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleSave = useCallback(
    async (values: Record<string, unknown>) => {
      if (!report) return;
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
    [report, reportId]
  );

  const handleSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      if (!report) return;
      setActionLoading(true);
      try {
        await fetch(`/api/reports/${reportId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formData: values }),
        });

        const response = await fetch(`/api/reports/${reportId}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        if (data.success) {
          message.success("Report submitted for review!");
          fetchReport();
        } else {
          message.error(data.error ?? "Failed to submit report.");
        }
      } catch {
        message.error("Failed to submit report.");
      } finally {
        setActionLoading(false);
      }
    },
    [report, reportId, fetchReport]
  );

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/reports/${reportId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: "Approved." }),
      });
      const data = await response.json();
      if (data.success) {
        message.success("Report approved!");
        fetchReport();
      } else {
        message.error(data.error ?? "Failed to approve.");
      }
    } catch {
      message.error("Failed to approve report.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestEdits = async () => {
    if (!editNotes.trim()) {
      message.warning("Please provide notes explaining what needs editing.");
      return;
    }
    setActionLoading(true);
    try {
      const response = await fetch(`/api/reports/${reportId}/request-edits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: editNotes }),
      });
      const data = await response.json();
      if (data.success) {
        message.success("Edit request sent to submitter.");
        setEditNotesModal(false);
        setEditNotes("");
        fetchReport();
      } else {
        message.error(data.error ?? "Failed to request edits.");
      }
    } catch {
      message.error("Failed to request edits.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReview = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/reports/${reportId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: "Reviewed." }),
      });
      const data = await response.json();
      if (data.success) {
        message.success("Report marked as reviewed.");
        fetchReport();
      } else {
        message.error(data.error ?? "Failed to review.");
      }
    } catch {
      message.error("Failed to review report.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinalize = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/reports/${reportId}/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: "Finalized." }),
      });
      const data = await response.json();
      if (data.success) {
        message.success("Report finalized!");
        fetchReport();
      } else {
        message.error(data.error ?? "Failed to finalize.");
      }
    } catch {
      message.error("Failed to finalize report.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormChange = useCallback((values: Record<string, unknown>) => {
    setFormData(values);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spin size="large" />
      </div>
    );
  }

  if (!report) {
    return (
      <Result
        status="404"
        title="Report Not Found"
        subTitle="The report you're looking for does not exist."
        extra={
          <Button onClick={() => router.push(backUrl)}>Back to Reports</Button>
        }
      />
    );
  }

  const frequency: ReportFrequency =
    (report as EnrichedReport & { frequency?: ReportFrequency }).frequency ??
    report.reportType?.frequency ??
    ReportFrequency.WEEKLY;

  const periodLabel = getReportPeriodLabel(
    frequency,
    report.reportWeek,
    report.reportMonth,
    undefined,
    report.reportYear
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push(backUrl)}
          />
          <div>
            <Title level={4} className="!mb-0">
              {report.reportTypeName ?? report.reportType?.name ?? "Report"}
            </Title>
            <Text type="secondary">{periodLabel}</Text>
          </div>
        </div>
        <ReportStatusBadge status={report.status} />
      </div>

      {/* Report Metadata */}
      <Card size="small">
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small">
          <Descriptions.Item label="Category">
            {REPORT_CATEGORY_LABELS[report.reportType?.category ?? ""] ?? "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Frequency">
            {REPORT_FREQUENCY_LABELS[frequency] ?? "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Period">{periodLabel}</Descriptions.Item>
          <Descriptions.Item label="Created">
            {new Date(report.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Descriptions.Item>
          {report.submittedAt && (
            <Descriptions.Item label="Submitted">
              {new Date(report.submittedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Descriptions.Item>
          )}
          {report.isLocked && (
            <Descriptions.Item label="Locked">
              <LockOutlined className="text-orange-500" /> Yes
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Reviewer Action Buttons */}
      {isReviewer && !isSubmitter && (
        <Card size="small" title="Reviewer Actions">
          <Space wrap>
            {nextStatuses.includes(ReportStatus.APPROVED) && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleApprove}
                loading={actionLoading}
                className="!bg-green-600 hover:!bg-green-700"
              >
                Approve
              </Button>
            )}
            {nextStatuses.includes(ReportStatus.REQUIRES_EDITS) && (
              <Button
                icon={<EditOutlined />}
                onClick={() => setEditNotesModal(true)}
                loading={actionLoading}
                className="text-orange-600 border-orange-400 hover:!text-orange-700 hover:!border-orange-500"
              >
                Request Edits
              </Button>
            )}
            {nextStatuses.includes(ReportStatus.REVIEWED) && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleReview}
                loading={actionLoading}
              >
                Mark Reviewed
              </Button>
            )}
            {nextStatuses.includes(ReportStatus.FINALIZED) &&
              currentUserRole === "SUPERADMIN" && (
                <Button
                  type="primary"
                  icon={<LockOutlined />}
                  onClick={handleFinalize}
                  loading={actionLoading}
                  danger
                >
                  Finalize
                </Button>
              )}
          </Space>
        </Card>
      )}

      {/* Dynamic Form - editable or view */}
      {report.reportType && (
        <>
          <Divider>Report Data</Divider>
          <DynamicFormRenderer
            reportType={report.reportType}
            initialData={formData}
            reportStatus={report.status}
            mode={canEdit ? "edit" : "view"}
            onSave={canEdit ? handleSave : undefined}
            onSubmit={canEdit ? handleSubmit : undefined}
            onFormChange={canEdit ? handleFormChange : undefined}
            isSaving={isSaving}
            lastSaved={lastSaved}
          />
        </>
      )}

      {/* Comments Section */}
      <Divider>Discussion</Divider>
      <ReportComments
        reportId={reportId}
        canComment={isSubmitter || isReviewer}
        currentUserId={currentUserId}
      />

      {/* Request Edits Modal */}
      <Modal
        title="Request Edits"
        open={editNotesModal}
        onOk={handleRequestEdits}
        onCancel={() => {
          setEditNotesModal(false);
          setEditNotes("");
        }}
        okText="Send Edit Request"
        confirmLoading={actionLoading}
        okButtonProps={{
          className: "!bg-orange-500 hover:!bg-orange-600",
        }}
      >
        <div className="space-y-2">
          <Text>
            Explain what changes are needed. The submitter will be notified.
          </Text>
          <TextArea
            rows={4}
            placeholder="Describe the required edits..."
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
            maxLength={1000}
            showCount
          />
        </div>
      </Modal>
    </div>
  );
}
