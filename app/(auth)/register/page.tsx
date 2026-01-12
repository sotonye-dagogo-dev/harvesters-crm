import { Metadata } from "next";
import RegisterForm from "@/components/features/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Register - Church Fellowship CRM",
  description: "Create your church fellowship account",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-church-primary/10 to-church-accent/10 p-4 py-12">
      <div className="w-full max-w-2xl">
        <RegisterForm />
      </div>
    </div>
  );
}
