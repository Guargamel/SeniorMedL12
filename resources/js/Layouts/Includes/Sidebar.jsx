import React, { useMemo, useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    Pill,
    Boxes,
    Target,
    FileText,
    ChevronDown,
} from "lucide-react";

const menu = [
    {
        title: "MAIN",
        items: [
            { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },

            {
                label: "Staff",
                icon: Users,
                children: [
                    { label: "All Staff", to: "/users" },
                    { label: "Create Staff", to: "/users/create" },
                ],
            },

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
                to: "/stock",
                icon: Boxes,
                children: [
                    { label: "Stock List", to: "/medicine-batches/index" },
                    { label: "Create Stock", to: "/medicine-batches/create" },
                ],
            },
        ],
    },
    {
        title: "OPERATIONS",
        items: [
            { label: "Distributions", to: "/distributions", icon: Target },
            // ✅ removed Notifications
            // { label: "Notifications", to: "/notifications", icon: Bell },
        ],
    },
    {
        title: "REQUESTS",
        items: [
            { label: "Requests", to: "/medicine-requests", icon: FileText, badgeKey: "pendingRequests" },
        ],
    },
];

function isPathActive(pathname, to) {
    return pathname === to || pathname.startsWith(to + "/");
}

function Badge({ value }) {
    if (!value || value <= 0) return null;
    const text = value > 99 ? "99+" : String(value);

    return (
        <span
            style={{
                marginLeft: "auto",
                minWidth: 18,
                height: 18,
                padding: "0 6px",
                borderRadius: 999,
                background: "#ef4444",
                color: "white",
                fontSize: 12,
                lineHeight: "18px",
                textAlign: "center",
                fontWeight: 700,
            }}
            aria-label={`${text} pending requests`}
            title={`${text} pending requests`}
        >
            {text}
        </span>
    );
}

export default function Sidebar() {
    const { pathname } = useLocation();

    // ✅ Pending requests count state
    const [pendingCount, setPendingCount] = useState(0);

    // ✅ Fetch pending count (poll every 30s)
    useEffect(() => {
        let alive = true;

        const fetchCount = async () => {
            try {
                // OPTION A (recommended): count endpoint
                const res = await fetch("/api/medicine-requests/pending-count", {
                    credentials: "include",
                    headers: { Accept: "application/json" },
                });

                if (!res.ok) return;
                const data = await res.json();

                // accept {count: number} OR {pending: number}
                const count = Number(data.count ?? data.pending ?? 0);
                if (alive) setPendingCount(Number.isFinite(count) ? count : 0);
            } catch {
                // ignore network errors
            }
        };

        fetchCount();
        const t = setInterval(fetchCount, 30000);

        return () => {
            alive = false;
            clearInterval(t);
        };
    }, []);

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

    const badges = {
        pendingRequests: pendingCount,
    };

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
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 10,
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
                                                        className={({ isActive }) => `mc-subnav-item ${isActive ? "active" : ""}`}
                                                    >
                                                        {c.label}
                                                    </NavLink>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            // ✅ Normal link (supports badge)
                            const badgeValue = item.badgeKey ? badges[item.badgeKey] : 0;

                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) => `mc-nav-item ${isActive ? "active" : ""}`}
                                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                                >
                                    <Icon size={18} />
                                    <span>{item.label}</span>
                                    <Badge value={badgeValue} />
                                </NavLink>
                            );
                        })}
                    </div>
                ))}
            </nav>
        </aside>
    );
}
