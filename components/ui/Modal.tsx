import { Modal as AntModal, ModalProps } from "antd";
import { ReactNode } from "react";

interface CustomModalProps extends ModalProps {
  children: ReactNode;
}

export default function Modal({ children, ...props }: CustomModalProps) {
  return (
    <AntModal
      {...props}
      className="custom-modal"
      styles={{
        header: {
          borderBottom: "1px solid #f0f0f0",
          paddingBottom: "12px",
        },
      }}
    >
      {children}
    </AntModal>
  );
}

interface ConfirmModalProps {
  open: boolean;
  title: string;
  content: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLoading?: boolean;
  danger?: boolean;
}

export function ConfirmModal({
  open,
  title,
  content,
  onConfirm,
  onCancel,
  confirmLoading = false,
  danger = false,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      title={title}
      onOk={onConfirm}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      okText="Confirm"
      cancelText="Cancel"
      okButtonProps={{
        danger,
      }}
    >
      <p className="text-gray-600">{content}</p>
    </Modal>
  );
}
