import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api"; // adjust path

/**
 * Blade: resources/views/admin/sales/create.blade.php
 *
 * Expected API (adjust to your backend):
 *   GET  /api/sales/form-options -> { products: [{id, label}] }
 *   POST /api/sales              -> { id, ... }
 */
export default function SalesCreate() {
    const navigate = useNavigate();

    const pageHeader = (
        <div className="col-sm-12">
            <h3 className="page-title">Create Sale</h3>
            <ul className="breadcrumb">
                <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                <li className="breadcrumb-item active">Create Sale</li>
            </ul>
        </div>
    );

    const [products, setProducts] = useState([]);
    const [productId, setProductId] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const data = await apiFetch("/api/sales/form-options");
                setProducts(data?.products || []);
            } catch (e) {
                // Fallback: some projects expose available products at /api/products
                try {
                    const data2 = await apiFetch("/api/products?available=1");
                    const list = Array.isArray(data2) ? data2 : (data2?.data || []);
                    setProducts(list.map(p => ({ id: p.id, label: p.purchase?.product || p.name || `Product #${p.id}` })));
                } catch (e2) {
                    setErr(e.message || "Failed to load products");
                }
            }
        })();
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        setErr("");

        if (!productId) {
            setErr("Please select a product.");
            return;
        }

        setSaving(true);
        try {
            await apiFetch("/api/sales", {
                method: "POST",
                body: JSON.stringify({ product: productId, quantity }),
            });
            navigate("/sales");
        } catch (e) {
            setErr(e.message || "Save failed");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div className="row">
                <div className="col-sm-12">
                    <div className="card">
                        <div className="card-body custom-edit-service">
                            {err && <div className="alert alert-danger">{err}</div>}

                            <form onSubmit={submit}>
                                <div className="row form-row">
                                    <div className="col-12">
                                        <div className="form-group">
                                            <label>
                                                Product <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                className="form-select form-control"
                                                value={productId}
                                                onChange={(e) => setProductId(e.target.value)}
                                            >
                                                <option value="">Select Product</option>
                                                {(Array.isArray(products)?products:[]).map((p) => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.label ?? p.name ?? p.product ?? `Product #${p.id}`}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <div className="form-group">
                                            <label>Quantity</label>
                                            <input
                                                type="number"
                                                min={1}
                                                className="form-control"
                                                value={quantity}
                                                onChange={(e) => setQuantity(parseInt(e.target.value || "1", 10))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button className="btn btn-success btn-block" type="submit" disabled={saving}>
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </form>

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
