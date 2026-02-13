/**
 * Medicines module pages for React Router.
 * Assumes you have an apiFetch helper at: resources/js/api.js
 *   export async function apiFetch(url, options) { ... }
 * And the SPA is authenticated via Laravel Sanctum cookie/session auth.
 */

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
                                        <th>Qty</th>
                                        <th>Expiry</th>
                                        <th>Status</th>
                                        <th style={{ width: 180 }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan="9">No medicines found.</td>
                                        </tr>
                                    ) : (
                                        filtered.map((m) => (
                                            <tr key={m.id}>
                                                <td>{m.id}</td>
                                                <td>{m.generic_name}</td>
                                                <td>{m.brand_name}</td>
                                                <td>{m.dosage_form}</td>
                                                <td>{m.strength}</td>
                                                <td>{m.quantity}</td>
                                                <td>{String(m.expiry_date ?? "").slice(0, 10)}</td>
                                                <td>
                                                    {Number(m.quantity ?? 0) <= 0 ? (
                                                        <span className="badge bg-danger">Out</span>
                                                    ) : String(m.expiry_date ?? "").slice(0, 10) &&
                                                        String(m.expiry_date).slice(0, 10) < new Date().toISOString().slice(0, 10) ? (
                                                        <span className="badge bg-warning text-dark">Expired</span>
                                                    ) : (
                                                        <span className="badge bg-success">OK</span>
                                                    )}
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
                                        ))
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
