import React, { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Layout from "./Layout";
import SeniorLayout from "./SeniorLayout";
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

            const res = await fetchCurrentUser();
            if (!alive) return;

            // ✅ normalize shape: some endpoints return {user: {...}}
            const u = res?.user ?? res;

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
            setUser(null);
            navigate("/login", { replace: true });
        } catch (e) {
            console.error("Logout error:", e);
            setErrors([e?.message || "Logout failed"]);
            setUser(null);
            navigate("/login", { replace: true });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    const roles = Array.isArray(user?.roles) ? user.roles : [];

    const isSeniorCitizen = roles.some((role) => role.name === "senior-citizen" || role.id === 4);

    const isAdminOrStaff =
        roles.length > 0
            ? roles.some((role) => role.name === "super-admin" || role.name === "staff" || [1, 2].includes(role.id))
            : [1, 2].includes(Number(user?.role_id));

    if (!isAdminOrStaff && !isSeniorCitizen) {
        return <Navigate to="/unauthorized" replace />;
    }

    const LayoutComponent = isAdminOrStaff ? Layout : SeniorLayout;

    return <LayoutComponent user={user} errors={errors} handleLogout={handleLogout} />;
}
