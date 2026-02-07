// resources/js/utils/api.js

function getCsrfToken() {
    const el = document.querySelector('meta[name="csrf-token"]');
    return el ? el.getAttribute("content") : "";
}

export async function apiFetch(url, options = {}) {
    const method = (options.method || "GET").toUpperCase();

    const headers = new Headers(options.headers || {});
    headers.set("Accept", "application/json");

    const isFormData = options.body instanceof FormData;

    if (!isFormData && options.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    if (method !== "GET") {
        const token = getCsrfToken();
        if (token) headers.set("X-CSRF-TOKEN", token);
    }

    const res = await fetch(url, {
        credentials: "include",
        ...options,
        headers,
    });

    const text = await res.text();
    let data = null;

    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        // if Laravel returned HTML by accident
        throw new Error("Backend returned HTML instead of JSON. Check auth/API routes.");
    }

    if (!res.ok) {
        throw new Error(data?.message || `Request failed (${res.status})`);
    }

    return data;
}
