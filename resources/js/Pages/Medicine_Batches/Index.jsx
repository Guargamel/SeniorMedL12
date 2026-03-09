import React, { useState, useEffect } from "react";
import { apiFetch, safeArray } from "../../utils/api";
import { Link } from "react-router-dom";
import { useUser } from "../../Components/UserContext";

const Index = () => {
    const [medicineBatches, setMedicineBatches] = useState([]);
    const [loading, setLoading] = useState(true);

    const ctx = useUser();
    const canDelete = (ctx?.userRoleNames ?? []).some(r => ['super-admin', 'staff'].includes(r));

    async function load() {
        setLoading(true);
        try {
            const data = await apiFetch("/api/medicine-batches");
            setMedicineBatches(safeArray(data));
        } catch (error) {
            console.error("Failed to load medicine batches:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    async function handleDelete(id) {
        if (!confirm("Delete this medicine batch?")) return;
        try {
            await apiFetch(`/api/medicine-batches/${id}`, { method: "DELETE" });
            await load();
        } catch (e) {
            console.error("Delete failed:", e);
            alert("Delete failed: " + (e?.message || "Unknown error"));
        }
    }

    if (loading) {
        return (
            <div className="text-center py-4">
                <span>Loading medicine batches...</span>
            </div>
        );
    }

    if (medicineBatches.length === 0) {
        return (
            <div className="text-center py-4">
                <span>No medicine batches found.</span>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h2 className="text-3xl font-semibold mb-6 text-center text-gray-700">Medicine Batches List</h2>

            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                <table className="min-w-full table-auto border-collapse">
                    <thead className="bg-gradient-to-r from-green-400 to-blue-500">
                        <tr>
                            <th className="py-3 px-6 text-left text-sm font-medium text-black">Batch Number</th>
                            <th className="py-3 px-6 text-left text-sm font-medium text-black">Quantity</th>
                            <th className="py-3 px-6 text-left text-sm font-medium text-black">Expiry Date</th>
                            <th className="py-3 px-6 text-left text-sm font-medium text-black">Cost</th>
                            <th className="py-3 px-6 text-left text-sm font-medium text-black">Supplier</th>
                            <th className="py-3 px-6 text-left text-sm font-medium text-black">Generic Name</th>
                            <th className="py-3 px-6 text-left text-sm font-medium text-black">Brand Name</th>
                            <th className="py-3 px-6 text-left text-sm font-medium text-black">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {medicineBatches.map((batch) => (
                            <tr key={batch.id} className="border-b hover:bg-blue-100 transition-colors">
                                <td className="py-4 px-6 text-sm text-gray-900">{batch.batch_no}</td>
                                <td className="py-4 px-6 text-sm text-gray-900">{batch.quantity}</td>
                                <td className="py-4 px-6 text-sm text-gray-900">
                                    {new Date(batch.expiry_date).toLocaleDateString()}
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-900">{batch.cost}</td>
                                <td className="py-4 px-6 text-sm text-gray-900">
                                    {batch.supplier ? batch.supplier.name : "N/A"}
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-900">
                                    {batch.medicine ? batch.medicine.generic_name : "N/A"}
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-900">
                                    {batch.medicine ? batch.medicine.brand_name : "N/A"}
                                </td>
                                <td className="py-4 px-6 text-sm text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Link
                                            to={`/medicine-batches/${batch.id}/edit`}
                                            className="text-blue-600 hover:underline"
                                        >
                                            Edit
                                        </Link>
                                        {canDelete && (
                                            <button
                                                onClick={() => handleDelete(batch.id)}
                                                className="text-red-600 hover:underline bg-transparent border-0 p-0 cursor-pointer"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Index;
