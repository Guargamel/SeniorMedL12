import React, { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Layout from "./Layout";
import { fetchCurrentUser, logout as apiLogout } from "../utils/auth";

export default function RequireAuthLayout() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        let alive = true;

        (async () => {
            setLoading(true);
            setErrors([]);

            const u = await fetchCurrentUser(); // never throws on 401
            if (!alive) return;

            setUser(u);
            setLoading(false);
        })();

        return () => {
            alive = false;
        };
    }, []);

    const handleLogout = async () => {
        setErrors([]);
        try {
            await apiLogout();
        } catch (e) {
            // Even if backend errors, force UI logout so you can continue
            setErrors([e?.message || "Logout failed"]);
        } finally {
            setUser(null);
            navigate("/login", { replace: true });
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return <Layout user={user} errors={errors} handleLogout={handleLogout} />;
}
