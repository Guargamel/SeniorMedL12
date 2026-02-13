import React, { useState } from 'react';
import { apiFetch } from "../utils/api"; // Adjust this path if needed

export default function UpdateStock({ medicineId }) {
    const [stockQuantity, setStockQuantity] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleStockUpdate = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await apiFetch(`/api/medicines/${medicineId}/stock`, {
                method: 'PUT',
                body: JSON.stringify({ stock_quantity: stockQuantity }),
            });

            setSuccessMessage('Stock updated successfully!');
            setStockQuantity('');
        } catch (err) {
            setError('Failed to update stock');
        }
    };

    return (
        <div className="container mt-4">
            <h2>Update Medicine Stock</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}

            <form onSubmit={handleStockUpdate}>
                <div className="mb-3">
                    <label className="form-label">Stock Quantity</label>
                    <input
                        type="number"
                        className="form-control"
                        value={stockQuantity}
                        onChange={(e) => setStockQuantity(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">Update Stock</button>
            </form>
        </div>
    );
}
