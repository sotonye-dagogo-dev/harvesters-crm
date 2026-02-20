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
  EditOutlined,
  HistoryOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { ReportStatus, MetricFieldType } from "@/lib/types";
import { useAuth } from "@/providers/AuthProvider";
import { formatDateTime, formatDate } from "@/lib/utils/format";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import {
  ReportStatusBadge,
  ReportDeadlineCountdown,
  ReportTimeline,
  ReportActionBar,
  ReportSectionCard,
} from "@/components/features/reports";
import { getRoleConfig } from "@/lib/constants/roles";
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
  template?: {
    id: string;
    name: string;
    version: number;
    sections?: TemplateSectionMeta[];
  };
  campus?: { name: string };
  submittedBy?: { firstName: string; lastName: string };
  reviewedBy?: { firstName: string; lastName: string };
  approvedBy?: { firstName: string; lastName: string };
  dataEntryBy?: { firstName: string; lastName: string };
}

/** Shape of a template section as returned by the API */
interface TemplateSectionMeta {
  id: string;
  name: string;
  order: number;
  isRequired?: boolean;
  description?: string;
  metrics?: TemplateMetricMeta[];
  subSections?: {
    id: string;
    name: string;
    order: number;
    metrics?: TemplateMetricMeta[];
  }[];
}

interface TemplateMetricMeta {
  id: string;
  name: string;
  fieldType: MetricFieldType;
  isRequired: boolean;
  capturesGoal: boolean;
  capturesAchieved: boolean;
  capturesYoY: boolean;
  order: number;
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

export default function ReportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params.id as string;
  const { user } = useAuth();
  const role = user?.role;
  const roleConfig = role ? getRoleConfig(role) : null;

