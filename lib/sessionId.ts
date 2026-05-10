/**
 * Per-Session Unique UI Client ID
 *
 * Generates a unique UI Client ID per browser tab using sessionStorage.
 * - Different tab  → different ID  (sessionStorage is per-tab)
 * - Page refresh   → same ID       (sessionStorage persists within tab)
 * - Tab closed     → ID discarded  (sessionStorage auto-cleans)
 *
 * Format: "TFWB_{4-char hex}" e.g. "TFWB_a3f8"
 */

const SESSION_KEY = "tifa_ui_client_id";

function generateId(): string {
    const hex = Math.random().toString(16).slice(2, 6);
    return `TFWB_${hex}`;
}

/**
 * Get the unique UI Client ID for this browser session (tab).
 * Safe to call from client components only.
 */
export function getSessionUiId(): string {
    if (typeof window === "undefined") {
        // Server-side fallback — should not normally be reached from client components
        return "TFWB_SSR";
    }

    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
        id = generateId();
        sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
}
