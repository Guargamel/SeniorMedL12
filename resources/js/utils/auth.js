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
        "X-Requested-With": "XMLHttpRequest",
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
        const res = await apiFetch("/api/user");
        return res?.user ?? res; // ✅ normalize response
    } catch (e) {
        if (e?.status === 401) return null;
        throw e;
    }
}

export async function login({ email, password }) {
    // MUST set XSRF-TOKEN cookie first
    await csrf();

    // Many Laravel auth setups are happiest with form-urlencoded for /login
    const form = new URLSearchParams();
    form.set("email", email);
    form.set("password", password);

    await apiFetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-Requested-With": "XMLHttpRequest",
        },
        body: form.toString(),
    });

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
