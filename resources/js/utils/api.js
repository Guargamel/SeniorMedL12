const API_BASE =
    import.meta.env.VITE_API_BASE_URL ||
    `${window.location.protocol}//${window.location.hostname}:8000`;

function getXsrfToken() {
    const row = document.cookie.split("; ").find((r) => r.startsWith("XSRF-TOKEN="));
    if (!row) return "";
    return decodeURIComponent(row.split("=")[1] || "");
}

export async function ensureCsrfCookie() {
    await fetch(`${API_BASE}/sanctum/csrf-cookie`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
    });
}

export function safeArray(v) {
    return Array.isArray(v) ? v : [];
}

export function normalizeList(payload, keys = []) {
    // supports:
    //  - [...]
    //  - { data: [...] }
    //  - { data: { data: [...] } } (Laravel paginator)
    //  - { roles: [...] }, { roles: { data: [...] } }, etc.
    if (Array.isArray(payload)) return payload;

    if (payload && typeof payload === "object") {
        // paginator: { data: { data: [...] } }
        if (payload.data && typeof payload.data === "object" && Array.isArray(payload.data.data)) {
            return payload.data.data;
        }
        // { data: [...] }
        if (Array.isArray(payload.data)) return payload.data;

        for (const k of keys) {
            if (Array.isArray(payload[k])) return payload[k];
            if (payload[k] && typeof payload[k] === "object" && Array.isArray(payload[k].data)) return payload[k].data;
        }
    }
    return [];
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
    if (options.body && !isFormData && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }

    // CSRF for state-changing requests
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
        await ensureCsrfCookie();
        const xsrf = getXsrfToken();
        if (xsrf) headers["X-XSRF-TOKEN"] = xsrf;
    }

    const res = await fetch(url, {
        ...options,
        method,
        headers,
        credentials: "include",
    });

    if (res.status === 204) return null;

    const contentType = res.headers.get("content-type") || "";

    let data;
    try {
        if (contentType.includes("application/json")) {
            data = await res.json();
        } else {
            const text = await res.text();
            data = { message: text?.slice(0, 300) || "Non-JSON response" };
        }
    } catch {
        data = { message: "Failed to parse server response" };
    }

    if (!res.ok) {
        const msg =
            (data && typeof data === "object" && typeof data.message === "string" && data.message) ||
            `Request failed (${res.status})`;

        const err = new Error(msg);
        err.status = res.status;
        err.data = data;
        throw err;
    }

    return data;
}
