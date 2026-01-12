import { Metadata } from "next";
import LoginForm from "@/components/features/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login - Church Fellowship CRM",
  description: "Sign in to access your church fellowship account",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-church-primary/10 to-church-accent/10 p-4">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
