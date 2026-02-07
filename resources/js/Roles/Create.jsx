import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api"; // adjust path

/**
 * React version of roles/create.blade.php
 *
 * Expects API endpoints (adjust if needed):
 *  - GET  /api/permissions          -> [{id,name}]
 *  - POST /api/roles                -> {id,...}
 */
export default function RolesCreate() {
    const navigate = useNavigate();
    const [role, setRole] = useState("");
    const [permissions, setPermissions] = useState([]);
    const [selected, setSelected] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const data = await apiFetch("/api/permissions");
                setPermissions(Array.isArray(data) ? data : (data?.data || []));
            } catch (e) {
                console.error(e);
                setError(e.message || "Failed to load permissions");
            }
        })();
    }, []);

    const onSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            await apiFetch("/api/roles", {
                method: "POST",
                body: JSON.stringify({
                    role,
                    permission: selected, // match your blade name="permission[]"
                }),
            });
            navigate("/roles");
        } catch (e) {
            console.error(e);
            setError(e.message || "Failed to create role");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div className="row">
                <div className="col-sm-12">
                    <h3 className="page-title">Create Role</h3>
                    <ul className="breadcrumb">
                        <li className="breadcrumb-item">
                            <Link to="/dashboard">Dashboard</Link>
                        </li>
                        <li className="breadcrumb-item">
                            <Link to="/roles">Roles</Link>
                        </li>
                        <li className="breadcrumb-item active">Create</li>
                    </ul>
                </div>
            </div>

            <div className="row">
                <div className="col-md-12 col-lg-12">
                    <div className="card card-table">
                        <div className="card-header">
                            <h4 className="card-title">Add Role</h4>
                        </div>
                        <div className="card-body">
                            <div className="p-5">
                                {error && <div className="alert alert-danger">{error}</div>}

                                <form onSubmit={onSubmit}>
                                    <div className="form-group">
                                        <label>Role</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="super-admin"
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Select Permissions</label>
                                        <select
                                            className="form-control"
                                            multiple
                                            value={selected}
                                            onChange={(e) =>
                                                setSelected(Array.from(e.target.selectedOptions).map((o) => o.value))
                                            }
                                        >
                                            {permissions.map((p) => {
                                                const name = typeof p === "string" ? p : p.name;
                                                return (
                                                    <option key={p.id ?? name} value={name}>
                                                        {name}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                        <small className="text-muted">Hold Ctrl (or Cmd) to select multiple.</small>
                                    </div>

                                    <button type="submit" className="btn btn-success btn-block" disabled={saving}>
                                        {saving ? "Saving..." : "Save Changes"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
