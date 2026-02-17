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

export default function Categories() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");

    async function load() {
        setLoading(true);
        try {
            const data = await apiFetch("/api/medicine-categories");
            setItems(safeArr(data));
        } catch (e) {
            console.error("Failed to load categories:", e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function onCreate(e) {
        e.preventDefault();
        const n = name.trim();
        if (!n) return;

        try {
            await apiFetch("/api/medicine-categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: n }),
            });
            setName("");
            await load();
        } catch (e) {
            console.error("Create category failed:", e);
            alert("Create failed. Check console.");
        }
    }

    async function onDelete(id) {
        if (!confirm("Delete this category?")) return;
        try {
            await apiFetch(`/api/medicine-categories/${id}`, { method: "DELETE" });
            await load();
        } catch (e) {
            console.error("Delete category failed:", e);
            alert("Delete failed. Check console.");
        }
    }

    return (
        <div className="content">
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h4 className="page-title mb-0">Medicine Categories</h4>
                <Link className="btn btn-light" to="/medicines">
                    Back
                </Link>
            </div>

            <div className="card mb-3">
                <div className="card-body">
                    <form className="d-flex gap-2" onSubmit={onCreate}>
                        <input
                            className="form-control"
                            placeholder="New category name..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <button className="btn btn-primary" type="submit">
                            Add
                        </button>
                    </form>
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
                                        <th>Name</th>
                                        <th style={{ width: 120 }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.length === 0 ? (
                                        <tr>
                                            <td colSpan="3">No categories yet.</td>
                                        </tr>
                                    ) : (
                                        items.map((c) => (
                                            <tr key={c.id}>
                                                <td>{c.id}</td>
                                                <td>{c.name ?? c.title ?? c.category_name}</td>
                                                <td>
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(c.id)}>
                                                        Delete
                                                    </button>
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
