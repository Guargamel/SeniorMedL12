import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../utils/api";

export default function StaffEdit() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "staff",
    });

    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
    const err = (k) => (errors?.[k]?.[0] ? errors[k][0] : "");

    useEffect(() => {
        let alive = true;

        (async () => {
            setLoading(true);
            setErrors({});

            try {
                const res = await apiFetch(`/api/staff/${id}`);

                const u = res?.user; // 🔥 THIS IS THE FIX

                if (!u) throw new Error("Invalid response");

                if (!alive) return;

                setForm({
                    name: u.name ?? "",
                    email: u.email ?? "",
                    password: "",
                    role: u.roles?.[0]?.name ?? "staff",
                });

            } catch (e) {
                if (!alive) return;
                setErrors({ general: [e?.message || "Failed to load staff"] });
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => { alive = false; };
    }, [id]);


    const submit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        try {
            const payload = { ...form };
            if (!payload.password) delete payload.password;

            await apiFetch(`/api/staff/${id}`, { method: "PUT", body: JSON.stringify(payload) });
            navigate("/users");
        } catch (e2) {
            setErrors(e2?.data?.errors || { general: [e2?.message || "Failed to update staff"] });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

    return (
        <div className="mc-card">
            <div className="mc-card-header">
                <h2 className="mc-card-title">Edit Staff</h2>
            </div>

            <div className="mc-card-body">
                {errors.general && <div className="alert alert-danger">{errors.general[0]}</div>}

                <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
                    <Field label="Full Name" value={form.name} onChange={(v) => set("name", v)} error={err("name")} />
                    <Field label="Email" value={form.email} onChange={(v) => set("email", v)} error={err("email")} />
                    <Field label="New Password (optional)" type="password" value={form.password} onChange={(v) => set("password", v)} error={err("password")} />

                    <div>
                        <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>Role</div>
                        <select className="form-control" value={form.role} onChange={(e) => set("role", e.target.value)}>
                            <option value="staff">staff</option>
                            <option value="super-admin">super-admin</option>
                        </select>
                        {err("role") && <div style={{ color: "#c0392b", fontSize: 12, marginTop: 4 }}>{err("role")}</div>}
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                        <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                            Cancel
                        </button>
                        <button disabled={saving} className="btn btn-success">
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Field({ label, error, type = "text", value, onChange }) {
    return (
        <div>
            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>{label}</div>
            <input className="form-control" type={type} value={value} onChange={(e) => onChange(e.target.value)} />
            {error && <div style={{ color: "#c0392b", fontSize: 12, marginTop: 4 }}>{error}</div>}
        </div>
    );
}
