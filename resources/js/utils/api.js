// resources/js/utils/api.js

const API_BASE = import.meta.env.VITE_API_BASE_URL || window.location.origin;

function getCookie(name) {
    const match = document.cookie.match(new RegExp("(^|;\\s*)" + name + "=([^;]*)"));
    return match ? decodeURIComponent(match[2]) : null;
}

/**
 * Hit Sanctum CSRF cookie endpoint so Laravel sets XSRF-TOKEN cookie.
 * Required before POST /login, POST /logout, and other state-changing requests
 * when CSRF middleware is active.
 */
export async function csrf() {
    await fetch(`${API_BASE}/sanctum/csrf-cookie`, {
        method: "GET",
        credentials: "include",
    });
}

/**
 * Normalizes common API response shapes into an array.
 * Supports:
 * - []
 * - { data: [] }
 * - { data: { data: [] } } (Laravel paginator)
 */
export function normalizeList(x) {
    if (Array.isArray(x)) return x;
    if (Array.isArray(x?.data)) return x.data;
    if (Array.isArray(x?.data?.data)) return x.data.data;
    return [];
}

/**
 * Backwards compatible helper (some files import safeArray)
 */
export function safeArray(x) {
    return normalizeList(x);
}

/**
 * Fetch helper with:
 * - base URL support (Render vs local)
 * - cookies included (Sanctum/session)
 * - X-XSRF-TOKEN header (from XSRF-TOKEN cookie)
 * - JSON parsing + useful errors
 */
export async function apiFetch(path, options = {}) {
    const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

    const method = (options.method || "GET").toUpperCase();
    const headers = {
        Accept: "application/json",
        ...(options.headers || {}),
    };

    const isFormData = options.body instanceof FormData;

    // Default JSON content-type if body provided (and not FormData)
    if (!isFormData && options.body !== undefined && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }

    // Add CSRF header if cookie exists
    const xsrf = getCookie("XSRF-TOKEN");
    if (xsrf) headers["X-XSRF-TOKEN"] = xsrf;

    const res = await fetch(url, {
        ...options,
        method,
        headers,
        credentials: "include", // ✅ REQUIRED for Sanctum/session cookies
    });

    if (res.status === 204) return null;

    const text = await res.text();
    let data = null;

    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = text;
    }

    if (!res.ok) {
        const msg =
            (data && (data.message || data.error)) ||
            `Request failed (${res.status})`;
        const err = new Error(msg);
        err.status = res.status;
        err.data = data;
        throw err;
    }

    return data;
}
