import { apiFetch } from "./api";

/**
 * Fetch current authenticated user.
 * Assumes Laravel exposes an auth endpoint like GET /api/user (typical Sanctum SPA).
 */
export async function fetchCurrentUser() {
    // Many Sanctum apps expose /api/user; some expose /user.
    try {
        return await apiFetch("/api/user", { method: "GET" });
    } catch (e) {
        // fallback
        return await apiFetch("/user", { method: "GET" });
    }
}

export async function ensureCsrfCookie() {
    // For Laravel Sanctum SPA auth, you should hit /sanctum/csrf-cookie before
    // any POST/PUT/DELETE that needs XSRF protection.
    try {
        await apiFetch("/sanctum/csrf-cookie", { method: "GET" });
    } catch (e) {
        // If backend doesn't have Sanctum route or returns non-JSON, ignore here.
        // Login/logout calls will surface the real error.
    }
}

export async function logout() {
    await ensureCsrfCookie();

    // Default Laravel logout is POST /logout (web route).
    // Some projects implement POST /api/logout instead.
    try {
        await apiFetch("/logout", { method: "POST" });
        return;
    } catch (e) {
        // If it's a 404/405 etc, try /api/logout
        await apiFetch("/api/logout", { method: "POST" });
    }
}
