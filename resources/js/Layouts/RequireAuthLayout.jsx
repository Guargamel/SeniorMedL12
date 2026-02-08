import React, { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Layout from "./Layout.jsx";
import { fetchCurrentUser, logout as apiLogout } from "../utils/auth";

/**
 * Wraps the main app layout and enforces authentication.
 * - On mount: fetches current user (Sanctum session)
 * - If 401: redirects to /login
 * - Exposes a working logout handler to Header via Layout props
 *
 * NOTE: Layout.jsx already renders <Outlet />, so we just render <Layout /> here.
 */
export default function RequireAuthLayout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setErrors([]);

      try {
        const u = await fetchCurrentUser();
        if (!alive) return;
        setUser(u);
      } catch (e) {
        if (!alive) return;
        // If unauthorized, redirect to login
        setUser(null);
        const msg = String(e?.message || "");
        // Only show a visible error for non-auth failures
        if (!(msg.toLowerCase().includes("not authenticated") || msg.includes("401"))) {
          setErrors([msg || "Failed to load user"]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const handleLogout = async () => {
    setErrors([]);
    try {
      await apiLogout();
    } catch (e) {
      // Even if backend errors, clear UI state so you can continue debugging.
      setErrors([e?.message || "Logout failed"]);
    } finally {
      setUser(null);
      navigate("/login", { replace: true });
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Layout user={user} errors={errors} handleLogout={handleLogout} />;
}
