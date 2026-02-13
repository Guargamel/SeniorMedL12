import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { fetchCurrentUser, login as apiLogin } from "../utils/auth";

/**
 * Public login page.
 * - Stays accessible (NOT protected)
 * - Only navigates to /dashboard after session is confirmed via /api/user
 */
export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || "/dashboard";

    const [checking, setChecking] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    // If already logged in, skip login page
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

    if (checking) return <div className="p-4">Loading...</div>;

    return (
        <div>
            <h1>Senior Medicine Monitoring System</h1>
            <p className="account-subtitle">Login</p>

            {error ? <div className="alert alert-danger">{error}</div> : null}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <input
                        className="form-control"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="username"
                        required
                    />
                </div>

                <div className="form-group">
                    <input
                        className="form-control"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                    />
                </div>

                <div className="form-group mb-0">
                    <button className="btn btn-danger btn-block" type="submit" disabled={submitting}>
                        {submitting ? "Signing in..." : "Login"}
                    </button>
                </div>
            </form>


            <div className="text-center dont-have">
                Request an account from the baranggay station
            </div>

        </div>
    );
}
