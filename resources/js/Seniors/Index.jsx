import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch, normalizeList } from "../utils/api";

export default function SeniorsIndex() {
    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState([]);
    const [meta, setMeta] = useState(null);
    const [pageUrl, setPageUrl] = useState("/api/seniors");

    const queryString = useMemo(() => `q=${encodeURIComponent(q.trim())}`, [q]);

    const load = async (url = "/api/seniors") => {
        setLoading(true);
        try {
            const join = url.includes("?") ? "&" : "?";
            const res = await apiFetch(`${url}${join}${queryString}`);

            // Supports Laravel paginator, data wrapper, etc.
            const list = normalizeList(res, ["users", "seniors"]);
            setRows(list);

            // meta for paginator
            setMeta(res?.meta || res?.data?.meta || null);
            setPageUrl(url);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load("/api/seniors");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const profileOf = (u) => u?.seniorProfile || u?.senior_profile || {};

    return (
        <div className="mc-card">
            <div className="mc-card-header">
                <h2 className="mc-card-title">Senior Citizens</h2>
                <Link className="btn btn-success btn-sm" to="/seniors/create">
                    Register Senior
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
                    <button className="btn btn-outline-secondary" onClick={() => load("/api/seniors")}>
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
                                    <th>Barangay</th>
                                    <th>Address</th>
                                    <th>Contact</th>
                                    <th>Notes</th>
                                    <th style={{ width: 140 }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((u) => {
                                    const p = profileOf(u);
                                    return (
                                        <tr key={u.id}>
                                            <td>
                                                <strong>{u.name}</strong>
                                            </td>
                                            <td>{u.email}</td>
                                            <td>{p.barangay || "-"}</td>
                                            <td>{p.address || "-"}</td>
                                            <td>{p.contact_no || "-"}</td>
                                            <td style={{ maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {p.notes || "-"}
                                            </td>
                                            <td style={{ whiteSpace: "nowrap" }}>
                                                <Link className="btn btn-sm btn-outline-primary" to={`/seniors/${u.id}/edit`}>
                                                    Edit
                                                </Link>

                                            </td>
                                        </tr>
                                    );
                                })}

                                {rows.length === 0 && (
                                    <tr>
                                        <td colSpan={7} style={{ padding: 12, color: "var(--mc-muted)" }}>
                                            No seniors found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Simple pagination (optional) */}
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
