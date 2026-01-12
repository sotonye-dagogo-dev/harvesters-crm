import { Timeline, Tag } from "antd";
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
      return <PhoneOutlined className="text-blue-600" />;
    case "FOLLOW_UP":
      return <MessageOutlined className="text-green-600" />;
    case "CHECK_IN":
      return <CheckCircleOutlined className="text-purple-600" />;
    default:
      return <MessageOutlined />;
  }
};

const getInteractionColor = (type: string) => {
  switch (type) {
    case "CALL":
      return "blue";
    case "FOLLOW_UP":
      return "green";
    case "CHECK_IN":
      return "purple";
    default:
      return "default";
  }
};

export default function InteractionLog({
  interactions,
  emptyMessage = "No interactions recorded yet",
}: InteractionLogProps) {
  if (interactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MessageOutlined className="text-4xl mb-2 text-gray-300" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  const timelineItems = interactions.map((interaction) => ({
    color: getInteractionColor(interaction.type),
    dot: getInteractionIcon(interaction.type),
    children: (
      <div className="pb-4">
        <div className="flex items-center justify-between mb-1">
          <Tag color={getInteractionColor(interaction.type)}>
            {interaction.type.replace("_", " ")}
          </Tag>
          <span className="text-xs text-gray-500">
            {format(
              new Date(interaction.timestamp),
              "MMM dd, yyyy 'at' h:mm a"
            )}
          </span>
        </div>
        {interaction.leaderName && (
          <p className="text-sm text-gray-600 mb-1">
            By: <span className="font-medium">{interaction.leaderName}</span>
          </p>
        )}
        <p className="text-gray-700">{interaction.notes}</p>
      </div>
    ),
  }));

  return (
    <div className="bg-white">
      <Timeline items={timelineItems} />
    </div>
  );
}
