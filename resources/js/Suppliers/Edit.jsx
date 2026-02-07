import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../utils/api"; // adjust path

export default function SuppliersEdit() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        company: "",
        address: "",
        product: "",
        comment: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState("");
    const [msg, setMsg] = useState("");

    const pageHeader = useMemo(() => (
        <div className="col-sm-12">
            <h3 className="page-title">Edit Supplier</h3>
            <ul className="breadcrumb">
                <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                <li className="breadcrumb-item active">Edit Supplier</li>
            </ul>
        </div>
    ), []);

    useEffect(() => {
        let alive = true;
        (async () => {
            setErr("");
            setLoading(true);
            try {
                const res = await apiFetch(`/api/suppliers/${id}`);
                const s = res.data || res.supplier || res;
                if (!alive) return;
                setForm({
                    name: s.name || "",
                    email: s.email || "",
                    phone: s.phone || "",
                    company: s.company || "",
                    address: s.address || "",
                    product: s.product || "",
                    comment: s.comment || "",
                });
            } catch (e) {
                if (alive) setErr(e.message || "Failed to load supplier");
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, [id]);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr(""); setMsg("");
        try {
            setSaving(true);
            await apiFetch(`/api/suppliers/${id}`, {
                method: "PUT",
                body: JSON.stringify(form),
            });
            setMsg("Supplier updated");
            navigate("/suppliers");
        } catch (e2) {
            setErr(e2.message || "Update failed");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <div className="row">{pageHeader}</div>
            </div>

            {err && <div className="alert alert-danger">{err}</div>}
            {msg && <div className="alert alert-success">{msg}</div>}

            <div className="row">
                <div className="col-sm-12">
                    <div className="card">
                        <div className="card-body custom-edit-service">
                            {loading ? (
                                <div>Loading...</div>
                            ) : (
                                <form onSubmit={onSubmit}>
                                    <div className="service-fields mb-3">
                                        <div className="row">
                                            <div className="col-lg-6">
                                                <div className="form-group">
                                                    <label>Name <span className="text-danger">*</span></label>
                                                    <input className="form-control" type="text" name="name" value={form.name} onChange={onChange} required />
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <label>Email <span className="text-danger">*</span></label>
                                                <input className="form-control" type="text" name="email" value={form.email} onChange={onChange} required />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="service-fields mb-3">
                                        <div className="row">
                                            <div className="col-lg-6">
                                                <div className="form-group">
                                                    <label>Phone <span className="text-danger">*</span></label>
                                                    <input className="form-control" type="text" name="phone" value={form.phone} onChange={onChange} required />
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <label>Company <span className="text-danger">*</span></label>
                                                <input className="form-control" type="text" name="company" value={form.company} onChange={onChange} required />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="service-fields mb-3">
                                        <div className="row">
                                            <div className="col-lg-6">
                                                <div className="form-group">
                                                    <label>Address <span className="text-danger">*</span></label>
                                                    <input className="form-control" type="text" name="address" value={form.address} onChange={onChange} required />
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <label>Product</label>
                                                <input className="form-control" type="text" name="product" value={form.product} onChange={onChange} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="service-fields mb-3">
                                        <div className="row">
                                            <div className="col-12">
                                                <label>Comment</label>
                                                <textarea className="form-control" name="comment" cols="30" rows="6" value={form.comment} onChange={onChange} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="submit-section">
                                        <button className="btn btn-success" type="submit" disabled={saving}>
                                            {saving ? "Saving..." : "Save"}
                                        </button>
                                        <Link to="/suppliers" className="btn btn-secondary ml-2">
                                            Cancel
                                        </Link>
                                    </div>

                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
