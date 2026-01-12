"use client";

import { useState } from "react";
import { Upload, message as antMessage } from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import Image from "next/image";

interface MockFileUploadProps {
  value?: string;
  onChange?: (url: string | null) => void;
  maxSize?: number; // in MB
  accept?: string;
  uploadText?: string;
  listType?: "text" | "picture" | "picture-card";
}

export default function MockFileUpload({
  value,
  onChange,
  maxSize = 5,
  accept = "image/*",
  uploadText = "Click to Upload",
  listType = "picture",
}: MockFileUploadProps) {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const beforeUpload = (file: File) => {
    // Validate file type
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      antMessage.error("You can only upload image files!");
      return false;
    }

    // Validate file size
    const isLtMaxSize = file.size / 1024 / 1024 < maxSize;
    if (!isLtMaxSize) {
      antMessage.error(`Image must be smaller than ${maxSize}MB!`);
      return false;
    }

    // Create preview URL (mock upload)
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setPreviewUrl(url);
      onChange?.(url);
      antMessage.success("File uploaded successfully (mock)");
    };
    reader.readAsDataURL(file);

    // Prevent actual upload
    return false;
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setFileList([]);
    onChange?.(null);
    antMessage.info("File removed");
  };

  return (
    <div className="space-y-2">
      {!previewUrl ? (
        <Upload
          accept={accept}
          beforeUpload={beforeUpload}
          onChange={handleChange}
          fileList={fileList}
          maxCount={1}
          listType={listType}
        >
          <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded cursor-pointer hover:border-blue-500 hover:text-blue-500 transition-colors">
            <UploadOutlined />
            <span>{uploadText}</span>
          </div>
        </Upload>
      ) : (
        <div className="space-y-2">
          <div className="relative w-full max-w-md border border-gray-200 rounded-lg overflow-hidden">
            <Image
              src={previewUrl}
              alt="Uploaded preview"
              width={400}
              height={300}
              className="w-full h-auto object-cover"
            />
          </div>
          <button
            onClick={handleRemove}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
          >
            <DeleteOutlined />
            Remove File
          </button>
        </div>
      )}
      <p className="text-xs text-gray-500">
        {previewUrl
          ? "Mock upload - file stored as base64 (in production, would upload to Cloudinary)"
          : `Accepted formats: ${accept}. Max size: ${maxSize}MB`}
      </p>
    </div>
  );
}
