import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { safeArray } from "../utils/api";

/**
 * Close dropdown when clicking outside OR pressing Escape.
 */
function useOutsideAndEscClose(ref, onClose) {
    useEffect(() => {
        function onMouseDown(e) {
            if (!ref.current) return;
            if (!ref.current.contains(e.target)) onClose();
        }

        function onKeyDown(e) {
            if (e.key === "Escape") onClose();
        }

        document.addEventListener("mousedown", onMouseDown);
        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.removeEventListener("mousedown", onMouseDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [ref, onClose]);
}

export default function Header({
    appLogo,
    user = {},
    notifications = [],
    onLogout = () => { },
    onMarkAllRead = () => { },
    onReadNotification = () => { },
    canViewSettings = false,
}) {
    const notiWrapRef = useRef(null);
    const userWrapRef = useRef(null);

    const [notiOpen, setNotiOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);

    useOutsideAndEscClose(notiWrapRef, () => setNotiOpen(false));
    useOutsideAndEscClose(userWrapRef, () => setUserOpen(false));

    const notiList = useMemo(() => safeArray(notifications), [notifications]);
    const notiCount = notiList.length;

    return (
        <div className="header">
            <div className="header-left">
                <Link to="/dashboard" className="logo">
                    <img src={appLogo || "/assets/img/med.jpg"} alt="Logo" />
                </Link>
                <Link to="/dashboard" className="logo logo-small">
                    <img src="/assets/img/med.jpg" alt="Logo" width="30" height="30" />
                </Link>
            </div>

            <button type="button" id="toggle_btn" className="btn btn-link p-0">
                <i className="fas fa-align-left" />
            </button>

            <button type="button" className="mobile_btn" id="mobile_btn">
                <i className="fas fa-bars" />
            </button>

            <ul className="nav user-menu">
                <li className="nav-item dropdown">
                    <a
                        href="#"
                        title="make a sale"
                        className="dropdown-toggle nav-link"
                        onClick={(e) => {
                            e.preventDefault();
                            // If your modal is bootstrap-based, you can trigger it here.
                            // Otherwise, call a prop like onOpenSaleModal()
                            const el = document.getElementById("add_sales");
                            if (el) {
                                // If you are using bootstrap modal somewhere else,
                                // you can handle opening there. This is just a placeholder.
                            }
                        }}
                    >
                        <i className="fas fa-cash-register" />
                    </a>
                </li>

                <li
                    ref={notiWrapRef}
                    className={`nav-item dropdown noti-dropdown ${notiOpen ? "show" : ""}`}
                >
                    <a
                        href="#"
                        className="dropdown-toggle nav-link"
                        aria-haspopup="true"
                        aria-expanded={notiOpen}
                        onClick={(e) => {
                            e.preventDefault();
                            setNotiOpen((v) => !v);
                            setUserOpen(false);
                        }}
                    >
                        <i className="fas fa-bell" />{" "}
                        <span className="badge badge-pill">{notiCount}</span>
                    </a>

                    <div className={`dropdown-menu notifications ${notiOpen ? "show" : ""}`}>
                        <div className="topnav-dropdown-header">
                            <span className="notification-title">Notifications</span>

                            <a
                                href="#"
                                className="clear-noti"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onMarkAllRead();
                                }}
                            >
                                Mark All As Read
                            </a>
                        </div>

                        <div className="noti-content">
                            <ul className="notification-list">
                                {notiList.length === 0 ? (
                                    <li className="notification-message">
                                        <div className="media">
                                            <div className="media-body">
                                                <p className="noti-details">
                                                    <span className="noti-title">No notifications.</span>
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                ) : (
                                    notiList.map((n, idx) => (
                                        <li key={n.id ?? idx} className="notification-message">
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    onReadNotification(n);
                                                    setNotiOpen(false);
                                                }}
                                            >
                                                <div className="media">
                                                    <span className="avatar avatar-sm">
                                                        <img
                                                            className="avatar-img rounded-circle"
                                                            alt="Product image"
                                                            src={n.image || "/assets/img/default-product.png"}
                                                        />
                                                    </span>

                                                    <div className="media-body">
                                                        <h6 className="text-danger">Stock Alert</h6>
                                                        <p className="noti-details">
                                                            <span className="noti-title">
                                                                {n.product_name} is only {n.quantity} left.
                                                            </span>
                                                            <span> Please update the purchase quantity </span>
                                                        </p>

                                                        <p className="noti-time">
                                                            <span className="notification-time">{n.timeAgo || ""}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </a>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>

                        <div className="topnav-dropdown-footer">
                            <Link to="/notifications" onClick={() => setNotiOpen(false)}>
                                View all Notifications
                            </Link>
                        </div>
                    </div>
                </li>

                {/* User Menu */}
                <li
                    ref={userWrapRef}
                    className={`nav-item dropdown has-arrow ${userOpen ? "show" : ""}`}
                >
                    <a
                        href="#"
                        className="dropdown-toggle nav-link"
                        aria-haspopup="true"
                        aria-expanded={userOpen}
                        onClick={(e) => {
                            e.preventDefault();
                            setUserOpen((v) => !v);
                            setNotiOpen(false);
                        }}
                    >
                        <span className="user-img">
                            <img
                                className="rounded-circle"
                                src={user.avatar || "/assets/img/avatar_1nn.png"}
                                width="31"
                                alt="avatar"
                            />
                        </span>
                    </a>

                    <div className={`dropdown-menu ${userOpen ? "show" : ""}`}>
                        <div className="user-header">
                            <div className="avatar avatar-sm">
                                <img
                                    src={user.avatar || "/assets/img/avatar_1nn.png"}
                                    alt="User"
                                    className="avatar-img rounded-circle"
                                />
                            </div>

                            <div className="user-text">
                                <h6>{user.name || ""}</h6>
                            </div>
                        </div>

                        <Link className="dropdown-item" to="/profile" onClick={() => setUserOpen(false)}>
                            My Profile
                        </Link>

                        {canViewSettings && (
                            <Link className="dropdown-item" to="/settings" onClick={() => setUserOpen(false)}>
                                Settings
                            </Link>
                        )}

                        <a
                            href="#"
                            className="dropdown-item"
                            onClick={(e) => {
                                e.preventDefault();
                                setUserOpen(false);
                                onLogout();
                            }}
                        >
                            Logout
                        </a>
                    </div>
                </li>
            </ul>
            {/* /Header Right Menu */}
        </div>
    );
}
