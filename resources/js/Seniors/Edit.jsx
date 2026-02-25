import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../utils/api";

export default function SeniorEdit() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [errors, setErrors] = useState({});
    const [bloodTypes, setBloodTypes] = useState([]);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",

        birthdate: "",
        sex: "Male",
        contact_no: "",
        barangay: "",
        address: "",
        notes: "",

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
                const list = Array.isArray(res) ? res : (res?.data ?? []);
                if (!alive) return;
                setBloodTypes(list);
            } catch (e) {
                console.error("Failed to load blood types:", e);
            }
        })();

        return () => {
            alive = false;
        };
    }, []);

    useEffect(() => {
        let alive = true;

        (async () => {
            setLoading(true);
            setErrors({});

            try {
                const res = await apiFetch(`/api/seniors/${id}`);

                const u = res?.senior || res?.data || res;
                const p = u?.senior_profile || u?.seniorProfile || u?.profile || {};

                if (!alive) return;

                setForm((prev) => ({
                    ...prev,
                    name: u?.name ?? "",
                    email: u?.email ?? "",
                    birthdate: p?.birthdate ?? "",
                    sex: p?.sex ?? "Male",
                    contact_no: p?.contact_no ?? "",
                    barangay: p?.barangay ?? "",
                    address: p?.address ?? "",
                    notes: p?.notes ?? "",

                    weight_kilos: p?.weight_kilos ?? "",
                    height_cm: p?.height_cm ?? "",
                    age: p?.age ?? "",
                    blood_pressure_systolic: p?.blood_pressure_systolic ?? "",
                    blood_pressure_diastolic: p?.blood_pressure_diastolic ?? "",
                    blood_type_id: p?.blood_type_id ?? "",

                    password: "",
                }));
            } catch (e) {
                if (!alive) return;
                setErrors({ general: [e?.message || "Failed to load senior"] });
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [id]);

    const submit = async (e) => {
        e.preventDefault();
        if (deleting) return;

        setSaving(true);
        setErrors({});

        try {
            const payload = { ...form };
            if (!payload.password) delete payload.password;

            await apiFetch(`/api/seniors/${id}`, {
                method: "PUT",
                body: JSON.stringify(payload),
            });

            navigate("/seniors");
        } catch (e2) {
            setErrors(
                e2?.data?.errors || { general: [e2?.message || "Failed to update senior"] }
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (saving) return;

        const ok = confirm(
            "Delete this senior? This will remove BOTH the user and the senior profile. This cannot be undone."
        );
        if (!ok) return;

        setDeleting(true);
        setErrors({});

        try {
            await apiFetch(`/api/seniors/${id}`, { method: "DELETE" });
            navigate("/seniors");
        } catch (e) {
            console.error("Delete failed:", e);
            setErrors(e?.data?.errors || { general: [e?.message || "Delete failed"] });
        } finally {
            setDeleting(false);
        }
    };

    if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

    const busy = saving || deleting;

    return (
        <div className="mc-card">
            <div className="mc-card-header">
                <h2 className="mc-card-title">Edit Senior</h2>
            </div>

            <div className="mc-card-body">
                {errors.general && <div className="alert alert-danger">{errors.general[0]}</div>}

                <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <Field
                            label="Full Name"
                            value={form.name}
                            onChange={(v) => set("name", v)}
                            error={err("name")}
                            disabled={busy}
                        />
                        <Field
                            label="Email"
                            value={form.email}
                            onChange={(v) => set("email", v)}
                            error={err("email")}
                            disabled={busy}
                        />
                    </div>

                    <Field
                        label="New Password (optional)"
                        type="password"
                        value={form.password}
                        onChange={(v) => set("password", v)}
                        error={err("password")}
                        disabled={busy}
                    />

                    <div style={{ borderTop: "1px solid var(--mc-border)", paddingTop: 12, marginTop: 6 }}>
                        <div style={{ fontWeight: 900, marginBottom: 8 }}>Senior Profile</div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                            <Field
                                label="Birthdate"
                                type="date"
                                value={form.birthdate}
                                onChange={(v) => set("birthdate", v)}
                                error={err("birthdate")}
                                disabled={busy}
                            />
                            <Select
                                label="Sex"
                                value={form.sex}
                                onChange={(v) => set("sex", v)}
                                options={["Male", "Female"]}
                                error={err("sex")}
                                disabled={busy}
                            />
                            <Field
                                label="Contact No."
                                value={form.contact_no}
                                onChange={(v) => set("contact_no", v)}
                                error={err("contact_no")}
                                disabled={busy}
                            />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <Field
                                label="Barangay"
                                value={form.barangay}
                                onChange={(v) => set("barangay", v)}
                                error={err("barangay")}
                                disabled={busy}
                            />
                            <Field
                                label="Address"
                                value={form.address}
                                onChange={(v) => set("address", v)}
                                error={err("address")}
                                disabled={busy}
                            />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 10 }}>
                            <Field label="Age" type="number" value={form.age} onChange={(v) => set("age", v)} error={err("age")} disabled={busy} />
                            <Field label="Height (cm)" type="number" value={form.height_cm} onChange={(v) => set("height_cm", v)} error={err("height_cm")} disabled={busy} />
                            <Field label="Weight (kg)" type="number" value={form.weight_kilos} onChange={(v) => set("weight_kilos", v)} error={err("weight_kilos")} disabled={busy} />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 10 }}>
                            <Field label="BP Systolic" type="number" value={form.blood_pressure_systolic} onChange={(v) => set("blood_pressure_systolic", v)} error={err("blood_pressure_systolic")} disabled={busy} />
                            <Field label="BP Diastolic" type="number" value={form.blood_pressure_diastolic} onChange={(v) => set("blood_pressure_diastolic", v)} error={err("blood_pressure_diastolic")} disabled={busy} />
                            <BloodTypeSelect
                                label="Blood Type"
                                value={form.blood_type_id}
                                onChange={(v) => set("blood_type_id", v)}
                                items={bloodTypes}
                                error={err("blood_type_id")}
                                disabled={busy}
                            />
                        </div>

                        <Textarea label="Notes" value={form.notes} onChange={(v) => set("notes", v)} error={err("notes")} disabled={busy} />
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                        <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)} disabled={busy}>
                            Cancel
                        </button>
                        <button disabled={busy} className="btn btn-success">
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>

                {/* ✅ Danger Zone block */}
                <div
                    style={{
                        marginTop: 18,
                        padding: 14,
                        borderRadius: 10,
                        border: "1px solid #e74c3c",
                        background: "rgba(231, 76, 60, 0.06)",
                    }}
                >
                    <div style={{ fontWeight: 900, marginBottom: 6, color: "#c0392b" }}>
                        Danger Zone
                    </div>
                    <div style={{ fontSize: 13, marginBottom: 10 }}>
                        Deleting will remove the <b>User</b> and the <b>Senior Profile</b>.
                        This cannot be undone.
                    </div>

                    <button
                        className="btn btn-outline-danger"
                        onClick={handleDelete}
                        disabled={busy}
                    >
                        {deleting ? "Deleting..." : "Delete Senior"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* --- small form helpers (self-contained) --- */

function Field({ label, error, type = "text", value, onChange, disabled }) {
    return (
        <div>
            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>{label}</div>
            <input
                className="form-control"
                type={type}
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
            />
            {error && <div style={{ color: "#c0392b", fontSize: 12, marginTop: 4 }}>{error}</div>}
        </div>
    );
}

function Textarea({ label, error, value, onChange, disabled }) {
    return (
        <div>
            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>{label}</div>
            <textarea
                className="form-control"
                rows={3}
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
            />
            {error && <div style={{ color: "#c0392b", fontSize: 12, marginTop: 4 }}>{error}</div>}
        </div>
    );
}

function Select({ label, error, value, onChange, options, disabled }) {
    return (
        <div>
            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>{label}</div>
            <select className="form-control" value={value ?? ""} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
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

function BloodTypeSelect({ label, error, value, onChange, items, disabled }) {
    return (
        <div>
            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>{label}</div>
            <select className="form-control" value={value ?? ""} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
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
