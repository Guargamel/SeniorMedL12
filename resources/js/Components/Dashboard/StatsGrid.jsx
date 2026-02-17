import React from "react";

export default function StatsGrid({ summary }) {
    const items = [
        { label: "TOTAL SENIORS", value: summary.totalSeniors, icon: "👥", chip: "this month" },
        { label: "APP USERS", value: summary.appUsers, icon: "📱", chip: "active" },
        { label: "MEDICINES", value: summary.medicines, icon: "💊", chip: "types" },
        { label: "TODAY'S DIST.", value: summary.todayDistributions, icon: "📋", chip: "today" },
    ];

    return (
        <div className="mc-stats">
            {items.map((x, i) => (
                <div key={i} className="mc-stat">
                    <div className="mc-stat-top">
                        <div className="mc-stat-label">{x.label}</div>
                        <div style={{ fontSize: 18 }}>{x.icon}</div>
                    </div>
                    <div className="mc-stat-value">{x.value}</div>
                    <div className="mc-stat-chip">{x.chip}</div>
                </div>
            ))}
        </div>
    );
}
