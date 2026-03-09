import React, { useState, useEffect } from "react";
import { apiFetch } from "../utils/api"; // Assuming apiFetch is set up

const SeniorDashboard = () => {
    const [stats, setStats] = useState({
        pendingRequests: 0,
        approvedRequests: 0,
        totalRequests: 0,
    });
    const [recentRequests, setRecentRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch data
    useEffect(() => {
        async function fetchData() {
            try {
                const requests = await apiFetch("/api/medicine-requests");

                // Log data for debugging
                console.log(requests); // Check the structure of the data

                // Check if 'requests' is an array
                if (Array.isArray(requests)) {
                    setStats({
                        pendingRequests: requests.filter(r => r.status === 'pending').length,
                        approvedRequests: requests.filter(r => r.status === 'approved').length,
                        totalRequests: requests.length,
                    });

                    // Get 5 most recent requests
                    setRecentRequests(requests.slice(0, 5));
                } else {
                    console.error('API response is not an array:', requests);
                }
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
                toast.error("Failed to load dashboard");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Your existing JSX content */}
            </div>
        </div>
    );
};

export default SeniorDashboard;
