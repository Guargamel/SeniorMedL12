import React, { useState, useEffect } from "react";
import { apiFetch, safeArray } from "../utils/api"; // Assuming apiFetch is your utility for fetching data

const Index = () => {
    const [medicineBatches, setMedicineBatches] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetching medicine batch data from API
    useEffect(() => {
        async function fetchMedicineBatches() {
            try {
                const data = await apiFetch("/api/medicine-batches"); // Assuming the API endpoint
                setMedicineBatches(data);
            } catch (error) {
                console.error("Failed to load medicine batches:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchMedicineBatches();
    }, []);

    // If data is loading, show loading message
    if (loading) {
        return (
            <div className="text-center py-4">
                <span>Loading medicine batches...</span>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h2 className="text-3xl font-semibold mb-6 text-center text-gray-700">Medicine Batches List</h2>

            {/* Table */}
            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                <table className="min-w-full table-auto border-collapse">
                    <thead className="bg-gradient-to-r from-green-400 to-blue-500">
                        <tr>
                            <th className="py-3 px-6 text-left text-sm font-medium text-white">Batch Number</th>
                            <th className="py-3 px-6 text-left text-sm font-medium text-white">Quantity</th>
                            <th className="py-3 px-6 text-left text-sm font-medium text-white">Expiry Date</th>
                            <th className="py-3 px-6 text-left text-sm font-medium text-white">Cost</th>
                            <th className="py-3 px-6 text-left text-sm font-medium text-white">Supplier</th>
                            <th className="py-3 px-6 text-left text-sm font-medium text-white">Medicine Type</th>
                            <th className="py-3 px-6 text-left text-sm font-medium text-white">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Render medicine batches */}
                        {safeArray(medicineBatches).map((batch) => (
                            <tr key={batch.id} className="border-b hover:bg-gray-50 transition-colors">
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
                                    {batch.medicine ? batch.medicine.type : "N/A"}
                                </td>
                                <td className="py-4 px-6 text-sm">
                                    <a
                                        href={`/medicine-batches/${batch.id}/edit`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        Edit
                                    </a>
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
