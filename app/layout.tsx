import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AntdProvider } from "@/providers/AntdProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { organizationSchema, webApplicationSchema } from "@/lib/utils/seo";
// PWA features temporarily disabled due to filesystem cache issues
// import { ServiceWorkerRegistration } from "@/components/features/pwa/ServiceWorkerRegistration";
// import { InstallPrompt } from "@/components/features/pwa/InstallPrompt";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Harvesters Church CRM | Harvesters International Christian Centre",
  description:
    "Manage church groups, track member engagement, and foster transformational encounters at Harvesters International Christian Centre. Connecting people with God across Nigeria, UK, and USA.",
  keywords: [
    "Harvesters Church",
    "Harvesters International Christian Centre",
    "church management",
    "fellowship",
    "Pastor Bolaji Idowu",
    "church CRM",
    "Lagos church",
    "member engagement",
    "attendance tracking",
  ],
  authors: [{ name: "Harvesters International Christian Centre" }],
  // PWA features temporarily disabled
  // manifest: "/manifest.json",
  // appleWebApp: {
  //   capable: true,
  //   statusBarStyle: "default",
  //   title: "Harvesters Small Groups",
  // },
  openGraph: {
    title: "Harvesters Church CRM | HICC",
    description:
      "Manage church groups and foster transformational encounters at Harvesters International Christian Centre",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {/* Skip to main content link for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-ds-brand-accent focus:text-white focus:rounded-[var(--ds-radius-md)] focus:shadow-ds-md"
        >
          Skip to main content
        </a>
        {/* PWA features temporarily disabled */}
        {/* <ServiceWorkerRegistration /> */}
        {/* <InstallPrompt /> */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AntdProvider>
            <AuthProvider>{children}</AuthProvider>
          </AntdProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
