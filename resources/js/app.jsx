import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import PlainLayout from "./Layouts/PlainLayout.jsx";
import AppLayout from "./Layouts/Layout.jsx";

// Auth
import Login from "./Auth/Login.jsx";
import Register from "./Auth/Register.jsx";

// Dashboard
import Dashboard from "./Pages/Dashboard.jsx";

/* =======================
   PRODUCTS
======================= */
import ProductsIndex from "./Products/Index.jsx";
import ProductsCreate from "./Products/Create.jsx";
import ProductsEdit from "./Products/Edit.jsx";
import ProductsExpired from "./Products/Expired.jsx";
import ProductsOutstock from "./Products/Outstock.jsx";
import Categories from "./Products/Categories.jsx";

/* =======================
   PURCHASES
======================= */
import PurchasesIndex from "./Purchases/Index.jsx";
import PurchasesCreate from "./Purchases/Create.jsx";
import PurchasesEdit from "./Purchases/Edit.jsx";
import PurchasesReport from "./Purchases/Reports.jsx";

/* =======================
   SALES
======================= */
import SalesIndex from "./Sales/Index.jsx";
import SalesCreate from "./Sales/Create.jsx";
import SalesEdit from "./Sales/Edit.jsx";
import SalesReport from "./Sales/Reports.jsx";

/* =======================
   SUPPLIERS
======================= */
import SuppliersIndex from "./Suppliers/Index.jsx";
import SuppliersCreate from "./Suppliers/Create.jsx";
import SuppliersEdit from "./Suppliers/Edit.jsx";

/* =======================
   USERS
======================= */
import UsersIndex from "./Users/Index.jsx";
import UsersCreate from "./Users/Create.jsx";
import UsersEdit from "./Users/Edit.jsx";
import Profile from "./Users/Profile.jsx";

/* =======================
   ROLES / PERMISSIONS
======================= */
import RolesIndex from "./Roles/Index.jsx";
import RolesCreate from "./Roles/Create.jsx";
import RolesEdit from "./Roles/Edit.jsx";
import Permissions from "./Roles/Permissions.jsx";

const container = document.getElementById("app");

createRoot(container).render(
    <BrowserRouter>
        <Routes>

            {/* PUBLIC ROUTES */}
            <Route element={<PlainLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Route>

            {/* PROTECTED APP ROUTES */}
            <Route element={<AppLayout />}>

                {/* Dashboard */}
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Categories */}
                <Route path="/categories" element={<Categories />} />

                {/* Products */}
                <Route path="/products" element={<ProductsIndex />} />
                <Route path="/products/create" element={<ProductsCreate />} />
                <Route path="/products/:id/edit" element={<ProductsEdit />} />
                <Route path="/expired" element={<ProductsExpired />} />
                <Route path="/outstock" element={<ProductsOutstock />} />

                {/* Purchases */}
                <Route path="/purchases" element={<PurchasesIndex />} />
                <Route path="/purchases/create" element={<PurchasesCreate />} />
                <Route path="/purchases/:id/edit" element={<PurchasesEdit />} />
                <Route path="/purchases/report" element={<PurchasesReport />} />

                {/* Sales */}
                <Route path="/sales" element={<SalesIndex />} />
                <Route path="/sales/create" element={<SalesCreate />} />
                <Route path="/sales/:id/edit" element={<SalesEdit />} />
                <Route path="/sales/report" element={<SalesReport />} />

                {/* Suppliers */}
                <Route path="/suppliers" element={<SuppliersIndex />} />
                <Route path="/suppliers/create" element={<SuppliersCreate />} />
                <Route path="/suppliers/:id/edit" element={<SuppliersEdit />} />


                {/* Users */}
                <Route path="/users" element={<UsersIndex />} />
                <Route path="/users/create" element={<UsersCreate />} />
                <Route path="/users/:id/edit" element={<UsersEdit />} />

                {/* Profile */}
                <Route path="/profile" element={<Profile />} />

                {/* Access Control */}
                <Route path="/roles" element={<RolesIndex />} />
                <Route path="/roles/create" element={<RolesCreate />} />
                <Route path="/roles/:id/edit" element={<RolesEdit />} />
                <Route path="/permissions" element={<Permissions />} />

                {/* DEFAULT */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* 404 */}
                <Route path="*" element={<div className="p-4">Page not found</div>} />

            </Route>
        </Routes>
    </BrowserRouter>
);
