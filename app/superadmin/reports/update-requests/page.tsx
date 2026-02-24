"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Spin,
  message,
  Typography,
  Modal,
} from "antd";
import { TextArea } from "@/components/ui/Input";
import Table from "@/components/ui/Table";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils/format";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { ReportUpdateRequestStatus } from "@/lib/types";
import { useAuth } from "@/providers/AuthProvider";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";

const { Title, Text } = Typography;
const { confirm } = Modal;

interface UpdateRequestItem {
  id: string;
  reportId: string;
  requestedById: string;
  reason: string;
  status: ReportUpdateRequestStatus;
  reviewedById?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function SuperadminUpdateRequestsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const role = user?.role;

  const [requests, setRequests] = useState<UpdateRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", "20");

      const res = await fetch(`/api/report-update-requests?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch update requests");
      const data = await res.json();
      setRequests(data.data || []);
      setTotal(data.pagination?.total || 0);
    } catch {
      message.error("Failed to load update requests");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = (id: string) => {
    confirm({
      title: "Approve Update Request",
      icon: <CheckCircleOutlined className="!text-ds-status-success" />,
      content: "This will apply the requested changes to the report. Continue?",
      okText: "Approve",
      onOk: async () => {
        try {
          const res = await fetch(`/api/report-update-requests/${id}/approve`, {
            method: "POST",
          });
          if (!res.ok) throw new Error("Failed to approve");
          message.success("Update request approved and changes applied");
          fetchRequests();
        } catch {
          message.error("Failed to approve request");
        }
      },
    });
  };

  const handleReject = (id: string) => {
    let reason = "";
    confirm({
      title: "Reject Update Request",
      icon: <ExclamationCircleOutlined />,
      content: (
        <div className="mt-4">
          <Text className="mb-2 block">Optionally provide a reason for rejection:</Text>
          <TextArea
            rows={3}
            placeholder="Reason for rejection..."
            onChange={(e) => { reason = e.target.value; }}
          />
        </div>
      ),
      okText: "Reject",
      okType: "danger",
      onOk: async () => {
        try {
          const res = await fetch(`/api/report-update-requests/${id}/reject`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reason ? { reason } : {}),
          });
          if (!res.ok) throw new Error("Failed to reject");
          message.success("Update request rejected");
          fetchRequests();
        } catch {
          message.error("Failed to reject request");
        }
      },
    });
  };

  const columns: ColumnsType<UpdateRequestItem> = [
    {
      title: "Report ID",
      dataIndex: "reportId",
      key: "reportId",
      render: (id: string) => (
        <Button type="link" size="small" onClick={() => router.push(`/superadmin/reports/${id}`)}>
          {id.substring(0, 8)}...
        </Button>
      ),
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      ellipsis: true,
      width: 300,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: ReportUpdateRequestStatus) => (
        <StatusBadge status={status} category="request" />
      ),
      filters: Object.values(ReportUpdateRequestStatus).map((s) => ({
        text: s,
        value: s,
      })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Requested",
      key: "createdAt",
      render: (_, r) => formatDate(r.createdAt),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
  ];

  if (!role) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64"><Spin size="large" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={role}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Title level={3} className="!mb-0">Report Update Requests</Title>
            <Text className="text-ds-text-subtle">
              Review and process requests to update locked or finalized reports
            </Text>
          </div>
          <Button icon={<ReloadOutlined />} onClick={fetchRequests}>Refresh</Button>
        </div>

        <Table
          dataSource={requests}
          columns={columns}
          rowKey="id"
          loading={loading}
          actions={[
            {
              key: "report",
              label: "View Report",
              icon: <EyeOutlined />,
              onClick: (r) => router.push(`/superadmin/reports/${r.reportId}`),
            },
            {
              key: "approve",
              label: "Approve",
              icon: <CheckCircleOutlined />,
              hidden: (r) => r.status !== ReportUpdateRequestStatus.PENDING,
              onClick: (r) => handleApprove(r.id),
            },
            {
              key: "reject",
              label: "Reject",
              icon: <CloseCircleOutlined />,
              danger: true,
              hidden: (r) => r.status !== ReportUpdateRequestStatus.PENDING,
              onClick: (r) => handleReject(r.id),
            },
          ]}
          scroll={{ x: 800 }}
          pagination={{
            current: page,
            pageSize: 20,
            total,
            onChange: (p) => setPage(p),
            showTotal: (t) => `${t} requests`,
          }}
        />
      </div>
    </DashboardLayout>
  );
}
