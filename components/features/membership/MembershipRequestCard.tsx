import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
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
                className="text-ds-status-success hover:text-ds-status-success font-medium"
              >
                Approve
              </button>,
              <button
                key="reject"
                onClick={() => onReject?.(request.id)}
                className="text-ds-status-error hover:text-ds-status-error font-medium"
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
            <StatusBadge status={request.type} category="requestType" />
            <StatusBadge status={request.status} category="request" />
          </div>
          <div className="flex items-center gap-1 text-xs text-ds-text-subtle">
            <ClockCircleOutlined />
            <span>{format(new Date(request.requestDate), "d MMM yyyy")}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-ds-text-primary">
            <UserOutlined className="text-ds-brand-accent" />
            <span className="font-medium">{request.memberName}</span>
          </div>

          <div className="text-sm text-ds-text-secondary">
            {request.type === "JOIN" ? (
              <div className="flex items-center gap-2">
                <TeamOutlined className="text-ds-brand-accent" />
                <span>
                  Wants to join{" "}
                  <span className="font-medium">{request.toGroupName}</span>
                </span>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <TeamOutlined className="text-ds-text-subtle" />
                  <span>
                    From:{" "}
                    <span className="font-medium">{request.fromGroupName}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TeamOutlined className="text-ds-brand-accent" />
                  <span>
                    To:{" "}
                    <span className="font-medium">{request.toGroupName}</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {request.message && (
            <div className="mt-2 p-2 bg-ds-surface-sunken rounded text-sm text-ds-text-secondary">
              <p className="italic">&ldquo;{request.message}&rdquo;</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
