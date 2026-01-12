import { Card, Tag } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";

interface MembershipRequestCardProps {
  request: {
    id: string;
    type: "JOIN" | "TRANSFER";
    memberName: string;
    memberId: string;
    toGroupName: string;
    fromGroupName?: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    requestDate: string;
    message?: string;
  };
  showActions?: boolean;
  onApprove?: (requestId: string) => void;
  onReject?: (requestId: string) => void;
}

export default function MembershipRequestCard({
  request,
  showActions = false,
  onApprove,
  onReject,
}: MembershipRequestCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "APPROVED":
        return "success";
      case "REJECTED":
        return "error";
      default:
        return "default";
    }
  };

  const getTypeColor = (type: string) => {
    return type === "JOIN" ? "blue" : "purple";
  };

  return (
    <Card
      hoverable={request.status === "PENDING"}
      className="h-full"
      actions={
        showActions && request.status === "PENDING"
          ? [
              <button
                key="approve"
                onClick={() => onApprove?.(request.id)}
                className="text-green-600 hover:text-green-800 font-medium"
              >
                Approve
              </button>,
              <button
                key="reject"
                onClick={() => onReject?.(request.id)}
                className="text-red-600 hover:text-red-800 font-medium"
              >
                Reject
              </button>,
            ]
          : undefined
      }
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Tag color={getTypeColor(request.type)}>{request.type}</Tag>
            <Tag color={getStatusColor(request.status)}>{request.status}</Tag>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <ClockCircleOutlined />
            <span>{format(new Date(request.requestDate), "MMM dd, yyyy")}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-900">
            <UserOutlined className="text-church-primary" />
            <span className="font-medium">{request.memberName}</span>
          </div>

          <div className="text-sm text-gray-600">
            {request.type === "JOIN" ? (
              <div className="flex items-center gap-2">
                <TeamOutlined className="text-church-primary" />
                <span>
                  Wants to join{" "}
                  <span className="font-medium">{request.toGroupName}</span>
                </span>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <TeamOutlined className="text-gray-400" />
                  <span>
                    From:{" "}
                    <span className="font-medium">{request.fromGroupName}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TeamOutlined className="text-church-primary" />
                  <span>
                    To:{" "}
                    <span className="font-medium">{request.toGroupName}</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {request.message && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
              <p className="italic">&ldquo;{request.message}&rdquo;</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
