import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api"; // Assuming apiFetch is your utility for fetching data

const Create = () => {
    const [batchNo, setBatchNo] = useState("");
    const [quantity, setQuantity] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [supplier, setSupplier] = useState("");
    const [cost, setCost] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const data = { batch_no: batchNo, quantity, expiry_date: expiryDate, supplier, cost };

        try {
            await apiFetch("/api/stock", {
                method: "POST",
                body: JSON.stringify(data),
            });
            navigate("/stock/index"); // Redirect to stock index page
        } catch (err) {
            setError("Failed to create stock batch");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Create Stock Batch</h2>
            {error && <div>{error}</div>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Batch Number</label>
                    <input type="text" value={batchNo} onChange={(e) => setBatchNo(e.target.value)} required />
                </div>
                <div>
                    <label>Quantity</label>
                    <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
                </div>
                <div>
                    <label>Expiry Date</label>
                    <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} required />
                </div>
                <div>
                    <label>Supplier</label>
                    <input type="text" value={supplier} onChange={(e) => setSupplier(e.target.value)} required />
                </div>
                <div>
                    <label>Cost</label>
                    <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} required />
                </div>
                <button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Stock"}</button>
            </form>
        </div>
    );
};

export default Create;
