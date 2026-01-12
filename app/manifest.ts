import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Church Fellowship CRM",
    short_name: "Fellowship CRM",
    description:
      "Manage church subgroups, track member engagement, and support pastoral care",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1b4b3e",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["productivity", "business"],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        description: "Go to your dashboard",
        url: "/dashboard",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "My Group",
        short_name: "Group",
        description: "View your group",
        url: "/leader/my-group",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
