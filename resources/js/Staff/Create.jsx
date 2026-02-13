import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";

export default function StaffCreate() {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "staff", // default
    });

    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
    const err = (k) => (errors?.[k]?.[0] ? errors[k][0] : "");

    const submit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        try {
            await apiFetch("/api/staff", { method: "POST", body: JSON.stringify(form) });
            navigate("/users");
        } catch (e2) {
            setErrors(e2?.data?.errors || { general: [e2?.message || "Failed to create staff"] });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mc-card">
            <div className="mc-card-header">
                <h2 className="mc-card-title">Add Staff</h2>
            </div>

            <div className="mc-card-body">
                {errors.general && <div className="alert alert-danger">{errors.general[0]}</div>}

                <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
                    <Field label="Full Name" value={form.name} onChange={(v) => set("name", v)} error={err("name")} />
                    <Field label="Email" value={form.email} onChange={(v) => set("email", v)} error={err("email")} />
                    <Field label="Password" type="password" value={form.password} onChange={(v) => set("password", v)} error={err("password")} />

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
                            {saving ? "Saving..." : "Create"}
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
