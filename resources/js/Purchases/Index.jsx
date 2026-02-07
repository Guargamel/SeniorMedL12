// resources/js/Purchases/Index.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";

export default function PurchasesIndex() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/purchases");
      const list = Array.isArray(res) ? res : (res.data || res.purchases || []);
      setItems(list);
    } catch (e) {
      setErr(e.message || "Failed to load purchases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((p) => {
      const product = (p.product || "").toLowerCase();
      const category = (p.category?.name || p.category_name || p.category || "").toLowerCase();
      const supplier = (p.supplier?.name || p.supplier_name || p.supplier || "").toLowerCase();
      return product.includes(s) || category.includes(s) || supplier.includes(s);
    });
  }, [items, q]);

  return (
    <div>
      <div className="page-header">
        <div className="row align-items-center">
          <div className="col-sm-7 col-auto">
            <h3 className="page-title">Purchase</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
              <li className="breadcrumb-item active">Purchase</li>
            </ul>
          </div>
          <div className="col-sm-5 col">
            <Link to="/purchases/create" className="btn btn-success float-right mt-2">Add New</Link>
          </div>
        </div>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}

      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <input
                  className="form-control"
                  style={{ maxWidth: 360 }}
                  placeholder="Search medicine/category/supplier..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                <Link className="btn btn-outline-secondary" to="/purchases/report">Reports</Link>
              </div>

              {loading ? (
                <div>Loading...</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover table-center mb-0">
                    <thead>
                      <tr>
                        <th>Medicine Name</th>
                        <th>Category</th>
                        <th>Supplier</th>
                        <th>Purchase Cost</th>
                        <th>Quantity</th>
                        <th>Expire Date</th>
                        <th className="action-btn">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr><td colSpan={7} className="text-center text-muted">No purchases found</td></tr>
                      ) : filtered.map((p) => (
                        <tr key={p.id}>
                          <td>{p.product}</td>
                          <td>{p.category?.name || p.category_name || "-"}</td>
                          <td>{p.supplier?.name || p.supplier_name || "-"}</td>
                          <td>{p.cost_price ?? "-"}</td>
                          <td>{p.quantity ?? "-"}</td>
                          <td>{p.expiry_date || "-"}</td>
                          <td>
                            <div className="actions">
                              <button
                                type="button"
                                className="btn btn-sm bg-success-light mr-2"
                                onClick={() => navigate(`/purchases/${p.id}/edit`)}
                              >
                                <i className="fe fe-pencil" /> Edit
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm bg-danger-light"
                                onClick={async () => {
                                  if (!confirm("Delete this purchase?")) return;
                                  try {
                                    await apiFetch(`/api/purchases/${p.id}`, { method: "DELETE" });
                                    await load();
                                  } catch (e) {
                                    alert(e.message || "Delete failed");
                                  }
                                }}
                              >
                                <i className="fe fe-trash" /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
