import React, { useEffect, useState } from "react";

export default function DashboardCards() {
    const [stats, setStats] = useState({
        today_sales: 0,
        total_categories: 0,
        total_expired_products: 0,
        total_users: 0,
        user_name: "",
        currency: "₱",
    });

    const [recentSales, setRecentSales] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/dashboard", {
                    headers: { Accept: "application/json" },
                    credentials: "include",
                });

                if (!res.ok) {
                    console.error("Dashboard API failed:", res.status);
                    return;
                }

                const data = await res.json();
                setStats(data.stats ?? stats);
                setRecentSales(data.recent_sales ?? []);
            } catch (error) {
                console.error("Dashboard load error:", error);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            {/* PAGE HEADER */}
            <div className="col-sm-12">
                <h3 className="page-title">Welcome {stats.user_name || "Admin"}!</h3>
                <ul className="breadcrumb">
                    <li className="breadcrumb-item active">Dashboard</li>
                </ul>
            </div>

            {/* DASHBOARD CARDS */}
            <div className="row">
                <div className="col-xl-3 col-sm-6 col-12">
                    <div className="card">
                        <div className="card-body">
                            <div className="dash-widget-header">
                                <span className="dash-widget-icon text-success border-success">
                                    <i className="fe fe-money" />
                                </span>
                                <div className="dash-count">
                                    <h3>
                                        {stats.currency} {stats.today_sales}
                                    </h3>
                                </div>
                            </div>
                            <div className="dash-widget-info">
                                <h6 className="text-muted">Today's Arrival</h6>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-sm-6 col-12">
                    <div className="card">
                        <div className="card-body">
                            <div className="dash-widget-header">
                                <span className="dash-widget-icon text-info">
                                    <i className="fa fa-th-large" />
                                </span>
                                <div className="dash-count">
                                    <h3>{stats.total_categories}</h3>
                                </div>
                            </div>
                            <div className="dash-widget-info">
                                <h6 className="text-muted">Available Categories</h6>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-sm-6 col-12">
                    <div className="card">
                        <div className="card-body">
                            <div className="dash-widget-header">
                                <span className="dash-widget-icon text-danger border-danger">
                                    <i className="fe fe-folder" />
                                </span>
                                <div className="dash-count">
                                    <h3>{stats.total_expired_products}</h3>
                                </div>
                            </div>
                            <div className="dash-widget-info">
                                <h6 className="text-muted">Expired Medicines</h6>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-sm-6 col-12">
                    <div className="card">
                        <div className="card-body">
                            <div className="dash-widget-header">
                                <span className="dash-widget-icon text-warning border-warning">
                                    <i className="fe fe-users" />
                                </span>
                                <div className="dash-count">
                                    <h3>{stats.total_users}</h3>
                                </div>
                            </div>
                            <div className="dash-widget-info">
                                <h6 className="text-muted">System Users</h6>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RECENT SALES TABLE */}
            <div className="row">
                <div className="col-md-12 col-lg-7">
                    <div className="card card-table p-3">
                        <div className="card-header">
                            <h4 className="card-title">Recent Sales List</h4>
                        </div>

                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-hover table-center mb-0">
                                    <thead>
                                        <tr>
                                            <th>Medicine</th>
                                            <th>Quantity</th>
                                            <th>Total Price</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {recentSales.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="text-center text-muted">
                                                    No recent sales
                                                </td>
                                            </tr>
                                        ) : (
                                            safeArray(recentSales).map((sale, index) => (
                                                <tr key={index}>
                                                    <td>{sale.medicine}</td>
                                                    <td>{sale.quantity}</td>
                                                    <td>{sale.total_price}</td>
                                                    <td>{sale.date}</td>
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
        </>
    );
}
