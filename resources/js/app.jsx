import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import PlainLayout from "./Layouts/PlainLayout.jsx";
import RequireAuthLayout from "./Layouts/RequireAuthLayout.jsx";

// Auth
import Login from "./Auth/Login.jsx";

// Dashboard
import Dashboard from "./Pages/Dashboard.jsx";

/* STAFF (USERS) */
import UsersIndex from "./Staff(User)/Index.jsx";
import UsersCreate from "./Staff(User)/Create.jsx";
import UsersEdit from "./Staff(User)/Edit.jsx";
import Profile from "./Staff(User)/Profile.jsx";

/* SENIORS */
import SeniorsIndex from "./Seniors/Index.jsx";
import SeniorCreate from "./Seniors/Create.jsx";
import SeniorEdit from "./Seniors/Edit.jsx";

/* ROLES / PERMISSIONS */
import RolesIndex from "./Roles/Index.jsx";
import RolesCreate from "./Roles/Create.jsx";
import RolesEdit from "./Roles/Edit.jsx";
import Permissions from "./Roles/Permissions.jsx";

const container = document.getElementById("app");

createRoot(container).render(
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
            {/* Default landing */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Public */}
            <Route element={<PlainLayout />}>
                <Route path="/login" element={<Login />} />
            </Route>

            {/* Protected */}
            <Route element={<RequireAuthLayout />}>
                {/* Dashboard */}
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Staff */}
                <Route path="/users" element={<UsersIndex />} />
                <Route path="/users/create" element={<UsersCreate />} />
                <Route path="/users/:id/edit" element={<UsersEdit />} />

                {/* Seniors */}
                <Route path="/seniors" element={<SeniorsIndex />} />
                <Route path="/seniors/create" element={<SeniorCreate />} />
                <Route path="/seniors/:id/edit" element={<SeniorEdit />} />

                {/* Profile */}
                <Route path="/profile" element={<Profile />} />

                {/* Roles / Permissions */}
                <Route path="/roles" element={<RolesIndex />} />
                <Route path="/roles/create" element={<RolesCreate />} />
                <Route path="/roles/:id/edit" element={<RolesEdit />} />
                <Route path="/permissions" element={<Permissions />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<div className="p-4">Page not found</div>} />
        </Routes>
    </BrowserRouter>
);
