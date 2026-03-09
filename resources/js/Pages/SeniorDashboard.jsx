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
                const res = await apiFetch("/api/medicine-requests");
                const requests = res.data || [];

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

                <h1 className="text-2xl font-bold mb-6">Senior Dashboard</h1>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded shadow">
                        <p className="text-gray-500 text-sm">Pending Requests</p>
                        <p className="text-2xl font-bold">{stats.pendingRequests}</p>
                    </div>

                    <div className="bg-white p-4 rounded shadow">
                        <p className="text-gray-500 text-sm">Approved Requests</p>
                        <p className="text-2xl font-bold">{stats.approvedRequests}</p>
                    </div>

                    <div className="bg-white p-4 rounded shadow">
                        <p className="text-gray-500 text-sm">Total Requests</p>
                        <p className="text-2xl font-bold">{stats.totalRequests}</p>
                    </div>
                </div>

                <div className="bg-white rounded shadow">
                    <h2 className="text-lg font-semibold p-4 border-b">Recent Requests</h2>

                    {recentRequests.length === 0 ? (
                        <p className="p-4 text-gray-500">No requests yet</p>
                    ) : (
                        recentRequests.map(req => (
                            <div key={req.id} className="p-4 border-b">
                                <p className="font-medium">{req.medicine_name}</p>
                                <p className="text-sm text-gray-500">{req.status}</p>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
};

export default SeniorDashboard;
