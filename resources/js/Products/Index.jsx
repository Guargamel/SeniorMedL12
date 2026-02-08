// resources/js/Products/Index.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";

export default function ProductsIndex() {
    const navigate = useNavigate();

    const [items, setItems] = useState([]);
    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const load = async () => {
        setErr("");
        setLoading(true);
        try {
            const res = await apiFetch("/api/products");
            const list = Array.isArray(res) ? res : (res.data || res.products || []);
            setItems(list);
        } catch (e) {
            setErr(e.message || "Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return items;
        return items.filter((p) => {
            const name = (p.product || p.name || "").toLowerCase();
            const cat = (p.category || p.category_name || "").toLowerCase();
            return name.includes(s) || cat.includes(s);
        });
    }, [items, q]);

    const pageHeader = (
        <div className="row align-items-center">
            <div className="col-sm-7 col-auto">
                <h3 className="page-title">Products</h3>
                <ul className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                    <li className="breadcrumb-item active">Products</li>
                </ul>
            </div>
            <div className="col-sm-5 col">
                <Link to="/products/create" className="btn btn-success float-right mt-2">Add Product</Link>
            </div>
        </div>
    );

    return (
        <div>
            <div className="page-header">{pageHeader}</div>

            {err && <div className="alert alert-danger">{err}</div>}

            <div className="row">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <input
                                    className="form-control"
                                    style={{ maxWidth: 360 }}
                                    placeholder="Search product/category..."
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                />
                                <div>
                                    <Link className="btn btn-outline-secondary mr-2" to="/outstock">Outstock</Link>
                                    <Link className="btn btn-outline-secondary mr-2" to="/expired">Expired</Link>
                                    <Link className="btn btn-outline-secondary" to="/categories">Categories</Link>
                                </div>
                            </div>

                            {loading ? (
                                <div>Loading...</div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover table-center mb-0">
                                        <thead>
                                            <tr>
                                                <th>Product Name</th>
                                                <th>Category</th>
                                                <th>Price</th>
                                                <th>Quantity</th>
                                                <th>Margin</th>
                                                <th>Expiry Date</th>
                                                <th className="action-btn">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered.length === 0 ? (
                                                <tr><td colSpan={7} className="text-center text-muted">No products found</td></tr>
                                            ) : (Array.isArray(filtered) ? filtered : []).map((p) => (
                                                <tr key={p.id}>
                                                    <td>{p.product || p.name || "-"}</td>
                                                    <td>{p.category || p.category_name || "-"}</td>
                                                    <td>{p.price ?? "-"}</td>
                                                    <td>{p.quantity ?? "-"}</td>
                                                    <td>{p.discount ?? "-"}</td>
                                                    <td>{p.expiry_date || p.expire || "-"}</td>
                                                    <td>
                                                        <div className="actions">
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm bg-success-light mr-2"
                                                                onClick={() => navigate(`/products/${p.id}/edit`)}
                                                            >
                                                                <i className="fe fe-pencil" /> Edit
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm bg-danger-light"
                                                                onClick={async () => {
                                                                    if (!confirm("Delete this product?")) return;
                                                                    try {
                                                                        await apiFetch(`/api/products/${p.id}`, { method: "DELETE" });
                                                                        await load();
                                                                    } catch (e) {
                                                                        alert(e.message || "Delete failed");
                                                                    }
                                                                }}
                                                            >
                                                                <i className="fe fe-trash" /> Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
