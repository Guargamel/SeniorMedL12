import React, { useState, useEffect } from 'react';
import { apiFetch } from "../utils/api";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    // For editable fields
    const [form, setForm] = useState({
        name: "",
        email: "",
        currentPassword: "",
        newPassword: "",
        newPasswordConfirm: "",
        avatar: null, // Avatar file (for upload)
    });

    const [saving, setSaving] = useState(false);

    const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
    const err = (field) => errors?.[field]?.[0] || '';

    // Fetch user data
    useEffect(() => {
        let alive = true;

        (async () => {
            setLoading(true);
            setErrors({});

            try {
                const data = await apiFetch('/api/user');

                if (!alive) return;

                setUser(data.user);
                setForm(prev => ({
                    ...prev,
                    name: data.user.name || "",
                    email: data.user.email || "",
                    avatar: data.user.avatar || "", // Set avatar from the backend
                }));
            } catch (err) {
                if (!alive) return;
                setErrors({ general: ["Failed to load profile"] });
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => { alive = false; };
    }, []);

    // Handle profile info update
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});
        setSuccessMessage('');

        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('email', form.email);

        if (form.avatar) {
            formData.append('avatar', form.avatar); // Append avatar file
        }

        try {
            const response = await apiFetch('/api/profile', {
                method: 'PUT',
                body: formData,
            });

            setUser(response.user);
            setSuccessMessage('Profile updated successfully!');

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setErrors(err?.data?.errors || { general: ["Failed to update profile"] });
        } finally {
            setSaving(false);
        }
    };

    // Handle password change
    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (form.newPassword !== form.newPasswordConfirm) {
            setErrors({ newPassword: ["Passwords do not match"] });
            return;
        }

        setSaving(true);
        setErrors({});
        setSuccessMessage('');

        try {
            await apiFetch('/api/profile/password', {
                method: 'PUT',
                body: JSON.stringify({
                    current_password: form.currentPassword,
                    password: form.newPassword,
                    password_confirmation: form.newPasswordConfirm,
                }),
            });

            setForm(prev => ({
                ...prev,
                currentPassword: "",
                newPassword: "",
                newPasswordConfirm: "",
            }));

            setSuccessMessage('Password updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setErrors(err?.data?.errors || { general: ["Failed to update password"] });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="mc-card">
                <div className="mc-card-body" style={{ padding: 40, textAlign: 'center' }}>
                    Loading profile...
                </div>
            </div>
        );
    }

    const initials = (user?.name || "NA")
        .split(" ")
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase())
        .join("");

    const roleName = user?.roles?.[0]?.name || "user";
    const roleDisplay = roleName.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

    // Avatar URL (using storage link for public access)
    const avatarUrl = user?.avatar ? `http://127.0.0.1:8000/storage/${user.avatar}` : null;

    return (
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div className="mc-card-header" style={{ marginBottom: 20 }}>
                <h2 className="mc-card-title">My Profile</h2>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Left Column - Profile Info */}
                <div className="mc-card">
                    <div className="mc-card-header">
                        <h3 className="mc-card-title" style={{ fontSize: 16 }}>Account Information</h3>
                    </div>
                    <div className="mc-card-body">
                        {/* User Avatar & Info */}
                        <div style={{ textAlign: 'center', marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--mc-border)' }}>
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
                                {form.avatar ? (
                                    <img
                                        src={URL.createObjectURL(form.avatar)}
                                        alt="Avatar Preview"
                                        style={{ width: "100%", height: "100%", borderRadius: "50%" }}
                                    />
                                ) : avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt="Avatar"
                                        style={{ width: "100%", height: "100%", borderRadius: "50%" }}
                                    />
                                ) : initials}

                                <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
                                    avatar in DB: {String(user?.avatar)}
                                    <br />
                                    avatarUrl: {String(avatarUrl)}
                                </div>
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
                                {user?.name}
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--mc-muted)' }}>
                                {roleDisplay}
                            </div>
                        </div>

                        <form onSubmit={handleProfileUpdate}>
                            <Field
                                label="Full Name"
                                value={form.name}
                                onChange={(v) => set('name', v)}
                                error={err('name')}
                            />
                            <Field
                                label="Email Address"
                                type="email"
                                value={form.email}
                                onChange={(v) => set('email', v)}
                                error={err('email')}
                            />
                            {/* Avatar Upload */}
                            <div style={{ marginTop: 20 }}>
                                <label htmlFor="avatar" className="form-label">Change Avatar</label>
                                <input
                                    type="file"
                                    id="avatar"
                                    className="form-control"
                                    onChange={(e) => set('avatar', e.target.files[0])}
                                />
                            </div>
                            <div style={{ marginTop: 20 }}>
                                <button
                                    type="submit"
                                    className="btn btn-success"
                                    disabled={saving}
                                    style={{ width: '100%' }}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}


function Field({ label, type = "text", value, onChange, error, disabled = false }) {
    return (
        <div style={{ marginBottom: 14 }}>
            <label className="form-label">{label}</label>
            <input
                type={type}
                className={`form-control ${error ? "is-invalid" : ""}`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
            />
            {error ? <div className="invalid-feedback">{error}</div> : null}
        </div>
    );
}
