import React from "react";
import { Navigate } from "react-router-dom";

// Helper function to check if the user has a specific role
const hasRole = (user, allowedRoles) => {
    return user?.role_id?.some(role => allowedRoles.includes(role.id));
};

const RequireRole = ({ user, allowedRoles, children }) => {
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!hasRole(user, allowedRoles)) {
        return <Navigate to="/unauthorized" replace />; // Or any route you want for unauthorized users
    }

    return children;
};

export default RequireRole;
