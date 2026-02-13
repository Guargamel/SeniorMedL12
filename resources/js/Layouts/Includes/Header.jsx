// resources/js/Includes/Header.jsx
import React, { useMemo } from "react";

export default function Header({
    user = {},
    notifications = [],
    onLogout = () => { },
}) {
    const count = useMemo(() => notifications?.length || 0, [notifications]);

    const initials = (user?.name || "NA")
        .split(" ")
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase())
        .join("");

    return (
        <div className="mc-topbar">
            <div className="mc-topbar-left">
                <h1 className="mc-title">Dashboard Overview</h1>
                <p className="mc-subtitle">
                    Welcome back! Here's what's happening today.
                </p>
            </div>

            <div className="mc-topbar-right">
                <button className="mc-bell" type="button">
                    🔔
                    {count > 0 && <span className="mc-badge">{count}</span>}
                </button>

                <div className="mc-user">
                    <div className="mc-user-avatar">{initials}</div>
                    <div className="mc-user-meta">
                        <div className="mc-user-name">{user?.name || "Nurse Ana"}</div>
                        <div className="mc-user-role">{user?.role || "Health Worker"}</div>
                    </div>
                </div>

                <button className="mc-logout" onClick={onLogout} type="button">
                    Logout
                </button>
            </div>
        </div>
    );
}
