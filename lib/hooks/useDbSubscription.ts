"use client";

/**
 * useDbSubscription — React hook for real-time UI updates
 *
 * Subscribe to mock database change events for specific entity types.
 * Calls the provided callback whenever a matching change occurs,
 * enabling components to re-fetch data without page refreshes.
 *
 * Usage:
 *   useDbSubscription(["notifications", "reports"], () => {
 *     refetchData();
 *   });
 */

import { useEffect, useRef } from "react";
import {
  onDbChange,
  type DbEntityType,
  type DbChangeEvent,
} from "@/lib/utils/dbEvents";

/**
 * Subscribe to database change events for the given entity types.
 * The callback fires whenever a matching CRUD event is emitted.
 *
 * @param entities - Array of entity type names to listen for
 * @param callback - Function to call when a matching change occurs
 */
export function useDbSubscription(
  entities: DbEntityType[],
  callback: (event: DbChangeEvent) => void
): void {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  const entitiesKey = entities.sort().join(",");

  useEffect(() => {
    const entitySet = new Set(entitiesKey.split(",") as DbEntityType[]);

    const unsubscribe = onDbChange((event) => {
      if (entitySet.has(event.entity)) {
        callbackRef.current(event);
      }
    });

    return unsubscribe;
  }, [entitiesKey]);
}
