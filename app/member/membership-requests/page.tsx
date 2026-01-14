"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Card, Button as AntButton, message, Spin, Tag, Modal } from "antd";
import {
  PlusOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";
import EmptyState from "@/components/ui/EmptyState";

export default function MembershipRequestsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<MembershipRequestWithDetails[]>([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/membership-requests");
      if (response.ok) {
        const data = await response.json();
        // Filter to show only user's own requests
        const userRequests = data.filter(
          (req: MembershipRequestWithDetails) => req.memberId === user?.id
        );
        // Sort by date descending
        userRequests.sort(
          (a: MembershipRequestWithDetails, b: MembershipRequestWithDetails) =>
            new Date(b.requestedAt).getTime() -
            new Date(a.requestedAt).getTime()
        );
        setRequests(userRequests);
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

  const handleCancelRequest = (requestId: string) => {
    Modal.confirm({
      title: "Cancel Request",
      content: "Are you sure you want to cancel this membership request?",
      okText: "Cancel Request",
      okType: "danger",
      onOk: async () => {
        try {
          const response = await fetch(
            `/api/membership-requests/${requestId}`,
            {
              method: "DELETE",
            }
          );

          if (response.ok) {
            message.success("Request cancelled successfully");
            fetchRequests();
          } else {
            const error = await response.json();
            message.error(error.error || "Failed to cancel request");
          }
        } catch (error) {
          message.error("An error occurred");
          console.error(error);
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  // Categorize requests
  const pendingRequests = requests.filter((req) => req.status === "PENDING");
  const processedRequests = requests.filter((req) => req.status !== "PENDING");

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              My Membership Requests
            </h1>
            <p className="text-gray-600">
              View and manage your group membership requests
            </p>
          </div>
          <AntButton
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push("/membership-requests/new")}
            size="large"
          >
            New Request
          </AntButton>
        </div>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ClockCircleOutlined className="text-blue-500" />
            Pending Requests ({pendingRequests.length})
          </h2>
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <Card
                key={request.id}
                className="hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Tag
                        color={request.type === "JOIN" ? "blue" : "orange"}
                        className="text-sm"
                      >
                        {request.type}
                      </Tag>
                      <Tag icon={<ClockCircleOutlined />} color="default">
                        Pending
                      </Tag>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {request.toGroup?.name}
                    </h3>
                    {request.message && (
                      <p className="text-gray-600 mb-3">{request.message}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        Requested:{" "}
                        {format(
                          new Date(request.requestedAt),
                          "MMM d, yyyy 'at' h:mm a"
                        )}
                      </span>
                      {request.fromGroup && (
                        <span>From: {request.fromGroup.name}</span>
                      )}
                    </div>
                  </div>
                  <AntButton
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleCancelRequest(request.id)}
                  >
                    Cancel
                  </AntButton>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Request History ({processedRequests.length})
          </h2>
          <div className="space-y-4">
            {processedRequests.map((request) => (
              <Card
                key={request.id}
                className={`${request.status === "APPROVED" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Tag
                        color={request.type === "JOIN" ? "blue" : "orange"}
                        className="text-sm"
                      >
                        {request.type}
                      </Tag>
                      <Tag
                        icon={
                          request.status === "APPROVED" ? (
                            <CheckCircleOutlined />
                          ) : (
                            <CloseCircleOutlined />
                          )
                        }
                        color={
                          request.status === "APPROVED" ? "success" : "error"
                        }
                      >
                        {request.status}
                      </Tag>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {request.toGroup?.name}
                    </h3>
                    {request.message && (
                      <p className="text-gray-600 mb-3">{request.message}</p>
                    )}
                    <div className="flex flex-col gap-1 text-sm text-gray-600">
                      <span>
                        Requested:{" "}
                        {format(
                          new Date(request.requestedAt),
                          "MMM d, yyyy 'at' h:mm a"
                        )}
                      </span>
                      {request.respondedAt && (
                        <span>
                          {request.status === "APPROVED"
                            ? "Approved"
                            : "Rejected"}
                          :{" "}
                          {format(
                            new Date(request.respondedAt),
                            "MMM d, yyyy 'at' h:mm a"
                          )}
                        </span>
                      )}
                      {request.respondedBy && (
                        <span>
                          By: {request.respondedBy.firstName}{" "}
                          {request.respondedBy.lastName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {requests.length === 0 && (
        <EmptyState
          icon={<ClockCircleOutlined />}
          title="No Membership Requests"
          description="You haven't submitted any membership requests yet. Click the button below to request to join or transfer to a group."
          action={
            <AntButton
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push("/member/membership-requests/new")}
              size="large"
            >
              Submit Request
            </AntButton>
          }
        />
      )}
    </div>
  );
}
