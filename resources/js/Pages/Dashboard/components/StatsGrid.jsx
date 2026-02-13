import React from "react";

export default function StatsGrid({ stats }) {
    return (
        <div className="mc-stats">
            <Stat label="TOTAL SENIORS" icon="👥" value={stats.totalSeniors} chip="↑ 12 this month" />
            <Stat label="APP USERS" icon="📱" value={stats.appUsers} chip="↑ 73% adoption" />
            <Stat label="MEDICINES" icon="💊" value={stats.medicines} chip="8 types in stock" />
            <Stat label="TODAY'S DIST." icon="📋" value={stats.todayDistributions} chip="↑ vs yesterday" />
        </div>
    );
}

function Stat({ label, icon, value, chip }) {
    return (
        <div className="mc-stat">
            <div className="mc-stat-top">
                <div className="mc-stat-label">{label}</div>
                <div>{icon}</div>
            </div>
            <div className="mc-stat-value">{value}</div>
            <div className="mc-stat-chip">{chip}</div>
        </div>
    );
}
