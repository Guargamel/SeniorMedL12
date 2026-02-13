import React from "react";

export default function QuickActions({ actions }) {
    return (
        <div className="mc-card">
            <div className="mc-card-header">
                <h2 className="mc-card-title">Quick Actions</h2>
            </div>

            <div className="mc-card-body">
                <div className="mc-actions">
                    {actions.map((a, i) => (
                        <div key={i} className="mc-action">
                            <div className="mc-action-icon">{a.icon}</div>
                            <div>
                                <div style={{ fontWeight: 900, fontSize: 12 }}>{a.title}</div>
                                <div style={{ fontSize: 11, color: "var(--mc-muted)" }}>{a.description}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
