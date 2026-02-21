import { Metadata } from "next";
import LoginForm from "@/components/features/auth/LoginForm";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export const metadata: Metadata = {
  title: "Login - Harvesters Church CRM",
  description: "Sign in to access your church fellowship account",
};

export default function LoginPage() {
  const isDev = process.env.NEXT_PUBLIC_SHOW_DEV_CREDENTIALS === "true";

  return (
    <div className="min-h-screen flex items-center justify-center bg-ds-surface-base p-4">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <LoginForm showDevCredentials={isDev} />
      </div>
    </div>
  );
}
