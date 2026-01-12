import { Metadata } from "next";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://fellowship-crm.church";

export function generateSEO({
  title,
  description,
  path,
  image = "/og-image.png",
  noIndex = false,
}: SEOProps): Metadata {
  const fullTitle = `${title} | Church Fellowship CRM`;
  const url = `${BASE_URL}${path}`;
  const imageUrl = `${BASE_URL}${image}`;

  return {
    title: fullTitle,
    description,
    ...(noIndex && { robots: { index: false, follow: false } }),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: "Church Fellowship CRM",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl],
    },
  };
}

// Common meta tags for different page types
export const seoConfig = {
  home: {
    title: "Home",
    description:
      "Centralized church fellowship management system for tracking subgroup meetings, member engagement, and pastoral care.",
    path: "/",
  },
  login: {
    title: "Login",
    description:
      "Sign in to Church Fellowship CRM to manage your church community.",
    path: "/login",
    noIndex: true,
  },
  register: {
    title: "Register",
    description: "Create an account to join your church fellowship community.",
    path: "/register",
    noIndex: true,
  },
  dashboard: {
    superadmin: {
      title: "Dashboard",
      description:
        "Superadmin dashboard - Manage all groups, members, and church-wide analytics.",
      path: "/superadmin/dashboard",
      noIndex: true,
    },
    leader: {
      title: "Dashboard",
      description:
        "Group leader dashboard - Manage your group, meetings, and member interactions.",
      path: "/leader/dashboard",
      noIndex: true,
    },
    member: {
      title: "Dashboard",
      description:
        "Member dashboard - View your group, attendance, and participation history.",
      path: "/member/dashboard",
      noIndex: true,
    },
  },
  groups: {
    title: "Groups",
    description: "View and manage church fellowship groups and subgroups.",
    path: "/superadmin/groups",
    noIndex: true,
  },
  members: {
    title: "Members",
    description:
      "Manage church members, track engagement, and monitor participation.",
    path: "/superadmin/members",
    noIndex: true,
  },
  analytics: {
    title: "Analytics",
    description:
      "View comprehensive analytics on member engagement, attendance, and group performance.",
    path: "/superadmin/analytics",
    noIndex: true,
  },
  meetings: {
    title: "Meetings",
    description:
      "Schedule and manage group meetings, track attendance, and record interactions.",
    path: "/leader/meetings",
    noIndex: true,
  },
};

// JSON-LD structured data for organization
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Church Fellowship CRM",
  description: "Church fellowship and member management system",
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Support",
    email: "support@fellowship-crm.church",
  },
};

// JSON-LD structured data for web application
export const webApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Church Fellowship CRM",
  description:
    "Centralized church fellowship management system for tracking subgroup meetings, member engagement, and pastoral care",
  url: BASE_URL,
  applicationCategory: "BusinessApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  operatingSystem: "Web Browser",
};
