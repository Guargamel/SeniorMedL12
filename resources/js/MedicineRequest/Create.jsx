import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { apiFetch } from "../utils/api";
import Select from "react-select";
import { toast } from "react-toastify";
import "../../css/style.css";

const Create = () => {
    const [loading, setLoading] = useState(false);
    const [medicines, setMedicines] = useState([]);
    const [receiptFile, setReceiptFile] = useState(null);

    const navigate = useNavigate();

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm({
        defaultValues: {
            medicine_id: null,
            quantity: 1,
            reason: "",
        },
    });

    useEffect(() => {
        let alive = true;

        async function fetchMedicines() {
            try {
                const medicinesData = await apiFetch("/api/medicines");

                const arr = Array.isArray(medicinesData)
                    ? medicinesData
                    : Array.isArray(medicinesData?.data)
                        ? medicinesData.data
                        : [];

                const medicineOptions = arr.map((medicine) => ({
                    value: medicine.id,
                    label: `${medicine.generic_name} (${medicine.brand_name || "Generic"})`,
                }));

                if (!alive) return;
                setMedicines(medicineOptions);

                // Check if medicine_id is in URL query params
                const urlParams = new URLSearchParams(window.location.search);
                const medicineId = urlParams.get("medicine_id");
                if (medicineId) {
                    setValue("medicine_id", parseInt(medicineId, 10));
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to load medicines");
            }
        }

        fetchMedicines();
        return () => {
            alive = false;
        };
    }, [setValue]);

    const selectedReceiptName = useMemo(() => {
        if (!receiptFile) return "";
        return receiptFile.name;
    }, [receiptFile]);

    const onSubmit = async (data) => {
        setLoading(true);

        try {
            // ✅ Use FormData to support file upload
            const fd = new FormData();
            fd.append("medicine_id", data.medicine_id ?? "");
            fd.append("quantity", data.quantity ?? "");
            fd.append("reason", data.reason ?? "");

            // ✅ File key name must match backend validation: receipt_image
            if (receiptFile) fd.append("prescription_path", receiptFile);

            const response = await apiFetch("/api/medicine-requests", {
                method: "POST",
                body: fd,
            });

            console.log("Request created successfully:", response);
            toast.success("Medicine request submitted successfully!");
            navigate("/medicine-requests");
        } catch (err) {
            console.error("Medicine request error:", err);

            let errorMessage = "Failed to create request";

            if (err?.data?.errors) {
                const flat = Object.values(err.data.errors).flat();
                errorMessage = flat.join(", ");
            } else if (err?.data?.error) {
                errorMessage = err.data.error;
            } else if (err?.data?.message) {
                errorMessage = err.data.message;
            } else if (err?.message) {
                errorMessage = err.message;
            }

            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Request Medicine</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Fill out the form and (optional) upload a receipt photo.
                            </p>
                        </div>
                    </div>

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
                                        options={medicines}
                                        value={medicines.find((option) => option.value === field.value) || null}
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        placeholder="Select a medicine..."
                                        onChange={(selectedOption) => field.onChange(selectedOption?.value ?? null)}
                                        isClearable
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
                                    min: { value: 1, message: "Quantity must be at least 1" },
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

                        {/* Receipt Upload (Pretty) */}
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="text-sm font-semibold text-gray-800">Receipt Photo (Optional)</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Upload a clear image (JPG/PNG/WebP). Max size depends on server validation.
                                    </div>
                                </div>

                                {receiptFile ? (
                                    <button
                                        type="button"
                                        onClick={() => setReceiptFile(null)}
                                        className="text-xs px-3 py-1.5 rounded-md bg-white border border-gray-300 hover:bg-gray-100"
                                    >
                                        Remove
                                    </button>
                                ) : null}
                            </div>

                            <label className="mt-3 block">
                                <div className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 bg-white px-4 py-5 hover:border-blue-400 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                                            ⬆
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-gray-800">
                                                {receiptFile ? "Change receipt photo" : "Click to upload receipt photo"}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                {receiptFile ? `Selected: ${selectedReceiptName}` : "PNG, JPG, JPEG, WEBP"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                                />
                            </label>

                            {/* If you want backend validation error later, it will likely be receipt_image */}
                            {/* Example: {errors.receipt_image && <div className="text-red-500 text-sm">{errors.receipt_image.message}</div>} */}
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

                        {/* Tiny helper */}
                        <div className="text-xs text-gray-500">
                            Receipt upload is mandatory. If included, it will be stored on the server and the path saved in the database.
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Create;
