import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../utils/api"; // adjust path

/**
 * Blade: resources/views/admin/sales/index.blade.php
 * - Old page used server-side DataTables.
 * - React version fetches a list and renders a table.
 *
 * Expected API (adjust to your backend):
 *   GET  /api/sales            -> { data: SaleRow[] } OR SaleRow[]
 *   DELETE /api/sales/:id      -> success
 *
 * SaleRow example:
 * { id, product, quantity, total_price, date }
 */
export default function SalesIndex({ permissions = {} }) {
    const pageHeader = (
        <>
            <div className="col-sm-7 col-auto">
                <h3 className="page-title">Sales</h3>
                <ul className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                    <li className="breadcrumb-item active">Sales</li>
                </ul>
            </div>
            {permissions.createSale && (
                <div className="col-sm-5 col">
                    <Link to="/sales/create" className="btn btn-success float-right mt-2">
                        Add Sale
                    </Link>
                </div>
            )}
        </>
    );

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const load = async () => {
        setLoading(true);
        setErr("");
        try {
            const data = await apiFetch("/api/sales");
            const list = Array.isArray(data) ? data : (data?.data || []);
            setRows(list);
        } catch (e) {
            setErr(e.message || "Failed to load sales");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async (id) => {
        if (!confirm("Delete this sale?")) return;
        try {
            await apiFetch(`/api/sales/${id}`, { method: "DELETE" });
            setRows((prev) => prev.filter((r) => r.id !== id));
        } catch (e) {
            alert(e.message || "Delete failed");
        }
    };

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-body">
                            {err && <div className="alert alert-danger">{err}</div>}

                            <div className="table-responsive">
                                <table className="table table-hover table-center mb-0">
                                    <thead>
                                        <tr>
                                            <th>Medicine Name</th>
                                            <th>Quantity</th>
                                            <th>Total Price</th>
                                            <th>Date</th>
                                            <th className="action-btn">Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan={5}>Loading...</td></tr>
                                        ) : rows.length === 0 ? (
                                            <tr><td colSpan={5}>No sales found.</td></tr>
                                        ) : (
                                            rows.map((r) => (
                                                <tr key={r.id}>
                                                    <td>{r.product}</td>
                                                    <td>{r.quantity}</td>
                                                    <td>{r.total_price}</td>
                                                    <td>{r.date}</td>
                                                    <td className="action-btn">
                                                        <div className="actions">
                                                            <Link className="btn btn-sm bg-success-light mr-2" to={`/sales/${r.id}/edit`}>
                                                                <i className="fe fe-pencil"></i> Edit
                                                            </Link>
                                                            <button className="btn btn-sm bg-danger-light" type="button" onClick={() => handleDelete(r.id)}>
                                                                <i className="fe fe-trash"></i> Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>

                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
