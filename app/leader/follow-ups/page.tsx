"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import {
  Card,
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  message,
  Alert,
  Tooltip,
  Progress,
} from "antd";
import {
  WarningOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { format } from "date-fns";
import dayjs from "dayjs";

interface InactiveMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  daysSinceLastMeeting: number;
  daysSinceLastInteraction: number;
  attendanceRate: number;
  riskLevel: "high" | "medium" | "low";
  lastMeetingDate: string | null;
  lastInteractionDate: string | null;
  pendingFollowUp: boolean;
}

interface FollowUp {
  id: string;
  memberId: string;
  memberName: string;
  scheduledDate: Date;
  type: "CALL" | "VISIT" | "MESSAGE";
  notes: string;
  status: "PENDING" | "COMPLETED" | "OVERDUE";
  createdAt: Date;
  completedAt: Date | null;
}

export default function FollowUpManagementPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [inactiveMembers, setInactiveMembers] = useState<InactiveMember[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [selectedMember, setSelectedMember] = useState<InactiveMember | null>(
    null
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCompleteModalVisible, setIsCompleteModalVisible] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUp | null>(
    null
  );
  const [form] = Form.useForm();
  const [completeForm] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [membersRes, followUpsRes] = await Promise.all([
        fetch("/api/follow-ups/inactive"),
        fetch("/api/follow-ups"),
      ]);

      if (membersRes.ok) {
        const data = await membersRes.json();
        setInactiveMembers(data.inactiveMembers || []);
      }

      if (followUpsRes.ok) {
        const data = await followUpsRes.json();
        setFollowUps(data.followUps || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Failed to load follow-up data");
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleFollowUp = (member: InactiveMember) => {
    setSelectedMember(member);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleSubmitFollowUp = async (values: {
    type: string;
    scheduledDate: dayjs.Dayjs;
    notes: string;
  }) => {
    try {
      const response = await fetch("/api/follow-ups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: selectedMember?.id,
          type: values.type,
          scheduledDate: values.scheduledDate.toISOString(),
          notes: values.notes,
        }),
      });

      if (response.ok) {
        message.success("Follow-up scheduled successfully");
        setIsModalVisible(false);
        fetchData();
      } else {
        message.error("Failed to schedule follow-up");
      }
    } catch (error) {
      console.error("Error scheduling follow-up:", error);
      message.error("An error occurred");
    }
  };

  const handleCompleteFollowUp = (followUp: FollowUp) => {
    setSelectedFollowUp(followUp);
    setIsCompleteModalVisible(true);
    completeForm.resetFields();
  };

  const handleSubmitCompletion = async (values: { outcome: string }) => {
    try {
      const response = await fetch(`/api/follow-ups/${selectedFollowUp?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "COMPLETED",
          outcome: values.outcome,
        }),
      });

      if (response.ok) {
        message.success("Follow-up marked as completed");
        setIsCompleteModalVisible(false);
        fetchData();
      } else {
        message.error("Failed to complete follow-up");
      }
    } catch (error) {
      console.error("Error completing follow-up:", error);
      message.error("An error occurred");
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return "red";
      case "medium":
        return "orange";
      case "low":
        return "yellow";
      default:
        return "gray";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "green";
      case "PENDING":
        return "blue";
      case "OVERDUE":
        return "red";
      default:
        return "gray";
    }
  };

  const inactiveMembersColumns = [
    {
      title: "Member",
      key: "member",
      render: (_: unknown, record: InactiveMember) => (
        <div>
          <div className="font-medium">
            {record.firstName} {record.lastName}
          </div>
          <div className="text-xs text-gray-500">{record.email}</div>
        </div>
      ),
    },
    {
      title: "Risk Level",
      dataIndex: "riskLevel",
      key: "riskLevel",
      render: (level: string) => (
        <Tag color={getRiskColor(level)}>{level.toUpperCase()}</Tag>
      ),
      sorter: (a: InactiveMember, b: InactiveMember) => {
        const order = { high: 3, medium: 2, low: 1 };
        return order[b.riskLevel] - order[a.riskLevel];
      },
    },
    {
      title: "Attendance",
      dataIndex: "attendanceRate",
      key: "attendanceRate",
      render: (rate: number) => (
        <Progress
          percent={rate}
          size="small"
          strokeColor={
            rate > 60 ? "#52c41a" : rate > 30 ? "#faad14" : "#ff4d4f"
          }
        />
      ),
      sorter: (a: InactiveMember, b: InactiveMember) =>
        a.attendanceRate - b.attendanceRate,
    },
    {
      title: "Last Seen",
      key: "lastSeen",
      render: (_: unknown, record: InactiveMember) => (
        <div>
          <div className="text-sm">
            Meeting: {record.daysSinceLastMeeting} days ago
          </div>
          <div className="text-xs text-gray-500">
            Interaction: {record.daysSinceLastInteraction} days ago
          </div>
        </div>
      ),
      sorter: (a: InactiveMember, b: InactiveMember) =>
        a.daysSinceLastMeeting - b.daysSinceLastMeeting,
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: InactiveMember) => (
        <div className="space-x-2">
          {record.pendingFollowUp ? (
            <Tag icon={<ClockCircleOutlined />} color="blue">
              Follow-up Scheduled
            </Tag>
          ) : (
            <Button
              type="primary"
              size="small"
              icon={<PhoneOutlined />}
              onClick={() => handleScheduleFollowUp(record)}
            >
              Schedule Follow-up
            </Button>
          )}
        </div>
      ),
    },
  ];

  const followUpsColumns = [
    {
      title: "Member",
      dataIndex: "memberName",
      key: "memberName",
      render: (name: string) => (
        <div className="flex items-center gap-2">
          <UserOutlined />
          <span className="font-medium">{name}</span>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type: string) => {
        const colors: Record<string, string> = {
          CALL: "blue",
          VISIT: "green",
          MESSAGE: "purple",
        };
        return <Tag color={colors[type]}>{type}</Tag>;
      },
    },
    {
      title: "Scheduled Date",
      dataIndex: "scheduledDate",
      key: "scheduledDate",
      render: (date: Date) => format(new Date(date), "MMM dd, yyyy"),
      sorter: (a: FollowUp, b: FollowUp) =>
        new Date(a.scheduledDate).getTime() -
        new Date(b.scheduledDate).getTime(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
      filters: [
        { text: "Pending", value: "PENDING" },
        { text: "Completed", value: "COMPLETED" },
        { text: "Overdue", value: "OVERDUE" },
      ],
      onFilter: (value: boolean | React.Key, record: FollowUp) =>
        record.status === String(value),
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      render: (notes: string) => (
        <Tooltip title={notes}>
          <div className="truncate max-w-xs">{notes}</div>
        </Tooltip>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: FollowUp) =>
        record.status === "PENDING" || record.status === "OVERDUE" ? (
          <Button
            type="link"
            icon={<CheckCircleOutlined />}
            onClick={() => handleCompleteFollowUp(record)}
          >
            Complete
          </Button>
        ) : (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Done
          </Tag>
        ),
    },
  ];

  if (loading) {
    return (
      <DashboardLayout role={user?.role || "LEADER"}>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Follow-up Management
          </h2>
          <CardSkeleton count={3} />
        </div>
      </DashboardLayout>
    );
  }

  const pendingFollowUps = followUps.filter(
    (f) => f.status === "PENDING"
  ).length;
  const overdueFollowUps = followUps.filter(
    (f) => f.status === "OVERDUE"
  ).length;
  const completedFollowUps = followUps.filter(
    (f) => f.status === "COMPLETED"
  ).length;

  return (
    <DashboardLayout role={user?.role || "LEADER"}>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Follow-up Management
          </h2>
          <p className="text-gray-600 mt-1">
            Track and engage with inactive members
          </p>
        </div>

        {/* Alert for high-risk members */}
        {inactiveMembers.filter((m) => m.riskLevel === "high").length > 0 && (
          <Alert
            title={`${inactiveMembers.filter((m) => m.riskLevel === "high").length} high-risk members need immediate attention`}
            description="These members have been inactive for an extended period and require follow-up"
            type="warning"
            icon={<WarningOutlined />}
            showIcon
            className="mb-6"
          />
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {inactiveMembers.length}
              </div>
              <div className="text-gray-600 text-sm">Inactive Members</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {pendingFollowUps}
              </div>
              <div className="text-gray-600 text-sm">Pending Follow-ups</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {overdueFollowUps}
              </div>
              <div className="text-gray-600 text-sm">Overdue</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {completedFollowUps}
              </div>
              <div className="text-gray-600 text-sm">Completed</div>
            </div>
          </Card>
        </div>

        {/* Inactive Members Table */}
        <Card title="Inactive Members" className="mb-6">
          <Table
            dataSource={inactiveMembers}
            columns={inactiveMembersColumns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>

        {/* Follow-ups Table */}
        <Card title="Scheduled Follow-ups">
          <Table
            dataSource={followUps}
            columns={followUpsColumns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>

        {/* Schedule Follow-up Modal */}
        <Modal
          title="Schedule Follow-up"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
        >
          <div className="mb-4">
            <p className="text-gray-600">
              Member:{" "}
              <strong>
                {selectedMember?.firstName} {selectedMember?.lastName}
              </strong>
            </p>
            <p className="text-sm text-gray-500">
              Last seen: {selectedMember?.daysSinceLastMeeting} days ago
            </p>
          </div>
          <Form form={form} layout="vertical" onFinish={handleSubmitFollowUp}>
            <Form.Item
              name="type"
              label="Follow-up Type"
              rules={[{ required: true, message: "Please select a type" }]}
            >
              <Select placeholder="Select type">
                <Select.Option value="CALL">Phone Call</Select.Option>
                <Select.Option value="VISIT">Home Visit</Select.Option>
                <Select.Option value="MESSAGE">Message</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="scheduledDate"
              label="Scheduled Date"
              rules={[{ required: true, message: "Please select a date" }]}
            >
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item
              name="notes"
              label="Notes"
              rules={[{ required: true, message: "Please add notes" }]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Reason for follow-up, concerns, etc."
              />
            </Form.Item>
            <Form.Item>
              <div className="flex justify-end gap-2">
                <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
                <Button type="primary" htmlType="submit">
                  Schedule
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>

        {/* Complete Follow-up Modal */}
        <Modal
          title="Complete Follow-up"
          open={isCompleteModalVisible}
          onCancel={() => setIsCompleteModalVisible(false)}
          footer={null}
        >
          <div className="mb-4">
            <p className="text-gray-600">
              Member: <strong>{selectedFollowUp?.memberName}</strong>
            </p>
            <p className="text-sm text-gray-500">
              Type: {selectedFollowUp?.type}
            </p>
          </div>
          <Form
            form={completeForm}
            layout="vertical"
            onFinish={handleSubmitCompletion}
          >
            <Form.Item
              name="outcome"
              label="Outcome"
              rules={[
                { required: true, message: "Please describe the outcome" },
              ]}
            >
              <Input.TextArea
                rows={4}
                placeholder="What was discussed? Any actions taken?"
              />
            </Form.Item>
            <Form.Item>
              <div className="flex justify-end gap-2">
                <Button onClick={() => setIsCompleteModalVisible(false)}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  Mark as Complete
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
