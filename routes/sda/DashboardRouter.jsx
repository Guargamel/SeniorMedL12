import React, { useState, useEffect } from "react";
import { apiFetch } from "../utils/api";
import Dashboard from "./Dashboard.jsx";
import SeniorDashboard from "./SeniorDashboard.jsx";

const DashboardRouter = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            try {
                const userData = await apiFetch("/api/user");
                setUser(userData.user);
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

    // Check if user is a senior citizen
    const isSeniorCitizen = user?.roles?.some(role => role.name === 'senior-citizen');

    // Show appropriate dashboard
    return isSeniorCitizen ? <SeniorDashboard /> : <Dashboard />;
};

export default DashboardRouter;
