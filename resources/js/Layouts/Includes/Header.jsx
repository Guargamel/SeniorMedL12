// resources/js/Includes/Header.jsx
import React, { useMemo, useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Header({
    user = {},
    notifications = [],
    onLogout = () => { },
}) {
    const count = useMemo(() => notifications?.length || 0, [notifications]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const initials = (user?.name || "NA")
        .split(" ")
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase())
        .join("");

    const roleName = user?.roles?.[0]?.name || user?.role || "Health Worker";
    const roleDisplay = roleName.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

                {/* Profile Dropdown */}
                <div className="mc-user-dropdown" ref={dropdownRef}>
                    <button 
                        className="mc-user" 
                        onClick={() => setShowDropdown(!showDropdown)}
                        type="button"
                        style={{ 
                            border: 'none', 
                            background: 'transparent', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <div className="mc-user-avatar">{initials}</div>
                        <div className="mc-user-meta">
                            <div className="mc-user-name">{user?.name || "User"}</div>
                            <div className="mc-user-role">{roleDisplay}</div>
                        </div>
                        <svg 
                            width="16" 
                            height="16" 
                            viewBox="0 0 16 16" 
                            fill="currentColor"
                            style={{ 
                                transition: 'transform 0.2s',
                                transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
                            }}
                        >
                            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                    </button>

                    {showDropdown && (
                        <div className="mc-dropdown-menu">
                            <Link 
                                to="/profile" 
                                className="mc-dropdown-item"
                                onClick={() => setShowDropdown(false)}
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M8 8a3 3 0 100-6 3 3 0 000 6zM12.93 13c-.03-2.76-2.24-5-5-5h-.86c-2.76 0-4.97 2.24-5 5h10.86z"/>
                                </svg>
                                My Profile
                            </Link>
                            <button 
                                className="mc-dropdown-item mc-dropdown-item-logout" 
                                onClick={() => {
                                    setShowDropdown(false);
                                    onLogout();
                                }}
                                type="button"
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M6 13V3h4v10H6zM3 6h3v4H3V6zm10 0h-3v4h3V6z"/>
                                </svg>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
