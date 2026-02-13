import React from "react";

export default function CriticalAlerts({ alerts }) {
    return (
        <div className="mc-card">
            <div className="mc-card-header">
                <h2 className="mc-card-title">Critical Alerts</h2>
            </div>

            <div className="mc-card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {alerts.map((a) => (
                    <div key={a.id} className="mc-alert" style={{ margin: 0 }}>
                        <div style={{ fontSize: 16 }}>{a.icon}</div>
                        <div>
                            <h4>{a.title}</h4>
                            <p>{a.message}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
