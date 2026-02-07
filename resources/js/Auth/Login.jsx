import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";").shift();
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            // 1) Get CSRF cookie
            await fetch("/sanctum/csrf-cookie", {
                method: "GET",
                credentials: "include",
                headers: { "Accept": "application/json" },
            });

            // 2) Read XSRF-TOKEN cookie and send it as X-XSRF-TOKEN
            const xsrfToken = getCookie("XSRF-TOKEN");
            const response = await fetch("/login", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-XSRF-TOKEN": xsrfToken ? decodeURIComponent(xsrfToken) : "",
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                navigate("/dashboard");
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
