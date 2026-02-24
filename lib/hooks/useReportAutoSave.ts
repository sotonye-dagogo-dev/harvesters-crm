"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { AUTO_SAVE_INTERVAL_MS } from "@/lib/constants";
import { useDebounce } from "@/lib/hooks";

/**
 * Auto-save hook for report forms.
 * Saves draft form data at a regular interval when changes are detected.
 */
export function useReportAutoSave(
  reportId: string | null,
  formData: Record<string, unknown>,
  options: {
    interval?: number;
    enabled?: boolean;
  } = {}
) {
  const { interval = AUTO_SAVE_INTERVAL_MS, enabled = true } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previousDataRef = useRef<string>("");

  // Debounce form data changes to detect when user stops typing
  const debouncedData = useDebounce(formData, 2000);

  // Track changes
  useEffect(() => {
    const currentJson = JSON.stringify(debouncedData);
    if (previousDataRef.current && currentJson !== previousDataRef.current) {
      setHasUnsavedChanges(true);
    }
    previousDataRef.current = currentJson;
  }, [debouncedData]);

  // Auto-save function
  const saveData = useCallback(async () => {
    if (!reportId || !hasUnsavedChanges || !enabled || isSaving) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/reports/${reportId}/auto-save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Auto-save failed");
      }

      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Auto-save failed";
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  }, [reportId, hasUnsavedChanges, enabled, isSaving, formData]);

  // Setup interval
  useEffect(() => {
    if (!enabled || !reportId) return;

    const timer = setInterval(saveData, interval);
    return () => clearInterval(timer);
  }, [enabled, reportId, interval, saveData]);

  // Manual save trigger
  const manualSave = useCallback(async () => {
    setHasUnsavedChanges(true);
    await saveData();
  }, [saveData]);

  return {
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    error,
    manualSave,
  };
}
