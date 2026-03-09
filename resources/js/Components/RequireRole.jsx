import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "./UserContext";

/**
 * RequireRole - Spatie-aware route guard.
 *
 * Reads the authenticated user from UserContext (set by RequireAuthLayout).
 * No extra API fetch — instant, no race conditions.
 *
 * Usage in router (must be nested inside RequireAuthLayout):
 *   <Route element={<RequireRole allowedRoles={['super-admin', 'staff']} />}>
 *     <Route path="/seniors" element={<SeniorsIndex />} />
 *   </Route>
 *
 * @param {string[]} allowedRoles - Spatie role names that are permitted
 */
const RequireRole = ({ allowedRoles = [] }) => {
    const ctx = useUser();

    // Context not ready yet (RequireAuthLayout still loading) — wait
    if (!ctx) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
            </div>
        );
    }

    const { user, userRoleNames = [] } = ctx;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check if the user's roles include any of the allowed roles
    const hasAccess = allowedRoles.some((role) => userRoleNames.includes(role));

    if (!hasAccess) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default RequireRole;
