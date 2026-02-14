import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";

function safeArr(x) {
    if (Array.isArray(x)) return x;
    if (Array.isArray(x?.data)) return x.data;
    return [];
}

export default function Index() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState("");

    // Load the medicines from the API
    async function load() {
        setLoading(true);
        try {
            const data = await apiFetch("/api/medicines");
            setItems(safeArr(data));
        } catch (e) {
            console.error("Failed to load medicines:", e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    // Filter the medicines based on the search query
    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return items;
        return items.filter((m) => {
            const hay = [
                m.generic_name,
                m.brand_name,
                m.dosage_form,
                m.strength,
                m.unit,
                m.description,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            return hay.includes(s);
        });
    }, [items, q]);

    // Handle the deletion of a medicine
    async function onDelete(id) {
        if (!confirm("Delete this medicine?")) return;
        try {
            await apiFetch(`/api/medicines/${id}`, { method: "DELETE" });
            await load();
        } catch (e) {
            console.error("Delete failed:", e);
            alert("Delete failed. Check console for details.");
        }
    }

    return (
        <div className="content">
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h4 className="page-title mb-0">All Medicines</h4>
                <Link className="btn btn-primary" to="/medicines/create">
                    Add Medicine
                </Link>
            </div>

            <div className="card mb-3">
                <div className="card-body d-flex gap-2 align-items-center flex-wrap">
                    <input
                        className="form-control"
                        placeholder="Search medicine..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        style={{ maxWidth: 420 }}
                    />
                    <button className="btn btn-light" type="button" onClick={load}>
                        Refresh
                    </button>
                    <button className="btn btn-outline-secondary" type="button" onClick={() => navigate("/medicines/expired")}>
                        Expired
                    </button>
                    <button className="btn btn-outline-secondary" type="button" onClick={() => navigate("/medicines/outstock")}>
                        Out of Stock
                    </button>
                    <button className="btn btn-outline-secondary" type="button" onClick={() => navigate("/medicines/categories")}>
                        Categories
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="card-body">
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Generic</th>
                                        <th>Brand</th>
                                        <th>Form</th>
                                        <th>Strength</th>
                                        <th>Status</th>
                                        <th style={{ width: 180 }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan="7">No medicines found.</td>
                                        </tr>
                                    ) : (
                                        filtered.map((m) => {
                                            // Calculate the availability of the medicine
                                            let availability = "OK";
                                            const currentDate = new Date();

                                            // Calculate total quantity of the medicine across all batches
                                            const totalQuantity = m.batches.reduce((total, batch) => {
                                                return total + batch.quantity;
                                            }, 0);

                                            // Check if the medicine is expired
                                            const isExpired = m.batches.some(batch => new Date(batch.expiry_date) < currentDate);

                                            if (totalQuantity === 0) {
                                                availability = "Out of Stock";
                                            } else if (isExpired) {
                                                availability = "Expired";
                                            } else if (totalQuantity < 10) {
                                                availability = "Low Stock";
                                            }

                                            return (
                                                <tr key={m.id}>
                                                    <td>{m.id}</td>
                                                    <td>{m.generic_name}</td>
                                                    <td>{m.brand_name}</td>
                                                    <td>{m.dosage_form}</td>
                                                    <td>{m.strength}</td>
                                                    <td>
                                                        <span className={`badge ${availability === "Expired" ? "bg-warning text-dark" : availability === "Out of Stock" ? "bg-danger" : availability === "Low Stock" ? "bg-secondary" : "bg-success"}`}>
                                                            {availability}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex gap-2">
                                                            <Link className="btn btn-sm btn-outline-primary" to={`/medicines/${m.id}/edit`}>
                                                                Edit
                                                            </Link>
                                                            <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(m.id)}>
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
