import React, { useState, useEffect } from "react";
import { apiFetch } from "../utils/api";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../../css/style.css";

const BrowseMedicines = () => {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchMedicines() {
            try {
                const data = await apiFetch("/api/medicines");
                setMedicines(data);
            } catch (error) {
                console.error("Failed to load medicines:", error);
                toast.error("Failed to load medicines");
            } finally {
                setLoading(false);
            }
        }
        fetchMedicines();
    }, []);

    const filteredMedicines = medicines.filter(medicine => 
        medicine.generic_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (medicine.brand_name && medicine.brand_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleRequestMedicine = (medicineId) => {
        // Navigate to create request page with pre-selected medicine
        navigate(`/medicine-requests/create?medicine_id=${medicineId}`);
    };

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
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Medicines</h1>
                    <p className="text-gray-600">Browse available medicines and request what you need</p>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search medicines by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <svg
                            className="absolute left-4 top-3.5 w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-6 flex gap-3">
                    <Link
                        to="/medicine-requests/create"
                        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        + Request Medicine
                    </Link>
                    <Link
                        to="/medicine-requests"
                        className="px-4 py-2 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                        My Requests
                    </Link>
                </div>

                {/* Medicines Grid */}
                {filteredMedicines.length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <p className="text-gray-500 text-lg">
                            {searchTerm ? "No medicines found matching your search" : "No medicines available"}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMedicines.map((medicine) => (
                            <div
                                key={medicine.id}
                                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6"
                            >
                                {/* Medicine Icon */}
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                    <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                </div>

                                {/* Medicine Info */}
                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                    {medicine.generic_name}
                                </h3>
                                {medicine.brand_name && (
                                    <p className="text-sm text-gray-600 mb-3">
                                        Brand: {medicine.brand_name}
                                    </p>
                                )}

                                {/* Additional Info */}
                                <div className="space-y-2 mb-4">
                                    {medicine.dosage && (
                                        <div className="flex items-center text-sm">
                                            <span className="text-gray-600">Dosage:</span>
                                            <span className="ml-2 text-gray-900 font-medium">{medicine.dosage}</span>
                                        </div>
                                    )}
                                    {medicine.category && (
                                        <div className="flex items-center text-sm">
                                            <span className="text-gray-600">Category:</span>
                                            <span className="ml-2 text-gray-900 font-medium">{medicine.category.name}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center text-sm">
                                        <span className="text-gray-600">Stock:</span>
                                        <span className={`ml-2 font-medium ${
                                            medicine.total_quantity > 50 ? 'text-green-600' : 
                                            medicine.total_quantity > 0 ? 'text-yellow-600' : 
                                            'text-red-600'
                                        }`}>
                                            {medicine.total_quantity > 0 ? `${medicine.total_quantity} units` : 'Out of stock'}
                                        </span>
                                    </div>
                                </div>

                                {/* Description */}
                                {medicine.description && (
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                        {medicine.description}
                                    </p>
                                )}

                                {/* Request Button */}
                                <button
                                    onClick={() => handleRequestMedicine(medicine.id)}
                                    disabled={medicine.total_quantity === 0}
                                    className={`w-full py-2.5 px-4 rounded-lg font-medium transition-colors ${
                                        medicine.total_quantity > 0
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    {medicine.total_quantity > 0 ? 'Request This Medicine' : 'Out of Stock'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrowseMedicines;
