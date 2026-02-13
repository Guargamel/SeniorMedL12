import apiFetch from "../utils/apiFetch"; // adjust path

export async function fetchMe() {
    return apiFetch("/api/me"); // must send cookies (credentials)
}
