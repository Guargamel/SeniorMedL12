import React, { useState, useEffect } from "react";
import { safeArray, apiFetch } from "../../utils/api";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useUser } from "../../Components/UserContext";

const Index = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [pendingActions, setPendingActions] = useState({});
    const [previewUrl, setPreviewUrl] = useState(null); // Modal preview

    // Use shared UserContext — no extra API fetch needed
    const ctx = useUser();
    const userRoleNames = ctx?.userRoleNames ?? [];

    useEffect(() => {
        async function fetchData() {
            try {
                const requestsData = await apiFetch("/api/medicine-requests");
                setRequests(requestsData?.data ?? requestsData);
            } catch (error) {
                console.error("Failed to load requests:", error);
                toast.error("Failed to load requests");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleStatusUpdate = async (id, status, reviewNotes = "") => {
        setPendingActions(prev => ({ ...prev, [id]: true }));

        try {
            await apiFetch(`/api/medicine-requests/${id}/review`, {
                method: "PUT",
                body: JSON.stringify({ status, notes: reviewNotes })
            });

            toast.success(`Request ${status} successfully!`);

            const updatedRequests = await apiFetch("/api/medicine-requests");
            setRequests(updatedRequests?.data ?? updatedRequests);
        } catch (error) {
            console.error("Failed to update request:", error);
            toast.error("Failed to update request");
        } finally {
            setPendingActions(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this request?")) return;

        try {
            await apiFetch(`/api/medicine-requests/${id}`, {
                method: "DELETE"
            });

            toast.success("Request deleted successfully!");

            const updatedRequests = await apiFetch("/api/medicine-requests");
            setRequests(updatedRequests?.data ?? updatedRequests);
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

    const canReview = userRoleNames.some(r => r === "super-admin" || r === "staff");
    const isSeniorCitizen = userRoleNames.includes("senior-citizen");

    const filteredRequests = safeArray(requests).filter(req => {
        if (filter === "all") return true;
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
                            {isSeniorCitizen
                                ? "Manage your medicine requests"
                                : "Review and manage medicine requests"}
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

                {/* Filters */}
                <div className="flex gap-3 mb-6 flex-wrap">
                    {["all", "pending", "approved", "declined"].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === type
                                ? "bg-blue-600 text-white"
                                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                                }`}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)} (
                            {type === "all"
                                ? requests.length
                                : safeArray(requests).filter(r => r.status === type).length}
                            )
                        </button>
                    ))}
                </div>

                {/* Requests */}
                {filteredRequests.length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <p className="text-gray-500 text-lg">No requests found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredRequests.map(request => (
                            <div
                                key={request.id}
                                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="p-6">

                                    <div className="flex flex-col md:flex-row gap-6 md:justify-between">

                                        {/* LEFT SIDE */}
                                        <div className="flex-1">

                                            <div className="flex items-center gap-3 mb-3">
                                                <h3 className="text-xl font-semibold text-gray-900">
                                                    {request.medicine?.generic_name || "Unknown Medicine"}
                                                </h3>
                                                {getStatusBadge(request.status)}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                {!isSeniorCitizen && (
                                                    <div className="text-sm">
                                                        <span className="text-gray-600">Requested by:</span>
                                                        <span className="ml-2 font-medium text-gray-900">
                                                            {request.user?.name || "Unknown"}
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
                                                        {new Date(request.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {request.reason && (
                                                <div className="mb-4">
                                                    <p className="text-sm text-gray-600">Reason:</p>
                                                    <p className="text-sm text-gray-900 mt-1">
                                                        {request.reason}
                                                    </p>
                                                </div>
                                            )}

                                            {request.notes && (
                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                    <p className="text-sm text-gray-600 font-medium">
                                                        Review Notes:
                                                    </p>
                                                    <p className="text-sm text-gray-900 mt-1">
                                                        {request.notes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* RIGHT SIDE */}
                                        <div className="flex md:flex-col gap-4 items-start md:items-end">

                                            {/* Actions */}
                                            <div className="flex flex-col gap-2">
                                                {canReview && request.status === "pending" && (
                                                    <>
                                                        <button
                                                            disabled={pendingActions[request.id]}
                                                            onClick={() => {
                                                                const notes = prompt("Add review notes (optional):");
                                                                if (notes !== null)
                                                                    handleStatusUpdate(request.id, "approved", notes);
                                                            }}
                                                            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-60"
                                                        >
                                                            {pendingActions[request.id]
                                                                ? "Approving..."
                                                                : "Approve"}
                                                        </button>

                                                        <button
                                                            disabled={pendingActions[request.id]}
                                                            onClick={() => {
                                                                const notes = prompt("Add review notes (optional):");
                                                                if (notes !== null)
                                                                    handleStatusUpdate(request.id, "declined", notes);
                                                            }}
                                                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition disabled:opacity-60"
                                                        >
                                                            {pendingActions[request.id]
                                                                ? "Declining..."
                                                                : "Decline"}
                                                        </button>
                                                    </>
                                                )}

                                                {isSeniorCitizen && request.status === "pending" && (
                                                    <button
                                                        onClick={() => handleDelete(request.id)}
                                                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>

                                            {/* Prescription Thumbnail */}
                                            {request.prescription_url && (
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-600 mb-2">
                                                        Prescription
                                                    </p>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setPreviewUrl(request.prescription_url)
                                                        }
                                                    >
                                                        <img
                                                            src={request.prescription_url}
                                                            alt="Prescription"
                                                            className="w-32 h-32 object-cover rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition"
                                                            loading="lazy"
                                                        />
                                                    </button>

                                                    <a
                                                        href={request.prescription_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="block text-xs text-blue-600 hover:underline mt-2"
                                                    >
                                                        Open in new tab
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal Preview */}
                {previewUrl && (
                    <div
                        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                        onClick={() => setPreviewUrl(null)}
                    >
                        <div
                            className="bg-white rounded-xl max-w-3xl w-full p-4 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setPreviewUrl(null)}
                                className="absolute top-2 right-2 px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
                            >
                                ✕
                            </button>

                            <img
                                src={previewUrl}
                                alt="Prescription Preview"
                                className="!w-full max-h-[75vh] object-contain rounded-lg border border-gray-200"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Index;
