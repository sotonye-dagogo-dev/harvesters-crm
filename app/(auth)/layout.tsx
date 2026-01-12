import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-church-primary/5 via-white to-church-accent/5">
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
