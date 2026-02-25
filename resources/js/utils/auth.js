// resources/js/utils/auth.js

const API_BASE = import.meta.env.VITE_API_BASE_URL || window.location.origin;

function getCookie(name) {
    const match = document.cookie.match(new RegExp("(^|;\\s*)" + name + "=([^;]*)"));
    return match ? decodeURIComponent(match[2]) : null;
}

export async function csrf() {
    // This sets the XSRF-TOKEN cookie (and laravel_session if applicable)
    await fetch(`${API_BASE}/sanctum/csrf-cookie`, {
        method: "GET",
        credentials: "include",
    });
}

export async function apiFetch(path, options = {}) {
    const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

    const method = (options.method || "GET").toUpperCase();
    const headers = {
        Accept: "application/json",
        ...(options.headers || {}),
    };

    const isFormData = options.body instanceof FormData;

    // If body exists and it's not FormData, default to JSON
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

export async function fetchCurrentUser() {
    try {
        // Your backend might expose /api/user or /api/me.
        // Keep /api/user since your console shows that endpoint.
        return await apiFetch("/api/user");
    } catch (e) {
        // 401 = not logged in
        if (e?.status === 401) return null;
        throw e;
    }
}

export async function login({ email, password }) {
    // ✅ MUST get CSRF cookie first or Laravel will return 419
    await csrf();

    // Laravel's default login route expects form-encoded OR JSON depending on setup.
    // We'll send JSON; if your backend expects form-data, tell me and I'll switch it.
    await apiFetch("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });

    // ✅ Confirm session by loading current user
    return await fetchCurrentUser();
}

export async function logout() {
    try {
        await csrf();
    } catch {
        // ignore if csrf fails; still try logout
    }

    // If you have POST /logout (Laravel default)
    await apiFetch("/logout", { method: "POST" });

    return true;
}
