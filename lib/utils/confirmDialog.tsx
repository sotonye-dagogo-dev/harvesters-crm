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
      } catch (err: any) {
        Modal.error({
          title: "Action Failed",
          content:
            err?.message || "An unexpected error occurred. Please try again.",
        });
      }
    },
    onCancel: onCancel
      ? async () => {
          try {
            await onCancel();
          } catch (err: any) {
            Modal.error({
              title: "Cancel Failed",
              content: err?.message || "An error occurred while cancelling.",
            });
          }
        }
      : undefined,
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
      } catch (err: any) {
        Modal.error({
          title: "Delete Failed",
          content: err?.message || `Failed to delete ${itemName}.`,
        });
      }
    },
    onCancel: onCancel
      ? async () => {
          try {
            await onCancel();
          } catch (err: any) {
            Modal.error({
              title: "Cancel Failed",
              content: err?.message || "An error occurred while cancelling.",
            });
          }
        }
      : undefined,
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
    onOk: async () => {
      try {
        await onOk();
      } catch (err: any) {
        Modal.error({
          title: "Action Failed",
          content: err?.message || "An unexpected error occurred.",
        });
      }
    },
    onCancel: onCancel
      ? async () => {
          try {
            await onCancel();
          } catch (err: any) {
            Modal.error({
              title: "Cancel Failed",
              content: err?.message || "An error occurred while cancelling.",
            });
          }
        }
      : undefined,
    centered: true,
    maskClosable: true,
  });
}
