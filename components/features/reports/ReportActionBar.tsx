"use client";

import { Button, Popconfirm, Space, Input, message } from "antd";
import {
  SendOutlined,
  CheckCircleOutlined,
  EditOutlined,
  EyeOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { ReportStatus, UserRole } from "@/lib/types";
import { REPORT_STATUS_TRANSITIONS } from "@/lib/constants/reports";
import { useState } from "react";

interface ReportActionBarProps {
  reportId: string;
  currentStatus: ReportStatus;
  userRole: UserRole;
  /** Whether the report is past its deadline */
  isPastDeadline?: boolean;
  /** Callback when a workflow action is triggered */
  onAction: (
    action: string,
    data?: { reason?: string; notes?: string }
  ) => Promise<void>;
  /** Whether an action is currently loading */
  loading?: boolean;
  className?: string;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  "Submit Report": <SendOutlined />,
  "Resubmit Report": <SendOutlined />,
  "Approve Report": <CheckCircleOutlined />,
  "Request Edits": <EditOutlined />,
  "Mark as Reviewed": <EyeOutlined />,
  "Lock Report": <LockOutlined />,
};

const ACTION_COLORS: Record<
  string,
  "primary" | "default" | "dashed" | "text" | "link"
> = {
  "Submit Report": "primary",
  "Resubmit Report": "primary",
  "Approve Report": "primary",
  "Request Edits": "default",
  "Mark as Reviewed": "default",
  "Lock Report": "default",
};

const ACTIONS_REQUIRING_REASON = new Set(["Request Edits"]);

/**
 * Action bar with workflow buttons based on current report status and user role.
 * Only shows actions that the current user's role is authorized to perform.
 */
export default function ReportActionBar({
  reportId,
  currentStatus,
  userRole,
  isPastDeadline = false,
  onAction,
  loading = false,
  className,
}: ReportActionBarProps) {
  const [reason, setReason] = useState("");

  const transitions = REPORT_STATUS_TRANSITIONS[currentStatus] || [];
  const availableActions = transitions.filter((t) =>
    t.requiredRoles.includes(userRole)
  );

  if (availableActions.length === 0) return null;

  const handleAction = async (action: string) => {
    try {
      if (ACTIONS_REQUIRING_REASON.has(action) && reason.trim()) {
        await onAction(action, { reason: reason.trim() });
      } else {
        await onAction(action);
      }
      setReason("");
    } catch {
      message.error("Action failed. Please try again.");
    }
  };

  const getApiEndpoint = (label: string): string => {
    const endpointMap: Record<string, string> = {
      "Submit Report": `/api/reports/${reportId}/submit`,
      "Resubmit Report": `/api/reports/${reportId}/submit`,
      "Approve Report": `/api/reports/${reportId}/approve`,
      "Request Edits": `/api/reports/${reportId}/request-edits`,
      "Mark as Reviewed": `/api/reports/${reportId}/review`,
      "Lock Report": `/api/reports/${reportId}/lock`,
    };
    return endpointMap[label] || "";
  };

  // Make endpoint info available to parent through a data attribute
  void getApiEndpoint;

  return (
    <div className={`flex flex-col gap-3 ${className ?? ""}`}>
      {isPastDeadline && currentStatus === ReportStatus.DRAFT && (
        <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
          This report is past its deadline. Submit as soon as possible.
        </div>
      )}

      <Space wrap>
        {availableActions.map((action) => {
          const needsReason = ACTIONS_REQUIRING_REASON.has(action.label);

          if (needsReason) {
            return (
              <Popconfirm
                key={action.to}
                title={action.label}
                description={
                  <div className="flex flex-col gap-2 min-w-[300px]">
                    <span className="text-sm text-gray-600">
                      Please provide a reason:
                    </span>
                    <Input.TextArea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      placeholder="Describe what needs to be changed…"
                    />
                  </div>
                }
                onConfirm={() => handleAction(action.label)}
                okText="Confirm"
                cancelText="Cancel"
                okButtonProps={{ disabled: !reason.trim() }}
              >
                <Button
                  icon={ACTION_ICONS[action.label]}
                  type={ACTION_COLORS[action.label] ?? "default"}
                  loading={loading}
                  danger={action.label === "Request Edits"}
                >
                  {action.label}
                </Button>
              </Popconfirm>
            );
          }

          return (
            <Popconfirm
              key={action.to}
              title={`Are you sure you want to ${action.label.toLowerCase()}?`}
              onConfirm={() => handleAction(action.label)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                icon={ACTION_ICONS[action.label]}
                type={ACTION_COLORS[action.label] ?? "default"}
                loading={loading}
                danger={action.label === "Lock Report"}
              >
                {action.label}
              </Button>
            </Popconfirm>
          );
        })}
      </Space>
    </div>
  );
}
