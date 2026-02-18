"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Spin,
  Typography,
  Button,
  Tabs,
  Descriptions,
  Card,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  HistoryOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { ReportStatus, MetricFieldType, ReportEventType } from "@/lib/types";
import { useAuth } from "@/providers/AuthProvider";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import {
  ReportStatusBadge,
  ReportDeadlineCountdown,
  ReportTimeline,
  ReportActionBar,
  ReportSectionCard,
} from "@/components/features/reports";
import { REPORT_PERIOD_LABELS } from "@/lib/constants/reports";

const { Title, Text } = Typography;

interface ReportDetail {
  id: string;
  templateId: string;
  templateVersionId: string;
  campusId: string;
  groupId?: string;
  periodType: string;
  periodYear: number;
  periodMonth: number;
  periodWeek?: number;
  status: ReportStatus;
  submittedById: string;
  reviewedById?: string;
  approvedById?: string;
  deadline: string;
  lockedAt?: string;
  isDataEntry: boolean;
  dataEntryById?: string;
  dataEntryDate?: string;
  notes?: string;
  sections: ReportSectionDetail[];
  createdAt: string;
  updatedAt: string;
  template?: { name: string; version: number };
  campus?: { name: string };
  submittedBy?: { firstName: string; lastName: string };
  reviewedBy?: { firstName: string; lastName: string };
  approvedBy?: { firstName: string; lastName: string };
  dataEntryBy?: { firstName: string; lastName: string };
}

interface ReportSectionDetail {
  id: string;
  reportId: string;
  templateSectionId: string;
  sectionName: string;
  order: number;
  metrics: ReportMetricDetail[];
}

interface ReportMetricDetail {
  id: string;
  reportSectionId: string;
  templateMetricId: string;
  metricName: string;
  fieldType: MetricFieldType;
  monthlyGoal?: number;
  monthlyAchieved?: number;
  yoyGoal?: number;
  textValue?: string;
  computedPercentage?: number;
  isLocked: boolean;
  order: number;
}

interface ReportEventDetail {
  id: string;
  eventType: string;
  actorId: string;
  timestamp: string;
  details?: Record<string, unknown>;
  previousStatus?: string;
  newStatus?: string;
  actor?: { firstName: string; lastName: string };
}

