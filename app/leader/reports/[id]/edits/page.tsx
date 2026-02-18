"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Spin,
  Typography,
  Button,
  Card,
  Table,
  Tag,
  Space,
  message,
  Empty,
  Modal,
} from "antd";
import { ArrowLeftOutlined, EyeOutlined } from "@ant-design/icons";
import { ReportEditStatus, MetricFieldType } from "@/lib/types";
import { useAuth } from "@/providers/AuthProvider";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import { ReportEditDiff } from "@/components/features/reports";

const { Title, Text } = Typography;

const EDIT_STATUS_MAP: Record<
  ReportEditStatus,
  { color: string; label: string }
> = {
  [ReportEditStatus.DRAFT]: { color: "orange", label: "Draft" },
  [ReportEditStatus.SUBMITTED]: { color: "blue", label: "Submitted" },
  [ReportEditStatus.APPROVED]: { color: "green", label: "Approved" },
  [ReportEditStatus.REJECTED]: { color: "red", label: "Rejected" },
};

interface EditMetric {
  metricName: string;
  fieldType: MetricFieldType;
  originalMonthlyGoal?: number;
  originalMonthlyAchieved?: number;
  originalYoyGoal?: number;
  originalTextValue?: string;
  monthlyGoal?: number;
  monthlyAchieved?: number;
  yoyGoal?: number;
  textValue?: string;
}

interface EditSection {
  sectionName: string;
  metrics: EditMetric[];
}

interface ReportEdit {
  id: string;
  reportId: string;
  status: ReportEditStatus;
  reason: string;
  submittedById: string;
  createdAt: string;
  updatedAt: string;
  sections?: EditSection[];
  submittedBy?: { firstName: string; lastName: string };
  reviewedBy?: { firstName: string; lastName: string };
  reviewedAt?: string;
  rejectionReason?: string;
}

export default function ReportEditsPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params.id as string;
  const { user } = useAuth();
  const role = user?.role;

  const [edits, setEdits] = useState<ReportEdit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEdit, setSelectedEdit] = useState<ReportEdit | null>(null);
  const [diffModalOpen, setDiffModalOpen] = useState(false);

  const fetchEdits = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports/${reportId}/edits`);
      if (!response.ok) throw new Error("Failed to fetch edits");
      const data = await response.json();
      setEdits(data.data || []);
    } catch {
      message.error("Failed to load report edits");
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    fetchEdits();
  }, [fetchEdits]);

  const handleViewDiff = (edit: ReportEdit) => {
    setSelectedEdit(edit);
    setDiffModalOpen(true);
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) =>
        new Date(date).toLocaleDateString("en-NG", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    {
      title: "Submitted By",
      key: "submittedBy",
      render: (_: unknown, record: ReportEdit) =>
        record.submittedBy
          ? `${record.submittedBy.firstName} ${record.submittedBy.lastName}`
          : "—",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: ReportEditStatus) => {
        const config = EDIT_STATUS_MAP[status];
        return config ? (
          <Tag color={config.color}>{config.label}</Tag>
        ) : (
          <Tag>{status}</Tag>
        );
      },
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      ellipsis: true,
      width: 250,
    },
    {
      title: "Reviewed By",
      key: "reviewedBy",
      render: (_: unknown, record: ReportEdit) =>
        record.reviewedBy
          ? `${record.reviewedBy.firstName} ${record.reviewedBy.lastName}`
          : "—",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: ReportEdit) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDiff(record)}
          >
            View Changes
          </Button>
        </Space>
      ),
    },
  ];

  if (!role) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={role}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push(`/leader/reports/${reportId}`)}
            type="text"
          />
          <div>
            <Title level={3} className="!mb-0">
              Report Edits
            </Title>
            <Text className="text-gray-500">
              All edit submissions for this report
            </Text>
          </div>
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={edits}
            rowKey="id"
            loading={loading}
            locale={{
              emptyText: (
                <Empty description="No edits have been submitted for this report" />
              ),
            }}
            pagination={
              edits.length > 10
                ? { pageSize: 10, showSizeChanger: false }
                : false
            }
          />
        </Card>

        <Modal
          title="Edit Changes"
          open={diffModalOpen}
          onCancel={() => setDiffModalOpen(false)}
          footer={null}
          width={800}
        >
          {selectedEdit && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-3 text-sm">
                <Text strong>Status:</Text>
                <Tag color={EDIT_STATUS_MAP[selectedEdit.status]?.color}>
                  {EDIT_STATUS_MAP[selectedEdit.status]?.label}
                </Tag>
                <Text strong>Reason:</Text>
                <Text>{selectedEdit.reason}</Text>
              </div>

              {selectedEdit.rejectionReason && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded p-3 border border-red-200 dark:border-red-800">
                  <Text strong className="text-red-600">
                    Rejection Reason:
                  </Text>{" "}
                  <Text>{selectedEdit.rejectionReason}</Text>
                </div>
              )}

              {selectedEdit.sections && selectedEdit.sections.length > 0 ? (
                <ReportEditDiff sections={selectedEdit.sections} mode="inline" />
              ) : (
                <Empty description="No detailed changes available" />
              )}
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
