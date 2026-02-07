import React from "react";
import { Link } from "react-router-dom";

export default function Header({
    appLogo,
    user = {},
    notifications = [],
    onLogout = () => { },
    onMarkAllRead = () => { },
    onReadNotification = () => { },
    canViewSettings = false,
}) {
    return (
        <div className="header">
            {/* Logo */}
            <div className="header-left">
                <Link to="/dashboard" className="logo">
                    <img src={appLogo || "/assets/img/med.jpg"} alt="Logo" />
                </Link>
                <Link to="/dashboard" className="logo logo-small">
                    <img src="/assets/img/med.jpg" alt="Logo" width="30" height="30" />
                </Link>
            </div>

            <a href="javascript:void(0);" id="toggle_btn">
                <i className="fe fe-text-align-left" />
            </a>

            {/* Mobile Menu Toggle */}
            <a className="mobile_btn" id="mobile_btn">
                <i className="fa fa-bars" />
            </a>

            {/* Header Right Menu */}
            <ul className="nav user-menu">
                {/* Sales modal button (kept like Blade) */}
                <li className="nav-item dropdown">
                    <a
                        href="#"
                        data-target="#add_sales"
                        title="make a sale"
                        data-toggle="modal"
                        className="dropdown-toggle nav-link"
                        onClick={(e) => e.preventDefault()}
                    >
                        <i className="fas fa-cash-register" />
                    </a>
                </li>

                {/* Notifications */}
                <li className="nav-item dropdown noti-dropdown">
                    <a href="#" className="dropdown-toggle nav-link" data-toggle="dropdown" onClick={(e) => e.preventDefault()}>
                        <i className="fe fe-bell" /> <span className="badge badge-pill">{notifications.length}</span>
                    </a>

                    <div className="dropdown-menu notifications">
                        <div className="topnav-dropdown-header">
                            <span className="notification-title">Notifications</span>
                            <a href="#" className="clear-noti" onClick={(e) => { e.preventDefault(); onMarkAllRead(); }}>
                                Mark All As Read
                            </a>
                        </div>

                        <div className="noti-content">
                            <ul className="notification-list">
                                {notifications.map((n, idx) => (
                                    <li key={idx} className="notification-message">
                                        <a
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                onReadNotification(n);
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
                                ))}
                            </ul>
                        </div>

                        <div className="topnav-dropdown-footer">
                            <a href="#" onClick={(e) => e.preventDefault()}>
                                View all Notifications
                            </a>
                        </div>
                    </div>
                </li>

                {/* User Menu */}
                <li className="nav-item dropdown has-arrow">
                    <a href="#" className="dropdown-toggle nav-link" data-toggle="dropdown" onClick={(e) => e.preventDefault()}>
                        <span className="user-img">
                            <img className="rounded-circle" src={user.avatar || "/assets/img/avatar_1nn.png"} width="31" alt="avatar" />
                        </span>
                    </a>

                    <div className="dropdown-menu">
                        <div className="user-header">
                            <div className="avatar avatar-sm">
                                <img
                                    src={user.avatar || "/assets/img/avatar_1nn.png"}
                                    alt="User Image"
                                    className="avatar-img rounded-circle"
                                />
                            </div>
                            <div className="user-text">
                                <h6>{user.name || ""}</h6>
                            </div>
                        </div>

                        <Link className="dropdown-item" to="/profile">
                            My Profile
                        </Link>

                        {canViewSettings && (
                            <Link className="dropdown-item" to="/settings">
                                Settings
                            </Link>
                        )}

                        <a
                            href="#"
                            className="dropdown-item"
                            onClick={(e) => {
                                e.preventDefault();
                                onLogout();
                            }}
                        >
                            Logout
                        </a>
                    </div>
                </li>
            </ul>
        </div>
    );
}
