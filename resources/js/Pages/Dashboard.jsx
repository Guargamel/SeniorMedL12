import React from "react";
import "../../css/mc-dashboard.css";

import useDashboard from "../Hooks/useDashboard";
import AlertBanner from "../Components/Dashboard/AlertBanner";
import StatsGrid from "../Components/Dashboard/StatsGrid";
import QuickActions from "../Components/Dashboard/QuickActions";
import RecentDistributions from "../Components/Dashboard/RecentDistributions";
import AlertsPanel from "../Components/Dashboard/AlertsPanel";

export default function Dashboard() {
    const { loading, summary, alerts, recentDistributions } = useDashboard();

    if (loading) return <div style={{ padding: 20 }}>Loading dashboard...</div>;

    return (
        <div className="mc-content">
            <AlertBanner alerts={alerts} />
            <StatsGrid summary={summary} />
            <QuickActions />

            <div className="mc-grid2">
                <RecentDistributions rows={recentDistributions} />
                <AlertsPanel alerts={alerts} />
            </div>
        </div>
    );
}
