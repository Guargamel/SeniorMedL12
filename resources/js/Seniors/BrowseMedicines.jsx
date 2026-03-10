import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import TTSButton from "../Components/TTSButton";

function safeArr(x) {
    if (Array.isArray(x)) return x;
    if (Array.isArray(x?.data)) return x.data;
    return [];
}

function getAvailability(m) {
    const batches = Array.isArray(m.batches) ? m.batches : [];
    const totalQuantity = (m.quantity != null)
        ? Number(m.quantity)
        : batches.reduce((total, b) => total + (Number(b.quantity) || 0), 0);
    const isExpired = (m.is_expired != null)
        ? Boolean(m.is_expired)
        : (batches.length > 0 && batches.every(b => new Date(b.expiry_date) < new Date()));
    const isLowStock = (m.is_low_stock != null)
        ? Boolean(m.is_low_stock)
        : (totalQuantity > 0 && totalQuantity < 10);

    if (totalQuantity === 0) return { label: "Out of Stock", badge: "bg-danger",           qty: 0,            tagalog: "Wala nang stock." };
    if (isExpired)           return { label: "Expired",      badge: "bg-warning text-dark", qty: totalQuantity, tagalog: "Ang gamot ay expired na." };
    if (isLowStock)          return { label: "Low Stock",    badge: "bg-secondary",          qty: totalQuantity, tagalog: "Mababa na ang stock." };
    return                          { label: "Available",    badge: "bg-success",            qty: totalQuantity, tagalog: "Available ang gamot." };
}

function speakPageIntro() {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(
        "Ito ang listahan ng mga gamot. Pindutin ang speaker icon sa tabi ng gamot para marinig ang detalye."
    );
    u.lang = "fil-PH"; u.rate = 0.85;
    window.speechSynthesis.speak(u);
}

export default function BrowseMedicines() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState("");
    const [userRole, setUserRole] = useState("");

    async function load() {
        setLoading(true);
        try {
            const data = await apiFetch("/api/medicines");
            setItems(safeArr(data));
            const userData = await apiFetch("/api/user");
            setUserRole(userData.user.roles[0]?.name);
        } catch (e) {
            console.error("Failed to load medicines:", e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return items;
        return items.filter((m) => {
            const hay = [m.generic_name, m.brand_name, m.dosage_form, m.strength, m.unit, m.description]
                .filter(Boolean).join(" ").toLowerCase();
            return hay.includes(s);
        });
    }, [items, q]);

    async function onDelete(id) {
        if (!confirm("Delete this medicine?")) return;
        try {
            await apiFetch(`/api/medicines/${id}`, { method: "DELETE" });
            await load();
        } catch (e) {
            alert("Delete failed.");
        }
    }

    const isSenior = userRole === "senior-citizen";

    return (
        <div className="content">
            <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2">
                    <h4 className="page-title mb-0" style={{ fontSize: "1.4rem" }}>All Medicines</h4>
                    {/* Page-level audio for seniors */}
                    <button
                        type="button"
                        className="btn btn-outline-info btn-sm"
                        style={{ borderRadius: 999 }}
                        title="Pakinggan ang paliwanag"
                        onClick={speakPageIntro}
                    >
                        🔊 Pakinggan
                    </button>
                </div>
                {!isSenior && (
                    <Link className="btn btn-primary" to="/medicines/create">
                        Add Medicine
                    </Link>
                )}
            </div>

            <div className="card mb-3">
                <div className="card-body d-flex gap-2 align-items-center flex-wrap">
                    <input
                        className="form-control"
                        placeholder="Hanapin / Search medicine..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        style={{ maxWidth: 420, fontSize: "1.05rem" }}
                    />
                    <button className="btn btn-light" type="button" onClick={load}>Refresh</button>
                    {!isSenior && (
                        <>
                            <button className="btn btn-outline-secondary" type="button" onClick={() => navigate("/medicines/expired")}>Expired</button>
                            <button className="btn btn-outline-secondary" type="button" onClick={() => navigate("/medicines/outstock")}>Out of Stock</button>
                            <button className="btn btn-outline-secondary" type="button" onClick={() => navigate("/medicines/categories")}>Categories</button>
                        </>
                    )}
                </div>
            </div>

            <div className="card">
                <div className="card-body">
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-striped table-hover" style={{ fontSize: "1.05rem" }}>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Generic Name</th>
                                        <th>Brand Name</th>
                                        <th>Form</th>
                                        <th>Strength</th>
                                        <th>Availability</th>
                                        {!isSenior && <th>Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={isSenior ? 6 : 7}>No medicines found.</td>
                                        </tr>
                                    ) : (
                                        filtered.map((m) => {
                                            const avail = getAvailability(m);
                                            const ttsText = `${m.generic_name}. ${m.brand_name ? `Brand: ${m.brand_name}.` : ""} Katayuan: ${avail.tagalog} ${avail.qty > 0 ? `Mayroon ${avail.qty} piraso.` : ""}`;
                                            return (
                                                <tr key={m.id}>
                                                    <td>{m.id}</td>
                                                    <td>
                                                        <strong>{m.generic_name}</strong>
                                                        {/* Per-row audio button for senior accessibility */}
                                                        <TTSButton text={ttsText} className="ms-2" />
                                                    </td>
                                                    <td>{m.brand_name || <span className="text-muted">—</span>}</td>
                                                    <td>{m.dosage_form || <span className="text-muted">—</span>}</td>
                                                    <td>{m.strength || <span className="text-muted">—</span>}</td>
                                                    <td>
                                                        <span className={`badge ${avail.badge}`} style={{ fontSize: "0.9rem", padding: "6px 10px" }}>
                                                            {avail.label}
                                                        </span>
                                                        {avail.qty > 0 && avail.label !== "Expired" && (
                                                            <span className="ms-2 text-muted" style={{ fontSize: "0.85rem" }}>
                                                                ({avail.qty} {m.unit || "pcs"})
                                                            </span>
                                                        )}
                                                    </td>
                                                    {!isSenior && (
                                                        <td>
                                                            <div className="d-flex gap-2">
                                                                <Link className="btn btn-sm btn-outline-primary" to={`/medicines/${m.id}/edit`}>Edit</Link>
                                                                <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(m.id)}>Delete</button>
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
