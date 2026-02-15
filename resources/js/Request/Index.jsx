import React, { useState, useEffect } from "react";
import { safeArray, apiFetch } from "../utils/api";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "../../css/style.css";

const Index = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [filter, setFilter] = useState('all'); // all, pending, approved, declined
    const [pendingActions, setPendingActions] = useState({}); // Track pending actions for each request

    useEffect(() => {
        async function fetchData() {
            try {
                const [requestsData, userData] = await Promise.all([
                    apiFetch("/api/medicine-requests"),
                    apiFetch("/api/user")
                ]);
                setRequests(requestsData);
                setUser(userData.user);
            } catch (error) {
                console.error("Failed to load requests:", error);
                toast.error("Failed to load requests");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleStatusUpdate = async (id, status, reviewNotes = '') => {
        setPendingActions((prev) => ({ ...prev, [id]: true })); // Start the loading state for this request
        try {
            await apiFetch(`/api/medicine-requests/${id}/review`, {
                method: "PUT",
                body: JSON.stringify({ status, review_notes: reviewNotes })
            });
            toast.success(`Request ${status} successfully!`);

            // Refresh requests
            const updatedRequests = await apiFetch("/api/medicine-requests");
            setRequests(updatedRequests);
        } catch (error) {
            console.error("Failed to update request:", error);
            toast.error("Failed to update request");
        } finally {
            setPendingActions((prev) => ({ ...prev, [id]: false })); // End the loading state for this request
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this request?")) return;

        try {
            await apiFetch(`/api/medicine-requests/${id}`, {
                method: "DELETE"
            });
            toast.success("Request deleted successfully!");

            // Refresh requests
            const updatedRequests = await apiFetch("/api/medicine-requests");
            setRequests(updatedRequests);
        } catch (error) {
            console.error("Failed to delete request:", error);
            toast.error("Failed to delete request");
        }
    };

    const getStatusBadge = (status) => {
        const statusStyles = {
            pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
            approved: "bg-green-100 text-green-800 border-green-300",
            declined: "bg-red-100 text-red-800 border-red-300"
        };

        return (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${statusStyles[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const canReview = user?.roles?.some(role =>
        role.name === 'super-admin' || role.name === 'staff'
    );

    const isSeniorCitizen = user?.roles?.some(role => role.name === 'senior-citizen');

    const filteredRequests = safeArray(requests).filter(req => {
        if (filter === 'all') return true;
        return req.status === filter;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Medicine Requests</h1>
                        <p className="text-gray-600 mt-1">
                            {isSeniorCitizen ? "Manage your medicine requests" : "Review and manage medicine requests"}
                        </p>
                    </div>
                    {isSeniorCitizen && (
                        <Link
                            to="/medicine-requests/create"
                            className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            + New Request
                        </Link>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-3 mb-6">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'all'
                            ? 'bg-blue-600 text-black'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }`}
                    >
                        All ({requests.length})
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'pending'
                            ? 'bg-yellow-500 text-black'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }`}
                    >
                        Pending ({safeArray(requests).filter(r => r.status === 'pending').length})
                    </button>
                    <button
                        onClick={() => setFilter('approved')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'approved'
                            ? 'bg-green-500 text-black'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }`}
                    >
                        Approved ({safeArray(requests).filter(r => r.status === 'approved').length})
                    </button>
                    <button
                        onClick={() => setFilter('declined')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'declined'
                            ? 'bg-red-500 text-black'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }`}
                    >
                        Declined ({safeArray(requests).filter(r => r.status === 'declined').length})
                    </button>
                </div>

                {/* Requests List */}
                {filteredRequests.length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <p className="text-gray-500 text-lg">No requests found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredRequests.map((request) => (
                            <div
                                key={request.id}
                                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <h3 className="text-xl font-semibold text-gray-900">
                                                    {request.medicine?.generic_name || 'Unknown Medicine'}
                                                </h3>
                                                {getStatusBadge(request.status)}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                {!isSeniorCitizen && (
                                                    <div className="text-sm">
                                                        <span className="text-gray-600">Requested by:</span>
                                                        <span className="ml-2 font-medium text-gray-900">
                                                            {request.user?.name || 'Unknown'}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="text-sm">
                                                    <span className="text-gray-600">Quantity:</span>
                                                    <span className="ml-2 font-medium text-gray-900">
                                                        {request.quantity} units
                                                    </span>
                                                </div>
                                                <div className="text-sm">
                                                    <span className="text-gray-600">Requested on:</span>
                                                    <span className="ml-2 font-medium text-gray-900">
                                                        {new Date(request.created_at).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                                {request.reviewed_at && (
                                                    <div className="text-sm">
                                                        <span className="text-gray-600">Reviewed on:</span>
                                                        <span className="ml-2 font-medium text-gray-900">
                                                            {new Date(request.reviewed_at).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {request.reason && (
                                                <div className="mb-4">
                                                    <p className="text-sm text-gray-600">Reason:</p>
                                                    <p className="text-sm text-gray-900 mt-1">{request.reason}</p>
                                                </div>
                                            )}

                                            {request.review_notes && (
                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                    <p className="text-sm text-gray-600 font-medium">Review Notes:</p>
                                                    <p className="text-sm text-gray-900 mt-1">{request.review_notes}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="ml-6 flex flex-col gap-2">
                                            {canReview && request.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            const notes = prompt("Add review notes (optional):");
                                                            if (notes !== null) {
                                                                handleStatusUpdate(request.id, 'approved', notes);
                                                            }
                                                        }}
                                                        className="px-4 py-2 bg-green-600 text-black text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const notes = prompt("Add review notes (optional):");
                                                            if (notes !== null) {
                                                                handleStatusUpdate(request.id, 'declined', notes);
                                                            }
                                                        }}
                                                        className="px-4 py-2 bg-red-600 text-black text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                                                    >
                                                        Decline
                                                    </button>
                                                </>
                                            )}
                                            {isSeniorCitizen && request.status === 'pending' && (
                                                <button
                                                    onClick={() => handleDelete(request.id)}
                                                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Index;
