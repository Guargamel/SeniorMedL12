import React, { useState } from "react";
import { Link } from "react-router-dom";

/**
 * Blade: resources/views/admin/sales/reports.blade.php
 *
 * Expected API (adjust to your backend):
 *   GET /api/sales/report?from=YYYY-MM-DD&to=YYYY-MM-DD
 *     -> { data: SaleRow[] } OR SaleRow[]
 * SaleRow: { id, product, quantity, total_price, date, image_url? }
 */
export default function SalesReports() {
    const pageHeader = (
        <>
            <div className="col-sm-7 col-auto">
                <h3 className="page-title">Sales Reports</h3>
                <ul className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                    <li className="breadcrumb-item active">Generate Sales Reports</li>
                </ul>
            </div>
            <div className="col-sm-5 col">
                <button
                    type="button"
                    className="btn btn-success float-right mt-2"
                    data-toggle="modal"
                    data-target="#generate_report"
                    onClick={() => setModalOpen(true)}
                >
                    Generate Report
                </button>
            </div>
        </>
    );

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [rows, setRows] = useState([]);
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const runReport = async (e) => {
        e.preventDefault();
        setErr("");

        if (!fromDate || !toDate) {
            setErr("Please pick both From and To dates.");
            return;
        }

        setLoading(true);
        try {
            const qs = new URLSearchParams({ from: fromDate, to: toDate }).toString();
            const data = await apiFetch(`/api/sales/report?${qs}`);
            const list = Array.isArray(data) ? data : (data?.data || []);
            setRows(list);
            setModalOpen(false);
        } catch (e2) {
            setErr(e2.message || "Failed to generate report");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    {err && <div className="alert alert-danger">{err}</div>}

                    <div className="card">
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-hover table-center mb-0">
                                    <thead>
                                        <tr>
                                            <th>Medicine Name</th>
                                            <th>Quantity</th>
                                            <th>Total Price</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan={4}>Loading...</td></tr>
                                        ) : rows.length === 0 ? (
                                            <tr><td colSpan={4}>No report data yet. Click “Generate Report in Purchase Report”.</td></tr>
                                        ) : (
                                            rows.map((r) => (
                                                <tr key={r.id ?? `${r.product}-${r.date}-${r.quantity}`}>
                                                    <td>
                                                        {r.product}
                                                        {r.image_url && (
                                                            <span className="avatar avatar-sm mr-2">
                                                                <img className="avatar-img" src={r.image_url} alt="image" />
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td>{r.quantity}</td>
                                                    <td>{r.total_price}</td>
                                                    <td>{r.date}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Simple React modal (no jQuery required) */}
            {modalOpen && (
                <div className="modal fade show" style={{ display: "block" }} role="dialog" aria-modal="true">
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Generate Report</h5>
                                <button type="button" className="close" aria-label="Close" onClick={() => setModalOpen(false)}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>

                            <div className="modal-body">
                                <form onSubmit={runReport}>
                                    <div className="row form-row">
                                        <div className="col-12">
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
                                        </div>
                                    </div>

                                    <button type="submit" className="btn btn-success btn-block" disabled={loading}>
                                        {loading ? "Submitting..." : "Submit"}
                                    </button>
                                </form>
                            </div>

                        </div>
                    </div>

                    {/* Backdrop */}
                    <div className="modal-backdrop fade show" onClick={() => setModalOpen(false)}></div>
                </div>
            )}
        </>
    );
}
