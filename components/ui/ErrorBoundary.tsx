"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { Result, Button } from "antd";
import { BugOutlined } from "@ant-design/icons";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    console.error("Error caught by boundary:", error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you would send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <Result
            status="error"
            icon={<BugOutlined />}
            title="Something went wrong"
            subTitle="An unexpected error occurred. Please try again or contact support if the problem persists."
            extra={[
              <Button type="primary" key="retry" onClick={this.handleReset}>
                Try Again
              </Button>,
              <Button key="home" onClick={() => (window.location.href = "/")}>
                Go Home
              </Button>,
            ]}
          >
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-left">
                <p className="font-semibold text-red-800 mb-2">
                  Error Details (Development Only):
                </p>
                <pre className="text-xs text-red-700 overflow-auto">
                  {this.state.error.toString()}
                  {"\n\n"}
                  {this.state.error.stack}
                </pre>
              </div>
            )}
          </Result>
        </div>
      );
    }

    return this.props.children;
  }
}

// Route-level error boundary with custom messaging
export class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Route error:", error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <Result
            status="500"
            title="Page Error"
            subTitle="This page encountered an error and couldn't load properly."
            extra={[
              <Button type="primary" key="back" onClick={this.handleReset}>
                Go Back
              </Button>,
              <Button key="home" onClick={() => (window.location.href = "/")}>
                Go Home
              </Button>,
            ]}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
