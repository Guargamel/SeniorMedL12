// resources/js/Purchases/Edit.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../utils/api";

export default function PurchasesEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [form, setForm] = useState({
    product: "",
    category: "",
    supplier: "",
    cost_price: "",
    quantity: "",
    expiry_date: "",
    image: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setErr("");
      setLoading(true);
      try {
        const [cRes, sRes, pRes] = await Promise.all([
          apiFetch("/api/categories"),
          apiFetch("/api/suppliers"),
          apiFetch(`/api/purchases/${id}`),
        ]);

        const cList = Array.isArray(cRes) ? cRes : (cRes.data || cRes.categories || []);
        const sList = Array.isArray(sRes) ? sRes : (sRes.data || sRes.suppliers || []);
        const purchase = pRes.data || pRes.purchase || pRes;

        if (!alive) return;
        setCategories(cList);
        setSuppliers(sList);

        setForm({
          product: purchase.product || "",
          category: String(purchase.category_id || purchase.category?.id || ""),
          supplier: String(purchase.supplier_id || purchase.supplier?.id || ""),
          cost_price: purchase.cost_price ?? "",
          quantity: purchase.quantity ?? "",
          expiry_date: (purchase.expiry_date || "").slice(0, 10),
          image: null,
        });
      } catch (e) {
        if (alive) setErr(e.message || "Failed to load purchase");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  const onChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") setForm((f) => ({ ...f, image: files?.[0] || null }));
    else setForm((f) => ({ ...f, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    const fd = new FormData();
    fd.append("product", form.product);
    fd.append("category", form.category);
    fd.append("supplier", form.supplier);
    fd.append("cost_price", form.cost_price);
    fd.append("quantity", form.quantity);
    fd.append("expiry_date", form.expiry_date);
    if (form.image) fd.append("image", form.image);
    fd.append("_method", "PUT");

    try {
      setSaving(true);
      await apiFetch(`/api/purchases/${id}`, { method: "POST", body: fd });
      navigate("/purchases");
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
            <h3 className="page-title">Edit Purchase</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
              <li className="breadcrumb-item active">Edit Purchase</li>
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
                <form onSubmit={submit} encType="multipart/form-data" autoComplete="off">
                  <div className="service-fields mb-3">
                    <div className="row">

                      <div className="col-lg-4">
                        <div className="form-group">
                          <label>Medicine Name<span className="text-danger">*</span></label>
                          <input className="form-control" type="text" name="product" value={form.product} onChange={onChange} required />
                        </div>
                      </div>

                      <div className="col-lg-4">
                        <div className="form-group">
                          <label>Category <span className="text-danger">*</span></label>
                          <select className="form-control" name="category" value={form.category} onChange={onChange} required>
                            {(Array.isArray(categories)?categories:[]).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="col-lg-4">
                        <div className="form-group">
                          <label>Supplier <span className="text-danger">*</span></label>
                          <select className="form-control" name="supplier" value={form.supplier} onChange={onChange} required>
                            {(Array.isArray(suppliers)?suppliers:[]).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                        </div>
                      </div>

                    </div>
                  </div>

                  <div className="service-fields mb-3">
                    <div className="row">
                      <div className="col-lg-4">
                        <div className="form-group">
                          <label>Purchase Cost<span className="text-danger">*</span></label>
                          <input className="form-control" type="number" step="0.01" name="cost_price" value={form.cost_price} onChange={onChange} required />
                        </div>
                      </div>
                      <div className="col-lg-4">
                        <div className="form-group">
                          <label>Quantity<span className="text-danger">*</span></label>
                          <input className="form-control" type="number" name="quantity" value={form.quantity} onChange={onChange} required />
                        </div>
                      </div>
                      <div className="col-lg-4">
                        <div className="form-group">
                          <label>Expire Date<span className="text-danger">*</span></label>
                          <input className="form-control" type="date" name="expiry_date" value={form.expiry_date} onChange={onChange} required />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="service-fields mb-3">
                    <div className="row">
                      <div className="col-lg-12">
                        <div className="form-group">
                          <label>Medicine Image</label>
                          <input className="form-control" type="file" name="image" accept="image/*" onChange={onChange} />
                          <small className="text-muted d-block mt-1">Leave empty to keep current image.</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="submit-section">
                    <button className="btn btn-success submit-btn" type="submit" disabled={saving}>
                      {saving ? "Saving..." : "Submit"}
                    </button>
                    <Link to="/purchases" className="btn btn-secondary ml-2">Cancel</Link>
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
