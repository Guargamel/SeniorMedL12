import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

/**
 * Blade: resources/views/admin/sales/edit.blade.php
 *
 * Expected API (adjust to your backend):
 *   GET  /api/sales/:id            -> { id, quantity, product_id } (or similar)
 *   GET  /api/sales/form-options   -> { products: [{id,label}] }
 *   PUT  /api/sales/:id            -> success
 */
export default function SalesEdit() {
    const { id } = useParams();
    const navigate = useNavigate();

    const pageHeader = (
        <div className="col-sm-12">
            <h3 className="page-title">Edit Sale</h3>
            <ul className="breadcrumb">
                <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                <li className="breadcrumb-item active">Edit Sale</li>
            </ul>
        </div>
    );

    const [products, setProducts] = useState([]);
    const [productId, setProductId] = useState("");
    const [quantity, setQuantity] = useState(1);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState("");

    useEffect(() => {
        (async () => {
            setLoading(true);
            setErr("");
            try {
                const [sale, opts] = await Promise.all([
                    apiFetch(`/api/sales/${id}`),
                    apiFetch("/api/sales/form-options").catch(() => ({ products: [] })),
                ]);

                setProducts(opts?.products || []);
                setQuantity(sale?.quantity ?? 1);

                // common fields:
                setProductId(
                    sale?.product_id ??
                    sale?.product ??
                    sale?.productId ??
                    ""
                );
            } catch (e) {
                setErr(e.message || "Failed to load sale");
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const submit = async (e) => {
        e.preventDefault();
        setErr("");

        if (!productId) {
            setErr("Please select a product.");
            return;
        }

        setSaving(true);
        try {
            await apiFetch(`/api/sales/${id}`, {
                method: "PUT",
                body: JSON.stringify({ product: productId, quantity }),
            });
            navigate("/sales");
        } catch (e) {
            setErr(e.message || "Update failed");
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

                            {loading ? (
                                <div>Loading...</div>
                            ) : (
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
                                                    {products.map((p) => (
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
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
