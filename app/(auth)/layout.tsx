import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-ds-surface-base">
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
