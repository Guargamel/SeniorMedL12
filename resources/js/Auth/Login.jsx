import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { fetchCurrentUser } from "../utils/auth";

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || "/dashboard";
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    useEffect(() => {
        // If already authenticated (session cookie still valid), skip login page
        fetchCurrentUser().then(() => navigate(from, { replace: true })).catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";").shift();
        return null;
    };

    const API_BASE = import.meta.env.VITE_API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:8000`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            // ✅ Step 5: get CSRF cookie from Laravel server (8000)
            await fetch(`${API_BASE}/sanctum/csrf-cookie`, {
                method: "GET",
                credentials: "include",
                headers: { Accept: "application/json" },
            });

            // ✅ Now login (cookies will be sent + XSRF cookie exists)
            const response = await fetch(`${API_BASE}/login`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                navigate(from, { replace: true });
                return;
            }

            const data = await response.json().catch(() => ({}));
            setError(data.message || "Login failed");
        } catch (err) {
            console.error(err);
            setError("Something went wrong");
        }
    };


    return (
        <div className="login-wrapper">
            <h1>Medicine System</h1>
            <p className="account-subtitle">Login Panel</p>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <input
                        className="form-control"
                        type="text"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <input
                        className="form-control"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <button className="btn btn-success btn-block" type="submit">
                        Login
                    </button>
                </div>
            </form>

            <div className="text-center forgotpass">
                <Link to="/password/request">Forgot Password?</Link>
            </div>

            <div className="text-center dont-have">
                Don’t have an account? <Link to="/register">Register</Link>
            </div>
        </div>
    );
};

export default Login;
