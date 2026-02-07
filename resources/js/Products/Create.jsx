// resources/js/Products/Create.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";

export default function ProductsCreate() {
  const navigate = useNavigate();

  const [purchases, setPurchases] = useState([]);
  const [form, setForm] = useState({ product: "", price: "", discount: "0", description: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setErr("");
      setLoading(true);
      try {
        const res = await apiFetch("/api/purchases");
        const list = Array.isArray(res) ? res : (res.data || res.purchases || []);
        if (!alive) return;
        setPurchases(list);
        if (list.length && !form.product) {
          setForm((f) => ({ ...f, product: String(list[0].id) }));
        }
      } catch (e) {
        if (alive) setErr(e.message || "Failed to load purchases");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      setSaving(true);
      await apiFetch("/api/products", { method: "POST", body: JSON.stringify(form) });
      navigate("/products");
    } catch (e2) {
      setErr(e2.message || "Create failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="row">
          <div className="col-sm-12">
            <h3 className="page-title">Add Product</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
              <li className="breadcrumb-item active">Add Product</li>
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
                            {purchases.map((p) => (
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
