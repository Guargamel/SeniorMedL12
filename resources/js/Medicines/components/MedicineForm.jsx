import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/api";

const emptyModel = {
    generic_name: "",
    brand_name: "",
    dosage_form: "",
    strength: "",
    category_id: "",
    unit: "",
    description: "",
    is_active: true,  // Default to true for active medicine
    expiry_date: "",
    quantity: 0,
    picture: null,
};

function toDateInputValue(value) {
    if (!value) return "";
    // Accept ISO datetime strings; keep only YYYY-MM-DD
    const m = String(value).match(/^\d{4}-\d{2}-\d{2}/);
    return m ? m[0] : "";
}

export default function MedicineForm({
    mode = "create", // "create" | "edit"
    id = null,
    backTo = "/medicines",
}) {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(mode === "edit");
    const [errors, setErrors] = useState({});
    const [categories, setCategories] = useState([]);
    const [model, setModel] = useState(emptyModel);

    const title = useMemo(() => {
        return mode === "edit" ? "Edit Medicine" : "Add Medicine";
    }, [mode]);

    useEffect(() => {
        let cancelled = false;

        async function loadCategories() {
            try {
                const data = await apiFetch("/api/medicine-categories");
                if (!cancelled) setCategories(Array.isArray(data) ? data : (data.data ?? []));
            } catch (e) {
                console.error("Failed to load categories:", e);
            }
        }

        async function loadMedicine() {
            if (mode !== "edit" || !id) return;
            setLoading(true);
            try {
                const data = await apiFetch(`/api/medicines/${id}`);
                const src = data?.data ?? data;
                if (!cancelled) {
                    setModel((prev) => ({
                        ...prev,
                        ...src,
                        category_id: src?.category_id ?? "",
                        is_active: src?.is_active ?? true,  // Ensure it's true/false
                        expiry_date: toDateInputValue(src?.expiry_date),
                        quantity: Number(src?.quantity ?? 0),
                        picture: null, // upload only when chosen
                    }));
                }
            } catch (e) {
                console.error("Failed to load medicine:", e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadCategories();
        loadMedicine();

        return () => {
            cancelled = true;
        };
    }, [mode, id]);

    function onChange(e) {
        const { name, type, value, checked, files } = e.target;

        if (type === "checkbox") {
            // Ensure `is_active` is a boolean
            setModel((m) => ({ ...m, [name]: checked }));
            return;
        }

        if (type === "file") {
            setModel((m) => ({ ...m, [name]: files?.[0] ?? null }));
            return;
        }

        setModel((m) => ({ ...m, [name]: value }));
    }

    async function onSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        // Log the form data to ensure `is_active` is boolean
        console.log("Form Data being submitted:", model);

        try {
            const form = new FormData();
            Object.entries(model).forEach(([k, v]) => {
                // Skip undefined or null values
                if (v === null || typeof v === "undefined") return;
                if (k === "category_id" && (v === "" || v === null)) return;
                form.append(k, v);  // Append form data, including `is_active`
            });

            const url = mode === "edit" ? `/api/medicines/${id}` : "/api/medicines";
            // Laravel expects PUT/PATCH for updates; using POST + _method works with multipart
            if (mode === "edit") form.append("_method", "PUT");

            await apiFetch(url, {
                method: "POST",
                body: form,
            });

            navigate(backTo);
        } catch (err) {
            const payload = err?.payload;
            if (payload?.errors) setErrors(payload.errors);
            console.error("Save failed:", err);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="content">
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h4 className="page-title mb-0">{title}</h4>
                <button className="btn btn-light" type="button" onClick={() => navigate(backTo)}>
                    Back
                </button>
            </div>

            <div className="card">
                <div className="card-body">
                    <form onSubmit={onSubmit} encType="multipart/form-data">
                        <div className="row">
                            {/* Generic Name */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Generic Name</label>
                                <input
                                    className="form-control"
                                    name="generic_name"
                                    value={model.generic_name || ""}
                                    onChange={onChange}
                                    required
                                />
                                {errors.generic_name ? <div className="text-danger small">{errors.generic_name[0]}</div> : null}
                            </div>

                            {/* Brand Name */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Brand Name</label>
                                <input
                                    className="form-control"
                                    name="brand_name"
                                    value={model.brand_name || ""}
                                    onChange={onChange}
                                />
                                {errors.brand_name ? <div className="text-danger small">{errors.brand_name[0]}</div> : null}
                            </div>

                            {/* Dosage Form */}
                            <div className="col-md-4 mb-3">
                                <label className="form-label">Dosage Form</label>
                                <input
                                    className="form-control"
                                    name="dosage_form"
                                    value={model.dosage_form || ""}
                                    onChange={onChange}
                                    placeholder="tablet, syrup, capsule..."
                                />
                                {errors.dosage_form ? <div className="text-danger small">{errors.dosage_form[0]}</div> : null}
                            </div>

                            {/* Strength */}
                            <div className="col-md-4 mb-3">
                                <label className="form-label">Strength</label>
                                <input
                                    className="form-control"
                                    name="strength"
                                    value={model.strength || ""}
                                    onChange={onChange}
                                    placeholder="e.g., 500mg"
                                />
                                {errors.strength ? <div className="text-danger small">{errors.strength[0]}</div> : null}
                            </div>

                            {/* Unit */}
                            <div className="col-md-4 mb-3">
                                <label className="form-label">Unit</label>
                                <input
                                    className="form-control"
                                    name="unit"
                                    value={model.unit || ""}
                                    onChange={onChange}
                                    placeholder="box, bottle, pcs..."
                                />
                                {errors.unit ? <div className="text-danger small">{errors.unit[0]}</div> : null}
                            </div>

                            {/* Category */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Category</label>
                                <select
                                    className="form-select"
                                    name="category_id"
                                    value={model.category_id ?? ""}
                                    onChange={onChange}
                                >
                                    <option value="">-- Select --</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name ?? c.title ?? c.category_name ?? `Category #${c.id}`}
                                        </option>
                                    ))}
                                </select>
                                {errors.category_id ? <div className="text-danger small">{errors.category_id[0]}</div> : null}
                            </div>

                            {/* Description */}
                            <div className="col-md-12 mb-3">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-control"
                                    name="description"
                                    value={model.description || ""}
                                    onChange={onChange}
                                    rows={3}
                                />
                                {errors.description ? <div className="text-danger small">{errors.description[0]}</div> : null}
                            </div>

                            {/* Picture */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Picture (optional)</label>
                                <input className="form-control" type="file" name="picture" accept="image/*" onChange={onChange} />
                                {errors.picture ? <div className="text-danger small">{errors.picture[0]}</div> : null}
                            </div>

                            {/* Active Status */}
                            <div className="col-md-6 mb-3 d-flex align-items-center gap-2">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    name="is_active"
                                    checked={!!model.is_active}  // Ensuring it's true or false
                                    onChange={onChange}
                                    id="is_active"
                                />
                                <label className="form-check-label" htmlFor="is_active">
                                    Active
                                </label>
                                {errors.is_active ? <div className="text-danger small ms-2">{errors.is_active[0]}</div> : null}
                            </div>

                        </div>

                        <button className="btn btn-primary" type="submit" disabled={saving}>
                            {saving ? "Saving..." : "Save Medicine"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
