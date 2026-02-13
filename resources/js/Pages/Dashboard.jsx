// resources/js/Pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import "../../css/mc-dashboard.css";

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalSeniors: 256,
        appUsers: 189,
        medicines: 45,
        todayDistributions: 23,
    });

    const [recentDistributions, setRecentDistributions] = useState([
        { id: 1, time: "10:30 AM", name: "Juan Dela Cruz", medicine: "Metformin 500mg", quantity: "30 tabs" },
        { id: 2, time: "10:15 AM", name: "Maria Santos", medicine: "Losartan 50mg", quantity: "30 tabs" },
        { id: 3, time: "09:45 AM", name: "Pedro Reyes", medicine: "Amlodipine 10mg", quantity: "30 tabs" },
        { id: 4, time: "09:30 AM", name: "Rosa Garcia", medicine: "Aspirin 80mg", quantity: "30 tabs" },
    ]);

    const [alerts] = useState([
        { id: 1, type: "danger", icon: "⚠️", title: "Low Stock", message: "Losartan 50mg - Only 15 tablets" },
        { id: 2, type: "warning", icon: "⏰", title: "Expiring Soon", message: "Aspirin 80mg expires in 30 days" },
        { id: 3, type: "warning", icon: "📌", title: "Upcoming Pickups", message: "45 seniors scheduled this week" },
    ]);

    useEffect(() => {
        // Later you can fetch real stats:
        // apiFetch("/api/dashboard/stats").then(setStats);
    }, []);

    const quickActions = [
        { icon: "➕", title: "Register Senior", description: "Add new senior citizen", action: "register" },
        { icon: "📦", title: "Record Stock", description: "Update inventory", action: "stock" },
        { icon: "💊", title: "Process Distribution", description: "Dispense medicine", action: "distribute" },
        { icon: "🔔", title: "Send Notification", description: "Alert mobile users", action: "notify" },
        { icon: "📊", title: "Generate Report", description: "View analytics", action: "report" },
        { icon: "👁️", title: "View Alerts", description: "Check warnings", action: "alerts" },
    ];

    return (
        <div className="dashboard-page">
            {/* Alerts */}
            <div className="alert alert-warning">
                <div className="alert-icon">⚠️</div>
                <div className="alert-content">
                    <h4>Low Stock Alert</h4>
                    <p>Losartan 50mg and Aspirin 80mg are running low. Consider restocking soon.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card animate-in">
                    <div className="stat-header">
                        <div className="stat-label">TOTAL SENIORS</div>
                        <div className="stat-icon">👥</div>
                    </div>
                    <div className="stat-value">{stats.totalSeniors}</div>
                    <div className="stat-change">↑ 12 this month</div>
                </div>

                <div className="stat-card animate-in">
                    <div className="stat-header">
                        <div className="stat-label">APP USERS</div>
                        <div className="stat-icon">📱</div>
                    </div>
                    <div className="stat-value">{stats.appUsers}</div>
                    <div className="stat-change">↑ 73% adoption</div>
                </div>

                <div className="stat-card animate-in">
                    <div className="stat-header">
                        <div className="stat-label">MEDICINES</div>
                        <div className="stat-icon">💊</div>
                    </div>
                    <div className="stat-value">{stats.medicines}</div>
                    <div className="stat-change">8 types in stock</div>
                </div>

                <div className="stat-card animate-in">
                    <div className="stat-header">
                        <div className="stat-label">TODAY'S DIST.</div>
                        <div className="stat-icon">📋</div>
                    </div>
                    <div className="stat-value">{stats.todayDistributions}</div>
                    <div className="stat-change">↑ vs yesterday</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Quick Actions</h2>
                </div>

                <div className="quick-actions">
                    {quickActions.map((a, i) => (
                        <div key={i} className="quick-action">
                            <div className="quick-action-icon">{a.icon}</div>
                            <div className="quick-action-content">
                                <h3>{a.title}</h3>
                                <p>{a.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid-2">
                {/* Recent Distributions */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Recent Distributions</h2>
                        <button className="btn btn-secondary btn-sm">View All</button>
                    </div>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Senior Citizen</th>
                                    <th>Medicine</th>
                                    <th>Quantity</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentDistributions.map((dist) => (
                                    <tr key={dist.id}>
                                        <td>{dist.time}</td>
                                        <td><strong>{dist.name}</strong></td>
                                        <td>{dist.medicine}</td>
                                        <td>{dist.quantity}</td>
                                        <td><span className="badge badge-success">✓ Completed</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Alerts */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Critical Alerts</h2>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {alerts.map((a) => (
                            <div key={a.id} className={`alert alert-${a.type}`} style={{ margin: 0 }}>
                                <div className="alert-icon">{a.icon}</div>
                                <div className="alert-content">
                                    <h4>{a.title}</h4>
                                    <p>{a.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
