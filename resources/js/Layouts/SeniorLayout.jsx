// resources/js/Layouts/SeniorLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Includes/Header.jsx";
import SeniorSidebar from "./Includes/SeniorSidebar.jsx";
import { safeArray } from "../utils/api";

// Global styles
import "bootstrap/dist/css/bootstrap.min.css";
import "../../css/style.css";
import "../../css/mc-dashboard.css";

export default function SeniorLayout({
    user = {},
    notifications = [],
    appLogo = "",
    handleLogout = () => {},
    errors = [],
    pageHeader = null,
}) {
    return (
        <div className="mc-shell">
            <SeniorSidebar />

            <div className="mc-main">
                <Header
                    user={user}
                    notifications={notifications}
                    appLogo={appLogo}
                    onLogout={handleLogout}
                />

                <div className="mc-content">
                    {pageHeader}

                    {safeArray(errors).map((error, idx) => (
                        <div key={idx} className="alert alert-danger">
                            {error}
                        </div>
                    ))}

                    <Outlet />
                </div>
            </div>
        </div>
    );
}
