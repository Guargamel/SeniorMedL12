// resources/js/Pages/Users/Index.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const UsersIndex = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    // NOTE: In Laravel 8 this was DataTables server-side via route('users.index').
    // In React we typically expose JSON endpoints, e.g. GET /api/users.
    // Adjust URLs/fields to match your Laravel 12 controllers.
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                setLoading(true);
                setErr("");
                const data = await apiFetch("/api/users");
                // expected: { data: [...] } OR [...]
                const list = Array.isArray(data) ? data : (data.data || []);
                if (alive) setRows(list);
            } catch (e) {
                if (alive) setErr(e.message || "Failed to load users");
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, []);

    const pageHeader = useMemo(() => (
        <>
            <div className="col-sm-7 col-auto">
                <h3 className="page-title">User</h3>
                <ul className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                    <li className="breadcrumb-item active">Users</li>
                </ul>
            </div>
            <div className="col-sm-5 col">
                <Link to="/users/create" className="btn btn-success float-right mt-2">Add User</Link>
            </div>
        </>
    ), []);

    const handleDelete = async (id) => {
        if (!confirm("Delete this user?")) return;
        try {
            await apiFetch(`/api/users/${id}`, { method: "DELETE" });
            setRows((prev) => prev.filter((r) => r.id !== id));
        } catch (e) {
            alert(e.message || "Delete failed");
        }
    };

    return (
        <>
            <div className="row">
                <div className="col-sm-12">
                    <div className="card">
                        <div className="card-body">
                            {err && <div className="alert alert-danger">{err}</div>}
                            {loading ? (
                                <div>Loading...</div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-striped table-bordered table-hover table-center mb-0">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Avatar</th>
                                                <th>Created date</th>
                                                <th className="text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rows.length === 0 ? (
                                                <tr><td colSpan={6} className="text-center text-muted">No users found</td></tr>
                                            ) : rows.map((u) => (
                                                <tr key={u.id}>
                                                    <td>{u.name}</td>
                                                    <td>{u.email}</td>
                                                    <td>{u.role?.name || u.role || "-"}</td>
                                                    <td>
                                                        {u.avatar_url ? (
                                                            <img src={u.avatar_url} alt="avatar" style={{ width: 32, height: 32, borderRadius: "50%" }} />
                                                        ) : (
                                                            <span className="text-muted">-</span>
                                                        )}
                                                    </td>
                                                    <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : "-"}</td>
                                                    <td className="text-center">
                                                        <Link to={`/users/${u.id}/edit`} className="btn btn-sm btn-primary mr-2">Edit</Link>
                                                        <button onClick={() => handleDelete(u.id)} className="btn btn-sm btn-danger">Delete</button>
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
        </>
    );
};

export default UsersIndex;
