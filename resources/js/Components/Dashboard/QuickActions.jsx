import React from "react";
import { useNavigate } from "react-router-dom";

export default function QuickActions() {
    const navigate = useNavigate();

    const actions = [
        { icon: "➕", title: "Register Senior", description: "Create senior account", to: "/seniors/create" },
        { icon: "📦", title: "Record Stock", description: "Add medicine batch", to: "/batches/create" },
        { icon: "💊", title: "Process Distribution", description: "Dispense medicine", to: "/distributions/create" },
        { icon: "🔔", title: "Send Notification", description: "Notify users", to: "/notifications" },
        { icon: "📊", title: "Generate Report", description: "View analytics", to: "/reports" },
        { icon: "👁️", title: "View Alerts", description: "Review warnings", to: "/alerts" },
    ];

    return (
        <div className="mc-card">
            <div className="mc-card-header">
                <h2 className="mc-card-title">Quick Actions</h2>
            </div>

            <div className="mc-card-body">
                <div className="mc-actions">
                    {actions.map((a, i) => (
                        <div key={i} className="mc-action" onClick={() => navigate(a.to)}>
                            <div className="mc-action-icon">{a.icon}</div>
                            <div>
                                <div style={{ fontWeight: 900, fontSize: 13 }}>{a.title}</div>
                                <div style={{ fontSize: 12, color: "var(--mc-muted)" }}>{a.description}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
