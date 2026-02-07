import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api"; // adjust if your apiFetch path differs

export default function SuppliersIndex() {
    const navigate = useNavigate();

    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const [deleting, setDeleting] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const loadSuppliers = async () => {
        setErr("");
        setLoading(true);
        try {
            // expected: array OR {data: []} OR {suppliers: []}
            const res = await apiFetch("/api/suppliers");
            const list = Array.isArray(res) ? res : (res.data || res.suppliers || []);
            setSuppliers(list);
        } catch (e) {
            setErr(e.message || "Failed to load suppliers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSuppliers();
    }, []);

    const pageHeader = useMemo(() => (
        <div className="row align-items-center">
            <div className="col-sm-7 col-auto">
                <h3 className="page-title">Supplier</h3>
                <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">Supplier</li>
                </ul>
            </div>
            <div className="col-sm-5 col">
                <Link to="/suppliers/create" className="btn btn-success float-right mt-2">
                    Add New
                </Link>
            </div>
        </div>
    ), []);

    const confirmDelete = (id) => setDeleteId(id);

    const doDelete = async () => {
        if (!deleteId) return;
        setErr("");
        try {
            setDeleting(true);
            await apiFetch(`/api/suppliers/${deleteId}`, { method: "DELETE" });
            setDeleteId(null);
            await loadSuppliers();
        } catch (e) {
            setErr(e.message || "Delete failed");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div>
            <div className="page-header">{pageHeader}</div>

            {err && <div className="alert alert-danger">{err}</div>}

            <div className="row">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-body">
                            {loading ? (
                                <div>Loading...</div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover table-center mb-0">
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Name</th>
                                                <th>Phone</th>
                                                <th>Email</th>
                                                <th>Address</th>
                                                <th>Company</th>
                                                <th className="action-btn">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {suppliers.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="text-center text-muted">
                                                        No suppliers found
                                                    </td>
                                                </tr>
                                            ) : (
                                                suppliers.map((s) => (
                                                    <tr key={s.id}>
                                                        <td>{s.product || ""}</td>
                                                        <td>{s.name || ""}</td>
                                                        <td>{s.phone || ""}</td>
                                                        <td>{s.email || ""}</td>
                                                        <td>{s.address || ""}</td>
                                                        <td>{s.company || ""}</td>
                                                        <td>
                                                            <div className="actions">
                                                                <button
                                                                    className="btn btn-sm bg-success-light mr-2"
                                                                    onClick={() => navigate(`/suppliers/${s.id}/edit`)}
                                                                    type="button"
                                                                >
                                                                    <i className="fe fe-pencil" /> Edit
                                                                </button>

                                                                <button
                                                                    className="btn btn-sm bg-danger-light"
                                                                    onClick={() => confirmDelete(s.id)}
                                                                    type="button"
                                                                >
                                                                    <i className="fe fe-trash" /> Delete
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

                    {/* Simple delete modal (Bootstrap-ish without jQuery) */}
                    {deleteId && (
                        <div
                            className="modal d-block"
                            tabIndex="-1"
                            role="dialog"
                            style={{ background: "rgba(0,0,0,.4)" }}
                        >
                            <div className="modal-dialog" role="document">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">Delete Supplier</h5>
                                        <button type="button" className="close" onClick={() => setDeleteId(null)}>
                                            <span>&times;</span>
                                        </button>
                                    </div>
                                    <div className="modal-body">
                                        Are you sure you want to delete this supplier?
                                    </div>
                                    <div className="modal-footer">
                                        <button className="btn btn-secondary" onClick={() => setDeleteId(null)} disabled={deleting}>
                                            Cancel
                                        </button>
                                        <button className="btn btn-danger" onClick={doDelete} disabled={deleting}>
                                            {deleting ? "Deleting..." : "Delete"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
