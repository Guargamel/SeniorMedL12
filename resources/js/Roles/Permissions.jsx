import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Modal from "./Modal";
import { apiFetch, normalizeList, safeArray } from "../utils/api"; // adjust path

/**
 * React version of roles/permissions.blade.php
 *
 * Expects API endpoints (adjust if needed):
 *  - GET    /api/permissions         -> [{id,name,created_at}]
 *  - POST   /api/permissions         -> create
 *  - PUT    /api/permissions/:id     -> update
 *  - DELETE /api/permissions/:id     -> delete
 */
export default function Permissions() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // modals state
    const [addOpen, setAddOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    const [permName, setPermName] = useState("");
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await apiFetch("/api/permissions");
            setRows(normalizeList(data, ["permissions"]));
        } catch (e) {
            console.error(e);
            setError(e.message || "Failed to load permissions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const openAdd = () => {
        setPermName("");
        setAddOpen(true);
    };

    const openEdit = (row) => {
        setEditId(row.id);
        setPermName(row.name);
        setEditOpen(true);
    };

    const onCreate = async () => {
        if (!permName.trim()) return;
        setSaving(true);
        try {
            await apiFetch("/api/permissions", {
                method: "POST",
                body: JSON.stringify({ permission: permName.trim() }),
            });
            setAddOpen(false);
            await load();
        } catch (e) {
            console.error(e);
            alert(e.message || "Create failed");
        } finally {
            setSaving(false);
        }
    };

    const onUpdate = async () => {
        if (!editId || !permName.trim()) return;
        setSaving(true);
        try {
            await apiFetch(`/api/permissions/${editId}`, {
                method: "PUT",
                body: JSON.stringify({ permission: permName.trim() }),
            });
            setEditOpen(false);
            await load();
        } catch (e) {
            console.error(e);
            alert(e.message || "Update failed");
        } finally {
            setSaving(false);
        }
    };

    const onDelete = async (id) => {
        if (!confirm("Delete this permission?")) return;
        try {
            await apiFetch(`/api/permissions/${id}`, { method: "DELETE" });
            await load();
        } catch (e) {
            console.error(e);
            alert(e.message || "Delete failed");
        }
    };

    const body = useMemo(() => {
        if (loading) {
            return (
                <tr>
                    <td colSpan={3} className="text-center py-4">Loading...</td>
                </tr>
            );
        }
        if (error) {
            return (
                <tr>
                    <td colSpan={3} className="text-center py-4 text-danger">{error}</td>
                </tr>
            );
        }
        if (!rows.length) {
            return (
                <tr>
                    <td colSpan={3} className="text-center py-4">No permissions found</td>
                </tr>
            );
        }

        return safeArray(rows).map((r) => (
            <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.created_at ? String(r.created_at).replace("T", " ").slice(0, 19) : ""}</td>
                <td className="text-center action-btn">
                    <button className="btn btn-sm btn-primary mr-2" onClick={() => openEdit(r)}>
                        Edit
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => onDelete(r.id)}>
                        Delete
                    </button>
                </td>
            </tr>
        ));
    }, [rows, loading, error]);

    return (
        <>
            <div className="row">
                <div className="col-sm-7 col-auto">
                    <h3 className="page-title">Permissions</h3>
                    <ul className="breadcrumb">
                        <li className="breadcrumb-item">
                            <Link to="/dashboard">Dashboard</Link>
                        </li>
                        <li className="breadcrumb-item active">Permissions</li>
                    </ul>
                </div>
                <div className="col-sm-5 col">
                    <button type="button" onClick={openAdd} className="btn btn-success float-right mt-2">
                        Add Permission
                    </button>
                </div>
            </div>

            <div className="row mt-3">
                <div className="col-sm-12">
                    <div className="card">
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-striped table-bordered table-hover table-center mb-0">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Created date</th>
                                            <th className="text-center action-btn">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>{body}</tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Modal */}
            <Modal
                open={addOpen}
                title="Add Permission"
                onClose={() => (saving ? null : setAddOpen(false))}
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setAddOpen(false)} disabled={saving}>
                            Cancel
                        </button>
                        <button className="btn btn-success" onClick={onCreate} disabled={saving}>
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </>
                }
            >
                <div className="form-group">
                    <label>Permission</label>
                    <input
                        type="text"
                        className="form-control"
                        value={permName}
                        onChange={(e) => setPermName(e.target.value)}
                        placeholder="view-products"
                    />
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal
                open={editOpen}
                title="Edit Permission"
                onClose={() => (saving ? null : setEditOpen(false))}
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setEditOpen(false)} disabled={saving}>
                            Cancel
                        </button>
                        <button className="btn btn-success" onClick={onUpdate} disabled={saving}>
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </>
                }
            >
                <div className="form-group">
                    <label>Permission</label>
                    <input
                        type="text"
                        className="form-control"
                        value={permName}
                        onChange={(e) => setPermName(e.target.value)}
                    />
                </div>
            </Modal>
        </>
    );
}