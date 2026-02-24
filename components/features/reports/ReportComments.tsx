"use client";

import { useState, useEffect, useCallback } from "react";
import {
  List,
  Input,
  Button,
  Avatar,
  Typography,
  Tag,
  Space,
  Spin,
  Empty,
  message,
} from "antd";
import { SendOutlined, UserOutlined, CommentOutlined } from "@ant-design/icons";
import { ReportCommentType } from "@/lib/types";

const { TextArea } = Input;
const { Text, Paragraph } = Typography;

interface ReportCommentsProps {
  reportId: string;
  canComment?: boolean;
  currentUserId?: string;
}

interface CommentItem {
  id: string;
  content: string;
  commentType: ReportCommentType;
  createdAt: string;
  userId: string;
  userName?: string;
  userRole?: string;
}

const COMMENT_TYPE_COLORS: Record<string, string> = {
  FEEDBACK: "blue",
  REQUEST_EDIT: "orange",
  APPROVAL_NOTE: "green",
  CLARIFICATION: "purple",
};

const COMMENT_TYPE_LABELS: Record<string, string> = {
  FEEDBACK: "Feedback",
  REQUEST_EDIT: "Edit Request",
  APPROVAL_NOTE: "Approval Note",
  CLARIFICATION: "Clarification",
};

export default function ReportComments({
  reportId,
  canComment = true,
  currentUserId,
}: ReportCommentsProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentType, setCommentType] = useState<ReportCommentType>(
    ReportCommentType.FEEDBACK
  );

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports/${reportId}/comments`);
      const data = await response.json();
      if (data.success) {
        setComments(data.data ?? []);
      }
    } catch {
      // Silently handle — show empty
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/reports/${reportId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment.trim(),
          commentType,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewComment("");
        message.success("Comment added.");
        fetchComments();
      } else {
        message.error(data.error ?? "Failed to add comment.");
      }
    } catch {
      message.error("Failed to add comment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spin />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <CommentOutlined className="text-lg" />
        <Text strong>Comments ({comments.length})</Text>
      </div>

      {comments.length === 0 ? (
        <Empty
          description="No comments yet"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={comments}
          renderItem={(comment) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar
                    icon={<UserOutlined />}
                    className={
                      comment.userId === currentUserId
                        ? "!bg-green-600"
                        : "!bg-gray-400"
                    }
                  />
                }
                title={
                  <div className="flex items-center gap-2 flex-wrap">
                    <Text strong className="text-sm">
                      {comment.userName ?? "User"}
                    </Text>
                    <Tag
                      color={
                        COMMENT_TYPE_COLORS[comment.commentType] ?? "default"
                      }
                      className="!text-xs"
                    >
                      {COMMENT_TYPE_LABELS[comment.commentType] ??
                        comment.commentType}
                    </Tag>
                    <Text type="secondary" className="!text-xs">
                      {new Date(comment.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </Text>
                  </div>
                }
                description={
                  <Paragraph className="!mb-0 !mt-1 whitespace-pre-wrap">
                    {comment.content}
                  </Paragraph>
                }
              />
            </List.Item>
          )}
        />
      )}

      {canComment && (
        <div className="space-y-2 border-t pt-4 dark:border-gray-700">
          <Space wrap>
            {Object.entries(COMMENT_TYPE_LABELS).map(([value, label]) => (
              <Tag
                key={value}
                color={
                  commentType === value ? COMMENT_TYPE_COLORS[value] : "default"
                }
                className="cursor-pointer"
                onClick={() => setCommentType(value as ReportCommentType)}
              >
                {label}
              </Tag>
            ))}
          </Space>
          <div className="flex gap-2">
            <TextArea
              rows={2}
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              maxLength={1000}
              showCount
              className="flex-1"
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSubmit}
              loading={submitting}
              disabled={!newComment.trim()}
              className="!bg-green-600 hover:!bg-green-700 self-end"
            >
              Send
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
