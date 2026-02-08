const API_BASE =
    import.meta.env.VITE_API_BASE_URL ||
    `${window.location.protocol}//${window.location.hostname}:8000`;

function getXsrfToken() {
    const row = document.cookie
        .split("; ")
        .find((r) => r.startsWith("XSRF-TOKEN="));
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

export async function apiFetch(path, options = {}) {
    const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
    const method = (options.method || "GET").toUpperCase();

    const headers = {
        Accept: "application/json",
        ...(options.headers || {}),
    };

    const isFormData = options.body instanceof FormData;
    if (options.body && !isFormData && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }

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

    const ct = res.headers.get("content-type") || "";
    const data = ct.includes("application/json")
        ? await res.json().catch(() => null)
        : await res.text().catch(() => "");

    if (!res.ok) {
        const msg =
            (data && data.message) ||
            (typeof data === "string" ? data.slice(0, 200) : "") ||
            `Request failed (${res.status})`;
        const err = new Error(msg);
        err.status = res.status;
        err.data = data;
        throw err;
    }

    return data;
}

export function getMe() {
    return apiFetch("/api/me");
}

export function logout() {
    return apiFetch("/api/logout", { method: "POST" });
}
