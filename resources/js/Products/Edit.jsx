// resources/js/Products/Edit.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../utils/api";

export default function ProductsEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [purchases, setPurchases] = useState([]);
  const [form, setForm] = useState({ product: "", price: "", discount: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setErr("");
      setLoading(true);
      try {
        const [pRes, prodRes] = await Promise.all([
          apiFetch("/api/purchases"),
          apiFetch(`/api/products/${id}`),
        ]);
        const pList = Array.isArray(pRes) ? pRes : (pRes.data || pRes.purchases || []);
        const prod = prodRes.data || prodRes.product || prodRes;

        if (!alive) return;
        setPurchases(pList);
        setForm({
          product: String(prod.purchase_id || prod.product_id || prod.product || prod.purchase?.id || ""),
          price: prod.price ?? "",
          discount: prod.discount ?? "",
          description: prod.description ?? "",
        });
      } catch (e) {
        if (alive) setErr(e.message || "Failed to load product");
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

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      setSaving(true);
      await apiFetch(`/api/products/${id}`, { method: "PUT", body: JSON.stringify(form) });
      navigate("/products");
    } catch (e2) {
      setErr(e2.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="row">
          <div className="col-sm-12">
            <h3 className="page-title">Edit Product</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
              <li className="breadcrumb-item active">Edit Product</li>
            </ul>
          </div>
        </div>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}

      <div className="row">
        <div className="col-sm-12">
          <div className="card">
            <div className="card-body custom-edit-service">
              {loading ? (
                <div>Loading...</div>
              ) : (
                <form onSubmit={submit}>
                  <div className="service-fields mb-3">
                    <div className="row">
                      <div className="col-lg-12">
                        <div className="form-group">
                          <label>Product <span className="text-danger">*</span></label>
                          <select className="form-control" name="product" value={form.product} onChange={onChange} required>
                            {(Array.isArray(purchases)?purchases:[]).map((p) => (
                              <option key={p.id} value={p.id}>{p.product}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="service-fields mb-3">
                    <div className="row">
                      <div className="col-lg-6">
                        <div className="form-group">
                          <label>Selling Price<span className="text-danger">*</span></label>
                          <input className="form-control" type="text" name="price" value={form.price} onChange={onChange} required />
                        </div>
                      </div>

                      <div className="col-lg-6">
                        <div className="form-group">
                          <label>Margin (%)<span className="text-danger">*</span></label>
                          <input className="form-control" type="text" name="discount" value={form.discount} onChange={onChange} required />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="service-fields mb-3">
                    <div className="row">
                      <div className="col-lg-12">
                        <div className="form-group">
                          <label>Descriptions <span className="text-danger">*</span></label>
                          <textarea className="form-control service-desc" name="description" value={form.description} onChange={onChange} required />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="submit-section">
                    <button className="btn btn-success submit-btn" type="submit" disabled={saving}>
                      {saving ? "Saving..." : "Submit"}
                    </button>
                    <Link to="/products" className="btn btn-secondary ml-2">Cancel</Link>
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
