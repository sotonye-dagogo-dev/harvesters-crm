import { List, Tag } from "antd";
import { BooleanBadge } from "@/components/ui/StatusBadge";

interface AttendanceListProps {
  members: Array<{
    id: string;
    firstName: string;
    lastName: string;
    isPresent: boolean;
  }>;
  showStatus?: boolean;
}

export default function AttendanceList({
  members,
  showStatus = true,
}: AttendanceListProps) {
  const presentCount = members.filter((m) => m.isPresent).length;
  const absentCount = members.length - presentCount;

  return (
    <div className="space-y-4">
      {showStatus && (
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">Present:</span>
            <Tag color="success">{presentCount}</Tag>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Absent:</span>
            <Tag color="error">{absentCount}</Tag>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Rate:</span>
            <Tag color="blue">
              {((presentCount / members.length) * 100).toFixed(0)}%
            </Tag>
          </div>
        </div>
      )}

      <List
        dataSource={members}
        renderItem={(member) => (
          <List.Item
            className={`${
              !member.isPresent ? "opacity-50" : ""
            } hover:bg-ds-surface-sunken px-4 rounded-lg transition-colors`}
          >
            <List.Item.Meta
              avatar={
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                    member.isPresent ? "bg-ds-brand-accent" : "bg-ds-text-subtle"
                  }`}
                >
                  {member.firstName[0]}
                  {member.lastName[0]}
                </div>
              }
              title={
                <span className="text-ds-text-primary">
                  {member.firstName} {member.lastName}
                </span>
              }
            />
            <BooleanBadge value={member.isPresent} trueLabel="Present" falseLabel="Absent" />
          </List.Item>
        )}
      />
    </div>
  );
}
