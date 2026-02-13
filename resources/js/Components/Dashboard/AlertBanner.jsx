import React from "react";

export default function AlertBanner({ alerts = [] }) {
    const top = alerts[0];
    if (!top) return null;

    return (
        <div className="mc-alert">
            <div style={{ fontSize: 18 }}>{top.icon || "⚠️"}</div>
            <div>
                <h4>{top.title}</h4>
                <p>{top.message}</p>
            </div>
        </div>
    );
}
