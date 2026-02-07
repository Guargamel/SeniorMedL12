import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../utils/api"; // adjust path

/**
 * React version of roles/index.blade.php
 *
 * Expects API endpoints (adjust if needed):
 *  - GET    /api/roles              -> [{id,name,permissions:[...]}]
 *  - DELETE /api/roles/:id
 */
export default function RolesIndex() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await apiFetch("/api/roles");
            // Support both array and {data:[...]} payloads
            setRows(Array.isArray(data) ? data : (data?.data || []));
        } catch (e) {
            console.error(e);
            setError(e.message || "Failed to load roles");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const onDelete = async (id) => {
        if (!confirm("Delete this role?")) return;
        try {
            await apiFetch(`/api/roles/${id}`, { method: "DELETE" });
            await load();
        } catch (e) {
            console.error(e);
            alert(e.message || "Delete failed");
        }
    };

    const tableBody = useMemo(() => {
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
                    <td colSpan={3} className="text-center py-4">No roles found</td>
                </tr>
            );
        }

        return rows.map((r) => (
            <tr key={r.id}>
                <td>{r.name}</td>
                <td>
                    {(r.permissions || [])
                        .map((p) => (typeof p === "string" ? p : p.name))
                        .join(", ")}
                </td>
                <td className="text-center action-btn">
                    <Link className="btn btn-sm btn-primary mr-2" to={`/roles/${r.id}/edit`}>
                        Edit
                    </Link>
                    <button className="btn btn-sm btn-danger" type="button" onClick={() => onDelete(r.id)}>
                        Delete
                    </button>
                </td>
            </tr>
        ));
    }, [rows, loading, error]);

    return (
        <div className="row">
            <div className="col-sm-7 col-auto">
                <h3 className="page-title">Roles</h3>
                <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">Roles</li>
                </ul>
            </div>

            <div className="col-sm-5 col">
                <Link to="/roles/create" className="btn btn-success float-right mt-2">
                    Add Role
                </Link>
            </div>

            <div className="col-sm-12 mt-3">
                <div className="card">
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered table-hover table-center mb-0">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Permissions</th>
                                        <th className="text-center action-btn">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>{tableBody}</tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
