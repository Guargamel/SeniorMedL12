import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../utils/api";
import Select from "react-select";
import { toast } from "react-toastify";

function toDateInputValue(v) {
    // Accepts: "2026-02-19", "2026-02-19T00:00:00.000000Z", Date, null
    if (!v) return "";

    // If already yyyy-mm-dd
    if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;

    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
}

export default function Edit() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [batchNo, setBatchNo] = useState("");
    const [quantity, setQuantity] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [supplier, setSupplier] = useState(null);
    const [cost, setCost] = useState("");
    const [selectedMedicine, setSelectedMedicine] = useState(null);

    const [medicines, setMedicines] = useState([]);
    const [suppliers, setSuppliers] = useState([]);

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let alive = true;

        (async () => {
            setPageLoading(true);
            setError(null);

            try {
                const [medsData, supsData, batch] = await Promise.all([
                    apiFetch("/api/medicines"),
                    apiFetch("/api/suppliers"),
                    apiFetch(`/api/medicine-batches/${id}`),
                ]);

                if (!alive) return;

                const medOptions = (Array.isArray(medsData) ? medsData : []).map((m) => ({
                    value: m.id,
                    label: m.generic_name,
                }));

                const supOptions = (Array.isArray(supsData) ? supsData : []).map((s) => ({
                    value: s.id,
                    label: s.name,
                }));

                setMedicines(medOptions);
                setSuppliers(supOptions);

                // Defaults to avoid controlled/uncontrolled warnings
                setBatchNo(batch?.batch_no ?? "");
                setQuantity(batch?.quantity != null ? String(batch.quantity) : "");
                setCost(batch?.cost != null ? String(batch.cost) : "");
                setExpiryDate(toDateInputValue(batch?.expiry_date));

                // supplier_id might be returned as supplier_id OR supplier.id
                const supplierId = batch?.supplier_id ?? batch?.supplier?.id ?? null;
                setSupplier(supplierId ? supOptions.find((o) => o.value === supplierId) || null : null);

                // medicine_id might be returned as medicine_id OR medicine.id
                const medicineId = batch?.medicine_id ?? batch?.medicine?.id ?? null;
                setSelectedMedicine(medicineId ? medOptions.find((o) => o.value === medicineId) || null : null);
            } catch (err) {
                console.error("Error fetching batch data:", err);
                toast.error("Failed to load medicine batch data");
                setError("Failed to load medicine batch data");
            } finally {
                if (alive) setPageLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload = {
            batch_no: batchNo,
            quantity: quantity === "" ? 0 : Number(quantity),
            expiry_date: expiryDate, // yyyy-mm-dd
            supplier_id: supplier ? supplier.value : null,
            cost: cost === "" ? 0 : Number(cost),
            medicine_id: selectedMedicine ? selectedMedicine.value : null,
        };

        try {
            await apiFetch(`/api/medicine-batches/${id}`, {
                method: "PUT",
                body: JSON.stringify(payload),
            });

            toast.success("Stock batch updated!");
            navigate("/medicine-batches/index");

        } catch (err) {
            console.error(err);
            setError(err?.message || "Failed to update stock batch");
            toast.error(err?.message || "Failed to update stock batch");
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return <div className="container mt-5">Loading...</div>;
    }

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Edit Stock Batch</h2>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit} className="form-card">
                <div className="form-group mb-3">
                    <label className="form-label">Batch Number</label>
                    <input
                        type="text"
                        className="form-control"
                        value={batchNo}
                        onChange={(e) => setBatchNo(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group mb-3">
                    <label className="form-label">Quantity</label>
                    <input
                        type="number"
                        className="form-control"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group mb-3">
                    <label className="form-label">Expiry Date</label>
                    <input
                        type="date"
                        className="form-control"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group mb-3">
                    <label className="form-label">Supplier</label>
                    <Select
                        options={suppliers}
                        value={supplier}
                        onChange={setSupplier}
                        placeholder="Select Supplier"
                    />
                </div>

                <div className="form-group mb-3">
                    <label className="form-label">Cost</label>
                    <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group mb-3">
                    <label className="form-label">Generic Name</label>
                    <Select
                        options={medicines}
                        value={selectedMedicine}
                        onChange={setSelectedMedicine}
                        placeholder="Select Medicine"
                    />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </form>
        </div>
    );
}
