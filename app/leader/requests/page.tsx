"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import DashboardLayout from "@/components/features/navigation/DashboardLayout";
import {
  Card,
  Button as AntButton,
  message,
  Spin,
  Tag,
  Modal,
  Descriptions,
  Avatar,
  Tabs,
} from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";
import EmptyState from "@/components/ui/EmptyState";
import { UserRole } from "@/lib/types";

const { TabPane } = Tabs;

export default function LeaderRequestsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<MembershipRequestWithDetails[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === UserRole.SMALL_GROUP_LEADER && !user.groupId) {
      message.warning("You are not assigned to a group");
      router.push("/leader/dashboard");
      return;
    }
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/membership-requests");
      if (response.ok) {
        const data = await response.json();
        // Filter requests for leader's group
        const groupRequests = data.filter(
          (req: MembershipRequestWithDetails) =>
            req.toGroupId === user?.groupId || req.fromGroupId === user?.groupId
        );
        // Sort by date descending
        groupRequests.sort(
          (a: MembershipRequestWithDetails, b: MembershipRequestWithDetails) =>
            new Date(b.requestedAt).getTime() -
            new Date(a.requestedAt).getTime()
        );
        setRequests(groupRequests);
      } else {
        message.error("Failed to load requests");
      }
    } catch (error) {
      message.error("An error occurred");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (requestId: string, memberName: string) => {
    Modal.confirm({
      title: "Approve Request",
      content: `Are you sure you want to approve ${memberName}'s request?`,
      okText: "Approve",
      okType: "primary",
      onOk: async () => {
        setProcessingId(requestId);
        try {
          const response = await fetch(
            `/api/membership-requests/${requestId}/process`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "APPROVE" }),
            }
          );

          if (response.ok) {
            message.success("Request approved successfully");
            fetchRequests();
          } else {
            const error = await response.json();
            message.error(error.error || "Failed to approve request");
          }
        } catch (error) {
          message.error("An error occurred");
          console.error(error);
        } finally {
          setProcessingId(null);
        }
      },
    });
  };

  const handleReject = (requestId: string, memberName: string) => {
    Modal.confirm({
      title: "Reject Request",
      content: `Are you sure you want to reject ${memberName}'s request?`,
      okText: "Reject",
      okType: "danger",
      onOk: async () => {
        setProcessingId(requestId);
        try {
          const response = await fetch(
            `/api/membership-requests/${requestId}/process`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "REJECT" }),
            }
          );

          if (response.ok) {
            message.success("Request rejected");
            fetchRequests();
          } else {
            const error = await response.json();
            message.error(error.error || "Failed to reject request");
          }
        } catch (error) {
          message.error("An error occurred");
          console.error(error);
        } finally {
          setProcessingId(null);
        }
      },
    });
  };

  if (loading) {
    return (
      <DashboardLayout role={user?.role}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  // Categorize requests
  const pendingRequests = requests.filter((req) => req.status === "PENDING");
  const processedRequests = requests.filter((req) => req.status !== "PENDING");

  const renderRequestCard = (request: MembershipRequestWithDetails) => {
    const member = request.member;
    const isPending = request.status === "PENDING";

    return (
      <Card
        key={request.id}
        className={`hover:shadow-md transition-shadow ${!isPending ? (request.status === "APPROVED" ? "border-green-200 bg-ds-status-success/5" : "border-red-200 bg-ds-status-error/5") : ""}`}
      >
        <div className="flex gap-6">
          {/* Member Profile */}
          <div className="flex-shrink-0">
            <Avatar
              size={80}
              icon={<UserOutlined />}
              src={member?.avatar}
              className="bg-ds-chart-1/50"
            />
          </div>

          {/* Request Details */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-ds-text-primary">
                  {member?.firstName} {member?.lastName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Tag
                    color={request.type === "JOIN" ? "blue" : "orange"}
                    className="text-sm"
                  >
                    {request.type}
                  </Tag>
                  <Tag
                    icon={
                      request.status === "PENDING" ? (
                        <ClockCircleOutlined />
                      ) : request.status === "APPROVED" ? (
                        <CheckCircleOutlined />
                      ) : (
                        <CloseCircleOutlined />
                      )
                    }
                    color={
                      request.status === "PENDING"
                        ? "default"
                        : request.status === "APPROVED"
                          ? "success"
                          : "error"
                    }
                  >
                    {request.status}
                  </Tag>
                </div>
              </div>

              {isPending && (
                <div className="flex gap-2">
                  <AntButton
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() =>
                      handleApprove(
                        request.id,
                        `${member?.firstName} ${member?.lastName}`
                      )
                    }
                    loading={processingId === request.id}
                  >
                    Approve
                  </AntButton>
                  <AntButton
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() =>
                      handleReject(
                        request.id,
                        `${member?.firstName} ${member?.lastName}`
                      )
                    }
                    loading={processingId === request.id}
                  >
                    Reject
                  </AntButton>
                </div>
              )}
            </div>

            {/* Member Info */}
            <Descriptions size="small" column={2} className="mb-3">
              <Descriptions.Item
                label={<MailOutlined className="text-ds-text-subtle" />}
              >
                {member?.email}
              </Descriptions.Item>
              <Descriptions.Item
                label={<PhoneOutlined className="text-ds-text-subtle" />}
              >
                {member?.phone}
              </Descriptions.Item>
              {member?.location && (
                <Descriptions.Item
                  label={
                    <EnvironmentOutlined className="text-ds-text-subtle" />
                  }
                  span={2}
                >
                  {member.location}
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Request Message */}
            {request.message && (
              <div className="bg-ds-surface-sunken p-3 rounded-md mb-3">
                <p className="text-sm text-ds-text-secondary italic">
                  &ldquo;{request.message}&rdquo;
                </p>
              </div>
            )}

            {/* Transfer Info */}
            {request.type === "TRANSFER" && request.fromGroup && (
              <div className="mb-3">
                <span className="text-sm text-ds-text-secondary">
                  Transferring from:{" "}
                  <span className="font-medium">{request.fromGroup.name}</span>
                </span>
              </div>
            )}

            {/* Timestamps */}
            <div className="flex flex-col gap-1 text-sm text-ds-text-subtle">
              <span>
                Requested:{" "}
                {format(
                  new Date(request.requestedAt),
                  "d MMM yyyy 'at' h:mm a"
                )}
              </span>
              {request.respondedAt && (
                <span>
                  {request.status === "APPROVED" ? "Approved" : "Rejected"}:{" "}
                  {format(
                    new Date(request.respondedAt),
                    "d MMM yyyy 'at' h:mm a"
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <DashboardLayout role={user?.role}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-ds-text-primary mb-2">
            Membership Requests
          </h1>
          <p className="text-ds-text-secondary">
            Review and manage membership requests for your group
          </p>
        </div>

        <Tabs defaultActiveKey="pending">
          <TabPane
            tab={
              <span>
                <ClockCircleOutlined />
                Pending ({pendingRequests.length})
              </span>
            }
            key="pending"
          >
            {pendingRequests.length === 0 ? (
              <EmptyState
                icon={<ClockCircleOutlined />}
                title="No Pending Requests"
                description="There are no pending membership requests for your group at this time."
              />
            ) : (
              <div className="space-y-4">
                {pendingRequests.map(renderRequestCard)}
              </div>
            )}
          </TabPane>

          <TabPane
            tab={
              <span>
                <CheckCircleOutlined />
                History ({processedRequests.length})
              </span>
            }
            key="history"
          >
            {processedRequests.length === 0 ? (
              <EmptyState
                icon={<CheckCircleOutlined />}
                title="No Request History"
                description="No requests have been processed yet."
              />
            ) : (
              <div className="space-y-4">
                {processedRequests.map(renderRequestCard)}
              </div>
            )}
          </TabPane>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
