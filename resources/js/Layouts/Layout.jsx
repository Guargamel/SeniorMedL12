// resources/js/Layouts/Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Includes/Header.jsx";
import Sidebar from "./Includes/Sidebar.jsx";
import { safeArray } from "../utils/api";

// Global styles for authenticated area (ensure sidebar/header styles load)
import "bootstrap/dist/css/bootstrap.min.css";
import "../../css/style.css";
import "../../css/mc-dashboard.css";

const defaultPermissions = {
    viewCategory: true,
    viewPurchase: true,
    createPurchase: true,
    viewProducts: true,
    createProduct: true,
    viewOutStock: true,
    viewExpired: true,
    viewSales: true,
    createSale: true,
    viewSupplier: true,
    createSupplier: true,
    viewReports: true,
    viewAccessControl: true,
    viewPermission: true,
    viewRole: true,
    viewUsers: true,
    viewSettings: true,
};

export default function Layout({
    user = {},
    notifications = [],
    appLogo = "",
    handleLogout = () => { },
    errors = [],
    pageHeader = null,
    permissions = defaultPermissions,
}) {
    return (
        <div className="mc-shell">
            <Sidebar permissions={permissions} />

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
