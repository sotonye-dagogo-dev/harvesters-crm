import { Modal as AntModal, ModalProps } from "antd";
import { ReactNode } from "react";

// ─── Size Presets ───────────────────────────────────────────────────────────

type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

const SIZE_WIDTH_MAP: Record<ModalSize, number | string> = {
  sm: 400,
  md: 520,
  lg: 720,
  xl: 960,
  full: "90vw",
};

// ─── Modal Component ────────────────────────────────────────────────────────

interface CustomModalProps extends ModalProps {
  children: ReactNode;
  /** Predefined size presets */
  size?: ModalSize;
}

export default function Modal({
  children,
  size = "md",
  width,
  ...props
}: CustomModalProps) {
  return (
    <AntModal
      {...props}
      width={width || SIZE_WIDTH_MAP[size]}
      className={`custom-modal ${props.className || ""}`}
      styles={{
        header: {
          borderBottom: "1px solid var(--ds-border-base)",
          paddingBottom: "12px",
        },
        ...props.styles,
      }}
    >
      {children}
    </AntModal>
  );
}

// ─── Confirm Modal ──────────────────────────────────────────────────────────

interface ConfirmModalProps {
  open: boolean;
  title: string;
  content?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLoading?: boolean;
  danger?: boolean;
  okText?: string;
  cancelText?: string;
}

export function ConfirmModal({
  open,
  title,
  content,
  onConfirm,
  onCancel,
  confirmLoading = false,
  danger = false,
  okText = "Confirm",
  cancelText = "Cancel",
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      title={title}
      onOk={onConfirm}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      okText={okText}
      cancelText={cancelText}
      size="sm"
      okButtonProps={{
        danger,
      }}
    >
      {typeof content === "string" ? (
        <p className="text-ds-text-secondary">{content}</p>
      ) : (
        content
      )}
    </Modal>
  );
}
