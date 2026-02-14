import React, { useState, useEffect } from "react";
import { apiFetch } from "../utils/api";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import AlertBanner from "../Components/AlertBanner";
import "../../css/style.css";

const SeniorDashboard = () => {
    const [stats, setStats] = useState({
        pendingRequests: 0,
        approvedRequests: 0,
        totalRequests: 0,
    });
    const [recentRequests, setRecentRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const requests = await apiFetch("/api/medicine-requests");
                
                setStats({
                    pendingRequests: requests.filter(r => r.status === 'pending').length,
                    approvedRequests: requests.filter(r => r.status === 'approved').length,
                    totalRequests: requests.length,
                });

                // Get 5 most recent requests
                setRecentRequests(requests.slice(0, 5));
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
                toast.error("Failed to load dashboard");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const getStatusBadge = (status) => {
        const styles = {
            pending: "bg-yellow-100 text-yellow-800",
            approved: "bg-green-100 text-green-800",
            declined: "bg-red-100 text-red-800"
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

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
                {/* Alert Banner */}
                <AlertBanner />

                {/* Welcome Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
                    <p className="text-gray-600">Here's an overview of your medicine requests</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Total Requests */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Requests</p>
                                <h3 className="text-3xl font-bold text-gray-900">{stats.totalRequests}</h3>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Pending Requests */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Pending</p>
                                <h3 className="text-3xl font-bold text-yellow-600">{stats.pendingRequests}</h3>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Approved Requests */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Approved</p>
                                <h3 className="text-3xl font-bold text-green-600">{stats.approvedRequests}</h3>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Link
                        to="/browse-medicines"
                        className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white hover:shadow-xl transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold mb-2">Browse Medicines</h3>
                                <p className="text-blue-100 text-sm">View available medicines and their stock levels</p>
                            </div>
                            <svg className="w-10 h-10 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                        </div>
                    </Link>

                    <Link
                        to="/medicine-requests/create"
                        className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-lg p-6 text-white hover:shadow-xl transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold mb-2">Request Medicine</h3>
                                <p className="text-green-100 text-sm">Submit a new medicine request for approval</p>
                            </div>
                            <svg className="w-10 h-10 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                    </Link>
                </div>

                {/* Recent Requests */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Recent Requests</h2>
                        <Link
                            to="/medicine-requests"
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                            View All →
                        </Link>
                    </div>

                    {recentRequests.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No requests yet</p>
                            <Link
                                to="/medicine-requests/create"
                                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Create Your First Request
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentRequests.map((request) => (
                                <div
                                    key={request.id}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900">
                                            {request.medicine?.generic_name || 'Unknown Medicine'}
                                        </h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {request.quantity} units • {new Date(request.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        {getStatusBadge(request.status)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SeniorDashboard;
