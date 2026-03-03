import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchCurrentUser, login as apiLogin } from "../utils/auth";

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || "/dashboard";

    const [checking, setChecking] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const u = await fetchCurrentUser();
                if (!alive) return;
                if (u) {
                    navigate("/dashboard", { replace: true });
                    return;
                }
            } finally {
                if (alive) setChecking(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            const u = await apiLogin({ email, password });
            if (!u) {
                setError("Login failed: still unauthorized after login.");
                return;
            }
            navigate(from, { replace: true });
        } catch (err) {
            setError(err?.message || "Login failed");
        } finally {
            setSubmitting(false);
        }
    };

    if (checking) {
        return (
            <div className="min-h-screen grid place-items-center bg-slate-50">
                <div className="flex items-center gap-3 text-slate-600">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                    <span className="text-sm">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 overflow-hidden">
                <div className="px-6 py-6 border-b border-slate-200">
                    <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                        Senior Medicine Monitoring System
                    </h1>
                    <p className="mt-1 text-sm text-slate-600">Login</p>
                </div>

                <div className="px-6 py-6">
                    {error ? (
                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                            {error}
                        </div>
                    ) : null}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Email</label>
                            <input
                                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="username"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Password</label>
                            <input
                                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        <button
                            className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-white font-semibold shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60"
                            type="submit"
                            disabled={submitting}
                        >
                            {submitting ? "Signing in..." : "Login"}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-600">
                        Request an account from the{" "}
                        <span className="font-semibold text-slate-800">barangay station</span>
                    </div>
                </div>
            </div>

            <p className="mt-6 text-center text-xs text-slate-500">
                © {new Date().getFullYear()} Senior Medicine Monitoring System
            </p>
        </div>
    );
}
