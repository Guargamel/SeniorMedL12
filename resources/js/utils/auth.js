import { apiFetch } from "./api";

// Returns user object if logged in, otherwise null
export async function fetchCurrentUser() {
    try {
        const response = await apiFetch("/api/user");
        // Return the user object (handles both {user: {...}} and direct user object)
        return response?.user || response;
    } catch (e) {
        if (e?.status === 401) return null; // expected when logged out
        throw e;
    }
}

export async function login({ email, password }) {
    // Using standard Laravel session login (web route)
    await apiFetch("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });

    // IMPORTANT: confirm session is real
    return await fetchCurrentUser();
}

export async function logout() {
    // Your API route: POST /api/logout
    await apiFetch("/api/logout", { method: "POST" });
}
