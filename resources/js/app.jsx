import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import PlainLayout from "./Layouts/PlainLayout.jsx";
import RequireAuthLayout from "./Layouts/RequireAuthLayout.jsx";

// Auth
import Login from "./Auth/Login.jsx";
import Register from "./Auth/Register.jsx";

// Dashboard
import Dashboard from "./Pages/Dashboard.jsx";

/* PRODUCTS */
import ProductsIndex from "./Inventory/Index.jsx";
import ProductsCreate from "./Inventory/Create.jsx";
import ProductsEdit from "./Inventory/Edit.jsx";
import ProductsExpired from "./Inventory/Expired.jsx";
import ProductsOutstock from "./Inventory/Outstock.jsx";
import Categories from "./Inventory/Categories.jsx";

/* USERS */
import UsersIndex from "./Users/Index.jsx";
import UsersCreate from "./Users/Create.jsx";
import UsersEdit from "./Users/Edit.jsx";
import Profile from "./Users/Profile.jsx";

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
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Public */}
            <Route element={<PlainLayout />}>
                <Route path="/login" element={<Login />} />
            </Route>

            {/* Protected */}
            <Route element={<RequireAuthLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />

                <Route path="/categories" element={<Categories />} />

                <Route path="/products" element={<ProductsIndex />} />
                <Route path="/products/create" element={<ProductsCreate />} />
                <Route path="/products/:id/edit" element={<ProductsEdit />} />
                <Route path="/expired" element={<ProductsExpired />} />
                <Route path="/outstock" element={<ProductsOutstock />} />

                <Route path="/profile" element={<Profile />} />

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
