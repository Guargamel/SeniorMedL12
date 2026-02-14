import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import Dashboard from "./Dashboard.jsx";
import SeniorDashboard from "./SeniorDashboard.jsx";

const DashboardRouter = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            try {
                const response = await apiFetch("/api/user");
                const userData = response?.user || response;
                setUser(userData);
            } catch (error) {
                console.error("Failed to load user:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check roles properly
    const roles = user?.roles || [];

    // Check if senior citizen (role_id 3 or role name 'senior-citizen')
    const isSeniorCitizen = roles.some(role =>
        role.id === 4 || role.name === 'senior-citizen'
    );

    // Check if admin or staff (role_id 1 or 2)
    const isAdminOrStaff = roles.some(role =>
        role.id === 1 || role.id === 2 || role.name === 'super-admin' || role.name === 'staff'
    );

    // Debug logs
    console.log('User roles:', roles);
    console.log('isSeniorCitizen:', isSeniorCitizen);
    console.log('isAdminOrStaff:', isAdminOrStaff);

    // Show appropriate dashboard
    if (isAdminOrStaff) {
        return <Dashboard />;
    } else if (isSeniorCitizen) {
        return <SeniorDashboard />;
    } else {
        // No recognized role - show unauthorized
        //  return <Navigate to="/unauthorized" replace />;
    }
};

export default DashboardRouter;
