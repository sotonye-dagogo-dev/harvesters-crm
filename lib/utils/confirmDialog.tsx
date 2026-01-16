import { Modal } from "antd";
import React from "react";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const { confirm } = Modal;

interface ConfirmOptions {
  title: string;
  content: string;
  onOk: () => void | Promise<void>;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  okType?: "primary" | "danger";
  icon?: React.ReactNode;
}

/**
 * Show confirmation dialog for destructive actions
 *
 * @example
 * showConfirm({
 *   title: 'Delete User',
 *   content: 'Are you sure you want to delete this user? This action cannot be undone.',
 *   onOk: async () => {
 *     await deleteUser(userId);
 *   },
 *   okType: 'danger',
 * });
 */
export function showConfirm({
  title,
  content,
  onOk,
  onCancel,
  okText = "Confirm",
  cancelText = "Cancel",
  okType = "primary",
  icon = <ExclamationCircleOutlined />,
}: ConfirmOptions) {
  confirm({
    title,
    content,
    icon,
    okText,
    cancelText,
    okType,
    onOk: async () => {
      try {
        await onOk();
      } catch (error) {
        Modal.error({
          title: "Operation Failed",
          content:
            error instanceof Error
              ? error.message
              : "An error occurred while performing this action. Please try again.",
          centered: true,
        });
      }
    },
    onCancel: () => {
      try {
        onCancel?.();
      } catch (error) {
        console.error("Error in cancel callback:", error);
      }
    },
    centered: true,
    maskClosable: true,
  });
}

/**
 * Show delete confirmation dialog
 *
 * @example
 * showDeleteConfirm({
 *   title: 'Delete Meeting',
 *   content: 'Are you sure you want to delete this meeting?',
 *   onOk: async () => {
 *     await deleteMeeting(meetingId);
 *   },
 * });
 */
export function showDeleteConfirm({
  title,
  content,
  onOk,
  onCancel,
  itemName = "item",
}: Omit<ConfirmOptions, "okType" | "okText"> & { itemName?: string }) {
  confirm({
    title: title || `Delete ${itemName}`,
    content:
      content ||
      `Are you sure you want to delete this ${itemName}? This action cannot be undone.`,
    icon: <ExclamationCircleOutlined style={{ color: "#dc2626" }} />,
    okText: "Delete",
    okType: "danger",
    cancelText: "Cancel",
    onOk: async () => {
      try {
        await onOk();
      } catch (error) {
        Modal.error({
          title: `Failed to Delete ${itemName}`,
          content:
            error instanceof Error
              ? error.message
              : `Unable to delete this ${itemName}. Please try again or contact support if the problem persists.`,
          centered: true,
        });
      }
    },
    onCancel: () => {
      try {
        onCancel?.();
      } catch (error) {
        console.error("Error in cancel callback:", error);
      }
    },
    centered: true,
    maskClosable: true,
  });
}

/**
 * Show warning confirmation dialog
 *
 * @example
 * showWarningConfirm({
 *   title: 'Remove Member',
 *   content: 'This will remove the member from the group. Continue?',
 *   onOk: async () => {
 *     await removeMember(memberId);
 *   },
 * });
 */
export function showWarningConfirm({
  title,
  content,
  onOk,
  onCancel,
}: Omit<ConfirmOptions, "okType" | "icon">) {
  confirm({
    title,
    content,
    icon: <ExclamationCircleOutlined style={{ color: "#eab308" }} />,
    okText: "Proceed",
    okType: "primary",
    cancelText: "Cancel",
    onOk,
    onCancel,
    centered: true,
    maskClosable: true,
  });
}
