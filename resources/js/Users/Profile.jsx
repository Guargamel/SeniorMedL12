import React, { useEffect, useState } from 'react';
import { apiFetch } from "../utils/api"; // Adjust this path if needed

export default function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // For editable fields
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
    const [avatarFile, setAvatarFile] = useState(null);

    // Avatar preview
    const [avatarPreview, setAvatarPreview] = useState(null);

    // Fetch user data
    useEffect(() => {
        setLoading(true);
        setError(null);
        apiFetch('/api/user') // Assuming you're fetching the authenticated user
            .then(data => {
                setUser(data.user);
                setName(data.user.name);
                setEmail(data.user.email);
                setAvatarPreview(data.user.avatar_url || "https://via.placeholder.com/150");
                setLoading(false);
            })
            .catch(err => {
                setError("Failed to load profile");
                setLoading(false);
            });
    }, []);

    // Handle form submission for name and email update
    const handleProfileUpdate = (e) => {
        e.preventDefault();
        setError(null);

        const payload = {
            name,
            email,
        };

        apiFetch('/api/user', {
            method: 'POST',
            body: JSON.stringify(payload),
        })
            .then(response => {
                setUser(response.user);
                setError("Profile updated successfully");
            })
            .catch(err => {
                setError("Failed to update profile");
            });
    };

    // Handle password change
    const handlePasswordChange = (e) => {
        e.preventDefault();
        setError(null);

        if (newPassword !== newPasswordConfirm) {
            setError("New passwords do not match");
            return;
        }

        const passwordPayload = {
            current_password: currentPassword,
            password: newPassword,
            password_confirmation: newPasswordConfirm,
        };

        apiFetch('/api/user/password', {
            method: 'POST',
            body: JSON.stringify(passwordPayload),
        })
            .then(() => {
                setCurrentPassword("");
                setNewPassword("");
                setNewPasswordConfirm("");
                setError("Password updated successfully");
            })
            .catch(err => {
                setError("Failed to update password");
            });
    };

    // Handle avatar upload
    const handleAvatarUpload = (e) => {
        e.preventDefault();
        setError(null);

        const formData = new FormData();
        formData.append('avatar', avatarFile);

        apiFetch('/api/user/avatar', {
            method: 'POST',
            body: formData,
        })
            .then(response => {
                setUser(response.user);
                setAvatarPreview(response.user.avatar_url);
                setError("Avatar updated successfully");
            })
            .catch(err => {
                setError("Failed to upload avatar");
            });
    };

    if (loading) {
        return <div>Loading profile...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="container mt-4">
            <h2>My Profile</h2>
            <div className="row">
                {/* Left Column: Editable Name, Email */}
                <div className="col-md-6">
                    <div className="card mb-3">
                        <div className="card-header">Account Information</div>
                        <div className="card-body">
                            <form onSubmit={handleProfileUpdate}>
                                <div className="mb-3">
                                    <label className="form-label">Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary">
                                    Save Changes
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Right Column: Avatar Upload & Password Change */}
                <div className="col-md-6">
                    {/* Avatar Section */}
                    <div className="card mb-3">
                        <div className="card-header">Avatar</div>
                        <div className="card-body">
                            <div className="d-flex align-items-center gap-3 mb-3">
                                <img
                                    src={avatarPreview || "https://via.placeholder.com/150"}
                                    alt="Avatar"
                                    width="150"
                                    height="150"
                                    style={{ borderRadius: '50%', objectFit: 'cover' }}
                                />
                                <div>
                                    <label className="form-label">Upload a new avatar (jpg/png/webp, max 2MB)</label>
                                    <input
                                        type="file"
                                        className="form-control mb-2"
                                        accept="image/*"
                                        onChange={(e) => setAvatarFile(e.target.files[0])}
                                    />
                                    <button onClick={handleAvatarUpload} className="btn btn-secondary">Upload Avatar</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Password Section */}
                    <div className="card">
                        <div className="card-header">Change Password</div>
                        <div className="card-body">
                            <form onSubmit={handlePasswordChange}>
                                <div className="mb-2">
                                    <label className="form-label">Current Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-2">
                                    <label className="form-label">New Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Confirm New Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={newPasswordConfirm}
                                        onChange={(e) => setNewPasswordConfirm(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-warning">
                                    Change Password
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
