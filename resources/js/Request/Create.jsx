import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { apiFetch } from "../utils/api";
import Select from "react-select";
import { toast } from "react-toastify";
import "../../css/style.css";

const Create = () => {
    const [loading, setLoading] = useState(false);
    const [medicines, setMedicines] = useState([]);
    const navigate = useNavigate();
    const { register, control, handleSubmit, formState: { errors }, setValue } = useForm();

    useEffect(() => {
        async function fetchMedicines() {
            try {
                const medicinesData = await apiFetch("/api/medicines");
                const medicineOptions = medicinesData.map(medicine => ({
                    value: medicine.id,
                    label: `${medicine.generic_name} (${medicine.brand_name || 'Generic'})`,
                }));
                setMedicines(medicineOptions);

                // Check if medicine_id is in URL query params
                const urlParams = new URLSearchParams(window.location.search);
                const medicineId = urlParams.get('medicine_id');
                if (medicineId) {
                    setValue('medicine_id', parseInt(medicineId));
                }
            } catch (err) {
                toast.error("Failed to load medicines");
            }
        }
        fetchMedicines();
    }, [setValue]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await apiFetch("/api/medicine-requests", {
                method: "POST",
                body: JSON.stringify(data),
            });
            toast.success("Medicine request submitted successfully!");
            navigate("/medicine-requests");
        } catch (err) {
            toast.error(err.message || "Failed to create request");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Request Medicine</h2>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Medicine Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Medicine <span className="text-red-500">*</span>
                            </label>
                            <Controller
                                control={control}
                                name="medicine_id"
                                rules={{ required: "Medicine is required" }}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        options={medicines}
                                        value={medicines.find(option => option.value === field.value)}
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        placeholder="Select a medicine..."
                                        onChange={(selectedOption) => field.onChange(selectedOption?.value)}
                                    />
                                )}
                            />
                            {errors.medicine_id && (
                                <span className="text-red-500 text-sm mt-1">{errors.medicine_id.message}</span>
                            )}
                        </div>

                        {/* Quantity */}
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                                Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="quantity"
                                type="number"
                                min="1"
                                {...register("quantity", {
                                    required: "Quantity is required",
                                    min: { value: 1, message: "Quantity must be at least 1" }
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter quantity needed"
                            />
                            {errors.quantity && (
                                <span className="text-red-500 text-sm mt-1">{errors.quantity.message}</span>
                            )}
                        </div>

                        {/* Reason */}
                        <div>
                            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                                Reason (Optional)
                            </label>
                            <textarea
                                id="reason"
                                rows="4"
                                {...register("reason")}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Briefly explain why you need this medicine..."
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-3 bg-blue-600 text-black font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? "Submitting..." : "Submit Request"}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate("/medicine-requests")}
                                className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>

                    {/* Info Box */}
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <h4 className="text-sm font-semibold text-blue-900 mb-1">Request Information</h4>
                                <p className="text-sm text-blue-800">
                                    Your request will be reviewed by staff. You'll be notified once your request is approved or declined.
                                    You can check the status of your requests anytime.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Create;
