import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { fetchCurrentUser } from "../utils/auth";

const Register = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || "/dashboard";
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [error, setError] = useState(null);

    useEffect(() => {
        let alive = true;
        (async () => {
            const u = await fetchCurrentUser();
            if (!alive) return;
            // Only redirect away from register if already logged in
            if (u) navigate(from, { replace: true });
        })();
        return () => {
            alive = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (password !== passwordConfirm) {
            setError("Passwords do not match");
            return;
        }

        try {
            const API_BASE = import.meta.env.VITE_API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:8000`;

            await fetch(`${API_BASE}/sanctum/csrf-cookie`, { credentials: "include" });

            const response = await fetch(`${API_BASE}/register`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                body: JSON.stringify({ name, email, password, password_confirmation: passwordConfirm }),
            });


            const data = await response.json();

            if (response.ok) {
                navigate("/login");
            } else {
                setError(data.message || "Registration failed");
            }
        } catch (err) {
            setError("Something went wrong");
            console.error(err);
        }
    };

    return (
        <div className="login-wrapper">
            <h1>Medicine Monitoring System</h1>
            <p className="account-subtitle">Register as Admin</p>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <input
                        className="form-control"
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

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
                    <input
                        className="form-control"
                        type="password"
                        placeholder="Confirm Password"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                    />
                </div>

                <div className="form-group mb-0">
                    <button className="btn btn-danger btn-block" type="submit">
                        Register (Admin)
                    </button>
                </div>
            </form>

            <div className="text-center dont-have">
                Already have an account? <Link to="/login">Login</Link>
            </div>
        </div>
    );
};

export default Register;
