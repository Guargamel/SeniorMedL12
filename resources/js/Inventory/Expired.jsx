// resources/js/Products/Expired.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch, normalizeList, safeArray } from "../utils/api";

export default function ExpiredProducts() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/products/expired");
      const list = normalizeList(res, ["products"]);
            setItems(list);
    } catch (e) {
      setErr(e.message || "Failed to load expired products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return safeArray(items);
    return safeArray(items).filter((p) => ((p.product || p.name || "").toLowerCase().includes(s)));
  }, [items, q]);

  return (
    <div>
      <div className="page-header">
        <div className="row">
          <div className="col-sm-12">
            <h3 className="page-title">Expired</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/products">Products</Link></li>
              <li className="breadcrumb-item active">Expired</li>
            </ul>
          </div>
        </div>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}

      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <input className="form-control" style={{ maxWidth: 360 }} placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
                <Link className="btn btn-outline-secondary" to="/products">Back</Link>
              </div>

              {loading ? (
                <div>Loading...</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover table-center mb-0">
                    <thead>
                      <tr>
                        <th>Brand Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Discount</th>
                        <th>Expire</th>
                        <th className="action-btn">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {safeArray(filtered).length === 0 ? (
                        <tr><td colSpan={7} className="text-center text-muted">No expired products</td></tr>
                      ) : safeArray(filtered).map((p) => (
                        <tr key={p.id}>
                          <td>{p.product || p.name || "-"}</td>
                          <td>{p.category || p.category_name || "-"}</td>
                          <td>{p.price ?? "-"}</td>
                          <td>{p.quantity ?? "-"}</td>
                          <td>{p.discount ?? "-"}</td>
                          <td>{p.expiry_date || "-"}</td>
                          <td>
                            <button className="btn btn-sm bg-success-light mr-2" type="button" onClick={() => navigate(`/products/${p.id}/edit`)}>
                              <i className="fe fe-pencil" /> Edit
                            </button>
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