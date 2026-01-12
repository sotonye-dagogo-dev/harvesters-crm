import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AntdProvider } from "@/providers/AntdProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { organizationSchema, webApplicationSchema } from "@/lib/utils/seo";
import { ServiceWorkerRegistration } from "@/components/features/pwa/ServiceWorkerRegistration";
import { InstallPrompt } from "@/components/features/pwa/InstallPrompt";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Church Fellowship CRM",
  description:
    "Manage church subgroups, track member engagement, and support pastoral care",
  keywords: [
    "church",
    "fellowship",
    "CRM",
    "member management",
    "attendance tracking",
  ],
  authors: [{ name: "Harvesters Church" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Fellowship CRM",
  },
  openGraph: {
    title: "Church Fellowship CRM",
    description:
      "Manage church subgroups, track member engagement, and support pastoral care",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(webApplicationSchema),
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        {/* Skip to main content link for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-church-primary focus:text-white focus:rounded focus:shadow-lg"
        >
          Skip to main content
        </a>
        <ServiceWorkerRegistration />
        <InstallPrompt />
        <AntdProvider>
          <AuthProvider>{children}</AuthProvider>
        </AntdProvider>
      </body>
    </html>
  );
}
