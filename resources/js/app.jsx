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
import ProductsIndex from "./Products/Index.jsx";
import ProductsCreate from "./Products/Create.jsx";
import ProductsEdit from "./Products/Edit.jsx";
import ProductsExpired from "./Products/Expired.jsx";
import ProductsOutstock from "./Products/Outstock.jsx";
import Categories from "./Products/Categories.jsx";

/* PURCHASES */
import PurchasesIndex from "./Purchases/Index.jsx";
import PurchasesCreate from "./Purchases/Create.jsx";
import PurchasesEdit from "./Purchases/Edit.jsx";
import PurchasesReport from "./Purchases/Reports.jsx";

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
                <Route path="/register" element={<Register />} />
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

                <Route path="/purchases" element={<PurchasesIndex />} />
                <Route path="/purchases/create" element={<PurchasesCreate />} />
                <Route path="/purchases/:id/edit" element={<PurchasesEdit />} />
                <Route path="/purchases/report" element={<PurchasesReport />} />

                <Route path="/users" element={<UsersIndex />} />
                <Route path="/users/create" element={<UsersCreate />} />
                <Route path="/users/:id/edit" element={<UsersEdit />} />

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
