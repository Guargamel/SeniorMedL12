import React, { useState, useEffect } from "react";
import { apiFetch, safeArray } from "../utils/api"; // Assuming apiFetch is your utility for fetching data

const Index = () => {
    const [stock, setStock] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStock() {
            try {
                const data = await apiFetch("/api/stock"); // Assuming the API endpoint
                setStock(data);
            } catch (error) {
                console.error("Failed to load stock:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStock();
    }, []);

    if (loading) {
        return <div>Loading stock...</div>;
    }

    return (
        <div>
            <h2>Stock List</h2>
            <table>
                <thead>
                    <tr>
                        <th>Batch Number</th>
                        <th>Quantity</th>
                        <th>Expiry Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {safeArray(stock).map((batch) => (
                        <tr key={batch.id}>
                            <td>{batch.batch_no}</td>
                            <td>{batch.quantity}</td>
                            <td>{batch.expiry_date}</td>
                            <td>
                                <a href={`/stock/${batch.id}/edit`}>Edit</a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Index;
