// resources/js/Layouts/Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../Includes/Header.jsx";
import Sidebar from "../Includes/Sidebar.jsx";
import { safeArray } from "../utils/api";

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
    handleMarkAllRead = () => { },
    handleReadNotification = () => { },
    errors = [],
    pageHeader = null,
    permissions = { /* ...your defaults... */ },
}) {
    return (
        <div className="main-wrapper">

            <Header
                user={user}
                notifications={notifications}
                appLogo={appLogo}
                onLogout={handleLogout}
                onMarkAllRead={handleMarkAllRead}
                onReadNotification={handleReadNotification}
            />

            <Sidebar permissions={defaultPermissions} />

            <div className="page-wrapper">
                <div className="content container-fluid">
                    {pageHeader && (
                        <div className="page-header">
                            <div className="row">{pageHeader}</div>
                        </div>
                    )}

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