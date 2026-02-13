/**
 * Medicines module pages for React Router.
 * Assumes you have an apiFetch helper at: resources/js/api.js
 *   export async function apiFetch(url, options) { ... }
 * And the SPA is authenticated via Laravel Sanctum cookie/session auth.
 */

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../utils/api";

function safeArr(x) {
    if (Array.isArray(x)) return x;
    if (Array.isArray(x?.data)) return x.data;
    return [];
}

export default function Outstock() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    async function load() {
        setLoading(true);
        try {
            // Recommended backend endpoint: GET /api/medicines/outstock
            // If you don't add it, we fallback to filtering /api/medicines
            try {
                const data = await apiFetch("/api/medicines/outstock");
                setItems(safeArr(data));
            } catch {
                const all = await apiFetch("/api/medicines");
                const arr = safeArr(all);
                setItems(arr.filter((m) => Number(m.quantity ?? 0) <= 0));
            }
        } catch (e) {
            console.error("Failed to load outstock:", e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    return (
        <div className="content">
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h4 className="page-title mb-0">Out of Stock</h4>
                <Link className="btn btn-light" to="/medicines">
                    Back
                </Link>
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
                                        <th>Qty</th>
                                        <th>Expiry</th>
                                        <th style={{ width: 120 }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.length === 0 ? (
                                        <tr>
                                            <td colSpan="6">No out-of-stock medicines.</td>
                                        </tr>
                                    ) : (
                                        items.map((m) => (
                                            <tr key={m.id}>
                                                <td>{m.id}</td>
                                                <td>{m.generic_name}</td>
                                                <td>{m.brand_name}</td>
                                                <td>{m.quantity}</td>
                                                <td>{String(m.expiry_date ?? "").slice(0, 10)}</td>
                                                <td>
                                                    <Link className="btn btn-sm btn-outline-primary" to={`/medicines/${m.id}/edit`}>
                                                        Edit
                                                    </Link>
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
