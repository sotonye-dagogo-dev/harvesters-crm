import { Timeline } from "antd";
import StatusBadge, { getColor } from "@/components/ui/StatusBadge";
import {
  PhoneOutlined,
  MessageOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";

interface Interaction {
  id: string;
  type: "CALL" | "FOLLOW_UP" | "CHECK_IN";
  timestamp: string;
  notes: string;
  leaderName?: string;
}

interface InteractionLogProps {
  interactions: Interaction[];
  emptyMessage?: string;
}

const getInteractionIcon = (type: string) => {
  switch (type) {
    case "CALL":
      return <PhoneOutlined className="text-ds-chart-1" />;
    case "FOLLOW_UP":
      return <MessageOutlined className="text-ds-status-success" />;
    case "CHECK_IN":
      return <CheckCircleOutlined className="text-ds-chart-3" />;
    default:
      return <MessageOutlined />;
  }
};

export default function InteractionLog({
  interactions,
  emptyMessage = "No interactions recorded yet",
}: InteractionLogProps) {
  if (interactions.length === 0) {
    return (
      <div className="text-center py-8 text-ds-text-subtle">
        <MessageOutlined className="text-4xl mb-2 text-ds-text-subtle" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  const timelineItems = interactions.map((interaction) => ({
    color: getColor(interaction.type, "interaction"),
    dot: getInteractionIcon(interaction.type),
    children: (
      <div className="pb-4">
        <div className="flex items-center justify-between mb-1">
          <StatusBadge status={interaction.type} category="interaction" />
          <span className="text-xs text-ds-text-subtle">
            {format(
              new Date(interaction.timestamp),
              "d MMM yyyy 'at' h:mm a"
            )}
          </span>
        </div>
        {interaction.leaderName && (
          <p className="text-sm text-ds-text-secondary mb-1">
            By: <span className="font-medium">{interaction.leaderName}</span>
          </p>
        )}
        <p className="text-ds-text-secondary">{interaction.notes}</p>
      </div>
    ),
  }));

  return (
    <div className="bg-white">
      <Timeline items={timelineItems} />
    </div>
  );
}
