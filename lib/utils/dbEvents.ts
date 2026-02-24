/**
 * Database Event System
 *
 * Lightweight pub/sub event emitter for real-time UI updates when the mock
 * database changes. Components subscribe to entity change events and re-fetch
 * data automatically, eliminating the need for manual page refreshes.
 *
 * In production this would be replaced by WebSocket / Server-Sent Events
 * from the real database, but the API surface stays the same.
 */

// ============================================================================
// Event Types
// ============================================================================

export type DbEntityType =
    | "users"
    | "groups"
    | "meetings"
    | "interactions"
    | "membershipRequests"
    | "notifications"
    | "campuses"
    | "zones"
    | "departments"
    | "cells"
    | "campaigns"
    | "campaignInteractions"
    | "inviteLinks"
    | "reports"
    | "reportTemplates"
    | "reportEdits"
    | "reportUpdateRequests";

export type DbChangeAction = "create" | "update" | "delete";

export interface DbChangeEvent {
    entity: DbEntityType;
    action: DbChangeAction;
    id?: string;
    timestamp: number;
}

type DbEventListener = (event: DbChangeEvent) => void;

// ============================================================================
// Singleton Event Emitter (survives HMR via globalThis)
// ============================================================================

const globalForEvents = globalThis as unknown as {
    __dbEventListeners?: Set<DbEventListener>;
};

if (!globalForEvents.__dbEventListeners) {
    globalForEvents.__dbEventListeners = new Set();
}

const listeners = globalForEvents.__dbEventListeners;

/**
 * Subscribe to database change events.
 * Returns an unsubscribe function.
 */
export function onDbChange(listener: DbEventListener): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

/**
 * Emit a database change event to all listeners.
 * Call this after any CRUD operation in the mock DB.
 */
export function emitDbChange(
    entity: DbEntityType,
    action: DbChangeAction,
    id?: string
): void {
    const event: DbChangeEvent = {
        entity,
        action,
        id,
        timestamp: Date.now(),
    };
    // Use queueMicrotask to avoid synchronous side effects during rendering
    queueMicrotask(() => {
        listeners.forEach((fn) => {
            try {
                fn(event);
            } catch {
                // Swallow listener errors to avoid breaking other listeners
            }
        });
    });
}