export default function SuperadminReportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params.id as string;
  const { user } = useAuth();
  const role = user?.role;


  const [report, setReport] = useState<ReportDetail | null>(null);
  const [events, setEvents] = useState<ReportEventDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReport = useCallback(async () => {
    try {
      const res = await fetch(`/api/reports/${reportId}`);
      if (!res.ok) throw new Error("Failed to fetch report");
      const data = await res.json();
      setReport(data.data);
    } catch {
      message.error("Failed to load report");
    }
  }, [reportId]);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch(`/api/reports/${reportId}/history`);
      if (!res.ok) return;
      const data = await res.json();
      setEvents(data.data || []);
    } catch {
      // non-critical
    }
  }, [reportId]);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchReport(), fetchEvents()]);
      setLoading(false);
    };
    loadAll();
  }, [fetchReport, fetchEvents]);

  const handleAction = async (
    action: string,
    data?: { reason?: string; notes?: string }
  ) => {
    if (!report) return;
    setActionLoading(true);
    try {
      const endpointMap: Record<string, string> = {
        "Submit Report": `/api/reports/${reportId}/submit`,
        "Resubmit Report": `/api/reports/${reportId}/submit`,
        "Approve Report": `/api/reports/${reportId}/approve`,
        "Request Edits": `/api/reports/${reportId}/request-edits`,
        "Mark as Reviewed": `/api/reports/${reportId}/review`,
        "Lock Report": `/api/reports/${reportId}/lock`,
      };
      const endpoint = endpointMap[action];
      if (!endpoint) throw new Error("Unknown action");

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data || {}),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Action failed");
      }
      message.success(`${action} successful`);
      await Promise.all([fetchReport(), fetchEvents()]);
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Action failed");
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !role) {
    return (
      <DashboardLayout role={role}>
        <div className="flex justify-center items-center h-64"><Spin size="large" /></div>
      </DashboardLayout>
    );
  }

  if (!report) {
    return (
      <DashboardLayout role={role}>
        <div className="text-center py-16">
          <Text className="text-gray-500">Report not found</Text>
          <br />
          <Button onClick={() => router.push("/superadmin/reports")} className="mt-4">
            Back to Reports
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const isPastDeadline = new Date(report.deadline) < new Date();
  const periodLabel =
    REPORT_PERIOD_LABELS[report.periodType as keyof typeof REPORT_PERIOD_LABELS] ??
    report.periodType;

  return (
    <DashboardLayout role={role}>
      <div className="flex flex-col gap-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/superadmin/reports")}
              type="text"
            />
            <div>
              <Title level={3} className="!mb-0">
                {report.template?.name ?? "Report"}
              </Title>
              <div className="flex items-center gap-3 mt-1">
                <ReportStatusBadge status={report.status} />
                <ReportDeadlineCountdown deadline={report.deadline} />
                <Text className="text-sm text-gray-500">
                  {periodLabel} — {report.periodYear}
                  {report.periodType === "WEEKLY"
                    ? `, Week ${report.periodWeek ?? report.periodMonth}`
                    : `, Month ${report.periodMonth}`}
                </Text>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              icon={<HistoryOutlined />}
              onClick={() => router.push(`/superadmin/reports/${reportId}/history`)}
            >
              History
            </Button>
            <Button
              icon={<FileTextOutlined />}
              onClick={() => router.push(`/superadmin/reports/${reportId}/edits`)}
            >
              Edits
            </Button>
          </div>
        </div>

        {/* Action Bar */}
        {role && (
          <ReportActionBar
            reportId={reportId}
            currentStatus={report.status}
            userRole={role}
            isPastDeadline={isPastDeadline}
            onAction={handleAction}
            loading={actionLoading}
          />
        )}

        <Tabs
          defaultActiveKey="details"
          items={[
            {
              key: "details",
              label: "Report Details",
              children: (
                <div className="flex flex-col gap-6">
                  <Card size="small" title="Report Information">
                    <Descriptions column={{ xs: 1, sm: 2, lg: 3 }} size="small">
                      <Descriptions.Item label="Campus">
                        {report.campus?.name ?? "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Period">
                        {periodLabel} — {report.periodYear}
                      </Descriptions.Item>
                      <Descriptions.Item label="Template">
                        {report.template?.name ?? "—"} (v{report.template?.version ?? "?"})
                      </Descriptions.Item>
                      <Descriptions.Item label="Submitted By">
                        {report.submittedBy
                          ? `${report.submittedBy.firstName} ${report.submittedBy.lastName}`
                          : "—"}
                      </Descriptions.Item>
                      {report.approvedBy && (
                        <Descriptions.Item label="Approved By">
                          {report.approvedBy.firstName} {report.approvedBy.lastName}
                        </Descriptions.Item>
                      )}
                      {report.reviewedBy && (
                        <Descriptions.Item label="Reviewed By">
                          {report.reviewedBy.firstName} {report.reviewedBy.lastName}
                        </Descriptions.Item>
                      )}
                      <Descriptions.Item label="Created">
                        {new Date(report.createdAt).toLocaleString()}
                      </Descriptions.Item>
                      <Descriptions.Item label="Last Updated">
                        {new Date(report.updatedAt).toLocaleString()}
                      </Descriptions.Item>
                      {report.isDataEntry && (
                        <Descriptions.Item label="Data Entry">
                          {report.dataEntryBy
                            ? `${report.dataEntryBy.firstName} ${report.dataEntryBy.lastName}`
                            : "Yes"}
                          {report.dataEntryDate &&
                            ` (${new Date(report.dataEntryDate).toLocaleDateString()})`}
                        </Descriptions.Item>
                      )}
                    </Descriptions>
                  </Card>

                  {/* Sections read-only */}
                  {report.sections
                    .sort((a, b) => a.order - b.order)
                    .map((section) => (
                      <ReportSectionCard
                        key={section.id}
                        section={{
                          templateSectionId: section.templateSectionId,
                          sectionName: section.sectionName,
                          order: section.order,
                          metrics: section.metrics.map((m) => ({
                            templateMetricId: m.templateMetricId,
                            name: m.metricName,
                            fieldType: m.fieldType,
                            isRequired: false,
                            capturesGoal: m.monthlyGoal !== undefined,
                            capturesAchieved: m.monthlyAchieved !== undefined,
                            capturesYoY: m.yoyGoal !== undefined,
                            order: m.order,
                          })),
                        }}
                        values={section.metrics.map((m) => ({
                          templateMetricId: m.templateMetricId,
                          monthlyGoal: m.monthlyGoal,
                          monthlyAchieved: m.monthlyAchieved,
                          yoyGoal: m.yoyGoal,
                          textValue: m.textValue,
                          computedPercentage: m.computedPercentage,
                          isLocked: m.isLocked,
                        }))}
                        onMetricChange={() => {}}
                        readOnly
                      />
                    ))}

                  {report.notes && (
                    <Card size="small" title="Notes">
                      <Text>{report.notes}</Text>
                    </Card>
                  )}
                </div>
              ),
            },
            {
              key: "timeline",
              label: "Activity Timeline",
              children: (
                <Card>
                  <ReportTimeline
                    events={events.map((e) => ({
                      id: e.id,
                      eventType: e.eventType as ReportEventType,
                      timestamp: e.timestamp,
                      actorName: e.actor
                        ? `${e.actor.firstName} ${e.actor.lastName}`
                        : undefined,
                      details: e.details,
                      previousStatus: e.previousStatus,
                      newStatus: e.newStatus,
                    }))}
                  />
                </Card>
              ),
            },
          ]}
        />
      </div>
    </DashboardLayout>
  );
}
