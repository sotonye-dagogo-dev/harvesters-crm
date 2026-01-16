"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { Button } from "antd";

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
  }

  // Prevent hydration mismatch - using setTimeout to avoid cascading renders
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <Button
        type="default"
        icon={<SunOutlined className="text-lg" />}
        className="flex items-center justify-center h-10 w-10 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
        aria-label="Toggle theme"
      />
    );
  }

  return (
    <Button
      type="default"
      icon={
        theme === "dark" ? (
          <SunOutlined className="text-lg text-yellow-500" />
        ) : (
          <MoonOutlined className="text-lg text-blue-600" />
        )
      }
      onClick={() => {
        setTheme(theme === "dark" ? "light" : "dark");
        toggleDarkClass(theme !== "dark")
      }}
      className="flex items-center justify-center h-10 w-10 rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 bg-white dark:bg-slate-800"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    />
  );
}
