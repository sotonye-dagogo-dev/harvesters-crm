"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import Button from "@/components/ui/Button";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  // function to also toggle dark class for body
  const toggleDarkClass = (isDark: boolean) => {
    if (isDark) {
      document.body.classList.add("dark");
      // set @media (prefer-color-scheme) and style color scheme to dark
      document.body.style.colorScheme = "dark";
    } else {
      document.body.classList.remove("dark");
      document.body.style.colorScheme = "light";
    }
  };

  // Prevent hydration mismatch - using setTimeout to avoid cascading renders
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="secondary"
        icon={<SunOutlined className="text-lg" />}
        className="flex items-center justify-center h-10 w-10 rounded-full shadow-ds-sm hover:shadow-ds-md transition-all duration-300 border border-ds-border-base bg-ds-surface-elevated"
        aria-label="Toggle theme"
      />
    );
  }

  return (
    <Button
      variant="secondary"
      icon={
        theme === "dark" ? (
          <SunOutlined className="text-lg text-yellow-500" />
        ) : (
          <MoonOutlined className="text-lg text-ds-chart-1" />
        )
      }
      onClick={() => {
        setTheme(theme === "dark" ? "light" : "dark");
        toggleDarkClass(theme !== "dark");
      }}
      className="flex items-center justify-center h-10 w-10 rounded-full shadow-ds-sm hover:shadow-ds-md transition-all duration-300 hover:scale-110 bg-ds-surface-elevated border border-ds-border-base ds-hover-glow"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    />
  );
}
