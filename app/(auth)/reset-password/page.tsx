"use client";

import { useState, useEffect, Suspense } from "react";
import { Form, Input, Button, Card, message, Progress } from "antd";
import { LockOutlined, CheckCircleOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      message.error("Invalid reset link");
      setTokenValid(false);
      return;
    }

    // Verify token
    verifyToken(token);
  }, [token]);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(
        `/api/auth/verify-reset-token?token=${token}`
      );
      const data = await response.json();

      if (response.ok && data.valid) {
        setTokenValid(true);
      } else {
        setTokenValid(false);
        message.error("This reset link is invalid or has expired");
      }
    } catch {
      setTokenValid(false);
      message.error("Failed to verify reset link");
    }
  };

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setPasswordStrength(calculatePasswordStrength(password));
  };

  const getStrengthColor = (strength: number): string => {
    if (strength < 40) return "#ff4d4f";
    if (strength < 70) return "#faad14";
    return "#52c41a";
  };

  const getStrengthText = (strength: number): string => {
    if (strength < 40) return "Weak";
    if (strength < 70) return "Medium";
    return "Strong";
  };

  const handleSubmit = async (values: {
    password: string;
    confirmPassword: string;
  }) => {
    if (!token) {
      message.error("Invalid reset token");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResetSuccess(true);
        message.success("Password reset successfully!");
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        message.error(data.error || "Failed to reset password");
      }
    } catch {
      message.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-church-primary to-church-secondary p-4">
        <Card className="w-full max-w-md shadow-xl">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-church-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Verifying reset link...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-church-primary to-church-secondary p-4">
        <Card className="w-full max-w-md shadow-xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-red-600">✕</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Invalid Reset Link
            </h2>
            <p className="text-gray-600 mb-6">
              This password reset link is invalid or has expired. Please request
              a new one.
            </p>
            <Link href="/forgot-password">
              <Button type="primary" size="large" block>
                Request New Link
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-church-primary to-church-secondary p-4">
        <Card className="w-full max-w-md shadow-xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleOutlined className="text-3xl text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Password Reset Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Your password has been reset successfully. You can now log in with
              your new password.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to login page...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-church-primary to-church-secondary p-4">
      <Card className="w-full max-w-md shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reset Password
          </h1>
          <p className="text-gray-600">Enter your new password below</p>
        </div>

        <Form
          name="reset-password"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="password"
            label="New Password"
            rules={[
              { required: true, message: "Please enter your new password" },
              { min: 8, message: "Password must be at least 8 characters" },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message:
                  "Password must contain uppercase, lowercase, and number",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter new password"
              onChange={handlePasswordChange}
            />
          </Form.Item>

          {passwordStrength > 0 && (
            <div className="mb-4">
              <Progress
                percent={passwordStrength}
                strokeColor={getStrengthColor(passwordStrength)}
                showInfo={false}
                size="small"
              />
              <p className="text-xs mt-1">
                <span
                  className={
                    passwordStrength < 40
                      ? "text-red-500"
                      : passwordStrength < 70
                        ? "text-yellow-500"
                        : "text-green-500"
                  }
                >
                  Password Strength: {getStrengthText(passwordStrength)}
                </span>
              </p>
            </div>
          )}

          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm new password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className="mb-4"
            >
              Reset Password
            </Button>
          </Form.Item>

          <div className="text-center">
            <Link
              href="/login"
              className="text-church-primary hover:text-church-primary/80 text-sm"
            >
              Back to Login
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-church-primary to-church-secondary p-4">
          <Card className="w-full max-w-md shadow-xl">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-church-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </Card>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
