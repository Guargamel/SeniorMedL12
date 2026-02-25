// resources/js/utils/api.js

const API_BASE = import.meta.env.VITE_API_BASE_URL || window.location.origin;

function getCookie(name) {
    const match = document.cookie.match(new RegExp("(^|;\\s*)" + name + "=([^;]*)"));
    return match ? decodeURIComponent(match[2]) : null;
}

export async function csrf() {
    // This sets XSRF-TOKEN cookie
    await fetch(`${API_BASE}/sanctum/csrf-cookie`, {
        method: "GET",
        credentials: "include",
    });
}

export function safeArray(x) {
    if (Array.isArray(x)) return x;
    if (Array.isArray(x?.data)) return x.data;
    if (Array.isArray(x?.data?.data)) return x.data.data; // paginator support
    return [];
}

export async function apiFetch(path, options = {}) {
    const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

    const method = (options.method || "GET").toUpperCase();
    const headers = {
        Accept: "application/json",
        ...(options.headers || {}),
    };

    // If we're sending JSON, set content-type
    const isFormData = options.body instanceof FormData;
    if (!isFormData && options.body !== undefined && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }

    // Send CSRF header if present (Laravel reads X-XSRF-TOKEN)
    const xsrf = getCookie("XSRF-TOKEN");
    if (xsrf) headers["X-XSRF-TOKEN"] = xsrf;

    const res = await fetch(url, {
        ...options,
        method,
        headers,
        credentials: "include", // <-- REQUIRED
    });

    // 204 No Content
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
