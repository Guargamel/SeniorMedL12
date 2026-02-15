import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../utils/api"; // Assuming apiFetch is your utility for fetching data

const Edit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [batchNo, setBatchNo] = useState("");
    const [quantity, setQuantity] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [supplier, setSupplier] = useState("");
    const [cost, setCost] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchStock() {
            try {
                const data = await apiFetch(`/api/medicine-batches/${id}`);
                setBatchNo(data.batch_no);
                setQuantity(data.quantity);
                setExpiryDate(data.expiry_date);
                setSupplier(data.supplier);
                setCost(data.cost);
            } catch (err) {
                setError("Failed to load medicine-batches data");
            }
        }
        fetchStock();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const data = { batch_no: batchNo, quantity, expiry_date: expiryDate, supplier, cost };

        try {
            await apiFetch(`/api/medicine-batches/${id}`, {
                method: "PUT",
                body: JSON.stringify(data),
            });
            navigate("/medicine-batches/index");
        } catch (err) {
            setError("Failed to update stock batch");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Edit Stock Batch</h2>
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit} className="form-card">
                <div className="form-group mb-3">
                    <label htmlFor="batchNo" className="form-label">Batch Number</label>
                    <input
                        type="text"
                        id="batchNo"
                        className="form-control"
                        value={batchNo}
                        onChange={(e) => setBatchNo(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group mb-3">
                    <label htmlFor="quantity" className="form-label">Quantity</label>
                    <input
                        type="number"
                        id="quantity"
                        className="form-control"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group mb-3">
                    <label htmlFor="expiryDate" className="form-label">Expiry Date</label>
                    <input
                        type="date"
                        id="expiryDate"
                        className="form-control"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group mb-3">
                    <label htmlFor="supplier" className="form-label">Supplier</label>
                    <input
                        type="text"
                        id="supplier"
                        className="form-control"
                        value={supplier}
                        onChange={(e) => setSupplier(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group mb-3">
                    <label htmlFor="cost" className="form-label">Cost</label>
                    <input
                        type="number"
                        id="cost"
                        className="form-control"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </form>
        </div>
    );
};

export default Edit;
