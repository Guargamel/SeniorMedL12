export async function apiFetch(url, options = {}) {
    const opts = {
        headers: {
            Accept: "application/json",
            ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
            ...(options.headers || {}),
        },
        credentials: "include", // IMPORTANT for Sanctum session auth
        ...options,
    };

    const res = await fetch(url, opts);

    // If Laravel returns HTML, you hit a web route not api route
    const text = await res.text();
    if (text.startsWith("<!doctype") || text.startsWith("<html")) {
        throw new Error("Backend returned HTML instead of JSON. Check your API routes / auth.");
    }

    let data;
    try { data = JSON.parse(text); } catch { data = text; }

    if (!res.ok) {
        const msg = data?.message || `Request failed (${res.status})`;
        throw new Error(msg);
    }

    return data;
}
