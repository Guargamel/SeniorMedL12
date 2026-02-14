import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form"; // Use Controller for React Select
import { apiFetch } from "../utils/api"; // Assuming apiFetch is your utility for fetching data
import Select from "react-select";
import { toast } from "react-toastify"; // For Toastify notifications
import "../../css/style.css"; // Import your custom styles

const Create = () => {
    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const navigate = useNavigate();
    const { register, control, handleSubmit, formState: { errors } } = useForm();

    // Fetching suppliers and medicines from the API
    useEffect(() => {
        async function fetchSuppliersAndMedicines() {
            try {
                const suppliersData = await apiFetch("/api/suppliers"); // Fetch suppliers
                const medicinesData = await apiFetch("/api/medicines"); // Fetch medicines
                const supplierOptions = suppliersData.map(supplier => ({
                    value: supplier.id,
                    label: supplier.name, // Display the supplier name
                }));
                const medicineOptions = medicinesData.map(medicine => ({
                    value: medicine.id,
                    label: medicine.generic_name, // Display the medicine name
                }));
                setSuppliers(supplierOptions);
                setMedicines(medicineOptions);
            } catch (err) {
                toast.error("Failed to load suppliers or medicines");
            }
        }
        fetchSuppliersAndMedicines();
    }, []);

    const onSubmit = async (data) => {
        setLoading(true);

        // Debug: Check what data is being sent
        console.log("Form data being submitted:", data);

        try {
            // Match the route defined in api.php: /api/medicine-batches/create
            const response = await apiFetch("/api/medicine-batches/create", {
                method: "POST",
                body: JSON.stringify(data),
            });
            toast.success("Medicine batch created successfully!");
            navigate("/medicine-batches/index");
        } catch (err) {
            toast.error("Failed to create medicine batch");
            console.error("Error creating batch:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-lg mx-auto">
            <h2 className="text-2xl font-semibold text-center mb-4">Add Stock Batch</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Medicine */}
                <div className="form-group">
                    <label htmlFor="medicine" className="block text-sm font-medium text-gray-700">Medicine Name</label>
                    <Controller
                        control={control}
                        name="medicine_id" // This will submit the ID
                        rules={{ required: "Medicine is required" }}
                        render={({ field }) => (
                            <Select
                                {...field}
                                options={medicines}
                                value={medicines.find(option => option.value === field.value)} // Set the selected value
                                className="mt-1 w-1/2"
                                classNamePrefix="react-select"
                                getOptionLabel={(e) => e.label} // Display medicine name
                                onChange={(selectedOption) => field.onChange(selectedOption.value)} // Submit the medicine ID
                            />
                        )}
                    />
                    {errors.medicine_id && <span className="text-red-500 text-sm">{errors.medicine_id.message}</span>}
                </div>

                {/* Batch Number */}
                <div className="form-group">
                    <label htmlFor="batch_no" className="block text-sm font-medium text-gray-700">Batch Number</label>
                    <input
                        id="batch_no"
                        type="text"
                        {...register("batch_no", { required: "Batch number is required" })}
                        className="mt-1 p-2 w-1/2 border border-gray-300 rounded-md"
                    />
                    {errors.batch_no && <span className="text-red-500 text-sm">{errors.batch_no.message}</span>}
                </div>

                {/* Quantity */}
                <div className="form-group">
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input
                        id="quantity"
                        type="number"
                        {...register("quantity", { required: "Quantity is required" })}
                        className="mt-1 p-2 w-1/2 border border-gray-300 rounded-md"
                    />
                    {errors.quantity && <span className="text-red-500 text-sm">{errors.quantity.message}</span>}
                </div>

                {/* Expiry Date */}
                <div className="form-group">
                    <label htmlFor="expiry_date" className="block text-sm font-medium text-gray-700">Expiry Date</label>
                    <input
                        id="expiry_date"
                        type="date"
                        {...register("expiry_date", { required: "Expiry date is required" })}
                        className="mt-1 p-2 w-1/2 border border-gray-300 rounded-md"
                    />
                    {errors.expiry_date && <span className="text-red-500 text-sm">{errors.expiry_date.message}</span>}
                </div>

                {/* Supplier */}
                <div className="form-group">
                    <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">Supplier</label>
                    <Controller
                        control={control}
                        name="supplier_id"
                        rules={{ required: "Supplier is required" }}
                        render={({ field }) => (
                            <Select
                                {...field}
                                options={suppliers}
                                value={suppliers.find(option => option.value === field.value)} // Set the selected value
                                className="mt-1 w-1/2"
                                classNamePrefix="react-select"
                                onChange={(selectedOption) => field.onChange(selectedOption.value)} // Submit the supplier ID
                            />
                        )}
                    />
                    {errors.supplier_id && <span className="text-red-500 text-sm">{errors.supplier_id.message}</span>}
                </div>

                {/* Cost */}
                <div className="form-group">
                    <label htmlFor="cost" className="block text-sm font-medium text-gray-700">Cost</label>
                    <input
                        id="cost"
                        type="number"
                        {...register("cost", { required: "Cost is required" })}
                        className="mt-1 p-2 w-1/2 border border-gray-300 rounded-md"
                    />
                    {errors.cost && <span className="text-red-500 text-sm">{errors.cost.message}</span>}
                </div>

                {/* Submit Button */}
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
};

export default Create;