  const [report, setReport] = useState<ReportDetail | null>(null);
  const [events, setEvents] = useState<ReportEventDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReport = useCallback(async () => {
    try {
      const response = await fetch(`/api/reports/${reportId}`);
      if (!response.ok) throw new Error("Failed to fetch report");
      const data = await response.json();
      setReport(data.data);
    } catch {
      message.error("Failed to load report");
    }
  }, [reportId]);

  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch(`/api/reports/${reportId}/history`);
      if (!response.ok) return;
      const data = await response.json();
      setEvents(data.data || []);
    } catch {
      // Non-critical
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

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data || {}),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Action failed");
      }

      message.success(`${action} successful`);
      // Refresh data
      await Promise.all([fetchReport(), fetchEvents()]);
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Action failed");
      throw err; // re-throw so ReportActionBar shows error too
    } finally {
      setActionLoading(false);
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
            onClick={() => router.push("/leader/reports")}
            className="mt-4"
          >
            Back to Reports
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const isPastDeadline = new Date(report.deadline) < new Date();
  const canEdit =
    (report.status === ReportStatus.DRAFT ||
      report.status === ReportStatus.REQUIRES_EDITS) &&
    (roleConfig?.canCreateReports ?? false);

  const periodLabel =
    REPORT_PERIOD_LABELS[
      report.periodType as keyof typeof REPORT_PERIOD_LABELS
    ] ?? report.periodType;

  // ── Build template metric lookup ──
  const templateMetricMap = new Map<string, TemplateMetricMeta>();
  const templateSections = report.template?.sections ?? [];
  for (const ts of templateSections) {
    for (const m of ts.metrics ?? []) {
      templateMetricMap.set(m.id, m);
    }
    for (const ss of ts.subSections ?? []) {
      for (const m of ss.metrics ?? []) {
        templateMetricMap.set(m.id, m);
      }
    }
  }

  // Merge template sections with submitted data
  const reportSectionsMap = new Map<string, ReportSectionDetail>();
  for (const rs of report.sections) {
    reportSectionsMap.set(rs.templateSectionId, rs);
  }

  type DisplaySection = {
    templateSectionId: string;
    sectionName: string;
    order: number;
    metrics: {
      templateMetricId: string;
      name: string;
      fieldType: MetricFieldType;
      isRequired: boolean;
      capturesGoal: boolean;
      capturesAchieved: boolean;
      capturesYoY: boolean;
      order: number;
    }[];
    values: {
      templateMetricId: string;
      monthlyGoal?: number;
      monthlyAchieved?: number;
      yoyGoal?: number;
      textValue?: string;
      computedPercentage?: number;
      isLocked?: boolean;
    }[];
  };

  const displaySections: DisplaySection[] = [];

  if (templateSections.length > 0) {
    for (const ts of [...templateSections].sort((a, b) => a.order - b.order)) {
      const reportSection = reportSectionsMap.get(ts.id);
      const allTemplateMetrics: TemplateMetricMeta[] = [];
      for (const m of ts.metrics ?? []) allTemplateMetrics.push(m);
      for (const ss of ts.subSections ?? []) {
        for (const m of ss.metrics ?? []) allTemplateMetrics.push(m);
      }
      allTemplateMetrics.sort((a, b) => a.order - b.order);

      const metricValuesMap = new Map<string, ReportMetricDetail>();
      if (reportSection) {
        for (const m of reportSection.metrics) {
          metricValuesMap.set(m.templateMetricId, m);
        }
      }

      displaySections.push({
        templateSectionId: ts.id,
        sectionName: ts.name,
        order: ts.order,
        metrics: allTemplateMetrics.map((tm, idx) => ({
          templateMetricId: tm.id,
          name: tm.name,
          fieldType: tm.fieldType,
          isRequired: tm.isRequired,
          capturesGoal: tm.capturesGoal,
          capturesAchieved: tm.capturesAchieved,
          capturesYoY: tm.capturesYoY,
          order: tm.order || idx + 1,
        })),
        values: allTemplateMetrics.map((tm) => {
          const mv = metricValuesMap.get(tm.id);
          return {
            templateMetricId: tm.id,
            monthlyGoal: mv?.monthlyGoal,
            monthlyAchieved: mv?.monthlyAchieved,
            yoyGoal: mv?.yoyGoal,
            textValue: mv?.textValue,
            computedPercentage: mv?.computedPercentage,
            isLocked: mv?.isLocked,
          };
        }),
      });
    }
  } else {
    for (const section of [...report.sections].sort(
      (a, b) => a.order - b.order
    )) {
      displaySections.push({
        templateSectionId: section.templateSectionId,
        sectionName: section.sectionName,
        order: section.order,
        metrics: section.metrics.map((m) => {
          const tmMeta = templateMetricMap.get(m.templateMetricId);
          return {
            templateMetricId: m.templateMetricId,
            name: m.metricName,
            fieldType: m.fieldType,
            isRequired: tmMeta?.isRequired ?? false,
            capturesGoal: tmMeta?.capturesGoal ?? true,
            capturesAchieved: tmMeta?.capturesAchieved ?? true,
            capturesYoY: tmMeta?.capturesYoY ?? true,
            order: m.order,
          };
        }),
        values: section.metrics.map((m) => ({
          templateMetricId: m.templateMetricId,
          monthlyGoal: m.monthlyGoal,
          monthlyAchieved: m.monthlyAchieved,
          yoyGoal: m.yoyGoal,
          textValue: m.textValue,
          computedPercentage: m.computedPercentage,
          isLocked: m.isLocked,
        })),
      });
    }
  }

  return (
    <DashboardLayout role={role}>
      <div className="flex flex-col gap-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/leader/reports")}
              type="text"
            />
            <div>
              <Title level={3} className="!mb-0">
                {report.template?.name ?? "Report"}
              </Title>
              <div className="flex items-center gap-3 mt-1">
                <ReportStatusBadge status={report.status} />
                <ReportDeadlineCountdown deadline={report.deadline} />
                <Text className="text-sm text-ds-text-subtle">
                  {periodLabel} — {report.periodYear}
                  {report.periodType === "WEEKLY"
                    ? `, Week ${report.periodWeek ?? report.periodMonth}`
                    : `, Month ${report.periodMonth}`}
                </Text>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {canEdit && (
              <Button
                icon={<EditOutlined />}
                onClick={() => router.push(`/leader/reports/${reportId}/edit`)}
              >
                Edit
              </Button>
            )}
            <Button
              icon={<HistoryOutlined />}
              onClick={() => router.push(`/leader/reports/${reportId}/history`)}
            >
              History
            </Button>
            <Button
              icon={<FileTextOutlined />}
              onClick={() => router.push(`/leader/reports/${reportId}/edits`)}
            >
              Edits
            </Button>
          </div>
        </div>

        {/* Action bar */}
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
                  {/* Metadata */}
                  <Card size="small" title="Report Information">
                    <Descriptions column={{ xs: 1, sm: 2, lg: 3 }} size="small">
                      <Descriptions.Item label="Campus">
                        {report.campus?.name ?? "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Period">
                        {periodLabel} — {report.periodYear}
                      </Descriptions.Item>
                      <Descriptions.Item label="Template">
                        {report.template?.name ?? "—"} (v
                        {report.template?.version ?? "?"})
                      </Descriptions.Item>
                      <Descriptions.Item label="Submitted By">
                        {report.submittedBy
                          ? `${report.submittedBy.firstName} ${report.submittedBy.lastName}`
                          : "—"}
                      </Descriptions.Item>
                      {report.approvedBy && (
                        <Descriptions.Item label="Approved By">
                          {report.approvedBy.firstName}{" "}
                          {report.approvedBy.lastName}
                        </Descriptions.Item>
                      )}
                      {report.reviewedBy && (
                        <Descriptions.Item label="Reviewed By">
                          {report.reviewedBy.firstName}{" "}
                          {report.reviewedBy.lastName}
                        </Descriptions.Item>
                      )}
                      <Descriptions.Item label="Created">
                        {formatDateTime(report.createdAt)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Last Updated">
                        {formatDateTime(report.updatedAt)}
                      </Descriptions.Item>
                      {report.isDataEntry && (
                        <Descriptions.Item label="Data Entry">
                          {report.dataEntryBy
                            ? `${report.dataEntryBy.firstName} ${report.dataEntryBy.lastName}`
                            : "Yes"}
                          {report.dataEntryDate &&
                            ` (${formatDate(report.dataEntryDate)})`}
                        </Descriptions.Item>
                      )}
                    </Descriptions>
                  </Card>

                  {/* Section data (read-only view) — powered by template metadata */}
                  {displaySections.length > 0 ? (
                    displaySections.map((ds) => (
                      <ReportSectionCard
                        key={ds.templateSectionId}
                        section={{
                          templateSectionId: ds.templateSectionId,
                          sectionName: ds.sectionName,
                          order: ds.order,
                          metrics: ds.metrics,
                        }}
                        values={ds.values}
                        onMetricChange={() => {}}
                        readOnly
                      />
                    ))
                  ) : (
                    <Card size="small">
                      <Text className="text-ds-text-subtle">
                        No sections have been filled in yet.
                      </Text>
                    </Card>
                  )}

                  {/* Notes */}
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
                      eventType:
                        e.eventType as import("@/lib/types").ReportEventType,
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
