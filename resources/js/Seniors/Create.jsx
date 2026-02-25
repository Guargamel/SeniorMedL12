import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";

export default function SeniorCreate() {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [bloodTypes, setBloodTypes] = useState([]);

    const [form, setForm] = useState({
        // user fields
        name: "",
        email: "",
        password: "",

        // senior profile fields
        birthdate: "",
        sex: "Male",
        contact_no: "",
        barangay: "",
        address: "",
        notes: "",

        // NEW medical fields
        weight_kilos: "",
        height_cm: "",
        age: "",
        blood_pressure_systolic: "",
        blood_pressure_diastolic: "",
        blood_type_id: "",
    });

    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
    const err = (k) => (errors?.[k]?.[0] ? errors[k][0] : "");

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const res = await apiFetch("/api/blood-types");
                // accept common shapes: {data: []} or []
                const list = Array.isArray(res) ? res : (res?.data ?? []);
                if (!alive) return;
                setBloodTypes(list);
            } catch (e) {
                // if endpoint missing, keep dropdown empty but don't crash
                console.error("Failed to load blood types:", e);
            }
        })();
        return () => { alive = false; };
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        try {
            // send payload as-is; backend should persist into senior_profiles columns
            await apiFetch("/api/seniors", {
                method: "POST",
                body: JSON.stringify(form),
            });

            navigate("/seniors");
        } catch (e2) {
            setErrors(e2?.data?.errors || { general: [e2?.message || "Failed to register senior"] });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mc-card">
            <div className="mc-card-header">
                <h2 className="mc-card-title">Register Senior</h2>
            </div>

            <div className="mc-card-body">
                {errors.general && <div className="alert alert-danger">{errors.general[0]}</div>}

                <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <Field label="Full Name" value={form.name} onChange={(v) => set("name", v)} error={err("name")} />
                        <Field label="Email" value={form.email} onChange={(v) => set("email", v)} error={err("email")} />
                    </div>

                    <Field
                        label="Password"
                        type="password"
                        value={form.password}
                        onChange={(v) => set("password", v)}
                        error={err("password")}
                    />

                    <div style={{ borderTop: "1px solid var(--mc-border)", paddingTop: 12, marginTop: 6 }}>
                        <div style={{ fontWeight: 900, marginBottom: 8 }}>Senior Profile</div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                            <Field label="Birthdate" type="date" value={form.birthdate} onChange={(v) => set("birthdate", v)} error={err("birthdate")} />
                            <Select label="Sex" value={form.sex} onChange={(v) => set("sex", v)} options={["Male", "Female"]} error={err("sex")} />
                            <Field label="Contact No." value={form.contact_no} onChange={(v) => set("contact_no", v)} error={err("contact_no")} />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <Field label="Barangay" value={form.barangay} onChange={(v) => set("barangay", v)} error={err("barangay")} />
                            <Field label="Address" value={form.address} onChange={(v) => set("address", v)} error={err("address")} />
                        </div>

                        {/* NEW medical fields */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 10 }}>
                            <Field
                                label="Age"
                                type="number"
                                value={form.age}
                                onChange={(v) => set("age", v)}
                                error={err("age")}
                            />
                            <Field
                                label="Height (cm)"
                                type="number"
                                value={form.height_cm}
                                onChange={(v) => set("height_cm", v)}
                                error={err("height_cm")}
                            />
                            <Field
                                label="Weight (kg)"
                                type="number"
                                value={form.weight_kilos}
                                onChange={(v) => set("weight_kilos", v)}
                                error={err("weight_kilos")}
                            />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 10 }}>
                            <Field
                                label="BP Systolic"
                                type="number"
                                value={form.blood_pressure_systolic}
                                onChange={(v) => set("blood_pressure_systolic", v)}
                                error={err("blood_pressure_systolic")}
                            />
                            <Field
                                label="BP Diastolic"
                                type="number"
                                value={form.blood_pressure_diastolic}
                                onChange={(v) => set("blood_pressure_diastolic", v)}
                                error={err("blood_pressure_diastolic")}
                            />
                            <BloodTypeSelect
                                label="Blood Type"
                                value={form.blood_type_id}
                                onChange={(v) => set("blood_type_id", v)}
                                items={bloodTypes}
                                error={err("blood_type_id")}
                            />
                        </div>

                        <Textarea label="Notes" value={form.notes} onChange={(v) => set("notes", v)} error={err("notes")} />
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                        <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                            Cancel
                        </button>
                        <button disabled={saving} className="btn btn-success">
                            {saving ? "Saving..." : "Register"}
                        </button>
                    </div>
                </form>

                <div style={{ fontSize: 12, color: "var(--mc-muted)", marginTop: 10 }}>
                    This creates a <b>User</b> and assigns the <b>senior-citizen</b> role automatically.
                </div>
            </div>
        </div>
    );
}

function Field({ label, error, type = "text", value, onChange }) {
    return (
        <div>
            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>{label}</div>
            <input className="form-control" type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
            {error && <div style={{ color: "#c0392b", fontSize: 12, marginTop: 4 }}>{error}</div>}
        </div>
    );
}

function Textarea({ label, error, value, onChange }) {
    return (
        <div>
            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>{label}</div>
            <textarea className="form-control" rows={3} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
            {error && <div style={{ color: "#c0392b", fontSize: 12, marginTop: 4 }}>{error}</div>}
        </div>
    );
}

function Select({ label, error, value, onChange, options }) {
    return (
        <div>
            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>{label}</div>
            <select className="form-control" value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
                {options.map((o) => (
                    <option key={o} value={o}>
                        {o}
                    </option>
                ))}
            </select>
            {error && <div style={{ color: "#c0392b", fontSize: 12, marginTop: 4 }}>{error}</div>}
        </div>
    );
}

function BloodTypeSelect({ label, error, value, onChange, items }) {
    return (
        <div>
            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>{label}</div>
            <select className="form-control" value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
                <option value="">-- Select --</option>
                {(items || []).map((bt) => (
                    <option key={bt.id} value={bt.id}>
                        {bt.type}
                    </option>
                ))}
            </select>
            {error && <div style={{ color: "#c0392b", fontSize: 12, marginTop: 4 }}>{error}</div>}
        </div>
    );
}
