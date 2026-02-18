"use client";

import { Timeline, Tag, Typography, Empty } from "antd";
import {
  CheckCircleOutlined,
  SendOutlined,
  EditOutlined,
  LockOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  UserOutlined,
  FileAddOutlined,
  AlertOutlined,
} from "@ant-design/icons";
import { ReportEventType } from "@/lib/types";

const { Text } = Typography;

interface TimelineEvent {
  id: string;
  eventType: ReportEventType;
  timestamp: string;
  actorName?: string;
  details?: Record<string, unknown>;
  previousStatus?: string;
  newStatus?: string;
}

interface ReportTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const EVENT_CONFIG: Record<
  ReportEventType,
  { color: string; icon: React.ReactNode; label: string }
> = {
  [ReportEventType.CREATED]: {
    color: "blue",
    icon: <FileAddOutlined />,
    label: "Report Created",
  },
  [ReportEventType.SUBMITTED]: {
    color: "green",
    icon: <SendOutlined />,
    label: "Report Submitted",
  },
  [ReportEventType.EDIT_REQUESTED]: {
    color: "orange",
    icon: <EditOutlined />,
    label: "Edits Requested",
  },
  [ReportEventType.EDIT_SUBMITTED]: {
    color: "cyan",
    icon: <EditOutlined />,
    label: "Edit Submitted",
  },
  [ReportEventType.EDIT_APPROVED]: {
    color: "green",
    icon: <CheckCircleOutlined />,
    label: "Edit Approved",
  },
  [ReportEventType.EDIT_REJECTED]: {
    color: "red",
    icon: <ExclamationCircleOutlined />,
    label: "Edit Rejected",
  },
  [ReportEventType.APPROVED]: {
    color: "green",
    icon: <CheckCircleOutlined />,
    label: "Report Approved",
  },
  [ReportEventType.REVIEWED]: {
    color: "purple",
    icon: <EyeOutlined />,
    label: "Report Reviewed",
  },
  [ReportEventType.LOCKED]: {
    color: "red",
    icon: <LockOutlined />,
    label: "Report Locked",
  },
  [ReportEventType.DEADLINE_PASSED]: {
    color: "red",
    icon: <ClockCircleOutlined />,
    label: "Deadline Passed",
  },
  [ReportEventType.UPDATE_REQUESTED]: {
    color: "orange",
    icon: <EditOutlined />,
    label: "Update Requested",
  },
  [ReportEventType.UPDATE_APPROVED]: {
    color: "green",
    icon: <CheckCircleOutlined />,
    label: "Update Approved",
  },
  [ReportEventType.UPDATE_REJECTED]: {
    color: "red",
    icon: <ExclamationCircleOutlined />,
    label: "Update Rejected",
  },
  [ReportEventType.DATA_ENTRY_CREATED]: {
    color: "blue",
    icon: <UserOutlined />,
    label: "Data Entry Created",
  },
  [ReportEventType.TEMPLATE_VERSION_NOTE]: {
    color: "default",
    icon: <AlertOutlined />,
    label: "Template Updated",
  },
  [ReportEventType.FIELD_UNLOCKED]: {
    color: "gold",
    icon: <LockOutlined />,
    label: "Field Unlocked",
  },
  [ReportEventType.AUTO_APPROVED]: {
    color: "green",
    icon: <CheckCircleOutlined />,
    label: "Auto-Approved",
  },
};

/**
 * Ant Design Timeline showing report event history.
 * Each event is rendered with its type-specific icon, color, and details.
 */
export default function ReportTimeline({
  events,
  className,
}: ReportTimelineProps) {
  if (!events.length) {
    return <Empty description="No events recorded" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Timeline
      className={className}
      items={sortedEvents.map((event) => {
        const config = EVENT_CONFIG[event.eventType] ?? {
          color: "gray",
          icon: <ClockCircleOutlined />,
          label: event.eventType,
        };

        return {
          key: event.id,
          color: config.color,
          dot: config.icon,
          children: (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <Text strong className="text-sm">
                  {config.label}
                </Text>
                {event.previousStatus && event.newStatus && (
                  <span className="text-xs text-gray-500">
                    <Tag className="text-xs">{event.previousStatus}</Tag>
                    →
                    <Tag className="text-xs">{event.newStatus}</Tag>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>
                  {new Date(event.timestamp).toLocaleString()}
                </span>
                {event.actorName && (
                  <>
                    <span>•</span>
                    <span>by {event.actorName}</span>
                  </>
                )}
              </div>
              {event.details && Object.keys(event.details).length > 0 && (
                <Text className="text-xs text-gray-500 mt-1">
                  {event.details.reason
                    ? String(event.details.reason)
                    : event.details.notes
                      ? String(event.details.notes)
                      : null}
                </Text>
              )}
            </div>
          ),
        };
      })}
    />
  );
}
