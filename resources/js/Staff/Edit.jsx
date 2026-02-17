import React, { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import { useNavigate, useParams } from "react-router-dom";

export default function BatchEdit() {
    const { id } = useParams(); // Get staff ID from URL params
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");

    const [form, setForm] = useState({
        name: "",
        email: "",
        currentPassword: "",
        newPassword: "",
        newPasswordConfirm: "",
        avatar: null, // For Avatar upload
    });

    const [avatarPreview, setAvatarPreview] = useState(null); // Preview for uploaded avatar

    const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
    const err = (field) => errors?.[field]?.[0] || "";

    useEffect(() => {
        let alive = true;

        (async () => {
            setLoading(true);
            setErrors({});
            setSuccessMessage("");

            try {
                const data = await apiFetch(`/api/staff/${id}`);
                const staff = data;

                if (!staff) throw new Error("Invalid response");

                if (!alive) return;

                // Set form fields with current staff data
                setForm({
                    name: staff.name || "",
                    email: staff.email || "",
                    currentPassword: "",
                    newPassword: "",
                    newPasswordConfirm: "",
                    avatar: null, // Avatar starts as null
                });

                // Set avatar preview if there's one
                if (staff.avatar) {
                    setAvatarPreview(staff.avatar); // Assuming the avatar URL is returned
                }
            } catch (e) {
                if (!alive) return;
                setErrors({ general: [e?.message || "Failed to load staff"] });
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [id]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});
        setSuccessMessage("");

        try {
            const response = await apiFetch(`/api/staff/${id}`, {
                method: "PUT",
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                }),
            });

            setSuccessMessage("Profile updated successfully!");
            setForm((prev) => ({
                ...prev,
                currentPassword: "",
                newPassword: "",
                newPasswordConfirm: "",
            }));

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err) {
            setErrors(err?.data?.errors || { general: ["Failed to update profile"] });
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (form.newPassword !== form.newPasswordConfirm) {
            setErrors({ newPassword: ["Passwords do not match"] });
            return;
        }

        setSaving(true);
        setErrors({});
        setSuccessMessage("");

        try {
            await apiFetch(`/api/staff/${id}/password`, {
                method: "PUT",
                body: JSON.stringify({
                    current_password: form.currentPassword,
                    password: form.newPassword,
                    password_confirmation: form.newPasswordConfirm,
                }),
            });

            setForm((prev) => ({
                ...prev,
                currentPassword: "",
                newPassword: "",
                newPasswordConfirm: "",
            }));

            setSuccessMessage("Password updated successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err) {
            setErrors(err?.data?.errors || { general: ["Failed to update password"] });
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setForm((prev) => ({ ...prev, avatar: file }));

            // Preview the image
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});
        setSuccessMessage("");

        // Prepare form data for avatar upload
        const formData = new FormData();
        formData.append("avatar", form.avatar);

        try {
            const data = await apiFetch(`/api/staff/${id}/avatar`, {
                method: "POST",
                body: formData,
            });

            // Update the avatar preview with the returned URL
            setAvatarPreview(data.avatar); // Assuming data.avatar contains the avatar URL

            setSuccessMessage("Avatar updated successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err) {
            setErrors(err?.data?.errors || { general: ["Failed to update avatar"] });
        } finally {
            setSaving(false);
        }
    };


    if (loading) {
        return (
            <div className="mc-card">
                <div className="mc-card-body" style={{ padding: 40, textAlign: "center" }}>
                    Loading profile...
                </div>
            </div>
        );
    }

    const initials = (form?.name || "NA")
        .split(" ")
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase())
        .join("");

    return (
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div className="mc-card-header" style={{ marginBottom: 20 }}>
                <h2 className="mc-card-title">Edit Staff Profile</h2>
            </div>

            {successMessage && (
                <div className="alert alert-success" style={{ marginBottom: 20 }}>
                    {successMessage}
                </div>
            )}

            {errors.general && (
                <div className="alert alert-danger" style={{ marginBottom: 20 }}>
                    {errors.general[0]}
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* Left Column - Profile Info */}
                <div className="mc-card">
                    <div className="mc-card-header">
                        <h3 className="mc-card-title" style={{ fontSize: 16 }}>Account Information</h3>
                    </div>
                    <div className="mc-card-body">
                        {/* User Avatar & Info */}
                        <div style={{ textAlign: "center", marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid var(--mc-border)" }}>
                            <div style={{
                                width: 80,
                                height: 80,
                                borderRadius: 20,
                                background: '#1e6f4f',
                                color: '#fff',
                                display: 'grid',
                                placeItems: 'center',
                                fontSize: 28,
                                fontWeight: 800,
                                margin: '0 auto 12px',
                            }}>
                                {initials}
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
                                {form.name}
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--mc-muted)' }}>
                                {form.role || "staff"}
                            </div>
                        </div>

                        <form onSubmit={handleProfileUpdate}>
                            <Field label="Full Name" value={form.name} onChange={(v) => set("name", v)} error={err("name")} />
                            <Field label="Email Address" type="email" value={form.email} onChange={(v) => set("email", v)} error={err("email")} />

                            <div style={{ marginTop: 20 }}>
                                <button type="submit" className="btn btn-success" disabled={saving} style={{ width: "100%" }}>
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Column - Avatar and Security */}
                <div className="mc-card">
                    <div className="mc-card-header">
                        <h3 className="mc-card-title" style={{ fontSize: 16 }}>Security & Avatar</h3>
                    </div>
                    <div className="mc-card-body">
                        {/* Avatar Section */}
                        <div style={{ textAlign: "center", marginBottom: 24 }}>
                            <img src={avatarPreview || "default-avatar.png"} alt="Avatar" style={{ width: 80, height: 80, borderRadius: "50%" }} />
                            <form onSubmit={handleAvatarSubmit} style={{ marginTop: 10 }}>
                                <input type="file" onChange={handleAvatarChange} />
                                <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: 10 }}>
                                    {saving ? "Uploading..." : "Change Avatar"}
                                </button>
                            </form>
                        </div>

                        {/* Password Section */}
                        <form onSubmit={handlePasswordChange}>
                            <Field label="Current Password" type="password" value={form.currentPassword} onChange={(v) => set("currentPassword", v)} error={err("currentPassword")} />
                            <Field label="New Password" type="password" value={form.newPassword} onChange={(v) => set("newPassword", v)} error={err("newPassword")} />
                            <Field label="Confirm New Password" type="password" value={form.newPasswordConfirm} onChange={(v) => set("newPasswordConfirm", v)} error={err("newPasswordConfirm")} />

                            <div style={{ marginTop: 20 }}>
                                <button type="submit" className="btn btn-warning" disabled={saving} style={{ width: "100%" }}>
                                    {saving ? "Updating..." : "Change Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({ label, error, type = "text", value, onChange }) {
    return (
        <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>{label}</div>
            <input className="form-control" type={type} value={value} onChange={(e) => onChange(e.target.value)} />
            {error && <div style={{ color: "#c0392b", fontSize: 12, marginTop: 4 }}>{error}</div>}
        </div>
    );
}
