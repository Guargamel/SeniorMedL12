import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import PlainLayout from "./Layouts/PlainLayout.jsx";
import RequireAuthLayout from "./Layouts/RequireAuthLayout.jsx";

// Auth
import Login from "./Auth/Login.jsx";

// Dashboard
import DashboardRouter from "./Pages/DashboardRouter.jsx";

// Unauthorized
import Unauthorized from "./Pages/Unauthorized.jsx";

// Staff (Users)
import UsersIndex from "./Staff/Index.jsx";
import UsersCreate from "./Staff/Create.jsx";
import UsersEdit from "./Staff/Edit.jsx";

// Seniors
import SeniorsIndex from "./Seniors/Index.jsx";
import SeniorCreate from "./Seniors/Create.jsx";
import SeniorEdit from "./Seniors/Edit.jsx";

// Roles / Permissions
import RolesIndex from "./Roles/Index.jsx";
import RolesCreate from "./Roles/Create.jsx";
import RolesEdit from "./Roles/Edit.jsx";
import Permissions from "./Roles/Permissions.jsx";

// Medicines
import MedicinesIndex from "./Medicines/Index.jsx";
import MedicinesCreate from "./Medicines/Create.jsx";
import MedicinesEdit from "./Medicines/Edit.jsx";
import MedicinesExpired from "./Medicines/Expired.jsx";
import MedicinesOutstock from "./Medicines/Outstock.jsx";
import MedicinesCategories from "./Medicines/Categories.jsx";

// Distribute Stock
import DistributeStock from "./Distribute/DistributeStock.jsx";

// Stock Management Routes
import BatchCreate from "./Medicine_Batches/Create.jsx";
import BatchIndex from "./Medicine_Batches/Index.jsx";
import BatchEdit from "./Medicine_Batches/Edit.jsx";

// Medicine Requests
import RequestsIndex from "./Request/Index.jsx";
import RequestCreate from "./Request/Create.jsx";
import BrowseMedicines from "./Request/BrowseMedicines.jsx";

// Notifications
import Notifications from "./Notifications/Notifications.jsx";

import Profile from "./Users/Profile.jsx";

// Main App Route Setup
const container = document.getElementById("app");

createRoot(container).render(
    <BrowserRouter>
        <Routes>
            {/* Default landing */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Public Routes */}
            <Route element={<PlainLayout />}>
                <Route path="/login" element={<Login />} />
            </Route>

            {/* Unauthorized */}
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected Routes */}
            <Route element={<RequireAuthLayout />}>
                {/* Dashboard - Role-based */}
                <Route path="/dashboard" element={<DashboardRouter />} />

                {/* Users Routes */}
                <Route path="/users" element={<UsersIndex />} />
                <Route path="/users/create" element={<UsersCreate />} />
                <Route path="/users/:id/edit" element={<UsersEdit />} />

                {/* Seniors Routes */}
                <Route path="/seniors" element={<SeniorsIndex />} />
                <Route path="/seniors/create" element={<SeniorCreate />} />
                <Route path="/seniors/:id/edit" element={<SeniorEdit />} />

                {/* Roles and Permissions Routes */}
                <Route path="/roles" element={<RolesIndex />} />
                <Route path="/roles/create" element={<RolesCreate />} />
                <Route path="/roles/:id/edit" element={<RolesEdit />} />
                <Route path="/permissions" element={<Permissions />} />

                {/* Medicines Routes */}
                <Route path="/medicines" element={<MedicinesIndex />} />
                <Route path="/medicines/create" element={<MedicinesCreate />} />
                <Route path="/medicines/:id/edit" element={<MedicinesEdit />} />
                <Route path="/medicines/expired" element={<MedicinesExpired />} />
                <Route path="/medicines/outstock" element={<MedicinesOutstock />} />
                <Route path="/medicines/categories" element={<MedicinesCategories />} />

                {/* Distribute Stock Route */}
                <Route path="/distributions" element={<DistributeStock />} />

                {/* Stock Management Routes */}
                <Route path="/medicine-batches/index" element={<BatchIndex />} />
                <Route path="/medicine-batches/create" element={<BatchCreate />} />
                <Route path="/medicine-batches/:id/edit" element={<BatchEdit />} />

                {/* Medicine Requests Routes */}
                <Route path="/medicine-requests" element={<RequestsIndex />} />
                <Route path="/medicine-requests/create" element={<RequestCreate />} />
                <Route path="/browse-medicines" element={<BrowseMedicines />} />

                {/* Notifications */}
                <Route path="/notifications" element={<Notifications />} />

                {/* Profile Route */}
                <Route path="/profile" element={<Profile />} /> {/* Add this line */}
            </Route>

            {/* 404 - Page not found */}
            <Route path="*" element={<div className="p-4">Page not found</div>} />
        </Routes>
    </BrowserRouter>
);
