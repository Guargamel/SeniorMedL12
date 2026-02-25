import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller, set } from "react-hook-form";
import { apiFetch } from "../../utils/api";
import Select from "react-select";
import { toast } from "react-toastify";
import "../../../css/style.css";

export default function Create() {
    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const navigate = useNavigate();
    const [receiptFile, setReceiptFile] = useState(null);
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            medicine_id: null,
            batch_no: "",
            quantity: "",
            expiry_date: "",
            supplier_id: null,
            cost: "",
        },
    });

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                const [suppliersData, medicinesData] = await Promise.all([
                    apiFetch("/api/suppliers"),
                    apiFetch("/api/medicines"),
                ]);

                if (!alive) return;

                setSuppliers(
                    (Array.isArray(suppliersData) ? suppliersData : []).map((s) => ({
                        value: s.id,
                        label: s.name,
                    }))
                );

                setMedicines(
                    (Array.isArray(medicinesData) ? medicinesData : []).map((m) => ({
                        value: m.id,
                        label: m.generic_name,
                    }))
                );
            } catch (err) {
                console.error(err);
                toast.error("Failed to load suppliers or medicines");
            }
        })();

        return () => {
            alive = false;
        };
    }, []);

    async function onSubmit(values) {
        setLoading(true);
        try {
            const fd = new FormData();
            fd.append("medicine_id", values.medicine_id);
            fd.append("batch_no", values.batch_no);
            fd.append("quantity", values.quantity);
            fd.append("expiry_date", values.expiry_date); // yyyy-mm-dd from <input type="date">
            fd.append("supplier_id", values.supplier_id);
            fd.append("cost", values.cost);

            await apiFetch("/api/medicine-batches/create", {
                method: "POST",
                body: fd,
            });

            toast.success("Stock batch created!");
            navigate("/medicine-batches/index"); // change if your route differs
        } catch (err) {
            console.error(err);
            toast.error(err?.message || "Failed to create stock batch");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-6 max-w-lg mx-auto">
            <h2 className="text-2xl font-semibold text-center mb-4">Add Stock Batch</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Medicine */}
                <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700">Medicine Name</label>
                    <Controller
                        control={control}
                        name="medicine_id"
                        rules={{ required: "Medicine is required" }}
                        render={({ field }) => (
                            <Select
                                options={medicines}
                                value={medicines.find((o) => o.value === field.value) || null}
                                onChange={(opt) => field.onChange(opt ? opt.value : null)}
                                className="mt-1 w-1/2"
                                classNamePrefix="react-select"
                                placeholder="Select Medicine"
                            />
                        )}
                    />
                    {errors.medicine_id && <span className="text-red-500 text-sm">{errors.medicine_id.message}</span>}
                </div>

                {/* Batch Number */}
                <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700">Batch Number</label>
                    <input
                        type="text"
                        {...register("batch_no", { required: "Batch number is required" })}
                        className="mt-1 p-2 w-1/2 border border-gray-300 rounded-md"
                    />
                    {errors.batch_no && <span className="text-red-500 text-sm">{errors.batch_no.message}</span>}
                </div>

                {/* Quantity */}
                <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input
                        type="number"
                        {...register("quantity", { required: "Quantity is required" })}
                        className="mt-1 p-2 w-1/2 border border-gray-300 rounded-md"
                    />
                    {errors.quantity && <span className="text-red-500 text-sm">{errors.quantity.message}</span>}
                </div>

                {/* Expiry Date */}
                <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                    <input
                        type="date"
                        {...register("expiry_date", { required: "Expiry date is required" })}
                        className="mt-1 p-2 w-1/2 border border-gray-300 rounded-md"
                    />
                    {errors.expiry_date && <span className="text-red-500 text-sm">{errors.expiry_date.message}</span>}
                </div>

                {/* Supplier */}
                <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700">Supplier</label>
                    <Controller
                        control={control}
                        name="supplier_id"
                        rules={{ required: "Supplier is required" }}
                        render={({ field }) => (
                            <Select
                                options={suppliers}
                                value={suppliers.find((o) => o.value === field.value) || null}
                                onChange={(opt) => field.onChange(opt ? opt.value : null)}
                                className="mt-1 w-1/2"
                                classNamePrefix="react-select"
                                placeholder="Select Supplier"
                            />
                        )}
                    />
                    {errors.supplier_id && <span className="text-red-500 text-sm">{errors.supplier_id.message}</span>}
                </div>

                {/* Cost */}
                <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700">Cost</label>
                    <input
                        type="number"
                        step="0.01"
                        {...register("cost", { required: "Cost is required" })}
                        className="mt-1 p-2 w-1/2 border border-gray-300 rounded-md"
                    />
                    {errors.cost && <span className="text-red-500 text-sm">{errors.cost.message}</span>}
                </div>

                {/* Rceipt File */}
                <div>
                    <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
                        Receipt Image
                    </div>

                    <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                    />

                    {receiptFile && (
                        <div style={{ fontSize: 12, marginTop: 6 }}>
                            Selected: <b>{receiptFile.name}</b>
                        </div>
                    )}
                </div>

                <div className="mt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full p-3 bg-blue-500 text-black font-semibold rounded-md hover:bg-blue-600 disabled:opacity-50"
                    >
                        {loading ? "Creating..." : "Create Stock"}
                    </button>
                </div>
            </form>
        </div>
    );
}
