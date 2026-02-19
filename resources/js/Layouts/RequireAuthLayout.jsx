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

            const u = await fetchCurrentUser();
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
            setUser(null);
            navigate("/login", { replace: true });
        } catch (e) {
            console.error("Logout error:", e);
            setErrors([e?.message || "Logout failed"]);
            // Force logout even if API fails
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

    // Ensure roles are loaded before checking
    const isSeniorCitizen = Array.isArray(user?.roles) && user.roles.some(role => role.name === 'senior-citizen');
    const isAdminOrStaff = Array.isArray(user?.roles)
        ? user.roles.some(role => [1, 2].includes(role.id) || ['super-admin', 'staff'].includes(role.name))
        : [1, 2].includes(user?.role_id);

    // If user is neither admin/staff nor senior citizen, redirect to unauthorized
    if (!isAdminOrStaff && !isSeniorCitizen) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Use SeniorLayout for senior citizens, regular Layout for admin/staff
    const LayoutComponent = isAdminOrStaff ? Layout : SeniorLayout;

    return <LayoutComponent user={user} errors={errors} handleLogout={handleLogout} />;
}
