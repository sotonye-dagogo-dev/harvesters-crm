"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { Button } from "antd";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Prevent hydration mismatch - using setTimeout to avoid cascading renders
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <Button
        type="text"
        icon={<SunOutlined />}
        className="flex items-center justify-center"
        aria-label="Toggle theme"
      />
    );
  }

  return (
    <Button
      type="text"
      icon={theme === "dark" ? <SunOutlined /> : <MoonOutlined />}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex items-center justify-center"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    />
  );
}
