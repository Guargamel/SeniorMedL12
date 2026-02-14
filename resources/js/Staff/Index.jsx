import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch, normalizeList } from "../utils/api";

export default function StaffIndex() {
    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState([]);
    const [meta, setMeta] = useState(null);

    const queryString = useMemo(() => `q=${encodeURIComponent(q.trim())}`, [q]);

    const load = async (url = "/api/staff") => {
        setLoading(true);
        try {
            const join = url.includes("?") ? "&" : "?";
            const res = await apiFetch(`${url}${join}${queryString}`);

            setRows(normalizeList(res, ["users", "staff"]));
            setMeta(res?.meta || res?.data?.meta || null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load("/api/staff");
    }, []);

    const roleName = (u) => {
        const r = u?.roles?.[0]?.name;
        return r || "-";
    };

    return (
        <div className="mc-card">
            <div className="mc-card-header">
                <h2 className="mc-card-title">Staff Accounts</h2>
                <Link className="btn btn-success btn-sm" to="/users/create">
                    Add Staff
                </Link>
            </div>

            <div className="mc-card-body">
                <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                    <input
                        className="form-control"
                        placeholder="Search name/email..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                    <button className="btn btn-outline-secondary" onClick={() => load("/api/staff")}>
                        Search
                    </button>
                </div>

                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table className="mc-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th style={{ width: 220 }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((u) => (
                                    <tr key={u.id}>
                                        <td><strong>{u.name}</strong></td>
                                        <td>{u.email}</td>
                                        <td>{roleName(u)}</td>
                                        <td style={{ whiteSpace: "nowrap" }}>
                                            <Link className="btn btn-sm btn-outline-primary" to={`/users/${u.id}/edit`}>
                                                Edit
                                            </Link>{" "}


                                        </td>
                                    </tr>
                                ))}

                                {rows.length === 0 && (
                                    <tr>
                                        <td colSpan={4} style={{ padding: 12, color: "var(--mc-muted)" }}>
                                            No staff found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {meta?.links?.length > 0 && (
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                                {meta.links.map((l, idx) => (
                                    <button
                                        key={idx}
                                        className={`btn btn-sm ${l.active ? "btn-success" : "btn-outline-secondary"}`}
                                        disabled={!l.url}
                                        onClick={() => l.url && load(l.url.replace(window.location.origin, ""))}
                                        dangerouslySetInnerHTML={{ __html: l.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
