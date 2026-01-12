import { Metadata } from "next";
import LoginForm from "@/components/features/auth/LoginForm";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export const metadata: Metadata = {
  title: "Login - Church Fellowship CRM",
  description: "Sign in to access your church fellowship account",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-church-primary/10 to-church-accent/10 dark:from-slate-900 dark:to-slate-800 p-4">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
