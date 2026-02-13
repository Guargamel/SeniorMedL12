import React, { useEffect, useState } from "react";
import "../../../css/mc-dashboard.css";

import AlertBanner from "./components/AlertBanner";
import StatsGrid from "./components/StatsGrid";
import QuickActions from "./components/QuickActions";
import RecentDistributions from "./components/RecentDistributions";
import CriticalAlerts from "./components/CriticalAlerts";

export default function Dashboard() {
    const [stats] = useState({
        totalSeniors: 256,
        appUsers: 189,
        medicines: 45,
        todayDistributions: 23,
    });

    const [recentDistributions] = useState([
        { id: 1, time: "10:30 AM", name: "Juan Dela Cruz", medicine: "Metformin 500mg", quantity: "30 tabs" },
        { id: 2, time: "10:15 AM", name: "Maria Santos", medicine: "Losartan 50mg", quantity: "30 tabs" },
        { id: 3, time: "09:45 AM", name: "Pedro Reyes", medicine: "Amlodipine 10mg", quantity: "30 tabs" },
        { id: 4, time: "09:30 AM", name: "Rosa Garcia", medicine: "Aspirin 80mg", quantity: "30 tabs" },
    ]);

    const [alerts] = useState([
        { id: 1, icon: "⚠️", title: "Low Stock", message: "Losartan 50mg - Only 15 tablets" },
        { id: 2, icon: "⏰", title: "Expiring Soon", message: "Aspirin 80mg expires in 30 days" },
        { id: 3, icon: "📌", title: "Upcoming Pickups", message: "45 seniors scheduled this week" },
    ]);

    const quickActions = [
        { icon: "➕", title: "Register Senior", description: "Add new senior citizen" },
        { icon: "📦", title: "Record Stock", description: "Update inventory" },
        { icon: "💊", title: "Process Distribution", description: "Dispense medicine" },
        { icon: "🔔", title: "Send Notification", description: "Alert mobile users" },
        { icon: "📊", title: "Generate Report", description: "View analytics" },
        { icon: "👁️", title: "View Alerts", description: "Check warnings" },
    ];

    useEffect(() => { }, []);

    return (
        <div className="mc-dashboard-page">
            <AlertBanner />
            <StatsGrid stats={stats} />
            <QuickActions actions={quickActions} />
            <CriticalAlerts alerts={alerts} />

            <div className="mc-grid2">
                <RecentDistributions rows={recentDistributions} />
            </div>
        </div>
    );
}
