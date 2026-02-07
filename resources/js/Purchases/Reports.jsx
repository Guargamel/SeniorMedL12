// resources/js/Purchases/Reports.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../utils/api";
import Modal from "../components/Modal";

export default function PurchasesReport() {
  const [open, setOpen] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const pageHeader = useMemo(() => (
    <div className="row align-items-center">
      <div className="col-sm-7 col-auto">
        <h3 className="page-title">Purchases Reports</h3>
        <ul className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
          <li className="breadcrumb-item active">Generate Purchase Reports</li>
        </ul>
      </div>
      <div className="col-sm-5 col">
        <button type="button" className="btn btn-success float-right mt-2" onClick={() => setOpen(true)}>
          Generate Report
        </button>
      </div>
    </div>
  ), []);

  const generate = async () => {
    setErr("");
    setLoading(true);
    try {
      // Your old Blade posted to route('purchases.report').
      // In SPA, prefer an API endpoint. Adjust if your backend differs.
      const res = await apiFetch("/api/purchases/report", {
        method: "POST",
        body: JSON.stringify({ from_date: fromDate, to_date: toDate }),
      });

      const list = Array.isArray(res) ? res : (res.data || res.purchases || res.rows || []);
      setRows(list);
      setOpen(false);
    } catch (e) {
      setErr(e.message || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">{pageHeader}</div>

      {err && <div className="alert alert-danger">{err}</div>}

      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-body">
              {loading ? (
                <div>Generating...</div>
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
                      </tr>
                    </thead>
                    <tbody>
                      {rows.length === 0 ? (
                        <tr><td colSpan={6} className="text-center text-muted">No report data yet</td></tr>
                      ) : rows.map((p) => (
                        <tr key={p.id || `${p.product}-${p.expiry_date}-${p.quantity}`}>
                          <td>{p.product}</td>
                          <td>{p.category?.name || p.category_name || "-"}</td>
                          <td>{p.supplier?.name || p.supplier_name || "-"}</td>
                          <td>{p.cost_price ?? "-"}</td>
                          <td>{p.quantity ?? "-"}</td>
                          <td>{p.expiry_date || "-"}</td>
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

      <Modal
        open={open}
        title="Generate Purchase Report"
        onClose={() => setOpen(false)}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn btn-success" onClick={generate} disabled={!fromDate || !toDate || loading}>
              {loading ? "Generating..." : "Generate"}
            </button>
          </>
        }
      >
        <div className="row">
          <div className="col-6">
            <div className="form-group">
              <label>From</label>
              <input type="date" className="form-control" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
          </div>
          <div className="col-6">
            <div className="form-group">
              <label>To</label>
              <input type="date" className="form-control" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
