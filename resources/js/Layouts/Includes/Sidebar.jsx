import React, { useMemo, useState, useRef, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    Pill,
    Boxes,
    Target,
    Bell,
    BarChart3,
    FileText,
    Settings,
    ChevronDown,
} from "lucide-react";

const menu = [
    {
        title: "MAIN",
        items: [
            { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },

            // ✅ Staff dropdown
            {
                label: "Staff",
                icon: Users,
                children: [
                    { label: "All Staff", to: "/users" },
                    { label: "Create Staff", to: "/users/create" },
                ],
            },

            // ✅ Seniors dropdown
            {
                label: "Senior Citizens",
                icon: Users,
                children: [
                    { label: "All Seniors", to: "/seniors" },
                    { label: "Register Senior", to: "/seniors/create" },
                ],
            },
        ],
    },
    {
        title: "INVENTORY",
        items: [
            {
                label: "Medicines",
                icon: Pill,
                children: [
                    { label: "All Medicines", to: "/medicines" },
                    { label: "Add Medicine", to: "/medicines/create" },
                    { label: "Expired", to: "/medicines/expired" },
                    { label: "Out of Stock", to: "/medicines/outstock" },
                ],
            },
            {
                label: "Stock Management",
                to: "/stock",  // Link to the stock management page
                icon: Boxes,
                children: [
                    { label: "Stock List", to: "/stock/index" },  // View all stock
                    { label: "Create Stock", to: "/stock/create" }, // Add new stock
                ]
            },
        ],
    },
    {
        title: "OPERATIONS",
        items: [
            { label: "Distributions", to: "/distributions", icon: Target },
            { label: "Notifications", to: "/notifications", icon: Bell },
        ],
    },
    {
        title: "REPORTS",
        items: [
            { label: "Analytics", to: "/analytics", icon: BarChart3 },
            { label: "Reports", to: "/reports", icon: FileText },
        ],
    },
    {
        title: "SYSTEM",
        items: [{ label: "Settings", to: "/settings", icon: Settings }],
    },
];

function isPathActive(pathname, to) {
    // active for exact match OR nested routes
    return pathname === to || pathname.startsWith(to + "/");
}

export default function Sidebar() {
    const { pathname } = useLocation();

    // auto-open dropdown if you're inside that section
    const initialOpen = useMemo(() => {
        const open = {};
        for (const section of menu) {
            for (const item of section.items) {
                if (item.children?.length) {
                    open[item.label] = item.children.some((c) => isPathActive(pathname, c.to));
                }
            }
        }
        return open;
    }, [pathname]);

    const [open, setOpen] = useState(initialOpen);

    const toggle = (key) => setOpen((p) => ({ ...p, [key]: !p[key] }));

    return (
        <aside className="mc-sidebar">
            <div className="mc-brand">
                <div className="mc-brand-icon">💊</div>
                <div className="mc-brand-name">MediCare</div>
            </div>

            <nav className="mc-nav">
                {menu.map((section) => (
                    <div key={section.title} className="mc-nav-section">
                        <div className="mc-nav-title">{section.title}</div>

                        {section.items.map((item) => {
                            const Icon = item.icon;

                            // ✅ Dropdown group
                            if (item.children?.length) {
                                const isOpen = !!open[item.label];
                                const groupActive = item.children.some((c) => isPathActive(pathname, c.to));

                                return (
                                    <div key={item.label}>
                                        <button
                                            type="button"
                                            onClick={() => toggle(item.label)}
                                            className={`mc-nav-item mc-nav-item-btn ${groupActive ? "active" : ""}`}
                                            style={{
                                                width: "100%",
                                                border: "none",
                                                background: "transparent",
                                                textAlign: "left",
                                            }}
                                        >
                                            <Icon size={18} />
                                            <span style={{ flex: 1 }}>{item.label}</span>
                                            <ChevronDown
                                                size={16}
                                                style={{
                                                    transition: "transform 0.2s",
                                                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                                                }}
                                            />
                                        </button>

                                        {isOpen && (
                                            <div className="mc-subnav">
                                                {item.children.map((c) => (
                                                    <NavLink
                                                        key={c.to}
                                                        to={c.to}
                                                        className={({ isActive }) =>
                                                            `mc-subnav-item ${isActive ? "active" : ""}`
                                                        }
                                                    >
                                                        {c.label}
                                                    </NavLink>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            // ✅ Normal link
                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) => `mc-nav-item ${isActive ? "active" : ""}`}
                                >
                                    <Icon size={18} />
                                    <span>{item.label}</span>
                                </NavLink>
                            );
                        })}
                    </div>
                ))}
            </nav>
        </aside>
    );
}
