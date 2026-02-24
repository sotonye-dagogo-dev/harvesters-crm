"use client";

import { useEffect } from "react";
import { Result } from "antd";
import Button from "@/components/ui/Button";
import { ReloadOutlined, HomeOutlined } from "@ant-design/icons";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-ds-surface-base p-4">
      <Result
        status="500"
        title="500"
        subTitle="Sorry, something went wrong. Please try again."
        extra={
          <div className="flex gap-4 justify-center">
            <Button
              size="large"
              icon={<ReloadOutlined />}
              onClick={reset}
            >
              Try Again
            </Button>
            <Link href="/">
              <Button variant="secondary" size="large" icon={<HomeOutlined />}>
                Go Home
              </Button>
            </Link>
          </div>
        }
      >
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-ds-surface-sunken border border-ds-status-error/30 rounded-[var(--ds-radius-lg)] text-left max-w-2xl mx-auto">
            <p className="text-sm font-mono text-ds-status-error whitespace-pre-wrap break-words">
              {error.message}
            </p>
            {error.stack && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-semibold text-ds-status-error">
                  Stack Trace
                </summary>
                <pre className="mt-2 text-xs text-ds-status-error/80 overflow-auto">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}
      </Result>
    </div>
  );
}
