// resources/js/Includes/Sidebar.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import feather from "feather-icons";

export default function Sidebar({ permissions = {} }) {
    const { pathname } = useLocation();

    const routeIs = (prefix) => pathname.startsWith(prefix);
    const isExact = (p) => pathname === p;

    // Define menus (Blade sidebar equivalent)
    const menus = useMemo(() => {
        const can = (key) => !!permissions[key];

        return [
            // Dashboard (always)
            {
                type: "link",
                key: "dashboard",
                label: "Dashboard",
                icon: <i data-feather="home" />,
                to: "/dashboard",
                show: true,
                active: isExact("/dashboard"),
            },

            // Categories
            // {
            //     type: "link",
            //     key: "categories",
            //     label: "Categories",
            //     icon: <i data-feather="layout" />,
            //     to: "/categories",
            //     show: can("view-category") || permissions.viewCategory,
            //     active: routeIs("/categories"),
            // },

            // // Purchase submenu
            // {
            //     type: "submenu",
            //     key: "purchase",
            //     label: "Purchase",
            //     icon: <i data-feather="star" />,
            //     show: can("view-purchase") || permissions.viewPurchase,
            //     active: routeIs("/purchases"),
            //     children: [
            //         { label: "Purchase", to: "/purchases", show: true, active: routeIs("/purchases") },
            //         {
            //             label: "Add Purchase",
            //             to: "/purchases/create",
            //             show: can("create-purchase") || permissions.createPurchase,
            //             active: isExact("/purchases/create"),
            //         },
            //     ],
            // },

            // Products submenu
            {
                type: "submenu",
                key: "products",
                label: "Medicines",
                icon: <i data-feather="file-text" />,
                show: can("view-products") || permissions.viewProducts,
                active: routeIs("/products") || isExact("/outstock") || isExact("/expired"),
                children: [
                    { label: "Products", to: "/products", show: true, active: routeIs("/products") },
                    {
                        label: "Add Product",
                        to: "/products/create",
                        show: can("create-product") || permissions.createProduct,
                        active: isExact("/products/create"),
                    },
                    {
                        label: "Out-Stock",
                        to: "/outstock",
                        show: can("view-outstock-products") || permissions.viewOutStock,
                        active: isExact("/outstock"),
                    },
                    {
                        label: "Expired",
                        to: "/expired",
                        show: can("view-expired-products") || permissions.viewExpired,
                        active: isExact("/expired"),
                    },
                ],
            },

            // Access Control submenu
            {
                type: "submenu",
                key: "access",
                label: "Access Control",
                icon: <i data-feather="lock" />,
                show: can("view-access-control") || permissions.viewAccessControl,
                active: isExact("/permissions") || routeIs("/roles"),
                children: [
                    {
                        label: "Permissions",
                        to: "/permissions",
                        show: can("view-permission") || permissions.viewPermission,
                        active: isExact("/permissions"),
                    },
                    {
                        label: "Roles",
                        to: "/roles",
                        show: can("view-role") || permissions.viewRole,
                        active: routeIs("/roles"),
                    },
                ],
            },

            // Users
            {
                type: "link",
                key: "users",
                label: "Users",
                icon: <i data-feather="users" />,
                to: "/users",
                show: can("view-users") || permissions.viewUsers,
                active: routeIs("/users"),
            },

            // Profile (always)
            {
                type: "link",
                key: "profile",
                label: "Profile",
                icon: <i data-feather="user-plus" />,
                to: "/profile",
                show: true,
                active: isExact("/profile"),
            },

            // Backups (Blade had backup.index; SPA path choose one and match your router)
            {
                type: "link",
                key: "backups",
                label: "Backups",
                icon: <i data-feather="database" />,
                to: "/backups",
                show: true,
                active: routeIs("/backups"),
            },

            // Settings
            {
                type: "link",
                key: "settings",
                label: "Settings",
                icon: <i data-feather="settings" />,
                to: "/settings",
                show: can("view-settings") || permissions.viewSettings,
                active: isExact("/settings"),
            },
        ];
    }, [permissions, pathname]);

    // Which submenus are open
    const [open, setOpen] = useState({});

    // Auto-open the submenu that matches the current route
    useEffect(() => {
        const next = {};
        menus.forEach((m) => {
            if (m.type === "submenu") next[m.key] = !!m.active;
        });
        setOpen((prev) => ({ ...prev, ...next }));
    }, [menus]);

    // Re-render feather icons after route/menu updates
    useEffect(() => {
        feather.replace();
    }, [pathname, open]);

    const toggle = (key) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

    return (
        <div className="sidebar" id="sidebar">
            <div className="sidebar-inner slimscroll">
                <div id="sidebar-menu" className="sidebar-menu">
                    <ul>
                        <li className="menu-title">
                            <span>Main</span>
                        </li>

                        {menus
                            .filter((m) => m.show)
                            .map((m) => {
                                // Simple link
                                if (m.type === "link") {
                                    return (
                                        <li key={m.key} className={m.active ? "active" : ""}>
                                            <Link to={m.to}>
                                                {m.icon} <span>{m.label}</span>
                                            </Link>
                                        </li>
                                    );
                                }

                                // Submenu
                                const isOpen = !!open[m.key];

                                return (
                                    <li key={m.key} className={`submenu ${m.active ? "active" : ""}`}>
                                        <a
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                toggle(m.key);
                                            }}
                                            aria-expanded={isOpen ? "true" : "false"}
                                        >
                                            {m.icon} <span> {m.label}</span>{" "}
                                            <span className="fas fa-chevron-down"></span>
                                        </a>

                                        <ul style={{ display: isOpen ? "block" : "none" }}>
                                            {m.children
                                                .filter((c) => c.show)
                                                .map((c) => (
                                                    <li key={c.to} className={c.active ? "active" : ""}>
                                                        <Link className={c.active ? "active" : ""} to={c.to}>
                                                            {c.label}
                                                        </Link>
                                                    </li>
                                                ))}
                                        </ul>
                                    </li>
                                );
                            })}
                    </ul>
                </div>
            </div>
        </div>
    );
}
