import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from "../utils/api";
import { useUser } from "../Components/UserContext";

export default function Profile() {
    const ctx = useUser();
    const userRoleNames = ctx?.userRoleNames ?? [];
    const isSenior = userRoleNames.includes('senior-citizen');

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [saving, setSaving] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    // Separate avatar preview state — only holds a File when user picks one
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        name: "",
        email: "",
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        newPasswordConfirm: "",
    });

    const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
    const setPass = (field, value) => setPasswordForm(prev => ({ ...prev, [field]: value }));
    const err = (field) => errors?.[field]?.[0] || '';

    // Fetch user data
    useEffect(() => {
        let alive = true;
        (async () => {
            setLoading(true);
            try {
                const data = await apiFetch('/api/user');
                if (!alive) return;
                const u = data.user ?? data;
                setUser(u);
                setForm({ name: u.name || "", email: u.email || "" });
            } catch (e) {
                if (!alive) return;
                setErrors({ general: ["Failed to load profile"] });
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, []);

    // When user picks a new avatar file, create a local preview URL
    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file);
        // Revoke previous preview to avoid memory leak
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(URL.createObjectURL(file));
    };

    // Profile info + optional avatar update
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});
        setSuccessMessage('');

        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('email', form.email);
        // Laravel can't receive PUT with multipart — spoof it
        formData.append('_method', 'PUT');

        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }

        try {
            // Use POST + _method=PUT for multipart compatibility
            const response = await apiFetch('/api/profile', {
                method: 'POST',
                body: formData,
            });

            const updatedUser = response.user ?? response;
            setUser(updatedUser);
            setAvatarFile(null);  // clear pending file after save
            setSuccessMessage('Profile updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (e) {
            setErrors(e?.data?.errors || { general: [e?.message || "Failed to update profile"] });
        } finally {
            setSaving(false);
        }
    };

    // Password change
    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwordForm.newPassword !== passwordForm.newPasswordConfirm) {
            setErrors({ newPassword: ["Passwords do not match"] });
            return;
        }

        setSavingPassword(true);
        setErrors({});
        setSuccessMessage('');

        try {
            await apiFetch('/api/profile/password', {
                method: 'PUT',
                body: JSON.stringify({
                    current_password: passwordForm.currentPassword,
                    password: passwordForm.newPassword,
                    password_confirmation: passwordForm.newPasswordConfirm,
                }),
            });

            setPasswordForm({ currentPassword: "", newPassword: "", newPasswordConfirm: "" });
            setSuccessMessage('Password updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (e) {
            setErrors(e?.data?.errors || { general: [e?.message || "Failed to update password"] });
        } finally {
            setSavingPassword(false);
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

    // Use backend-provided avatar_url (absolute), then fallback to constructing from avatar path
    const currentAvatarUrl = avatarPreview
        || user?.avatar_url
        || (user?.avatar ? `${window.location.origin}/storage/${user.avatar}` : null);

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

            {(errors.general || errors.email || errors.name || errors.avatar) && (
                <div className="alert alert-danger" style={{ marginBottom: 20 }}>
                    {[
                        ...(errors.general || []),
                        ...(errors.email   ? [`Email: ${errors.email[0]}`]   : []),
                        ...(errors.name    ? [`Name: ${errors.name[0]}`]     : []),
                        ...(errors.avatar  ? [`Avatar: ${errors.avatar[0]}`] : []),
                    ].map((msg, i) => <div key={i}>{msg}</div>)}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

                {/* Left — Account Info + Avatar */}
                <div className="mc-card">
                    <div className="mc-card-header">
                        <h3 className="mc-card-title" style={{ fontSize: 16 }}>Account Information</h3>
                    </div>
                    <div className="mc-card-body">

                        {/* Avatar preview */}
                        <div style={{ textAlign: 'center', marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--mc-border)' }}>
                            <div style={{
                                width: 80,
                                height: 80,
                                borderRadius: 20,
                                background: '#1e6f4f',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 28,
                                fontWeight: 800,
                                margin: '0 auto 12px',
                                overflow: 'hidden',
                            }}>
                                {currentAvatarUrl ? (
                                    <img
                                        src={currentAvatarUrl}
                                        alt="Avatar"
                                        style={{ width: "100%", height: "100%", objectFit: 'cover' }}
                                    />
                                ) : initials}
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

                            {/* Avatar upload — separate from required fields visually */}
                            <div style={{ marginTop: 20 }}>
                                <label className="form-label">
                                    Change Avatar <span style={{ fontSize: 12, color: '#888', fontWeight: 400 }}>(optional)</span>
                                </label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="form-control"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                />
                                {avatarFile && (
                                    <div style={{ fontSize: 12, color: '#1e6f4f', marginTop: 4 }}>
                                        ✓ New photo selected: {avatarFile.name}
                                    </div>
                                )}
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

                {/* Right — Change Password */}
                <div className="mc-card">
                    <div className="mc-card-header">
                        <h3 className="mc-card-title" style={{ fontSize: 16 }}>Change Password</h3>
                    </div>
                    <div className="mc-card-body">
                        <form onSubmit={handlePasswordChange}>
                            <Field
                                label="Current Password"
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(v) => setPass('currentPassword', v)}
                                error={err('current_password')}
                            />
                            <Field
                                label="New Password"
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(v) => setPass('newPassword', v)}
                                error={err('newPassword')}
                            />
                            <Field
                                label="Confirm New Password"
                                type="password"
                                value={passwordForm.newPasswordConfirm}
                                onChange={(v) => setPass('newPasswordConfirm', v)}
                                error={err('newPasswordConfirm')}
                            />
                            <div style={{ marginTop: 20 }}>
                                <button
                                    type="submit"
                                    className="btn btn-success"
                                    disabled={savingPassword}
                                    style={{ width: '100%' }}
                                >
                                    {savingPassword ? 'Updating...' : 'Update Password'}
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
