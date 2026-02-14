import React from "react";
import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Pill,
    FileText,
    Bell,
    User,
    Plus,
} from "lucide-react";

const seniorMenu = [
    {
        title: "MAIN",
        items: [
            { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
            { label: "Browse Medicines", to: "/browse-medicines", icon: Pill },
        ],
    },
    {
        title: "MY REQUESTS",
        items: [
            { label: "My Requests", to: "/medicine-requests", icon: FileText },
            { label: "New Request", to: "/medicine-requests/create", icon: Plus },
        ],
    },
    {
        title: "ACCOUNT",
        items: [
            { label: "Notifications", to: "/notifications", icon: Bell },
            { label: "My Profile", to: "/profile", icon: User },
        ],
    },
];

export default function SeniorSidebar() {
    return (
        <aside className="mc-sidebar">
            <div className="mc-brand">
                <div className="mc-brand-icon">💊</div>
                <div className="mc-brand-name">MediCare</div>
                <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                    Senior Portal
                </div>
            </div>

            <nav className="mc-nav">
                {seniorMenu.map((section) => (
                    <div key={section.title} className="mc-nav-section">
                        <div className="mc-nav-title">{section.title}</div>

                        {section.items.map((item) => {
                            const Icon = item.icon;

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

            {/* Help Section */}
            <div style={{
                position: "absolute",
                bottom: "20px",
                left: "20px",
                right: "20px",
                padding: "12px",
                backgroundColor: "#f1f5f9",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#64748b"
            }}>
                <div style={{ fontWeight: "600", marginBottom: "4px" }}>Need Help?</div>
                <div>Contact staff for assistance</div>
            </div>
        </aside>
    );
}
