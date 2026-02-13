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
import UsersIndex from "./Staff/Index.jsx";
import UsersCreate from "./Staff/Create.jsx";
import UsersEdit from "./Staff/Edit.jsx";
import UserProfile from "./Users/Profile.jsx";

/* SENIORS */
import SeniorsIndex from "./Seniors/Index.jsx";
import SeniorCreate from "./Seniors/Create.jsx";
import SeniorEdit from "./Seniors/Edit.jsx";

/* ROLES / PERMISSIONS */
import RolesIndex from "./Roles/Index.jsx";
import RolesCreate from "./Roles/Create.jsx";
import RolesEdit from "./Roles/Edit.jsx";
import Permissions from "./Roles/Permissions.jsx";

import MedicinesIndex from "./Medicines/Index.jsx";
import MedicinesCreate from "./Medicines/Create.jsx";
import MedicinesEdit from "./Medicines/Edit.jsx";
import MedicinesExpired from "./Medicines/Expired.jsx";
import MedicinesOutstock from "./Medicines/Outstock.jsx";
import MedicinesCategories from "./Medicines/Categories.jsx";

import DistributeStock from "./Distribute/DistributeStock.jsx";

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

                {/* users */}
                <Route path="/users" element={<UsersIndex />} />
                <Route path="/users/create" element={<UsersCreate />} />
                <Route path="/users/:id/edit" element={<UsersEdit />} />
                <Route path="/profile" index element={<UserProfile />} />


                {/* Roles / Permissions */}
                <Route path="/roles" element={<RolesIndex />} />
                <Route path="/roles/create" element={<RolesCreate />} />
                <Route path="/roles/:id/edit" element={<RolesEdit />} />
                <Route path="/permissions" element={<Permissions />} />

                {/* Medicines */}
                <Route path="/medicines" element={<MedicinesIndex />} />
                <Route path="/medicines/create" element={<MedicinesCreate />} />
                <Route path="/medicines/:id/edit" element={<MedicinesEdit />} />
                <Route path="/medicines/expired" element={<MedicinesExpired />} />
                <Route path="/medicines/outstock" element={<MedicinesOutstock />} />
                <Route path="/medicines/categories" element={<MedicinesCategories />} />

                <Route path="/distributions" element={<DistributeStock />} />

            </Route>

            {/* 404 */}
            <Route path="*" element={<div className="p-4">Page not found</div>} />
        </Routes>
    </BrowserRouter>
);
