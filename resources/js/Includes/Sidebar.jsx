// resources/js/Includes/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
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
} from "lucide-react";

const menu = [
    {
        title: "MAIN",
        items: [
            { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
            { label: "Senior Citizens", to: "/seniors", icon: Users },
        ],
    },
    {
        title: "INVENTORY",
        items: [
            { label: "Medicines", to: "/medicines", icon: Pill },
            { label: "Stock Management", to: "/stock", icon: Boxes },
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

export default function Sidebar() {
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
                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `mc-nav-item ${isActive ? "active" : ""}`
                                    }
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
