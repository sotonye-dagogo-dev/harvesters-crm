"use client";

import { useEffect } from "react";
import { Button, Result } from "antd";
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-church-primary/5 to-church-accent/5 p-4">
      <Result
        status="500"
        title="500"
        subTitle="Sorry, something went wrong. Please try again."
        extra={
          <div className="flex gap-4 justify-center">
            <Button
              type="primary"
              size="large"
              icon={<ReloadOutlined />}
              onClick={reset}
            >
              Try Again
            </Button>
            <Link href="/">
              <Button size="large" icon={<HomeOutlined />}>
                Go Home
              </Button>
            </Link>
          </div>
        }
      >
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left max-w-2xl mx-auto">
            <p className="text-sm font-mono text-red-900 whitespace-pre-wrap break-words">
              {error.message}
            </p>
            {error.stack && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-semibold text-red-800">
                  Stack Trace
                </summary>
                <pre className="mt-2 text-xs text-red-700 overflow-auto">
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
